const path = require('path')
const puppeteer = require('puppeteer')
const { loadFeature, defineFeature } = require('jest-cucumber')
const feature = loadFeature('../MillicastPuppeteer.feature', { loadRelativePath: true, errors: true })

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
      await page.goto(`file:${path.join(__dirname, '../../MillicastJest.html')}`)
    })

    then('the web page title says "MillicastJest"', async () => {
      await expect(page.title()).resolves.toMatch('MillicastJest')
    })
  })

  test('Millicast SDK loaded', ({ given, when, then }) => {
    let millicastModule = null

    given('i have a browser opened and an example page with the Millicast SDK', async () => {
      browser = await puppeteer.launch()
      page = await browser.newPage()
      await page.goto(`file:${path.join(__dirname, '../../MillicastJest.html')}`)
    })

    when('i ask the "millicast" module', async () => {
      millicastModule = await page.evaluate('millicast')
    })

    then('returns an instance of "millicast"', () => {
      expect(millicastModule).toBeDefined()
    })
  })
})
