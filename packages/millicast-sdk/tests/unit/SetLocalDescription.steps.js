import { loadFeature, defineFeature } from 'jest-cucumber'
import { PeerConnection } from '../../src/PeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
import { changeBrowserMock } from './__mocks__/MockBrowser'
const feature = loadFeature('../features/SetLocalDescription.feature', {
  loadRelativePath: true,
  errors: true,
})

defineFeature(feature, (test) => {
  afterEach(async () => {
    jest.restoreAllMocks()
    changeBrowserMock(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
    )
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
      const tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' },
      ]
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
      const tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' },
      ]
      mediaStream = new MediaStream(tracks)
      stereo = true
    })

    when('I want to get the RTC Local SDP without video', async () => {
      sdp = await peerConnection.getRTCLocalSDP({
        mediaStream,
        stereo,
        disableAudio: false,
        disableVideo: true,
      })
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
      const tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' },
      ]
      mediaStream = new MediaStream(tracks)
      stereo = true
    })

    when('I want to get the RTC Local SDP without audio', async () => {
      sdp = await peerConnection.getRTCLocalSDP({
        mediaStream,
        stereo,
        disableAudio: true,
        disableVideo: false,
      })
    })

    then('returns the SDP', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role with simulcast and valid MediaStream', ({
    given,
    when,
    then,
  }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream
    let simulcast

    given(
      'I have a MediaStream with 1 audio track and 1 video track and I want support simulcast',
      async () => {
        await peerConnection.createRTCPeer()
        const tracks = [
          { id: 1, kind: 'audio', label: 'Audio1' },
          { id: 2, kind: 'video', label: 'Video1' },
        ]
        mediaStream = new MediaStream(tracks)
        simulcast = true
      }
    )

    when('I want to get the RTC Local SDP', async () => {
      sdp = await peerConnection.getRTCLocalSDP({
        mediaStream,
        simulcast,
        codec: 'h264',
        disableVideo: false,
      })
    })

    then('returns the SDP', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role with invalid MediaStream', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let errorResponse
    let mediaStream
    let stereo

    given('I have a MediaStream with 2 video tracks and no audio track', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [
        { id: 1, kind: 'video', label: 'Video1' },
        { id: 2, kind: 'video', label: 'Video2' },
      ]
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
      expect(errorResponse.message).toBe(
        'MediaStream must have 1 audio track and 1 video track, or at least one of them.'
      )
    })
  })

  test('Get RTC Local SDP as publisher role with valid list of tracks', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let tracks

    given('I have a list of tracks with 1 audio track and 1 video track', async () => {
      await peerConnection.createRTCPeer()
      tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' },
      ]
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
      tracks = [
        { id: 1, kind: 'audio', label: 'Audio1' },
        { id: 2, kind: 'video', label: 'Video1' },
        { id: 3, kind: 'audio', label: 'Audio2' },
        { id: 4, kind: 'audio', label: 'Audio3' },
      ]
    })

    when('I want to get the RTC Local SDP', async () => {
      try {
        await peerConnection.getRTCLocalSDP({ mediaStream: tracks })
      } catch (error) {
        errorResponse = error
      }
    })

    then('throw invalid MediaStream error', async () => {
      expect(errorResponse.message).toBe(
        'MediaStream must have 1 audio track and 1 video track, or at least one of them.'
      )
    })
  })

  test('Get RTC Local SDP with scalability mode, valid MediaStream and using Chrome', ({
    given,
    when,
    then,
  }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream
    let scalabilityMode

    given(
      'I am using Chrome and I have a MediaStream with 1 audio track and 1 video track and I want to support L1T3 mode',
      async () => {
        await peerConnection.createRTCPeer()
        const tracks = [
          { id: 1, kind: 'audio', label: 'Audio1' },
          { id: 2, kind: 'video', label: 'Video1' },
        ]
        mediaStream = new MediaStream(tracks)
        scalabilityMode = 'L1T3'
      }
    )

    when('I want to get the RTC Local SDP', async () => {
      jest.spyOn(global.RTCPeerConnection.prototype, 'addTransceiver').mockImplementation(jest.fn)
      sdp = await peerConnection.getRTCLocalSDP({
        mediaStream,
        scalabilityMode,
        disableVideo: false,
        disableAudio: false,
      })
    })

    then('returns the SDP with scalability mode', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
      expect(peerConnection.peer.addTransceiver).toHaveBeenCalledTimes(2)
    })
  })

  test('Get RTC Local SDP with scalability mode, valid MediaStream and using Firefox', ({
    given,
    when,
    then,
  }) => {
    const peerConnection = new PeerConnection()
    let sdp
    let mediaStream
    let scalabilityMode

    given(
      'I am using Firefox and I have a MediaStream with 1 audio track and 1 video track and I want to support L1T3 mode',
      async () => {
        changeBrowserMock('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0')
        await peerConnection.createRTCPeer()
        const tracks = [
          { id: 1, kind: 'audio', label: 'Audio1' },
          { id: 2, kind: 'video', label: 'Video1' },
        ]
        mediaStream = new MediaStream(tracks)
        scalabilityMode = 'L1T3'
      }
    )

    when('I want to get the RTC Local SDP', async () => {
      jest.spyOn(global.RTCPeerConnection.prototype, 'addTransceiver').mockImplementation(jest.fn)
      sdp = await peerConnection.getRTCLocalSDP({ mediaStream, scalabilityMode, disableVideo: false })
    })

    then('returns the SDP without scalability mode', async () => {
      expect(peerConnection.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })
})
