const millicast = window.millicast

class SentryTest {
  constructor () {
    this.Logger = millicast.Logger
  }

  testLogs () {
    const msg = document.getElementById('msg').value
    const context = document.getElementById('context').value
    if (msg && context) {
      const logger = this.Logger.get(context)
      if (context === 'debug') { logger.debug(msg) }
      if (context === 'info') { logger.info(msg) }
      if (context === 'warn') { logger.warn(msg) }
      if (context === 'error') { logger.error(msg) }

      document.getElementById('return').innerHTML = 'mensaje enviado'
    } else {
      document.getElementById('return').innerHTML = 'ingrese ambos valores'
    }
  }
}

window.sentryTest = new SentryTest()
