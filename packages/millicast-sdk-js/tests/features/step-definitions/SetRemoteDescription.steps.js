import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastWebRTC from '../../../src/MillicastWebRTC'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
import { changeBrowserMock } from './__mocks__/MockBrowser'
const feature = loadFeature('../SetRemoteDescription.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  afterEach(async () => {
    jest.restoreAllMocks()
    changeBrowserMock('Chrome')
  })

  test('Setting remote SDP to RTC peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const sdp = 'My SDP'

    given('I got the peer', async () => {
      jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
      await millicastWebRTC.getRTCPeer()
    })

    when('I set the remote description', async () => {
      await millicastWebRTC.setRTCRemoteSDP(sdp)
    })

    then('the SDP is setted', async () => {
      expect(millicastWebRTC.peer.currentRemoteDescription).toBeDefined()
    })
  })

  test('Error setting remote SDP to RTC peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const sdp = 'My SDP'
    let responseError

    given('I got the peer', async () => {
      jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
      await millicastWebRTC.getRTCPeer()
    })

    when('I set the remote description and peer returns an error', async () => {
      jest.spyOn(global.RTCPeerConnection.prototype, 'setRemoteDescription').mockRejectedValue(new Error('Invalid answer'))
      try {
        await millicastWebRTC.setRTCRemoteSDP(sdp)
      } catch (error) {
        responseError = error
      }
    })

    then('throws an error', async () => {
      expect(responseError.message).toBe('Invalid answer')
    })
  })
})
