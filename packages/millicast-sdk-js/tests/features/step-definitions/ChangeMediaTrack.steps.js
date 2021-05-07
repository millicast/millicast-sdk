import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastWebRTC from '../../../src/MillicastWebRTC'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'
const feature = loadFeature('../ChangeMediaTrack.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  beforeEach(() => {
    jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
  })

  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Replace track to existing peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const track = { id: 3, kind: 'audio', label: 'Audio2' }

    given('I have a peer connected', async () => {
      await millicastWebRTC.getRTCPeer()
      const tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
      const mediaStream = new MediaStream(tracks)
      await millicastWebRTC.getRTCLocalSDP({ mediaStream })
    })

    when('I want to change current audio track', () => {
      millicastWebRTC.replaceTrack(track)
    })

    then('the track is changed', async () => {
      expect(millicastWebRTC.peer.getSenders()).toBeDefined()
      expect(millicastWebRTC.peer.getSenders()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            track: { ...track }
          })
        ])
      )
    })
  })

  test('Replace track to unexisting peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const track = { id: 3, kind: 'audio', label: 'Audio2' }

    given('I do not have a peer connected', async () => {})

    when('I want to change the audio track', () => {
      millicastWebRTC.replaceTrack(track)
    })

    then('the track is not changed', async () => {
      expect(millicastWebRTC.peer).toBeNull()
    })
  })

  test('Replace unexisting track to peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const track = { id: 2, kind: 'audio', label: 'Audio2' }

    given('I have a peer connected with video track', async () => {
      await millicastWebRTC.getRTCPeer()
      const tracks = [{ id: 1, kind: 'video', label: 'Video1' }]
      const mediaStream = new MediaStream(tracks)
      await millicastWebRTC.getRTCLocalSDP({ mediaStream })
    })

    when('I want to change the audio track', () => {
      millicastWebRTC.replaceTrack(track)
    })

    then('the track is not changed', async () => {
      expect(millicastWebRTC.peer.getSenders()).toBeDefined()
      expect(millicastWebRTC.peer.getSenders()).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({
            track: { ...track }
          })
        ])
      )
    })
  })
})
