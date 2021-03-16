class MillicastSignalingTest {
  constructor() {
    this.wsUrl = "";
    this.millicastSignaling = new millicast.MillicastSignaling();
  }

  async testConnect() {
    return millicast.MillicastDirector.getPublisher().then((res) => {
      this.wsUrl = `${res.data.wsUrl}?token=${res.data.jwt}`;
      return this.millicastSignaling.connect(this.wsUrl).then((ws) => {
        console.log("webSocket open: ", ws);
        return ws;
      });
    });
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
