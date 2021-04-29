import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastWebRTC from '../../../src/MillicastWebRTC'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
const feature = loadFeature('../GetPeerStatus.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  beforeEach(() => {
    jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
  })

  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Get existing RTC peer status', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let status

    given('I have a peer instanced', async () => {
      await millicastWebRTC.getRTCPeer()
    })

    when('I want to get the peer connection state', () => {
      status = millicastWebRTC.getRTCPeerStatus()
    })

    then('returns the connection state', async () => {
      expect(status).toBe('new')
    })
  })

  test('Get unexisting RTC peer status', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let status

    given('I do not have a peer connected', async () => {})

    when('I want to get the peer connection state', () => {
      status = millicastWebRTC.getRTCPeerStatus()
    })

    then('returns no value', async () => {
      expect(status).toBeNull()
    })
  })
})
