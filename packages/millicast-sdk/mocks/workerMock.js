module.exports = class Worker {
  constructor () {
    this.onmessage = null
    this.onerror = null
  }

  postMessage (_msg) {
    // Mock implementation
  }

  terminate () {
    // Mock implementation
  }

  addEventListener (_event, _handler) {
    // Mock implementation
  }

  removeEventListener (_event, _handler) {
    // Mock implementation
  }
}
