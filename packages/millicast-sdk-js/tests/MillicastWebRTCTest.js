import MillicastWebRTC from "../src/MillicastWebRTC";

const MillicastWebRTCTest = () => {
  const config = {};
  const webRTC = new MillicastWebRTC();

  webRTC.getRTCPeer();
};

module.exports = MillicastWebRTCTest;
