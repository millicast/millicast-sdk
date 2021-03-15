class MillicastPublishTest {
  constructor() {
    this.millicastPublish = new millicast.MillicastPublish()
  }

  async testStart(options = undefined) {
    const mediaStream = await millicastMediaTest.testGetMedia()
    const broadcastOptions = options ?? {
      token: 'dummyToken', 
      streamName: 'dummyStreamName', 
      mediaStream: mediaStream, 
      bandwidth: 0, 
      disableVideo: false, 
      disableAudio: false
    }
    const response = await this.millicastPublish.broadcast(broadcastOptions)
    console.log("Start response: ", response);
    // const url = this.url;
    // const ws = this.millicastSignaling.connect(url);
    // console.log("webSocket open: ", ws);
    // return ws;
  }

  testStop() {
    this.millicastPublish.stop()
    console.log("Broadcast stopped")
  }

  // async testPublish() {
  //   const sdp = this.sdp;
  //   const publishSdp = this.millicastSignaling.publish(sdp);
  //   console.log("publish sdp: ", publishSdp);
  //   return publishSdp;
  // }
}

const millicastPublishTest = new MillicastPublishTest();
