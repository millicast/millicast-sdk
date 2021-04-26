global.window = { adapter: { browserDetails: { browser: 'Chrome' } } }

export const changeBrowserMock = (browserName) => {
  global.window.adapter.browserDetails.browser = browserName
}
