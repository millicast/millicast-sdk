const { MillicastUtils } = require("./MillicastUtils.js");

class MillicastWebRTC {
  constructor() {
    // constructor syntactic suga
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

  getRTCLocalSDP(
    RTCOfferOptions = { offerToReceiveVideo: true, offerToReceiveAudio: true }
  ) {
    let desc = null;
    return this.peer
      .createOffer(RTCOfferOptions)
      .then((res) => {
        desc = res;
        return this.peer.setLocalDescription(desc);
      })
      .then(() => {
        return Promise.resolve(desc.sdp);
      })
      .catch((err) => {
        //console.error(err);
        return Promise.reject(err);
      });
  }

  getRTCPublisherSDP(
    mediaStream,
    RTCOfferOptions = { offerToReceiveVideo: true, offerToReceiveAudio: true }
  ) {
    let desc;
    //let RTCOfferOptions = {offerToReceiveAudio, offerToReceiveVideo};
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        //console.log('audio track: ', track);
        this.peer.addTrack(track, mediaStream);
      });
    }

    return this.peer
      .createOffer(RTCOfferOptions)
      .then((res) => {
        desc = res;
        //support for stereo
        desc.sdp = desc.sdp.replace(
          "useinbandfec=1",
          "useinbandfec=1; stereo=1"
        );
        return this.peer.setLocalDescription(desc);
      })
      .then(() => {
        return Promise.resolve(desc.sdp);
      })
      .catch((err) => {
        //console.error(err);
        return Promise.reject(err);
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
}

module.exports = MillicastWebRTC;
