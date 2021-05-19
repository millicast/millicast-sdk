import path from 'path'
import puppeteer from 'puppeteer'
import { loadFeature, defineFeature } from 'jest-cucumber'
const feature = loadFeature('../features/FunctionalPublish.feature', { loadRelativePath: true, errors: true })

jest.setTimeout(20000)
const pageLocation = `file:${path.join(__dirname, './PuppeteerJest.html')}`
const publishToken = process.env.PUBLISH_TOKEN
const streamName = process.env.STREAM_NAME
const accountId = process.env.ACCOUNT_ID
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
    executablePath: process.env.CHROME_LOCATION,
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream'
    ]
  })
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
      broadcastPage = await browser.newPage()
      viewerPage = await browser.newPage()
      await broadcastPage.goto(pageLocation)
      await viewerPage.goto(pageLocation)
      options = {
        ...defaultOptions,
        codec
      }
    })

    when('I broadcast a stream and connect to stream as viewer', async () => {
      await broadcastPage.evaluate(async ({ options, publishToken, streamName }) => await startPublisher(publishToken, streamName, options), { options, publishToken, streamName })
      await viewerPage.evaluate(async ({ streamName, accountId }) => await startViewer(streamName, accountId), { streamName, accountId })

      isActive = await broadcastPage.evaluate('window.publish.isActive()')

      videoFrame1 = await viewerPage.evaluate('getVideoPixelSums()')
      await viewerPage.waitForTimeout(500)
      videoFrame2 = await viewerPage.evaluate('getVideoPixelSums()')
    })

    then('broadcast is active and Viewer receive video data', async () => {
      expect(isActive).toBeTruthy()
      expect(videoFrame1).not.toBe(0)
      expect(videoFrame2).not.toBe(0)
      expect(videoFrame1).not.toEqual(videoFrame2)
    })
  })
})
