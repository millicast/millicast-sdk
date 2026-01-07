/**
 * @jest-environment node
 */

import path from 'path'
import puppeteer from 'puppeteer'
import { loadFeature, defineFeature } from 'jest-cucumber'
const feature = loadFeature('../features/FunctionalPublish.feature', { loadRelativePath: true, errors: true })

jest.setTimeout(50000)
const pageLocation = `file:${path.join(__dirname, './PuppeteerJest.html')}`
const streamName = process.env.STREAM_NAME ?? 'demo_' + Math.round(Math.random() * 100) + '_' + new Date().getTime()
const defaultOptions = {
  bandwidth: 0,
  disableVideo: false,
  disableAudio: false,
  simulcast: false,
  scalabilityMode: null
}
let browser = null
const sleep = ms => new Promise(function (resolve) { setTimeout(resolve, ms) })

afterEach(async () => {
  if (browser) {
    const pages = await browser.pages()
    await Promise.all(pages.map(page => page.close()))
    await browser.close()
  }
  browser = null
})

defineFeature(feature, test => {
  test('Broadcasting stream', ({ given, when, then }) => {
    let broadcastPage
    let viewerPage
    let isActive
    let videoFrame1
    let videoFrame2
    let options

    given(/^a page with view options and a page with broadcaster options and codec (.*)$/, async (codec) => {
      if (!browser) {
        browser = await puppeteer.launch({
          headless: true,
          executablePath: puppeteer.executablePath(),
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--allow-file-access-from-files'
          ]
        })
      }
      broadcastPage = await browser.newPage()
      viewerPage = await browser.newPage()
      broadcastPage.on('pageerror', err => console.error('Broadcast page error:', err.message))
      viewerPage.on('pageerror', err => console.error('Viewer page error:', err.message))
      await broadcastPage.goto(pageLocation)
      await viewerPage.goto(pageLocation)
      options = { ...defaultOptions, codec }
    })

    when('I broadcast a stream and connect to stream as viewer', async () => {
      await broadcastPage.evaluate(({ options, publishToken, streamName }) => {
        // Use window prefix to satisfy linter and ensure browser global scope
        return window.startPublisher(publishToken, streamName, options)
      }, { options, publishToken: process.env.PUBLISH_TOKEN, streamName })

      await viewerPage.evaluate(({ streamName, accountId }) => {
        return window.startViewer(streamName, accountId)
      }, { streamName, accountId: process.env.ACCOUNT_ID })

      await sleep(3000)
      isActive = await broadcastPage.evaluate('window.publish.isActive()')
      videoFrame1 = await viewerPage.evaluate('getVideoPixelSums()')
      await sleep(500)
      videoFrame2 = await viewerPage.evaluate('getVideoPixelSums()')
    })

    then('broadcast is active and Viewer receive video data', async () => {
      expect(isActive).toBeTruthy()
      expect(videoFrame1).not.toBe(0)
      expect(videoFrame2).not.toBe(0)
      expect(videoFrame1).not.toEqual(videoFrame2)
    })
  })

  // --- STATS TEST ---
  test('Stats events arrive periodically', ({ given, then }) => {
    let broadcastPage, viewerPage
    given('a broadcaster and a viewer session', async () => {
      if (!browser) browser = await puppeteer.launch({ headless: true, executablePath: puppeteer.executablePath(), args: ['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--allow-file-access-from-files'] })
      broadcastPage = await browser.newPage()
      viewerPage = await browser.newPage()
      await broadcastPage.goto(pageLocation)
      await viewerPage.goto(pageLocation)

      await broadcastPage.evaluate(({ token, streamName }) => window.startPublisher(token, streamName, { codec: 'h264' }), { token: process.env.PUBLISH_TOKEN, streamName })
      await viewerPage.evaluate(({ accountId, streamName }) => window.startViewer(streamName, accountId), { accountId: process.env.ACCOUNT_ID, streamName })
      await sleep(5000)
    })

    then('both clients receive stats events from the SDK', async () => {
      const pubStats = await broadcastPage.evaluate('window.pubStatsCount')
      const viewStats = await viewerPage.evaluate('window.viewStatsCount')
      expect(pubStats).toBeGreaterThan(0)
      expect(viewStats).toBeGreaterThan(0)
    })
  })

  // --- METADATA TEST ---
  test('Metadata works for h264', ({ given, when, then }) => {
    let broadcastPage, viewerPage
    const testData = 'test-metadata-sei'

    given('a broadcaster using h264 and a viewer', async () => {
      if (!browser) browser = await puppeteer.launch({ headless: true, executablePath: puppeteer.executablePath(), args: ['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--allow-file-access-from-files'] })
      broadcastPage = await browser.newPage()
      viewerPage = await browser.newPage()
      await broadcastPage.goto(pageLocation)
      await viewerPage.goto(pageLocation)
      await broadcastPage.evaluate(({ token, streamName }) => window.startPublisher(token, streamName, { codec: 'h264' }), { token: process.env.PUBLISH_TOKEN, streamName })
      await viewerPage.evaluate(({ accountId, streamName }) => window.startViewer(streamName, accountId), { accountId: process.env.ACCOUNT_ID, streamName })
      await sleep(3000)
    })

    when('the publisher sends a metadata payload', async () => {
      await broadcastPage.evaluate((data) => window.publish.sendMetadata(data), testData)
      await sleep(2000)
    })

    then('the viewer receives the matching metadata event', async () => {
      const received = await viewerPage.evaluate('window.lastReceivedMetadata')
      expect(received).toBeTruthy()
    })
  })

  // --- SIMULCAST TEST ---
  test('Simulcast layer generation', ({ given, when, then }) => {
    let broadcastPage
    given(/^a broadcaster with simulcast enabled and codec (.*)$/, async (codec) => {
      if (!browser) browser = await puppeteer.launch({ headless: true, executablePath: puppeteer.executablePath(), args: ['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--allow-file-access-from-files'] })
      broadcastPage = await browser.newPage()
      await broadcastPage.goto(pageLocation)
      await broadcastPage.evaluate(({ token, streamName, codec }) => {
        return window.startPublisher(token, streamName, { codec, simulcast: true })
      }, { token: process.env.PUBLISH_TOKEN, streamName, codec })
    })

    when('the stream is active', async () => {
      await sleep(6000)
    })

    then('the publisher reports multiple active simulcast layers', async () => {
      const layers = await broadcastPage.evaluate(async () => {
        const stats = await window.publish.getRTCPeerConnection().getStats()
        let count = 0
        stats.forEach(r => { if (r.type === 'outbound-rtp' && r.kind === 'video') count++ })
        return count
      })
      expect(layers).toBeGreaterThan(1)
    })
  })
})
