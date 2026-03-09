import { UAParser } from 'ua-parser-js'

const chromeExcludedOS = ['iOS']

export default class UserAgent {
  private parser: UAParser

  constructor () {
    // Check for window to avoid SSR/Node errors during testing
    const ua = typeof window !== 'undefined' ? window.navigator.userAgent : ''
    this.parser = new UAParser(ua)
  }

  isChromium () {
    const browserData = this.parser.getUA()
    return !!browserData.match(/Chrome/i)
  }

  isChrome () {
    const browserData = this.parser.getBrowser()
    if (!browserData.name) {
      return false
    }
    const osData = this.parser.getOS()

    const regex = new RegExp(chromeExcludedOS.join('|'), 'i')
    const osAllowed = !regex.test(osData.name || '')

    return !!browserData.name.match(/Chrome/i) && osAllowed
  }

  isFirefox () {
    const browserData = this.parser.getBrowser()
    return !!browserData.name?.match(/Firefox/i)
  }

  isOpera () {
    const browserData = this.parser.getBrowser()
    return !!browserData.name?.match(/Opera/i)
  }

  isSafari () {
    const browserData = this.parser.getBrowser()
    return !!browserData.name?.match(/Safari/i)
  }
}
