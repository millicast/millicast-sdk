import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastWebRTC, { webRTCEvents } from '../../../src/MillicastWebRTC'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
const feature = loadFeature('../PeerConnectionEvent.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  beforeEach(() => {
    jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
  })

  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Receive new track from peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const handler = jest.fn()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await millicastWebRTC.getRTCPeer()
      await millicastWebRTC.setRTCRemoteSDP(sdp)
    })

    when('peer returns new track', async () => {
      millicastWebRTC.on(webRTCEvents.track, handler)
      millicastWebRTC.peer.emitMockEvent('ontrack', { streams: ['new stream incoming'] })
    })

    then('track event is fired', async () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith({ streams: ['new stream incoming'] })
    })
  })

  test('Get connecting status from peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const handler = jest.fn()
    const sdp = 'My default SDP'

    given('I have a peer', async () => {
      await millicastWebRTC.getRTCPeer()
    })

    when('peer starts to connect', async () => {
      millicastWebRTC.on(webRTCEvents.connectionStateChange, handler)
      await millicastWebRTC.setRTCRemoteSDP(sdp)
      millicastWebRTC.peer.connectionState = 'connecting'
      millicastWebRTC.peer.emitMockEvent('onconnectionstatechange', {})
    })

    then('connectionStateChange event is fired', async () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith('connecting')
    })
  })

  test('Get connected status from peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const handler = jest.fn()
    const sdp = 'My default SDP'

    given('I have a peer', async () => {
      await millicastWebRTC.getRTCPeer()
    })

    when('peer connects', async () => {
      millicastWebRTC.on(webRTCEvents.connectionStateChange, handler)
      await millicastWebRTC.setRTCRemoteSDP(sdp)
      millicastWebRTC.peer.connectionState = 'connected'
      millicastWebRTC.peer.emitMockEvent('onconnectionstatechange', {})
    })

    then('connectionStateChange event is fired', async () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith('connected')
    })
  })

  test('Get disconnected status from peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const handler = jest.fn()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await millicastWebRTC.getRTCPeer()
      await millicastWebRTC.setRTCRemoteSDP(sdp)
      millicastWebRTC.peer.connectionState = 'connected'
    })

    when('peer disconnects', async () => {
      millicastWebRTC.on(webRTCEvents.connectionStateChange, handler)
      millicastWebRTC.peer.connectionState = 'disconnected'
      millicastWebRTC.peer.emitMockEvent('onconnectionstatechange', {})
    })

    then('connectionStateChange event is fired', async () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith('disconnected')
    })
  })

  test('Get failed status from peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const handler = jest.fn()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await millicastWebRTC.getRTCPeer()
      await millicastWebRTC.setRTCRemoteSDP(sdp)
      millicastWebRTC.peer.connectionState = 'connected'
    })

    when('peer have a connection error', async () => {
      millicastWebRTC.on(webRTCEvents.connectionStateChange, handler)
      millicastWebRTC.peer.connectionState = 'failed'
      millicastWebRTC.peer.emitMockEvent('onconnectionstatechange', {})
    })

    then('connectionStateChange event is fired', async () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith('failed')
    })
  })
})
