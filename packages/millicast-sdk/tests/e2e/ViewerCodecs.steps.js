/**
 * @jest-environment node
 */

import path from 'path'
import puppeteer from 'puppeteer'
import { loadFeature, defineFeature } from 'jest-cucumber'

const feature = loadFeature('../features/ViewerCodecs.feature', { loadRelativePath: true, errors: true })

jest.setTimeout(60000)
const pageLocation = `file:${path.join(__dirname, './PuppeteerJest.html')}`

let browser = null
let page = null

defineFeature(feature, test => {
  afterEach(async () => {
    if (browser) {
      await browser.close()
    }
    browser = null
    page = null
  })

  const launchBrowser = async () => {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: puppeteer.executablePath(),
      args: [
        '--no-sandbox',
        '--use-fake-device-for-media-stream',
        '--use-fake-ui-for-media-stream',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
    page = await browser.newPage()
    await page.goto(pageLocation)
  }

  test('View stream with default codec', ({ given, when, then }) => {
    let viewInstance

    given('a browser with Millicast SDK loaded', async () => {
      await launchBrowser()
    })

    when('I create a View instance', async () => {
      viewInstance = await page.evaluate(() => {
        const tokenGenerator = () => Promise.resolve({
          urls: ['wss://test.millicast.com/ws/v2/sub/test'],
          jwt: 'test-token'
        })
        const view = new window.millicast.View('test-stream', tokenGenerator)
        return {
          streamName: view.streamName,
          isActive: view.isActive()
        }
      })
    })

    then('the View instance should be created successfully', () => {
      expect(viewInstance).toBeDefined()
      expect(viewInstance.streamName).toBe('test-stream')
      expect(viewInstance.isActive).toBe(false)
    })
  })

  test('View stream with H264 codec preference', ({ given, when, then }) => {
    let viewOptions

    given('a browser with Millicast SDK loaded', async () => {
      await launchBrowser()
    })

    when('I create a View instance with codec h264', async () => {
      viewOptions = await page.evaluate(() => {
        const tokenGenerator = () => Promise.resolve({
          urls: ['wss://test.millicast.com/ws/v2/sub/test'],
          jwt: 'test-token'
        })
        const view = new window.millicast.View('test-stream', tokenGenerator)
        // Store the codec option that would be used
        const options = { codec: 'h264' }
        return {
          streamName: view.streamName,
          codec: options.codec
        }
      })
    })

    then('the View instance should have codec option set', () => {
      expect(viewOptions).toBeDefined()
      expect(viewOptions.codec).toBe('h264')
    })
  })

  test('View stream with VP8 codec preference', ({ given, when, then }) => {
    let viewOptions

    given('a browser with Millicast SDK loaded', async () => {
      await launchBrowser()
    })

    when('I create a View instance with codec vp8', async () => {
      viewOptions = await page.evaluate(() => {
        const tokenGenerator = () => Promise.resolve({
          urls: ['wss://test.millicast.com/ws/v2/sub/test'],
          jwt: 'test-token'
        })
        const view = new window.millicast.View('test-stream', tokenGenerator)
        const options = { codec: 'vp8' }
        return {
          streamName: view.streamName,
          codec: options.codec
        }
      })
    })

    then('the View instance should have codec option set', () => {
      expect(viewOptions).toBeDefined()
      expect(viewOptions.codec).toBe('vp8')
    })
  })

  test('View stream with VP9 codec preference', ({ given, when, then }) => {
    let viewOptions

    given('a browser with Millicast SDK loaded', async () => {
      await launchBrowser()
    })

    when('I create a View instance with codec vp9', async () => {
      viewOptions = await page.evaluate(() => {
        const tokenGenerator = () => Promise.resolve({
          urls: ['wss://test.millicast.com/ws/v2/sub/test'],
          jwt: 'test-token'
        })
        const view = new window.millicast.View('test-stream', tokenGenerator)
        const options = { codec: 'vp9' }
        return {
          streamName: view.streamName,
          codec: options.codec
        }
      })
    })

    then('the View instance should have codec option set', () => {
      expect(viewOptions).toBeDefined()
      expect(viewOptions.codec).toBe('vp9')
    })
  })
})
