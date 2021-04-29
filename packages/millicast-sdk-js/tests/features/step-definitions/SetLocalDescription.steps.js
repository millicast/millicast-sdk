import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastWebRTC from '../../../src/MillicastWebRTC'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
import { changeBrowserMock } from './__mocks__/MockBrowser'
const feature = loadFeature('../SetLocalDescription.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  beforeEach(() => {
    jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    changeBrowserMock('Chrome')
  })

  test('Get RTC Local SDP as subscriber role', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let sdp

    given('I do not have options', async () => {
      await millicastWebRTC.getRTCPeer()
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await millicastWebRTC.getRTCLocalSDP()
    })

    then('returns the SDP', async () => {
      expect(millicastWebRTC.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role with valid MediaStream', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let sdp
    let mediaStream
    let stereo

    given('I have a MediaStream with 1 audio track and 1 video track and I want support stereo', async () => {
      await millicastWebRTC.getRTCPeer()
      const tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
      mediaStream = new MediaStream(tracks)
      stereo = true
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await millicastWebRTC.getRTCLocalSDP({ mediaStream, stereo })
    })

    then('returns the SDP', async () => {
      expect(millicastWebRTC.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role with invalid MediaStream', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let errorResponse
    let mediaStream
    let stereo

    given('I have a MediaStream with 2 video tracks and no audio track', async () => {
      await millicastWebRTC.getRTCPeer()
      const tracks = [{ id: 1, kind: 'video', label: 'Video1' }, { id: 2, kind: 'video', label: 'Video2' }]
      mediaStream = new MediaStream(tracks)
      stereo = true
    })

    when('I want to get the RTC Local SDP', async () => {
      try {
        await millicastWebRTC.getRTCLocalSDP({ mediaStream, stereo })
      } catch (error) {
        errorResponse = error
      }
    })

    then('throw invalid MediaStream error', async () => {
      expect(errorResponse.message).toBe('MediaStream must have 1 audio track and 1 video track, or at least one of them.')
    })
  })

  test('Get RTC Local SDP as publisher role with valid list of tracks', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let sdp
    let tracks

    given('I have a list of tracks with 1 audio track and 1 video track', async () => {
      await millicastWebRTC.getRTCPeer()
      tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await millicastWebRTC.getRTCLocalSDP({ mediaStream: tracks })
    })

    then('returns the SDP', async () => {
      expect(millicastWebRTC.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role with invalid list of tracks', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let errorResponse
    let tracks

    given('I have a list of tracks with 3 audio tracks and 1 video track', async () => {
      await millicastWebRTC.getRTCPeer()
      tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' },
        { id: 3, kind: 'audio', label: 'Audio2' }, { id: 4, kind: 'audio', label: 'Audio3' }]
    })

    when('I want to get the RTC Local SDP', async () => {
      try {
        await millicastWebRTC.getRTCLocalSDP({ mediaStream: tracks })
      } catch (error) {
        errorResponse = error
      }
    })

    then('throw invalid MediaStream error', async () => {
      expect(errorResponse.message).toBe('MediaStream must have 1 audio track and 1 video track, or at least one of them.')
    })
  })
})
