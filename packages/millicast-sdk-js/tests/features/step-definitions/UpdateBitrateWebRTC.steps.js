import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastWebRTC from '../../../src/MillicastWebRTC'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
import { changeBrowserMock } from './__mocks__/MockBrowser'
const feature = loadFeature('../UpdateBitrateWebRTC.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  afterEach(async () => {
    jest.restoreAllMocks()
    changeBrowserMock('Chrome')
  })

  test('Update bitrate with restrictions', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await millicastWebRTC.getRTCPeer()
      await millicastWebRTC.setRTCRemoteSDP(sdp)
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).toBe(sdp)
    })

    when('I want to update the bitrate to 1000 kbps', async () => {
      await millicastWebRTC.updateBitrate(1000)
    })

    then('the bitrate is updated', async () => {
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).not.toBe(sdp)
    })
  })

  test('Update bitrate with no restrictions', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await millicastWebRTC.getRTCPeer()
      await millicastWebRTC.setRTCRemoteSDP(sdp)
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).toBe(sdp)
    })

    when('I want to update the bitrate to unlimited', async () => {
      await millicastWebRTC.updateBitrate()
    })

    then('the bitrate is updated', async () => {
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).not.toBe(sdp)
    })
  })

  test('Update bitrate with restrictions in Firefox', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const sdp = 'My default SDP'

    given('I am using Firefox and I have a peer connected', async () => {
      changeBrowserMock('firefox')
      await millicastWebRTC.getRTCPeer()
      await millicastWebRTC.setRTCRemoteSDP(sdp)
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).toBe(sdp)
    })

    when('I want to update the bitrate to 1000 kbps', async () => {
      await millicastWebRTC.updateBitrate(1000)
    })

    then('the bitrate is updated', async () => {
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).not.toBe(sdp)
    })
  })
})
