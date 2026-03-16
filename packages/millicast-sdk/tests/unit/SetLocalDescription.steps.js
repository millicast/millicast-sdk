import { loadFeature, defineFeature } from 'jest-cucumber'
import PeerConnection from '../../src/PeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
import { changeBrowserMock } from './__mocks__/MockBrowser'
const feature = loadFeature('../features/SetLocalDescription.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  afterEach(async () => {
    jest.restoreAllMocks()
    changeBrowserMock('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36')
  })

  test('Get RTC Local SDP as subscriber role', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp

    given('I do not have options', async () => {
      await peerConnection.createRTCPeer()
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP()
    })

    then('returns the SDP', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP without video as subscriber role', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp

    given('I want local SDP without video', async () => {
      await peerConnection.createRTCPeer()
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ disableAudio: false, disableVideo: true })
    })

    then('returns the SDP', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP without audio as subscriber role', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp

    given('I want local SDP without audio', async () => {
      await peerConnection.createRTCPeer()
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ disableAudio: true, disableVideo: false })
    })

    then('returns the SDP', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role with valid MediaStream', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream
    let stereo

    given('I have a MediaStream with 1 audio track and 1 video track and I want support stereo', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
      mediaStream = new MediaStream(tracks)
      stereo = true
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, stereo })
    })

    then('returns the SDP', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role without video', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream
    let stereo

    given('I have a MediaStream with 1 audio track and 1 video track', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
      mediaStream = new MediaStream(tracks)
      stereo = true
    })

    when('I want to get the RTC Local SDP without video', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, stereo, disableAudio: false, disableVideo: true })
    })

    then('returns the SDP', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role without audio', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream
    let stereo

    given('I have a MediaStream with 1 audio track and 1 video track', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
      mediaStream = new MediaStream(tracks)
      stereo = true
    })

    when('I want to get the RTC Local SDP without audio', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, stereo, disableAudio: true, disableVideo: false })
    })

    then('returns the SDP', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role with simulcast and valid MediaStream', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream
    let simulcast

    given('I have a MediaStream with 1 audio track and 1 video track and I want support simulcast', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
      mediaStream = new MediaStream(tracks)
      simulcast = true
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, simulcast, codec: 'h264', disableVideo: false })
    })

    then('returns the SDP', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
      // Verify simulcast was configured via sendEncodings on the video transceiver
      const videoTransceiver = peerConnection.peer.getTransceivers().find(
        t => t.sender.track?.kind === 'video'
      )
      expect(videoTransceiver).toBeDefined()
      expect(videoTransceiver.setCodecPreferences).toHaveBeenCalled()
    })
  })

  test('Get RTC Local SDP as publisher role with invalid MediaStream', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let errorResponse
    let mediaStream
    let stereo

    given('I have a MediaStream with 2 video tracks and no audio track', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [{ id: 1, kind: 'video', label: 'Video1' }, { id: 2, kind: 'video', label: 'Video2' }]
      mediaStream = new MediaStream(tracks)
      stereo = true
    })

    when('I want to get the RTC Local SDP', async () => {
      try {
        await peerConnection.getRTCLocalSDP({ mediaStream, stereo })
      } catch (error) {
        errorResponse = error
      }
    })

    then('throw invalid MediaStream error', async () => {
      expect(errorResponse.message).toBe('MediaStream must have 1 audio track and 1 video track, or at least one of them.')
    })
  })

  test('Get RTC Local SDP as publisher role with valid list of tracks', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let tracks

    given('I have a list of tracks with 1 audio track and 1 video track', async () => {
      await peerConnection.createRTCPeer()
      tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream: tracks })
    })

    then('returns the SDP', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role with invalid list of tracks', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let errorResponse
    let tracks

    given('I have a list of tracks with 3 audio tracks and 1 video track', async () => {
      await peerConnection.createRTCPeer()
      tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' },
        { id: 3, kind: 'audio', label: 'Audio2' }, { id: 4, kind: 'audio', label: 'Audio3' }]
    })

    when('I want to get the RTC Local SDP', async () => {
      try {
        await peerConnection.getRTCLocalSDP({ mediaStream: tracks })
      } catch (error) {
        errorResponse = error
      }
    })

    then('throw invalid MediaStream error', async () => {
      expect(errorResponse.message).toBe('MediaStream must have 1 audio track and 1 video track, or at least one of them.')
    })
  })

  test('Get RTC Local SDP with scalability mode, valid MediaStream and using Chrome', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream
    let scalabilityMode

    given('I am using Chrome and I have a MediaStream with 1 audio track and 1 video track and I want to support L1T3 mode', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' }
      ]
      mediaStream = new MediaStream(tracks)
      scalabilityMode = 'L1T3'
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, scalabilityMode, disableVideo: false, disableAudio: false })
    })

    then('returns the SDP with scalability mode', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
      expect(peerConnection.peer.getTransceivers().length).toBe(2)
    })
  })

  test('Get RTC Local SDP with scalability mode, valid MediaStream and using Firefox', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream
    let scalabilityMode

    given('I am using Firefox and I have a MediaStream with 1 audio track and 1 video track and I want to support L1T3 mode', async () => {
      changeBrowserMock('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0')
      await peerConnection.createRTCPeer()
      const tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' }
      ]
      mediaStream = new MediaStream(tracks)
      scalabilityMode = 'L1T3'
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, scalabilityMode, disableVideo: false })
    })

    then('returns the SDP without scalability mode', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP with DTX enabled', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream

    given('I have a MediaStream with 1 audio track and 1 video track and DTX enabled', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' }
      ]
      mediaStream = new MediaStream(tracks)
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, dtx: true })
    })

    then('returns the SDP with DTX configured via SDP munging', async () => {
      expect(sdp).toBeDefined()
      expect(sdp).toContain('useinbandfec=1;usedtx=1')
    })
  })

  test('Get RTC Local SDP with stereo configured via browser API', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream

    given('I have a MediaStream with 1 audio track and 1 video track and stereo enabled', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' }
      ]
      mediaStream = new MediaStream(tracks)
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, stereo: true })
    })

    then('returns the SDP with stereo configured via SDP munging', async () => {
      expect(sdp).toBeDefined()
      expect(sdp).toContain('useinbandfec=1;stereo=1;sprop-stereo=1')
    })
  })

  test('Get RTC Local SDP with multi-opus configured via browser API', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream

    given('I have a MediaStream with 1 audio track and 1 video track for multi-opus', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' }
      ]
      mediaStream = new MediaStream(tracks)
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream })
    })

    then('returns the SDP with multi-opus configured via browser API', async () => {
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP with absCaptureTime header extension', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream

    given('I have a MediaStream with 1 audio track and 1 video track and absCaptureTime enabled', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' }
      ]
      mediaStream = new MediaStream(tracks)
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, absCaptureTime: true })
    })

    then('returns the SDP with absCaptureTime header extension configured', async () => {
      expect(sdp).toBeDefined()
      const transceivers = peerConnection.peer.getTransceivers()
      const txWithExtensions = transceivers.find(t => t.setHeaderExtensionsToNegotiate.mock.calls.length > 0)
      expect(txWithExtensions).toBeDefined()
      const extensionArgs = txWithExtensions.setHeaderExtensionsToNegotiate.mock.calls[0][0]
      const absCaptureExt = extensionArgs.find(ext => ext.uri === 'http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time')
      expect(absCaptureExt).toBeDefined()
    })
  })

  test('Get RTC Local SDP with dependencyDescriptor header extension', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream

    given('I have a MediaStream with 1 audio track and 1 video track and dependencyDescriptor enabled', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' }
      ]
      mediaStream = new MediaStream(tracks)
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, dependencyDescriptor: true, simulcast: true, codec: 'h264' })
    })

    then('returns the SDP with dependencyDescriptor header extension configured', async () => {
      expect(sdp).toBeDefined()
      const transceivers = peerConnection.peer.getTransceivers()
      const videoTx = transceivers.find(t => t.sender.track?.kind === 'video')
      expect(videoTx).toBeDefined()
      expect(videoTx.setHeaderExtensionsToNegotiate).toHaveBeenCalled()
      const extensionArgs = videoTx.setHeaderExtensionsToNegotiate.mock.calls[0][0]
      const ddExt = extensionArgs.find(ext => ext.uri === 'https://aomediacodec.github.io/av1-rtp-spec/#dependency-descriptor-rtp-header-extension')
      expect(ddExt).toBeDefined()
    })
  })

  test('Get RTC Local SDP with simulcast configures multiple sendEncodings layers', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream

    given('I have a MediaStream with 1 audio track and 1 video track for simulcast encoding verification', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' }
      ]
      mediaStream = new MediaStream(tracks)
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, simulcast: true, codec: 'h264', disableVideo: false })
    })

    then('returns the SDP with simulcast sendEncodings layers configured', async () => {
      expect(sdp).toBeDefined()
      const videoTransceiver = peerConnection.peer.getTransceivers().find(
        t => t.sender.track?.kind === 'video'
      )
      expect(videoTransceiver).toBeDefined()
      // Verify encoding layers have rids
      const params = videoTransceiver.sender.getParameters()
      expect(params.encodings.length).toBeGreaterThan(1)
      expect(params.encodings[0].rid).toBe('high')
      expect(params.encodings[0].maxBitrate).toBeDefined()
      expect(params.encodings[0].scaleResolutionDownBy).toBeDefined()
    })
  })

  test('Renegotiation syncs video header extensions to new transceivers', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const referenceExtensions = [
      { uri: 'http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time', direction: 'sendonly' },
      { uri: 'https://aomediacodec.github.io/av1-rtp-spec/#dependency-descriptor-rtp-header-extension', direction: 'sendrecv' }
    ]

    given('I have an established peer connection with a video transceiver with header extensions', async () => {
      await peerConnection.createRTCPeer()
      // Add first video transceiver with header extensions
      const tx1 = peerConnection.peer.addTransceiver(
        { kind: 'video', label: 'Video1', id: '1', getSettings: () => ({ width: 1280, height: 720 }) },
        { direction: 'sendonly' }
      )
      tx1.getHeaderExtensionsToNegotiate.mockReturnValue(referenceExtensions)
      // Set remote description so onnegotiationneeded can proceed
      await peerConnection.setRTCRemoteSDP('remote-sdp')
    })

    when('a new video transceiver is added and renegotiation is triggered', async () => {
      // Add second video transceiver (no extensions set yet)
      peerConnection.peer.addTransceiver(
        { kind: 'video', label: 'Video2', id: '2', getSettings: () => ({ width: 1280, height: 720 }) },
        { direction: 'sendonly' }
      )
      // Trigger onnegotiationneeded
      if (peerConnection.peer.onnegotiationneeded) {
        await peerConnection.peer.onnegotiationneeded()
      }
    })

    then('the new video transceiver has the same header extensions as the first', async () => {
      const transceivers = peerConnection.peer.getTransceivers()
      const videoTransceivers = transceivers.filter(t => t.sender?.track?.kind === 'video')
      expect(videoTransceivers.length).toBe(2)
      // The second transceiver should have had setHeaderExtensionsToNegotiate called with the reference extensions
      expect(videoTransceivers[1].setHeaderExtensionsToNegotiate).toHaveBeenCalledWith(referenceExtensions)
    })
  })
})
