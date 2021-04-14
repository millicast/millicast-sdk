const path = require('path')
const puppeteer = require('puppeteer')

describe('Millicast with Puppeteer loaded tests', () => {
  let browser
  let page
  beforeEach(async () => {
    browser = await puppeteer.launch()
    page = await browser.newPage()
    await page.goto(`file:${path.join(__dirname, 'MillicastJest.html')}`)
  })

  afterEach(async () => {
    if (browser) {
      await browser.close()
      browser = null
    }
  })

  test('should be titled "MillicastJest', async () => {
    await expect(page.title()).resolves.toMatch('MillicastJest')
  })

  test('should exists Millicast module', async () => {
    await expect(page.evaluate('millicast')).resolves.toBeDefined()
  })
})
