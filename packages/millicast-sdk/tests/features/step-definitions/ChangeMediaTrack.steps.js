import { loadFeature, defineFeature } from 'jest-cucumber'
import PeerConnection from '../../../src/PeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'
const feature = loadFeature('../ChangeMediaTrack.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Replace track to existing peer', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const track = { id: 3, kind: 'audio', label: 'Audio2' }

    given('I have a peer connected', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
      const mediaStream = new MediaStream(tracks)
      await peerConnection.getRTCLocalSDP({ mediaStream, disableVideo: false, disableAudio: false })
    })

    when('I want to change current audio track', () => {
      peerConnection.replaceTrack(track)
    })

    then('the track is changed', async () => {
      expect(peerConnection.peer.getSenders()).toBeDefined()
      expect(peerConnection.peer.getSenders()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            track: { ...track }
          })
        ])
      )
    })
  })

  test('Replace track to unexisting peer', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const track = { id: 3, kind: 'audio', label: 'Audio2' }

    given('I do not have a peer connected', async () => {})

    when('I want to change the audio track', () => {
      peerConnection.replaceTrack(track)
    })

    then('the track is not changed', async () => {
      expect(peerConnection.peer).toBeNull()
    })
  })

  test('Replace unexisting track to peer', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const track = { id: 2, kind: 'audio', label: 'Audio2' }

    given('I have a peer connected with video track', async () => {
      await peerConnection.createRTCPeer()
      const tracks = [{ id: 1, kind: 'video', label: 'Video1' }]
      const mediaStream = new MediaStream(tracks)
      await peerConnection.getRTCLocalSDP({ mediaStream })
    })

    when('I want to change the audio track', () => {
      peerConnection.replaceTrack(track)
    })

    then('the track is not changed', async () => {
      expect(peerConnection.peer.getSenders()).toBeDefined()
      expect(peerConnection.peer.getSenders()).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({
            track: { ...track }
          })
        ])
      )
    })
  })
})
