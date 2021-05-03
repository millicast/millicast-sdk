import UAParser from 'ua-parser-js'

export default class UserAgent extends UAParser {
  isChrome (excludedOS = []) {
    const browserData = this.getBrowser()
    const osData = this.getOS()

    let osAllowed = true
    if (excludedOS.length > 0) {
      const regex = new RegExp(excludedOS.join('|'), 'i')
      osAllowed = !regex.test(osData.name)
    }

    return browserData.name.match(/Chrome/i) && osAllowed
  }

  isFirefox () {
    const browserData = this.getBrowser()

    return browserData.name.match(/Firefox/i)
  }
}
