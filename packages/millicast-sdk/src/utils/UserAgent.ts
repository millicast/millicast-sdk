export default class UserAgent {
  private get ua (): string {
    // Read live UA at call time so test mocks and dynamic changes are respected
    return typeof window !== 'undefined' ? window.navigator.userAgent : '';
  }

  isChromium () {
    return /Chrome/i.test(this.ua);
  }

  isChrome () {
    // Must contain Chrome but not be on iOS (CriOS is Chrome on iOS but behaves as Safari)
    return /Chrome/i.test(this.ua) && !/iOS|iPhone|iPad|iPod/i.test(this.ua);
  }

  isFirefox () {
    return /Firefox/i.test(this.ua);
  }

  isOpera () {
    return /Opera|OPR\//i.test(this.ua);
  }

  isSafari () {
    return /Safari/i.test(this.ua) && !/Chrome/i.test(this.ua);
  }
}
