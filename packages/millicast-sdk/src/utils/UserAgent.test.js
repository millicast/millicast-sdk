import UserAgent from './UserAgent'

// Create shared mock functions
const mockGetUA = jest.fn()
const mockGetBrowser = jest.fn()
const mockGetOS = jest.fn()

// Mock UAParser while preserving the class structure for inheritance
jest.mock('ua-parser-js', () => {
  // Create a proper class that can be extended
  class MockUAParser {
    constructor (userAgent) {
      this.userAgent = userAgent
      this.getUA = mockGetUA
      this.getBrowser = mockGetBrowser
      this.getOS = mockGetOS
    }
  }

  // Add methods to prototype as well
  MockUAParser.prototype.getUA = mockGetUA
  MockUAParser.prototype.getBrowser = mockGetBrowser
  MockUAParser.prototype.getOS = mockGetOS

  return MockUAParser
})

describe('UserAgent', () => {
  let userAgent

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock window.navigator.userAgent
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      writable: true,
      configurable: true
    })

    // Create UserAgent instance - now inheritance should work properly
    userAgent = new UserAgent()
  })

  test('should have all expected methods', () => {
    expect(userAgent).toBeDefined()
    expect(userAgent.isChromium).toBeDefined()
    expect(userAgent.isChrome).toBeDefined()
    expect(userAgent.isFirefox).toBeDefined()
    expect(userAgent.isOpera).toBeDefined()
    expect(userAgent.isSafari).toBeDefined()

    // Verify they are functions
    expect(typeof userAgent.isChromium).toBe('function')
    expect(typeof userAgent.isChrome).toBe('function')
    expect(typeof userAgent.isFirefox).toBe('function')
    expect(typeof userAgent.isOpera).toBe('function')
    expect(typeof userAgent.isSafari).toBe('function')
  })

  describe('isChromium()', () => {
    test('should return true if user agent contains "Chrome"', () => {
      mockGetUA.mockReturnValue('Mozilla/5.0 ... Chrome/91.0.4472.124 ...')

      expect(userAgent.isChromium()).toBeTruthy()
    })

    test('should return false if user agent does not contain "Chrome"', () => {
      mockGetUA.mockReturnValue('Mozilla/5.0 ... Firefox/89.0 ...')

      expect(userAgent.isChromium()).toBeFalsy()
    })
  })

  describe('isChrome()', () => {
    test('should return true for Chrome browser on allowed OS', () => {
      mockGetBrowser.mockReturnValue({ name: 'Chrome', version: '91.0.4472.124' })
      mockGetOS.mockReturnValue({ name: 'Windows', version: '10' })

      expect(userAgent.isChrome()).toBeTruthy()
    })

    test('should return false for Chrome browser on iOS (excluded OS)', () => {
      mockGetBrowser.mockReturnValue({ name: 'Chrome', version: '91.0' })
      mockGetOS.mockReturnValue({ name: 'iOS', version: '14.0' })

      expect(userAgent.isChrome()).toBeFalsy()
    })

    test('should return false for non-Chrome browser', () => {
      mockGetBrowser.mockReturnValue({ name: 'Firefox', version: '89.0' })
      mockGetOS.mockReturnValue({ name: 'Windows', version: '10' })

      expect(userAgent.isChrome()).toBeFalsy()
    })

    test('should return false if browser name is undefined', () => {
      mockGetBrowser.mockReturnValue({})
      mockGetOS.mockReturnValue({ name: 'Windows', version: '10' })

      expect(userAgent.isChrome()).toBeFalsy()
    })
  })

  describe('isFirefox()', () => {
    test('should return true for Firefox browser', () => {
      mockGetBrowser.mockReturnValue({ name: 'Firefox', version: '89.0' })

      expect(userAgent.isFirefox()).toBeTruthy()
    })

    test('should return false for non-Firefox browser', () => {
      mockGetBrowser.mockReturnValue({ name: 'Chrome', version: '91.0' })

      expect(userAgent.isFirefox()).toBeFalsy()
    })

    test('should return false if browser name is undefined', () => {
      mockGetBrowser.mockReturnValue({})

      expect(userAgent.isFirefox()).toBeFalsy()
    })
  })

  describe('isOpera()', () => {
    test('should return true for Opera browser', () => {
      mockGetBrowser.mockReturnValue({ name: 'Opera', version: '76.0' })

      expect(userAgent.isOpera()).toBeTruthy()
    })

    test('should return false for non-Opera browser', () => {
      mockGetBrowser.mockReturnValue({ name: 'Chrome', version: '91.0' })

      expect(userAgent.isOpera()).toBeFalsy()
    })
  })

  describe('isSafari()', () => {
    test('should return true for Safari browser', () => {
      mockGetBrowser.mockReturnValue({ name: 'Safari', version: '14.0' })

      expect(userAgent.isSafari()).toBeTruthy()
    })

    test('should return false for non-Safari browser', () => {
      mockGetBrowser.mockReturnValue({ name: 'Chrome', version: '91.0' })

      expect(userAgent.isSafari()).toBeFalsy()
    })
  })
})
