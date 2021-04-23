import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastWebRTC from '../../../src/MillicastWebRTC'
const feature = loadFeature('../ManageRTCPeer.feature', { loadRelativePath: true, errors: true })

const defaultConfig = {
  bundlePolicy: 'balanced',
  encodedInsertableStreams: false,
  iceCandidatePoolSize: 0,
  iceServers: [],
  iceTransportPolicy: 'all',
  rtcpMuxPolicy: 'require',
  sdpSemantics: 'unified-plan'
}

class RTCPeerConnection {
  constructor (config = null) {
    this.config = config
    this.remoteDescription = {
      type: 'offer',
      sdp: 'alksdjflkjaskldf'
    }
  }

  getConfiguration () {
    return { ...defaultConfig, ...this.config }
  }
}

global.RTCPeerConnection = RTCPeerConnection

defineFeature(feature, test => {
  test('Get RTC peer without configuration', ({ given, when, then }) => {
    let millicastWebRTC = null
    let peer = null

    jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])

    given('I have no configuration', async () => {
      millicastWebRTC = new MillicastWebRTC()
    })

    when('I get the RTC peer', async () => {
      peer = await millicastWebRTC.getRTCPeer()
    })

    then('returns the peer', async () => {
      expect(peer.getConfiguration()).toMatchObject({ ...defaultConfig, bundlePolicy: 'max-bundle' })
    })
  })

  test('Get RTC peer again', ({ given, when, then }) => {
    let millicastWebRTC = null
    let peer = null

    given('I got the peer previously', async () => {
      millicastWebRTC = new MillicastWebRTC()
      await millicastWebRTC.getRTCPeer()
    })

    when('I get the RTC peer', async () => {
      peer = await millicastWebRTC.getRTCPeer()
    })

    then('returns the peer', async () => {
      expect(peer).toMatchObject(millicastWebRTC.peer)
    })
  })

  test('Get RTC peer with configuration', ({ given, when, then }) => {
    let millicastWebRTC = null
    let peer = null

    given('I have configuration', async () => {
      millicastWebRTC = new MillicastWebRTC()
    })

    when('I get the RTC peer', async () => {
      peer = await millicastWebRTC.getRTCPeer({
        bundlePolicy: 'max-bundle'
      })
    })

    then('returns the peer', async () => {
      expect(peer).toMatchObject(millicastWebRTC.peer)
      expect(peer.getConfiguration()).toMatchObject({
        bundlePolicy: 'max-bundle'
      })
    })
  })
})
