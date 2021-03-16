class MillicastSignalingTest {
  constructor() {
    this.token =
      "5159e188181e7fea4b21bd4af7a04e1c634af11995d421431a2472c134b59f31";
    this.streamName = "kmc1vt0c";
    this.streamAccountId = "tnJhvK";
    this.millicastSignaling = new millicast.MillicastSignaling();
    this.millicastWebRTC = new millicast.MillicastWebRTC();
  }

  async testConnect() {
    return millicast.MillicastDirector.getPublisher(
      this.token,
      this.streamName
    ).then((res) => {
      const wsUrl = `${res.wsUrl}?token=${res.jwt}`;
      return this.millicastSignaling.connect(wsUrl).then((ws) => {
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

  async testSubscribe(
    options = {
      mediaStream: null,
      disableVideo: false,
      disableAudio: false,
    }
  ) {
    let director = null;
    let pc = null;

    return millicast.MillicastDirector.getSubscriber(
      this.streamAccountId,
      this.streamName,
      true
    )
      .then((dir) => {
        director = dir;
        return this.millicastWebRTC.getRTCConfiguration();
      })
      .then((config) => {
        return this.millicastWebRTC.getRTCPeer(config);
      })
      .then((peer) => {
        pc = peer;
        pc.ontrack = function (event) {
          document.getElementById("received_video").srcObject =
            event.streams[0];
          document.getElementById("hangup-button").disabled = false;
        };
        this.millicastWebRTC.RTCOfferOptions = {
          offerToReceiveVideo: !options.disableVideo,
          offerToReceiveAudio: !options.disableAudio,
        };
        return this.millicastWebRTC
          .getRTCLocalSDP(null, options.mediaStream)
          .then((sdp) => {
            this.millicastWebRTC.setRTCRemoteSDP(sdp).then((remoteSdp) => {
              this.millicastSignaling
                .subscribe(remoteSdp, this.streamId)
                .then((subscriptionSdp) => {
                  console.log("subscription sdp: ", subscriptionSdp);
                  return subscriptionSdp;
                });
            });
          });
      });
  }

  async testPublish(
    options = {
      mediaStream: null,
      disableVideo: false,
      disableAudio: false,
    }
  ) {
    let director = null;
    let pc = null;

    return millicast.MillicastDirector.getPublisher(this.token, this.streamName)
      .then((dir) => {
        director = dir;
        return this.millicastWebRTC.getRTCConfiguration();
      })
      .then((config) => {
        return this.millicastWebRTC.getRTCPeer(config);
      })
      .then((peer) => {
        pc = peer;
        this.millicastWebRTC.RTCOfferOptions = {
          offerToReceiveVideo: !options.disableVideo,
          offerToReceiveAudio: !options.disableAudio,
        };
        return this.millicastWebRTC.getRTCLocalSDP(null, options.mediaStream);
      })
      .then((localSdp) => {
        this.millicastSignaling.wsUrl = `${director.wsUrl}?token=${director.jwt}`;
        return this.millicastSignaling.publish(localSdp).then((publishSdp) => {
          console.log("publish sdp: ", publishSdp);
          return publishSdp;
        });
      });
  }
}

const millicastSignalingTest = new MillicastSignalingTest();
