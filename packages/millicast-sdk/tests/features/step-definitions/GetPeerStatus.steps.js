import { loadFeature, defineFeature } from 'jest-cucumber'
import PeerConnection from '../../../src/PeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockRTCPeerConnection'
import MockRTCPeerConnectionNoConnectionState from './__mocks__/MockRTCPeerConnectionNoConnectionState'
const feature = loadFeature('../GetPeerStatus.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  beforeEach(() => {
    jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
  })

  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Get existing RTC peer status', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let status

    given('I have a peer instanced', async () => {
      await peerConnection.getRTCPeer()
    })

    when('I want to get the peer connection state', () => {
      status = peerConnection.getRTCPeerStatus()
    })

    then('returns the connection state', async () => {
      expect(status).toBe('new')
    })
  })

  test('Get unexisting RTC peer status', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let status

    given('I do not have a peer connected', async () => {})

    when('I want to get the peer connection state', () => {
      status = peerConnection.getRTCPeerStatus()
    })

    then('returns no value', async () => {
      expect(status).toBeNull()
    })
  })

  test('Get existing RTC peer status without connectionState', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    let status

    given('I have a peer instanced without connectionState', async () => {
      global.RTCPeerConnection = MockRTCPeerConnectionNoConnectionState
      await peerConnection.getRTCPeer()
    })

    when('I want to get the peer connection state', () => {
      status = peerConnection.getRTCPeerStatus()
    })

    then('returns the connection state', async () => {
      expect(status).toBe('new')
    })
  })
})
