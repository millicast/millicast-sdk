import UserAgent from '../../src/utils/UserAgent'

const setUA = (ua) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: ua,
    writable: true,
    configurable: true
  })
}

describe('UserAgent', () => {
  test('should have all expected methods', () => {
    setUA('Mozilla/5.0 Chrome/91.0')
    const userAgent = new UserAgent()
    expect(typeof userAgent.isChromium).toBe('function')
    expect(typeof userAgent.isChrome).toBe('function')
    expect(typeof userAgent.isFirefox).toBe('function')
    expect(typeof userAgent.isOpera).toBe('function')
    expect(typeof userAgent.isSafari).toBe('function')
  })

  describe('isChromium()', () => {
    test('should return true if user agent contains "Chrome"', () => {
      setUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      expect(new UserAgent().isChromium()).toBeTruthy()
    })

    test('should return false if user agent does not contain "Chrome"', () => {
      setUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0')
      expect(new UserAgent().isChromium()).toBeFalsy()
    })
  })

  describe('isChrome()', () => {
    test('should return true for Chrome browser on allowed OS', () => {
      setUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      expect(new UserAgent().isChrome()).toBeTruthy()
    })

    test('should return false for Chrome browser on iOS (excluded OS)', () => {
      setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/91.0.4472.80 Mobile/15E148 Safari/604.1')
      expect(new UserAgent().isChrome()).toBeFalsy()
    })

    test('should return false for non-Chrome browser', () => {
      setUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0')
      expect(new UserAgent().isChrome()).toBeFalsy()
    })

    test('should return false for empty user agent', () => {
      setUA('')
      expect(new UserAgent().isChrome()).toBeFalsy()
    })
  })

  describe('isFirefox()', () => {
    test('should return true for Firefox browser', () => {
      setUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0')
      expect(new UserAgent().isFirefox()).toBeTruthy()
    })

    test('should return false for non-Firefox browser', () => {
      setUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      expect(new UserAgent().isFirefox()).toBeFalsy()
    })

    test('should return false for empty user agent', () => {
      setUA('')
      expect(new UserAgent().isFirefox()).toBeFalsy()
    })
  })

  describe('isOpera()', () => {
    test('should return true for Opera browser', () => {
      setUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0 Safari/537.36 OPR/76.0')
      expect(new UserAgent().isOpera()).toBeTruthy()
    })

    test('should return false for non-Opera browser', () => {
      setUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      expect(new UserAgent().isOpera()).toBeFalsy()
    })
  })

  describe('isSafari()', () => {
    test('should return true for Safari browser', () => {
      setUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15')
      expect(new UserAgent().isSafari()).toBeTruthy()
    })

    test('should return false for non-Safari browser', () => {
      setUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      expect(new UserAgent().isSafari()).toBeFalsy()
    })
  })
})
