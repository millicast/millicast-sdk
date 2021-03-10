import MillicastWebRTC from "../src/MillicastWebRTC";

class MillicastWebRTCTest {
  constructor() {
    this.webRTC = new MillicastWebRTC();
  }

  testGetRTCPeer() {
    return this.webRTC.getRTCPeer();
  }
}

module.exports = MillicastWebRTCTest;
