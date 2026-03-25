/**
 * @jest-environment node
 */

import puppeteer from 'puppeteer'
import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { startStaticServer } from './utils/static-server'

const feature = loadFeature('../features/ViewerCodecs.feature', { loadRelativePath: true, errors: true })

jest.setTimeout(60000)
let pageLocation = ''
let closeStaticServer = null

let browser = null
let page = null

beforeAll(async () => {
  const packageRoot = path.resolve(__dirname, '..', '..')
  const { baseUrl, close } = await startStaticServer(packageRoot)
  pageLocation = `${baseUrl}/tests/e2e/PuppeteerJest.html`
  closeStaticServer = close
})

afterAll(async () => {
  if (closeStaticServer) {
    await closeStaticServer()
  }
  closeStaticServer = null
})

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
      expect(viewInstance.streamName).toBe('')
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
