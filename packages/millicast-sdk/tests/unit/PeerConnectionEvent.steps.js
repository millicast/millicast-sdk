import { loadFeature, defineFeature } from 'jest-cucumber'
import PeerConnection from '../../src/PeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
import MockRTCPeerConnectionNoConnectionState from './__mocks__/MockRTCPeerConnectionNoConnectionState'
const feature = loadFeature('../features/PeerConnectionEvent.feature', {
  loadRelativePath: true,
  errors: true,
})

defineFeature(feature, (test) => {
  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Receive new track from peer', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const handler = jest.fn()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await peerConnection.createRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)
    })

    when('peer returns new track', async () => {
      peerConnection.on('track', handler)
      peerConnection.peer.emitMockEvent('ontrack', { streams: ['new stream incoming'] })
    })

    then('track event is fired', async () => {
      // PeerConnection's track event is asynchronous now
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ streams: ['new stream incoming'] })
    })
  })

  test('Get connecting status from peer', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const handler = jest.fn()
    const sdp = 'My default SDP'

    given('I have a peer', async () => {
      await peerConnection.createRTCPeer()
    })

    when('peer starts to connect', async () => {
      peerConnection.on('connectionStateChange', handler)
      await peerConnection.setRTCRemoteSDP(sdp)
      peerConnection.peer.connectionState = 'connecting'
      peerConnection.peer.emitMockEvent('onconnectionstatechange', {})
    })

    then('connectionStateChange event is fired', async () => {
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('connecting')
    })
  })

  test('Get connected status from peer', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const handler = jest.fn()
    const sdp = 'My default SDP'

    given('I have a peer', async () => {
      await peerConnection.createRTCPeer()
    })

    when('peer connects', async () => {
      peerConnection.on('connectionStateChange', handler)
      await peerConnection.setRTCRemoteSDP(sdp)
      peerConnection.peer.connectionState = 'connected'
      peerConnection.peer.emitMockEvent('onconnectionstatechange', {})
    })

    then('connectionStateChange event is fired', async () => {
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('connected')
    })
  })

  test('Get disconnected status from peer', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const handler = jest.fn()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await peerConnection.createRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)
      peerConnection.peer.connectionState = 'connected'
    })

    when('peer disconnects', async () => {
      peerConnection.on('connectionStateChange', handler)
      peerConnection.peer.connectionState = 'disconnected'
      peerConnection.peer.emitMockEvent('onconnectionstatechange', {})
    })

    then('connectionStateChange event is fired', async () => {
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('disconnected')
    })
  })

  test('Get failed status from peer', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const handler = jest.fn()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await peerConnection.createRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)
      peerConnection.peer.connectionState = 'connected'
    })

    when('peer have a connection error', async () => {
      peerConnection.on('connectionStateChange', handler)
      peerConnection.peer.connectionState = 'failed'
      peerConnection.peer.emitMockEvent('onconnectionstatechange', {})
    })

    then('connectionStateChange event is fired', async () => {
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('failed')
    })
  })

  test('Get new status from peer without connectionState', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const handler = jest.fn()
    const sdp = 'My default SDP'

    given('I have a peer without connectionState', async () => {
      global.RTCPeerConnection = MockRTCPeerConnectionNoConnectionState
      await peerConnection.createRTCPeer()
    })

    when('peer is instanced', async () => {
      peerConnection.on('connectionStateChange', handler)
      await peerConnection.setRTCRemoteSDP(sdp)
      peerConnection.peer.emitMockEvent('oniceconnectionstatechange')
    })

    then('connectionStateChange event is fired', async () => {
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('connected')
    })
  })
})
