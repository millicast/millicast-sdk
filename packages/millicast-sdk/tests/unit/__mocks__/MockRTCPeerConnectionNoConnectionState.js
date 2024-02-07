import MockRTCPeerConnection from './MockRTCPeerConnection'

export const defaultConfig = {
  bundlePolicy: 'balanced',
  encodedInsertableStreams: false,
  iceCandidatePoolSize: 0,
  iceServers: [],
  iceTransportPolicy: 'all',
  rtcpMuxPolicy: 'require',
  sdpSemantics: 'unified-plan'
}

export default class MockRTCPeerConnectionNoConnectionState extends MockRTCPeerConnection {
  constructor (config = null) {
    super()
    this.connectionState = null
    this.iceConnectionState = 'new'
  }

  setRemoteDescription (answer) {
    this.currentRemoteDescription = answer
    this.iceConnectionState = 'connected'
  }

  onconnectionstatechange (state) {}

  oniceconnectionstatechange (state) {
    this.iceConnectionState = state
  }

  emitMockEvent (eventName, data) {
    if (eventName === 'ontrack') {
      this.ontrack(data)
    } else if (eventName === 'oniceconnectionstatechange') {
      this.oniceconnectionstatechange(data)
    }
  }
}
