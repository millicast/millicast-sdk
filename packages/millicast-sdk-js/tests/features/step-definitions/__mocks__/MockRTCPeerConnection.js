export const defaultConfig = {
  bundlePolicy: 'balanced',
  encodedInsertableStreams: false,
  iceCandidatePoolSize: 0,
  iceServers: [],
  iceTransportPolicy: 'all',
  rtcpMuxPolicy: 'require',
  sdpSemantics: 'unified-plan'
}

class MockRTCPeerConnection {
  constructor (config = null) {
    this.config = config
    this.remoteDescription = {
      type: 'offer',
      sdp: 'SDP data'
    }
    this.signalingState = 'stable'
    this.currentRemoteDescription = null
  }

  getConfiguration () {
    return { ...defaultConfig, ...this.config }
  }

  close () {
    this.signalingState = 'closed'
  }

  setRemoteDescription (answer) {
    this.currentRemoteDescription = answer
  }
}

global.RTCPeerConnection = MockRTCPeerConnection
