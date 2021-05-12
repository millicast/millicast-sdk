import { loadFeature, defineFeature } from 'jest-cucumber'
import PeerConnection from '../../../src/PeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
import { changeBrowserMock } from './__mocks__/MockBrowser'
const feature = loadFeature('../UpdateBitrateWebRTC.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  beforeEach(() => {
    jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    changeBrowserMock('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36')
  })

  test('Update bitrate with restrictions', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await peerConnection.getRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)
      expect(peerConnection.peer.currentRemoteDescription.sdp).toBe(sdp)
    })

    when('I want to update the bitrate to 1000 kbps', async () => {
      await peerConnection.updateBitrate(1000)
    })

    then('the bitrate is updated', async () => {
      expect(peerConnection.peer.currentRemoteDescription.sdp).not.toBe(sdp)
    })
  })

  test('Update bitrate with no restrictions', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await peerConnection.getRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)
      expect(peerConnection.peer.currentRemoteDescription.sdp).toBe(sdp)
    })

    when('I want to update the bitrate to unlimited', async () => {
      await peerConnection.updateBitrate()
    })

    then('the bitrate is updated', async () => {
      expect(peerConnection.peer.currentRemoteDescription.sdp).not.toBe(sdp)
    })
  })

  test('Update bitrate with restrictions in Firefox', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const sdp = 'My default SDP'

    given('I am using Firefox and I have a peer connected', async () => {
      changeBrowserMock('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0')
      await peerConnection.getRTCPeer()
      await peerConnection.setRTCRemoteSDP(sdp)
      expect(peerConnection.peer.currentRemoteDescription.sdp).toBe(sdp)
    })

    when('I want to update the bitrate to 1000 kbps', async () => {
      await peerConnection.updateBitrate(1000)
    })

    then('the bitrate is updated', async () => {
      expect(peerConnection.peer.currentRemoteDescription.sdp).not.toBe(sdp)
    })
  })
})
