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
      try {
        if (!browser) {
          browser = await puppeteer.launch({
            // executablePath: process.env.CHROME_LOCATION,
            headless: true,
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

        // Add page error listeners
        broadcastPage.on('pageerror', err => console.error('Broadcast page error:', err.message))
        viewerPage.on('pageerror', err => console.error('Viewer page error:', err.message))

        await broadcastPage.goto(pageLocation)
        await viewerPage.goto(pageLocation)
        options = {
          ...defaultOptions,
          codec
        }
      } catch (error) {
        console.error(`Failed to setup pages for codec ${codec}:`, error.message)
        throw error
      }
    })

    when('I broadcast a stream and connect to stream as viewer', async () => {
      try {
        await broadcastPage.evaluate(({ options, publishToken, streamName, accountId }) => {
          window.ENV = {
            PUBLISH_TOKEN: publishToken,
            STREAM_NAME: streamName,
            ACCOUNT_ID: accountId
          }
          console.log('Environment check:', {
            publishToken: publishToken ? 'SET' : 'MISSING',
            accountId: accountId ? 'SET' : 'MISSING',
            streamName
          })
          return startPublisher(publishToken, streamName, options)
        }, {
          options,
          publishToken: process.env.PUBLISH_TOKEN,
          streamName,
          accountId: process.env.ACCOUNT_ID
        })

        await viewerPage.evaluate(({ streamName, accountId }) => {
          window.ENV = {
            STREAM_NAME: streamName,
            ACCOUNT_ID: accountId
          }
          console.log('Environment check:', {
            accountId: accountId ? 'SET' : 'MISSING',
            streamName
          })
          return startViewer(streamName, accountId)
        }, {
          streamName,
          accountId: process.env.ACCOUNT_ID
        })

        await sleep(3000)

        isActive = await broadcastPage.evaluate('window.publish.isActive()')
        videoFrame1 = await viewerPage.evaluate('getVideoPixelSums()')
        await sleep(500)
        videoFrame2 = await viewerPage.evaluate('getVideoPixelSums()')
      } catch (error) {
        console.error('Failed to setup streaming:', error.message)

        await broadcastPage.screenshot({ path: `debug-broadcast-${Date.now()}.png` })
        await viewerPage.screenshot({ path: `debug-viewer-${Date.now()}.png` })

        throw error
      }
    })
    then('broadcast is active and Viewer receive video data', async () => {
      try {
        expect(isActive).toBeTruthy()
        expect(videoFrame1).not.toBe(0)
        expect(videoFrame2).not.toBe(0)
        expect(videoFrame1).not.toEqual(videoFrame2)
      } catch (error) {
        console.error('Stream verification failed:', error.message)
        console.log('Debug info:', { isActive, videoFrame1, videoFrame2 })
        throw error
      }
    })
  })
})
