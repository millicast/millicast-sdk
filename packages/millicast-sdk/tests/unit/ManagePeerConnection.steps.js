import { loadFeature, defineFeature } from 'jest-cucumber'
import PeerConnection, { webRTCEvents } from '../../src/PeerConnection'
import { defaultConfig } from './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
const feature = loadFeature('../features/ManagePeerConnection.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Get RTC peer without configuration', ({ given, when, then }) => {
    let peerConnection = null
    let peer = null

    given('I have no configuration', async () => {
      peerConnection = new PeerConnection()
    })

    when('I get the RTC peer', async () => {
      await peerConnection.createRTCPeer()
      peer = peerConnection.getRTCPeer()
    })

    then('returns the peer', async () => {
      expect(peer.getConfiguration()).toMatchObject({ ...defaultConfig, bundlePolicy: 'balanced' })
    })
  })

  test('Get RTC peer without instance previously', ({ given, when, then }) => {
    let peerConnection = null
    let peer = null

    given('I have no configuration', async () => {
      peerConnection = new PeerConnection()
    })

    when('I get the RTC peer without instance first', async () => {
      peer = peerConnection.getRTCPeer()
    })

    then('returns null', async () => {
      expect(peer).toBeNull()
    })
  })

  test('Get RTC peer with configuration', ({ given, when, then }) => {
    let peerConnection = null
    let peer = null

    given('I have configuration', async () => {
      peerConnection = new PeerConnection()
    })

    when('I get the RTC peer', async () => {
      await peerConnection.createRTCPeer({
        bundlePolicy: 'max-bundle'
      })
      peer = peerConnection.getRTCPeer()
    })

    then('returns the peer', async () => {
      expect(peer).toMatchObject(peerConnection.peer)
      expect(peer.getConfiguration()).toMatchObject({
        bundlePolicy: 'max-bundle'
      })
    })
  })

  test('Close existing RTC peer', ({ given, when, then }) => {
    const handler = jest.fn()
    let peerConnection = null

    given('I have a RTC peer', async () => {
      peerConnection = new PeerConnection()
      await peerConnection.createRTCPeer()
      peerConnection.on(webRTCEvents.connectionStateChange, handler)
    })

    when('I close the RTC peer', async () => {
      await peerConnection.closeRTCPeer()
    })

    then('the peer is closed and emits connectionStateChange event', async () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith('closed')
      expect(peerConnection.peer).toBeNull()
    })
  })
})
