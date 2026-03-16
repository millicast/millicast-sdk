import WS from 'jest-websocket-mock'
import TransactionManager from 'transaction-manager'
import Signaling from '../../src/Signaling'
import './__mocks__/MockBrowser'
import { WebSocket } from 'mock-socket'

global.RTCRtpReceiver = {
  getCapabilities: jest.fn()
}

global.WebSocket = WebSocket

describe('Signaling internal options', () => {
  const publishWebSocketLocation = 'ws://localhost:8080'
  const streamName = 'TestStream'
  const accountId = 'TestAccount'
  const publisherId = 'Publisher123'
  const offerSdp = `v=0
    o=alice 2890844526 2890844526 IN IP4 host.anywhere.com
    s=
    c=IN IP4 host.anywhere.com
    t=0 0
    m=audio 49170 RTP/AVP 0
    a=rtpmap:0 PCMU/8000
  `
  let server = null
  let cmdSpy = null

  beforeEach(async () => {
    server = new WS(publishWebSocketLocation, { jsonProtocol: true })
    jest.restoreAllMocks()
    const browserCapabilities = {
      codecs: [
        { clockRate: 90000, mimeType: 'video/VP8' },
        { clockRate: 90000, mimeType: 'video/H264' }
      ],
      headerExtensions: []
    }
    jest.spyOn(RTCRtpReceiver, 'getCapabilities').mockReturnValue({ ...browserCapabilities })
    
    cmdSpy = jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
      return {
        feedId: 12345,
        publisherId,
        subscriberId: 'sub123',
        clusterId: 'cluster1',
        streamViewId: 'view123',
        sdp: offerSdp,
        streamId: `${accountId}/${streamName}`,
        uuid: 'feeds://uuid1234/5678'
      }
    })
  })

  afterEach(async () => {
    WS.clean()
    server.close()
    server = null
  })

  describe('customKeys option', () => {
    test('should pass customKeys to view command when provided', async () => {
      const signaling = new Signaling({
        streamName,
        url: publishWebSocketLocation
      })

      const customKeys = { key1: 'value1', key2: 'value2' }
      await signaling.subscribe(offerSdp, { customKeys })

      expect(cmdSpy).toHaveBeenCalledWith('view', expect.objectContaining({
        customKeys
      }))
    })

    test('should not include customKeys when not provided', async () => {
      const signaling = new Signaling({
        streamName,
        url: publishWebSocketLocation
      })

      await signaling.subscribe(offerSdp, {})

      const callArgs = cmdSpy.mock.calls[0][1]
      expect(callArgs.customKeys).toBeUndefined()
    })
  })

  describe('forceSmooth option', () => {
    test('should pass forceSmooth in abr config when provided', async () => {
      const signaling = new Signaling({
        streamName,
        url: publishWebSocketLocation
      })

      await signaling.subscribe(offerSdp, { forceSmooth: true })

      expect(cmdSpy).toHaveBeenCalledWith('view', expect.objectContaining({
        abr: expect.objectContaining({
          forceSmooth: true
        })
      }))
    })

    test('should merge forceSmooth with existing abr configuration', async () => {
      const signaling = new Signaling({
        streamName,
        url: publishWebSocketLocation
      })

      await signaling.subscribe(offerSdp, {
        abrConfiguration: { strategy: 'bandwidth', metadata: true },
        forceSmooth: true
      })

      expect(cmdSpy).toHaveBeenCalledWith('view', expect.objectContaining({
        abr: expect.objectContaining({
          strategy: 'bandwidth',
          metadata: true,
          forceSmooth: true
        })
      }))
    })

    test('should not include forceSmooth when not provided', async () => {
      const signaling = new Signaling({
        streamName,
        url: publishWebSocketLocation
      })

      await signaling.subscribe(offerSdp, {})

      const callArgs = cmdSpy.mock.calls[0][1]
      expect(callArgs.abr?.forceSmooth).toBeUndefined()
    })
  })

  describe('disableVideo and disableAudio', () => {
    test('should throw error when both video and audio are disabled', async () => {
      const signaling = new Signaling({
        streamName,
        url: publishWebSocketLocation
      })

      await expect(
        signaling.subscribe(offerSdp, { disableVideo: true, disableAudio: true })
      ).rejects.toThrow('Not attempting to connect as video and audio are disabled')
    })

    test('should allow disabling only video', async () => {
      const signaling = new Signaling({
        streamName,
        url: publishWebSocketLocation
      })

      const result = await signaling.subscribe(offerSdp, { disableVideo: true, disableAudio: false })
      expect(result).toBeDefined()
    })

    test('should allow disabling only audio', async () => {
      const signaling = new Signaling({
        streamName,
        url: publishWebSocketLocation
      })

      const result = await signaling.subscribe(offerSdp, { disableVideo: false, disableAudio: true })
      expect(result).toBeDefined()
    })
  })
})
