/**
 * @jest-environment node
 */

import puppeteer from 'puppeteer'
import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { startStaticServer } from './utils/static-server'
const feature = loadFeature('../features/Puppeteer.feature', { loadRelativePath: true, errors: true })

// Variables used for testing
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

  test('Load example page with Puppeteer', ({ given, when, then }) => {
    given('i have a browser opened', async () => {
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
    })

    when('i open a new page and go to the example web', async () => {
      page = await browser.newPage()
      await page.goto(pageLocation)
    })

    then('the web page title says "PuppeteerJest"', async () => {
      await expect(page.title()).resolves.toMatch('PuppeteerJest')
    })
  }, 100000)

  test('SDK loaded', ({ given, when, then }) => {
    let millicastModule = null

    given('i have a browser opened and an example page with the Millicast SDK', async () => {
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
      }
      )
      page = await browser.newPage()
      await page.goto(pageLocation)
    })

    when('i ask the "millicast" module', async () => {
      millicastModule = await page.evaluate('millicast')
    })

    then('returns an instance of "millicast"', () => {
      expect(millicastModule).toBeDefined()
    })
  }, 100000)
})
