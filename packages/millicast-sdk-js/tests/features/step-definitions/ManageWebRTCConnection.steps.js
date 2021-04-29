import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastWebRTC, { webRTCEvents } from '../../../src/MillicastWebRTC'
import { defaultConfig } from './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
import { changeBrowserMock } from './__mocks__/MockBrowser'
const feature = loadFeature('../ManageWebRTCConnection.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  afterEach(async () => {
    jest.restoreAllMocks()
    changeBrowserMock('Chrome')
  })

  test('Get RTC peer without configuration', ({ given, when, then }) => {
    let millicastWebRTC = null
    let peer = null

    given('I have no configuration', async () => {
      jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
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
      jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
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

  test('Close existing RTC peer', ({ given, when, then }) => {
    const handler = jest.fn()
    let millicastWebRTC = null

    given('I have a RTC peer', async () => {
      jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
      millicastWebRTC = new MillicastWebRTC()
      await millicastWebRTC.getRTCPeer()
      millicastWebRTC.on(webRTCEvents.connectionStateChange, handler)
    })

    when('I close the RTC peer', async () => {
      await millicastWebRTC.closeRTCPeer()
    })

    then('the peer is closed and emits connectionStateChange event', async () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith('closed')
      expect(millicastWebRTC.peer).toBeNull()
    })
  })
})
