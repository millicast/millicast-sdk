class SentryTest {
  constructor() {
    this.logger = millicast.logger;
  }

  testLogs() {
    const msg = document.getElementById("msg").value;
    const context = document.getElementById("context").value;
    if (msg && context) {
      this.logger.warn(msg);
      document.getElementById("return").innerHTML = "mensaje enviado";
    } else {
      document.getElementById("return").innerHTML = "ingrese ambos valores";
    }
  }
}

const sentryTest = new SentryTest();
