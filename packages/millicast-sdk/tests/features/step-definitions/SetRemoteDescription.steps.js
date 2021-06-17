import { loadFeature, defineFeature } from 'jest-cucumber'
import PeerConnection from '../../../src/PeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
const feature = loadFeature('../SetRemoteDescription.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  beforeEach(() => {
    jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
  })

  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Setting remote SDP to RTC peer', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const sdp = 'My SDP'

    given('I got the peer', async () => {
      jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
      await peerConnection.createRTCPeer()
    })

    when('I set the remote description', async () => {
      await peerConnection.setRTCRemoteSDP(sdp)
    })

    then('the SDP is setted', async () => {
      expect(peerConnection.peer.currentRemoteDescription).toBeDefined()
    })
  })

  test('Error setting remote SDP to RTC peer', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const sdp = 'My SDP'
    let responseError

    given('I got the peer', async () => {
      jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
      await peerConnection.createRTCPeer()
    })

    when('I set the remote description and peer returns an error', async () => {
      jest.spyOn(global.RTCPeerConnection.prototype, 'setRemoteDescription').mockRejectedValue(new Error('Invalid answer'))
      try {
        await peerConnection.setRTCRemoteSDP(sdp)
      } catch (error) {
        responseError = error
      }
    })

    then('throws an error', async () => {
      expect(responseError.message).toBe('Invalid answer')
    })
  })
})
