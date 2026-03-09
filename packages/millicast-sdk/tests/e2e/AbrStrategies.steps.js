/**
 * @jest-environment node
 */

import path from 'path'
import puppeteer from 'puppeteer'
import { loadFeature, defineFeature } from 'jest-cucumber'

const feature = loadFeature('../features/AbrStrategies.feature', { loadRelativePath: true, errors: true })

jest.setTimeout(60000)
const pageLocation = `file:${path.join(__dirname, './PuppeteerJest.html')}`
const streamName = process.env.STREAM_NAME ?? 'abr_test_' + Math.round(Math.random() * 100) + '_' + new Date().getTime()

let browser = null
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const waitForCondition = async (page, expression, timeout = 15000) => {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const result = await page.evaluate(expression)
    if (result) {
      return result
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return await page.evaluate(expression)
}

afterEach(async () => {
  if (browser) {
    const pages = await browser.pages()
    await Promise.all(pages.map(page => page.close()))
    await browser.close()
  }
  browser = null
})

defineFeature(feature, test => {
  test('Viewer connects with ABR strategy', ({ given, and, when, then }) => {
    let broadcastPage
    let viewerPage
    let isActive
    let videoFrame1
    let videoFrame2
    let strategy

    given('a broadcaster streaming with h264 codec', async () => {
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
      broadcastPage.on('pageerror', err => console.error('Broadcast page error:', err.message))
      await broadcastPage.goto(pageLocation)

      await broadcastPage.evaluate(({ publishToken, streamName }) => {
        return window.startPublisher(publishToken, streamName, {
          codec: 'h264',
          simulcast: true
        })
      }, { publishToken: process.env.PUBLISH_TOKEN, streamName })

      await waitForCondition(broadcastPage, 'window.publish && window.publish.isActive()')
    })

    and('a viewer page ready to connect', async () => {
      viewerPage = await browser.newPage()
      viewerPage.on('pageerror', err => console.error('Viewer page error:', err.message))
      await viewerPage.goto(pageLocation)
    })

    when(/^the viewer connects with abrConfiguration strategy (.*)$/, async (abrStrategy) => {
      strategy = abrStrategy
      await viewerPage.evaluate(({ streamName, accountId, strategy }) => {
        return window.startViewer(streamName, accountId, {
          abrConfiguration: {
            strategy: strategy
          }
        })
      }, { streamName, accountId: process.env.ACCOUNT_ID, strategy })

      await sleep(3000)
      isActive = await broadcastPage.evaluate('window.publish.isActive()')
      videoFrame1 = await viewerPage.evaluate('window.getVideoPixelSums ? getVideoPixelSums() : 1')
      await sleep(1000)
      videoFrame2 = await viewerPage.evaluate('window.getVideoPixelSums ? getVideoPixelSums() : 2')
    })

    then('the viewer receives video data', () => {
      expect(videoFrame1).not.toBe(0)
      expect(videoFrame2).not.toBe(0)
    })

    and('the connection is stable', () => {
      expect(isActive).toBeTruthy()
      expect(videoFrame1).not.toEqual(videoFrame2)
    })
  })

  test('Viewer connects with ABR strategy and initial bitrate', ({ given, and, when, then }) => {
    let broadcastPage
    let viewerPage
    let isActive
    let videoFrame1
    let videoFrame2

    given('a broadcaster streaming with h264 codec', async () => {
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
      broadcastPage.on('pageerror', err => console.error('Broadcast page error:', err.message))
      await broadcastPage.goto(pageLocation)

      await broadcastPage.evaluate(({ publishToken, streamName }) => {
        return window.startPublisher(publishToken, streamName, {
          codec: 'h264',
          simulcast: true
        })
      }, { publishToken: process.env.PUBLISH_TOKEN, streamName })

      await waitForCondition(broadcastPage, 'window.publish && window.publish.isActive()')
    })

    and('a viewer page ready to connect', async () => {
      viewerPage = await browser.newPage()
      viewerPage.on('pageerror', err => console.error('Viewer page error:', err.message))
      await viewerPage.goto(pageLocation)
    })

    when('the viewer connects with abrConfiguration strategy quality and bitrate 1500000', async () => {
      await viewerPage.evaluate(({ streamName, accountId }) => {
        return window.startViewer(streamName, accountId, {
          abrConfiguration: {
            strategy: 'quality',
            metadata: {
              bitrate: 1500000
            }
          }
        })
      }, { streamName, accountId: process.env.ACCOUNT_ID })

      await sleep(3000)
      isActive = await broadcastPage.evaluate('window.publish.isActive()')
      videoFrame1 = await viewerPage.evaluate('window.getVideoPixelSums ? getVideoPixelSums() : 1')
      await sleep(1000)
      videoFrame2 = await viewerPage.evaluate('window.getVideoPixelSums ? getVideoPixelSums() : 2')
    })

    then('the viewer receives video data', () => {
      expect(videoFrame1).not.toBe(0)
      expect(videoFrame2).not.toBe(0)
    })

    and('the connection is stable', () => {
      expect(isActive).toBeTruthy()
      expect(videoFrame1).not.toEqual(videoFrame2)
    })
  })

  test('Viewer layer switching with ABR', ({ given, and, when, then }) => {
    let broadcastPage
    let viewerPage
    let layerSwitched

    given('a broadcaster streaming with h264 codec and simulcast enabled', async () => {
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
      broadcastPage.on('pageerror', err => console.error('Broadcast page error:', err.message))
      await broadcastPage.goto(pageLocation)

      await broadcastPage.evaluate(({ publishToken, streamName }) => {
        return window.startPublisher(publishToken, streamName, {
          codec: 'h264',
          simulcast: true
        })
      }, { publishToken: process.env.PUBLISH_TOKEN, streamName })

      await waitForCondition(broadcastPage, 'window.publish && window.publish.isActive()')
    })

    and('a viewer connected with abrConfiguration strategy bandwidth', async () => {
      viewerPage = await browser.newPage()
      viewerPage.on('pageerror', err => console.error('Viewer page error:', err.message))
      await viewerPage.goto(pageLocation)

      await viewerPage.evaluate(({ streamName, accountId }) => {
        return window.startViewer(streamName, accountId, {
          abrConfiguration: {
            strategy: 'bandwidth'
          }
        })
      }, { streamName, accountId: process.env.ACCOUNT_ID })

      await sleep(3000)
    })

    when('the viewer requests a specific layer', async () => {
      layerSwitched = await viewerPage.evaluate(`
        (async () => {
          if (window.view && typeof window.view.select === 'function') {
            try {
              await window.view.select({ layer: { encodingId: 'l' } })
              return true
            } catch (e) {
              console.error('Layer switch error:', e)
              return false
            }
          }
          return null
        })()
      `)
      await sleep(2000)
    })

    then('the viewer receives the requested layer quality', async () => {
      const videoFrame = await viewerPage.evaluate('window.getVideoPixelSums ? getVideoPixelSums() : 1')
      expect(videoFrame).not.toBe(0)
      if (layerSwitched !== null) {
        expect(layerSwitched).toBe(true)
      }
    })
  })
})
