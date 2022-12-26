import path from 'path'
import puppeteer from 'puppeteer'
import { loadFeature, defineFeature } from 'jest-cucumber'
const feature = loadFeature('../Puppeteer.feature', { loadRelativePath: true, errors: true })

// Variables used for testing
let browser = null
let page = null

afterEach(async () => {
  if (browser) {
    await browser.close()
  }
  browser = null
  page = null
})

defineFeature(feature, test => {
  test('Load example page with Puppeteer', ({ given, when, then }) => {
    given('i have a browser opened', async () => {
      browser = await puppeteer.launch()
    })

    when('i open a new page and go to the example web', async () => {
      page = await browser.newPage()
      await page.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
    })

    then('the web page title says "PuppeteerJest"', async () => {
      await expect(page.title()).resolves.toMatch('PuppeteerJest')
    })
  }, 50000)

  test('SDK loaded', ({ given, when, then }) => {
    let millicastModule = null

    given('i have a browser opened and an example page with the Millicast SDK', async () => {
      browser = await puppeteer.launch()
      page = await browser.newPage()
      await page.goto(`file:${path.join(__dirname, '../../PuppeteerJest.html')}`)
    })

    when('i ask the "millicast" module', async () => {
      millicastModule = await page.evaluate('millicast')
    })

    then('returns an instance of "millicast"', () => {
      expect(millicastModule).toBeDefined()
    })
  }, 50000)
})
