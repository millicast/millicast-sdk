class MillicastSignalingTest {
  constructor() {
    const options = {
      url: "wss://echo.websocket.org/",
      sdp: "sdp mock",
    };
    this.url = options.url;
    this.sdp = options.sdp;
    this.millicastSignaling = new millicast.MillicastSignaling(options);
  }

  async testConnect() {
    const url = this.url;
    const ws = this.millicastSignaling.connect(url);
    console.log("webSocket open: ", ws);
    return ws;
  }

  async testClose() {
    const ws = this.millicastSignaling.close();
    console.log("webSocket closed", ws);
    return ws;
  }

  async testSubscribe() {
    const sdp = this.sdp;
    const streamId = "streamId mock";
    const subscriptionSdp = this.millicastSignaling.subscribe(sdp, streamId);
    console.log("subscription sdp: ", subscriptionSdp);
    return subscriptionSdp;
  }

  async testPublish() {
    const sdp = this.sdp;
    const publishSdp = this.millicastSignaling.publish(sdp);
    console.log("publish sdp: ", publishSdp);
    return publishSdp;
  }
}

const millicastSignalingTest = new MillicastSignalingTest();
