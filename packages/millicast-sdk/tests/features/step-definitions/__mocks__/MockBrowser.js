global.window = { navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }

export const changeBrowserMock = (browserAgent) => {
  Object.defineProperty(global.window.navigator, 'userAgent', {
    get: function () {
      return browserAgent
    },
    configurable: true
  })
}
