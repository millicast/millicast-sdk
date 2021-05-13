import { loadFeature, defineFeature } from 'jest-cucumber'
import PeerConnection, { webRTCEvents } from '../../../src/PeerConnection'
import { defaultConfig } from './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
const feature = loadFeature('../ManagePeerConnection.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  beforeEach(() => {
    jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
  })

  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Get RTC peer without configuration', ({ given, when, then }) => {
    let peerConnection = null
    let peer = null

    given('I have no configuration', async () => {
      jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
      peerConnection = new PeerConnection()
    })

    when('I get the RTC peer', async () => {
      peer = await peerConnection.getRTCPeer()
    })

    then('returns the peer', async () => {
      expect(peer.getConfiguration()).toMatchObject({ ...defaultConfig, bundlePolicy: 'max-bundle' })
    })
  })

  test('Get RTC peer again', ({ given, when, then }) => {
    let peerConnection = null
    let peer = null

    given('I got the peer previously', async () => {
      jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
      peerConnection = new PeerConnection()
      await peerConnection.getRTCPeer()
    })

    when('I get the RTC peer', async () => {
      peer = await peerConnection.getRTCPeer()
    })

    then('returns the peer', async () => {
      expect(peer).toMatchObject(peerConnection.peer)
    })
  })

  test('Get RTC peer with configuration', ({ given, when, then }) => {
    let peerConnection = null
    let peer = null

    given('I have configuration', async () => {
      peerConnection = new PeerConnection()
    })

    when('I get the RTC peer', async () => {
      peer = await peerConnection.getRTCPeer({
        bundlePolicy: 'max-bundle'
      })
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
      jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
      peerConnection = new PeerConnection()
      await peerConnection.getRTCPeer()
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
