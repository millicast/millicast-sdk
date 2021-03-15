class MillicastWebRTCTest {
  constructor() {
    const defaultRTCOfferOptions = {
      offerToReceiveVideo: true,
      offerToReceiveAudio: true,
    }
    this.millicastWebRTC = new millicast.MillicastWebRTC()
  }

  async testGetRTCPeer() {
    const RTCPeer = await this.millicastWebRTC.getRTCPeer()
    console.log('GetRTCPeer response: ', RTCPeer)
    return RTCPeer
  }

  async testCloseRTCPeer() {
  }

  testGetRTCConfiguration() {
  }

  testGetRTCIceServers() {
  }

  testSetRTCRemoteSDP() {
  }

  testGetRTCLocalSDP() {
  }

  testResolveLocalSDP() {
  }

  testUpdateBandwidthRestriction() {
  }

  testUpdateBitrate() {
  }
}

const millicastWebRTCTest = new MillicastWebRTCTest()