import { loadFeature, defineFeature } from 'jest-cucumber'
import { BaseWebRTC } from '../../src/utils/BaseWebRTC'
import { defaultConfig } from './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
const feature = loadFeature('../features/BaseWebRTC.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, (test) => {
  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Get existing RTC peer', ({ given, when, then }) => {
    let baseWebRTC = null
    let peer = null

    given('I have a BaseWebRTC instanced and existing peer', async () => {
      baseWebRTC = new BaseWebRTC(() => {}, null, false)
      await baseWebRTC.webRTCPeer.createRTCPeer()
    })

    when('I want to get the peer', () => {
      peer = baseWebRTC.getRTCPeerConnection()
    })

    then('returns the peer', async () => {
      expect(peer.getConfiguration()).toMatchObject({ ...defaultConfig, bundlePolicy: 'balanced' })
    })
  })

  test('Get no existing RTC peer', ({ given, when, then }) => {
    let baseWebRTC = null
    let peer = null

    given('I have a BaseWebRTC instanced and no existing peer', async () => {
      baseWebRTC = new BaseWebRTC(() => {}, null, false)
      baseWebRTC.webRTCPeer = null
    })

    when('I want to get the peer', () => {
      peer = baseWebRTC.getRTCPeerConnection()
    })

    then('returns null', async () => {
      expect(peer).toBeNull()
    })
  })
})
