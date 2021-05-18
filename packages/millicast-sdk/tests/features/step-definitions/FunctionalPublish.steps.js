import path from 'path'
import puppeteer from 'puppeteer'
import { loadFeature, defineFeature } from 'jest-cucumber'
const feature = loadFeature('../FunctionalPublish.feature', { loadRelativePath: true, errors: true })

jest.setTimeout(20000)
const publishToken = ''
const streamName = ''
const accountId = ''
const startPublisher = () => null
const startViewer = () => null
const defaultOptions = {
  bandwidth: 0,
  disableVideo: false,
  disableAudio: false,
  simulcast: false,
  scalabilityMode: null
}
let browser = null

afterEach(async () => {
  if (browser) {
    await browser.close()
  }
  browser = null
})

beforeEach(async () => {
  browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream'
    ]
  })
})

defineFeature(feature, test => {
  test('Broadcast h264 stream', ({ given, when, then }) => {
    let broadcastPage
    let viewerPage
    let isActive
    let videoFrame1
    let videoFrame2
    let options

    given('a page with broadcaster options and a page with view options', async () => {
      broadcastPage = await browser.newPage()
      viewerPage = await browser.newPage()
      await broadcastPage.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
      await viewerPage.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
      options = {
        ...defaultOptions,
        codec: 'h264'
      }
    })

    when('I broadcast a stream with h264 codec and connect to stream as viewer', async () => {
      await broadcastPage.evaluate(async ({ options, publishToken, streamName }) => await startPublisher(publishToken, streamName, options), { options, publishToken, streamName })
      await viewerPage.evaluate(async ({ streamName, accountId }) => await startViewer(streamName, accountId), { streamName, accountId })
      await broadcastPage.waitForTimeout(4000)

      isActive = await broadcastPage.evaluate('window.publish.isActive()')

      videoFrame1 = await viewerPage.evaluate('getVideoPixelSums()')
      await viewerPage.waitForTimeout(500)
      videoFrame2 = await viewerPage.evaluate('getVideoPixelSums()')
    })

    then('broadcast is active and Viewer receive video data', async () => {
      expect(isActive).toBeTruthy()
      expect(videoFrame1).not.toBe(0)
      expect(videoFrame2).not.toBe(0)
      expect(Math.abs(videoFrame1 - videoFrame2)).not.toBe(0)
    })
  })

  test('Broadcast vp8 stream', ({ given, when, then }) => {
    let broadcastPage
    let viewerPage
    let isActive
    let videoFrame1
    let videoFrame2
    let options

    given('a page with broadcaster options and a page with view options', async () => {
      broadcastPage = await browser.newPage()
      viewerPage = await browser.newPage()
      await broadcastPage.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
      await viewerPage.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
      options = {
        ...defaultOptions,
        codec: 'vp8'
      }
    })

    when('I broadcast a stream with vp8 codec and connect to stream as viewer', async () => {
      await broadcastPage.evaluate(async ({ options, publishToken, streamName }) => await startPublisher(publishToken, streamName, options), { options, publishToken, streamName })
      await viewerPage.evaluate(async ({ streamName, accountId }) => await startViewer(streamName, accountId), { streamName, accountId })
      await broadcastPage.waitForTimeout(4000)

      isActive = await broadcastPage.evaluate('window.publish.isActive()')

      videoFrame1 = await viewerPage.evaluate('getVideoPixelSums()')
      await viewerPage.waitForTimeout(500)
      videoFrame2 = await viewerPage.evaluate('getVideoPixelSums()')
    })

    then('broadcast is active and Viewer receive video data', async () => {
      expect(isActive).toBeTruthy()
      expect(videoFrame1).not.toBe(0)
      expect(videoFrame2).not.toBe(0)
      expect(Math.abs(videoFrame1 - videoFrame2)).not.toBe(0)
    })
  })

  test('Broadcast vp9 stream', ({ given, when, then }) => {
    let broadcastPage
    let viewerPage
    let isActive
    let videoFrame1
    let videoFrame2
    let options

    given('a page with broadcaster options and a page with view options', async () => {
      broadcastPage = await browser.newPage()
      viewerPage = await browser.newPage()
      await broadcastPage.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
      await viewerPage.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
      options = {
        ...defaultOptions,
        codec: 'vp9'
      }
    })

    when('I broadcast a stream with vp9 codec and connect to stream as viewer', async () => {
      await broadcastPage.evaluate(async ({ options, publishToken, streamName }) => await startPublisher(publishToken, streamName, options), { options, publishToken, streamName })
      await viewerPage.evaluate(async ({ streamName, accountId }) => await startViewer(streamName, accountId), { streamName, accountId })
      await broadcastPage.waitForTimeout(4000)

      isActive = await broadcastPage.evaluate('window.publish.isActive()')

      videoFrame1 = await viewerPage.evaluate('getVideoPixelSums()')
      await viewerPage.waitForTimeout(500)
      videoFrame2 = await viewerPage.evaluate('getVideoPixelSums()')
    })

    then('broadcast is active and Viewer receive video data', async () => {
      expect(isActive).toBeTruthy()
      expect(videoFrame1).not.toBe(0)
      expect(videoFrame2).not.toBe(0)
      expect(Math.abs(videoFrame1 - videoFrame2)).not.toBe(0)
    })
  })

  test('Broadcast av1 stream', ({ given, when, then }) => {
    let broadcastPage
    let viewerPage
    let isActive
    let videoFrame1
    let videoFrame2
    let options

    given('a page with broadcaster options and a page with view options', async () => {
      broadcastPage = await browser.newPage()
      viewerPage = await browser.newPage()
      await broadcastPage.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
      await viewerPage.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
      options = {
        ...defaultOptions,
        codec: 'av1'
      }
    })

    when('I broadcast a stream with av1 codec and connect to stream as viewer', async () => {
      await broadcastPage.evaluate(async ({ options, publishToken, streamName }) => await startPublisher(publishToken, streamName, options), { options, publishToken, streamName })
      await viewerPage.evaluate(async ({ streamName, accountId }) => await startViewer(streamName, accountId), { streamName, accountId })
      await broadcastPage.waitForTimeout(4000)

      isActive = await broadcastPage.evaluate('window.publish.isActive()')

      videoFrame1 = await viewerPage.evaluate('getVideoPixelSums()')
      await viewerPage.waitForTimeout(500)
      videoFrame2 = await viewerPage.evaluate('getVideoPixelSums()')
    })

    then('broadcast is active and Viewer receive video data', async () => {
      expect(isActive).toBeTruthy()
      expect(videoFrame1).not.toBe(0)
      expect(videoFrame2).not.toBe(0)
      expect(Math.abs(videoFrame1 - videoFrame2)).not.toBe(0)
    })
  })
})
