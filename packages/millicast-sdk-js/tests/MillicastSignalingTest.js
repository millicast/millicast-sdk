class MillicastSignalingTest {
  constructor(options = {}) {
    const defaultOptions = {
      wsUrl: "ws://localhost:8080/",
    };
    const optionsToUse = options ? options : defaultOptions;
    this.millicastSignaling = new millicast.millicastSignaling(optionsToUse);
  }

  async testConnect() {
    const url = options.wsUrl;
    const ws = this.millicastSignaling.connect(url);
    console.log("webSocket open: ", ws);
    document.getElementById("response").innerHTML = ws;
    return ws;
  }

  async testClose() {
    const url = options.wsUrl;
    const ws = this.millicastSignaling.close(url);
    console.log("webSocket closed", ws);
    document.getElementById("response").innerHTML = ws;
    return ws;
  }

  async testSubscribe() {
    const sdp = "";
    const streamId = "";
    const subscriptionSdp = this.millicastSignaling.subscribe(sdp, streamId);
    console.log("subscription sdp: ", subscriptionSdp);
    document.getElementById("response").innerHTML = subscriptionSdp;
    return subscriptionSdp;
  }

  async testPublish() {
    const sdp = "";
    const streamId = "";
    const publishSdp = this.millicastSignaling.publish(sdp);
    console.log("publish sdp: ", publishSdp);
    document.getElementById("response").innerHTML = publishSdp;
    return publishSdp;
  }
}

const millicastSignaling = new MillicastSignalingTest();
