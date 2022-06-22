import UAParser from 'ua-parser-js'

const chromeExcludedOS = ['iOS']

export default class UserAgent extends UAParser {
  constructor () {
    super(window.navigator.userAgent)
  }

  isChrome () {
    const browserData = this.getBrowser()
    if (!browserData.name) {
      return false
    }
    const osData = this.getOS()

    let osAllowed = true
    const regex = new RegExp(chromeExcludedOS.join('|'), 'i')
    osAllowed = !regex.test(osData.name)

    return browserData.name.match(/Chrome/i) && osAllowed
  }

  isFirefox () {
    const browserData = this.getBrowser()
    if (!browserData.name) {
      return false
    }
    return browserData.name.match(/Firefox/i)
  }
}
