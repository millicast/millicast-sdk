import path from 'path'
import puppeteer from 'puppeteer'
import { loadFeature, defineFeature } from 'jest-cucumber'
const feature = loadFeature('../FunctionalPublish.feature', { loadRelativePath: true, errors: true })

jest.setTimeout(100000)
const publishToken = ''
const streamName = ''
const accountId = ''
let browser = null

afterEach(async () => {
  if (browser) {
    await browser.close()
  }
  browser = null
})

beforeEach(async () => {
  // browser = await puppeteer.connect({
  //   browserWSEndpoint: 'ws://localhost:3000'
  // })

  // Local testing without Docker in headless mode and local Chrome.
  browser = await puppeteer.launch({
    devtools: true,
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

    given('a page with broadcaster options and a page with view options', async () => {
      broadcastPage = await browser.newPage()
      viewerPage = await browser.newPage()
      await broadcastPage.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
      await viewerPage.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
    })

    when('I broadcast a stream with h264 codec and connect to stream as viewer', async () => {
      // broadcastPage.on('console', (msg) => console.log(msg.text()))
      isActive = await broadcastPage.evaluate(async ({ publishToken, streamName }) => {
        const millicast = window.millicast
        millicast.Logger.setLevel(millicast.Logger.DEBUG)
        const tokenGenerator = () => millicast.Director.getPublisher(publishToken, streamName)
        const publish = new millicast.Publish(streamName, tokenGenerator)
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        document.getElementById('my-video').srcObject = mediaStream
        await publish.connect({
          mediaStream,
          bandwidth: 0,
          disableVideo: false,
          disableAudio: false,
          simulcast: false,
          codec: 'h264',
          scalabilityMode: null
        })
        window.publish = publish
      }, { publishToken, streamName })

      await viewerPage.evaluate(async ({ streamName, accountId }) => {
        const millicast = window.millicast
        millicast.Logger.setLevel(millicast.Logger.DEBUG)
        const tokenGenerator = () => millicast.Director.getSubscriber(streamName, accountId)
        const view = new millicast.View(streamName, tokenGenerator)
        view.on('track', (event) => {
          document.getElementById('my-video').srcObject = event.streams[0]
        })
        await view.connect()
      }, { streamName, accountId })

      await broadcastPage.waitForTimeout(4000)
      isActive = await broadcastPage.evaluate('window.publish.isActive()')

      videoFrame1 = await viewerPage.evaluate(() => {
        const canvas = document.createElement('canvas')
        const id = document.getElementById('my-video')
        const ctx = canvas.getContext('2d')
        ctx.drawImage(id, 0, 0, id.videoHeight - 1, id.videoWidth - 1)
        const imageData = ctx.getImageData(0, 0, id.videoHeight - 1, id.videoWidth - 1).data
        const sum = imageData.reduce((total, current) => total + current)
        if (sum === 255 * (Math.pow(id.videoHeight - 1, (id.videoWidth - 1) * (id.videoWidth - 1)))) {
          return 0
        }
        return sum
      })

      await viewerPage.waitForTimeout(500)

      videoFrame2 = await viewerPage.evaluate(() => {
        const canvas = document.createElement('canvas')
        const id = document.getElementById('my-video')
        const ctx = canvas.getContext('2d')
        ctx.drawImage(id, 0, 0, id.videoHeight - 1, id.videoWidth - 1)
        const imageData = ctx.getImageData(0, 0, id.videoHeight - 1, id.videoWidth - 1).data
        const sum = imageData.reduce((total, current) => total + current)
        if (sum === 255 * (Math.pow(id.videoHeight - 1, (id.videoWidth - 1) * (id.videoWidth - 1)))) {
          return 0
        }
        return sum
      })
    })

    then('broadcast is active and Viewer receive video data', async () => {
      expect(isActive).toBeTruthy()
      expect(videoFrame1).not.toBe(0)
      expect(videoFrame2).not.toBe(0)
      expect(Math.abs(videoFrame1 - videoFrame2)).not.toBe(0)
    })
  })
})
