// jest.setup.js
// Mock Worker
global.Worker = class Worker {
  constructor (stringUrl) {
    this.url = stringUrl
    this.onmessage = null
  }

  postMessage (msg) {
    // Mock implementation
  }

  terminate () {
    // Mock implementation
  }
}

// Mock URL constructor for Workers
global.URL = class URL {
  constructor (url, base) {
    this.href = url
  }
}

// Mock import.meta if not already handled by globals
if (typeof globalThis.importMeta === 'undefined') {
  globalThis.importMeta = { url: 'file://mock-url' }
}
