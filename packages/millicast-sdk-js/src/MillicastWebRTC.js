const MillicastUtils = require("./MillicastUtils.js");

export default class MillicastWebRTC {
  constructor() { // constructor syntactic suga
    this.peer = null;
  }

  async getRTCPeer(config) {
    if (!!this.peer) return this.peer;
    try {
      if (!!config) config = await this.getRTCConfiguration();
      this.peer = new RTCPeerConnection(config);
      return this.peer;
    } catch (e) {
      throw e;
    }
  }

  async closeRTCPeer() {
    try {
      this.peer = null;
    } catch (e) {
      throw e;
    }
  }

  getRTCConfiguration() {
    let config = {
      //iceServers,
      rtcpMuxPolicy: "require",
      bundlePolicy: "max-bundle",
    };
    //return new Promise((resolve, reject) => {
    return this.getRTCIceServers()
      .then((res) => {
        config.iceServers = res;
        return Promise.resolve(config);
      })
      .catch(() => {
        return Promise.resolve(config);
      });
  }

  getRTCIceServers(location = "https://turn.millicast.com/webrtc/_turn") {
    const url = location;
    return new Promise((resolve, reject) => {
      let a = [];
      MillicastUtils.request(location, "PUT")
        .then((result) => {
          if (result.s === "ok") {
            let list = result.v.iceServers;
            //call returns old format, this updates URL to URLS in credentials path.
            list.forEach((cred) => {
              let v = cred.url;
              if (!!v) {
                cred.urls = v;
                delete cred.url;
              }
              a.push(cred);
            });
          }
          resolve(a);
        })
        .catch((error) => {
          //console.error(error);
          resolve(a);
        });
    });
  }

  setRTCRemoteSDP(sdp) {
    const answer = new RTCSessionDescription({
      type: "answer",
      sdp,
    });
    //Set it
    return this.peer.setRemoteDescription(answer);
  }

  getRTCLocalSDP(
    stereo,
    mediaStream,
    RTCOfferOptions = { offerToReceiveVideo: true, offerToReceiveAudio: true }
  ) {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        this.peer.addTrack(track, mediaStream)
      })
    }

    return this.peer.createOffer(RTCOfferOptions)
      .then((res) => {
        let desc = res
        if (stereo) {
          desc.sdp = desc.sdp.replace("useinbandfec=1", "useinbandfec=1; stereo=1")
        }
        return this.peer.setLocalDescription(desc)
      })
      .then(() => {
        return Promise.resolve(desc.sdp)
      })
      .catch((err) => {
        return Promise.reject(err)
      })
  }

  /**
   * Establish MillicastStream Update Bandwidth.
   * @param {String} sdp - Remote SDP.
   * @param {Number} bitrate - Bitrate, 0 unlimited bitrate
   * @return {String} sdp - Mangled SDP
   */
   updateBandwidthRestriction(sdp, bitrate = 0) {
    let offer = SemanticSDP.SDPInfo.process(sdp);
    let videoOffer = offer.getMedia("video");

    if (bitrate < 1) {
        this.sdp = sdp.replace(/b=AS:.*\r\n/, '').replace(/b=TIAS:.*\r\n/, '');
    } else {
        videoOffer.setBitrate(bitrate);
        this.sdp = offer.toString();
        if (!!window.adapter) {
            if (this.sdp.indexOf('b=AS:') > -1 && adapter.browserDetails.browser === 'firefox') {
                this.sdp = this.sdp.replace('b=AS:', 'b=TIAS:');
            }
        }
    }
    return this.sdp;
}
}
