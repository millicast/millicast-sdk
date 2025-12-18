import { loadFeature, defineFeature } from 'jest-cucumber'
import PeerConnection, { webRTCEvents } from '../../src/PeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
import MockRTCPeerConnectionNoConnectionState from './__mocks__/MockRTCPeerConnectionNoConnectionState'
const feature = loadFeature('../features/PeerConnectionEvent.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
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
      peerConnection.on(webRTCEvents.track, handler)
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
      peerConnection.on(webRTCEvents.connectionStateChange, handler)
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
      peerConnection.on(webRTCEvents.connectionStateChange, handler)
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
      peerConnection.on(webRTCEvents.connectionStateChange, handler)
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
      peerConnection.on(webRTCEvents.connectionStateChange, handler)
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
      peerConnection.on(webRTCEvents.connectionStateChange, handler)
      await peerConnection.setRTCRemoteSDP(sdp)
      peerConnection.peer.emitMockEvent('oniceconnectionstatechange')
    })

    then('connectionStateChange event is fired', async () => {
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('connected')
    })
  })

  // New tests for degradation preference
  test('Apply degradation preference successfully', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const sdp = 'My default SDP'
    let result

    given('I have a peer connected with video track', async () => {
      await peerConnection.createRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)

      // Mock video sender
      const mockVideoTrack = { kind: 'video' }
      const mockSender = {
        track: mockVideoTrack,
        getParameters: jest.fn(() => ({ degradationPreference: 'balanced' })),
        setParameters: jest.fn(() => Promise.resolve())
      }
      peerConnection.peer.getSenders = jest.fn(() => [mockSender])
    })

    when('I apply maintain-resolution degradation preference', async () => {
      result = await peerConnection.applyDegradationPreference('maintain-resolution')
    })

    then('degradation preference is set successfully', () => {
      const sender = peerConnection.peer.getSenders()[0]
      expect(sender.setParameters).toHaveBeenCalledWith(
        expect.objectContaining({ degradationPreference: 'maintain-resolution' })
      )
      expect(result).toBeUndefined() // Method returns void on success
    })
  })

  test('Apply degradation preference with invalid option', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const sdp = 'My default SDP'
    let result

    given('I have a peer connected with video track', async () => {
      await peerConnection.createRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)

      const mockVideoTrack = { kind: 'video' }
      const mockSender = {
        track: mockVideoTrack,
        getParameters: jest.fn(() => ({ degradationPreference: 'balanced' })),
        setParameters: jest.fn(() => Promise.resolve())
      }
      peerConnection.peer.getSenders = jest.fn(() => [mockSender])
    })

    when('I apply invalid degradation preference', async () => {
      result = await peerConnection.applyDegradationPreference('invalid-option')
    })

    then('degradation preference is not applied', () => {
      const sender = peerConnection.peer.getSenders()[0]
      expect(sender.setParameters).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  test('Apply degradation preference without video track', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const sdp = 'My default SDP'
    let result

    given('I have a peer connected without video track', async () => {
      await peerConnection.createRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)

      // Mock only audio sender
      const mockAudioTrack = { kind: 'audio' }
      const mockSender = {
        track: mockAudioTrack,
        getParameters: jest.fn(() => ({})),
        setParameters: jest.fn(() => Promise.resolve())
      }
      peerConnection.peer.getSenders = jest.fn(() => [mockSender])
    })

    when('I apply degradation preference', async () => {
      result = await peerConnection.applyDegradationPreference('maintain-resolution')
    })

    then('degradation preference is not applied', () => {
      const sender = peerConnection.peer.getSenders()[0]
      expect(sender.setParameters).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  test('Apply degradation preference with undefined value', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const sdp = 'My default SDP'
    let result

    given('I have a peer connected with video track', async () => {
      await peerConnection.createRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)

      const mockVideoTrack = { kind: 'video' }
      const mockSender = {
        track: mockVideoTrack,
        getParameters: jest.fn(() => ({ degradationPreference: 'balanced' })),
        setParameters: jest.fn(() => Promise.resolve())
      }
      peerConnection.peer.getSenders = jest.fn(() => [mockSender])
    })

    when('I apply undefined degradation preference', async () => {
      result = await peerConnection.applyDegradationPreference(undefined)
    })

    then('degradation preference is not applied', () => {
      const sender = peerConnection.peer.getSenders()[0]
      expect(sender.setParameters).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  test('Apply degradation preference fails with error', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const sdp = 'My default SDP'
    let error

    given('I have a peer connected with video track', async () => {
      await peerConnection.createRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)

      const mockVideoTrack = { kind: 'video' }
      const mockSender = {
        track: mockVideoTrack,
        getParameters: jest.fn(() => ({ degradationPreference: 'balanced' })),
        setParameters: jest.fn(() => Promise.reject(new Error('setParameters failed')))
      }
      peerConnection.peer.getSenders = jest.fn(() => [mockSender])
    })

    when('I apply degradation preference and it fails', async () => {
      try {
        await peerConnection.applyDegradationPreference('maintain-resolution')
      } catch (e) {
        error = e
      }
    })

    then('error is thrown', () => {
      expect(error).toBeDefined()
      expect(error.message).toBe('setParameters failed')
    })
  })

  test('Apply all valid degradation preferences', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const sdp = 'My default SDP'
    const validOptions = ['balanced', 'maintain-framerate', 'maintain-resolution']
    const results = []

    given('I have a peer connected with video track', async () => {
      await peerConnection.createRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)

      const mockVideoTrack = { kind: 'video' }
      const mockSender = {
        track: mockVideoTrack,
        getParameters: jest.fn(() => ({ degradationPreference: 'balanced' })),
        setParameters: jest.fn(() => Promise.resolve())
      }
      peerConnection.peer.getSenders = jest.fn(() => [mockSender])
    })

    when('I apply each valid degradation preference', async () => {
      for (const option of validOptions) {
        await peerConnection.applyDegradationPreference(option)
        results.push(option)
      }
    })

    then('all degradation preferences are applied successfully', () => {
      const sender = peerConnection.peer.getSenders()[0]
      expect(sender.setParameters).toHaveBeenCalledTimes(3)
      expect(results).toEqual(validOptions)
    })
  })
})
