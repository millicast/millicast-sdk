module.exports = class Worker {
  constructor () {
    this.onmessage = null
    this.onerror = null
  }

  postMessage (msg) {
    // Mock implementation
  }

  terminate () {
    // Mock implementation
  }

  addEventListener (event, handler) {
    // Mock implementation
  }

  removeEventListener (event, handler) {
    // Mock implementation
  }
}
