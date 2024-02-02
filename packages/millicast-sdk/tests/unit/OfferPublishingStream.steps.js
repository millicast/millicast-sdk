import { loadFeature, defineFeature } from 'jest-cucumber'
import WS from 'jest-websocket-mock'
import TransactionManager from 'transaction-manager'
import Signaling from '../../src/Signaling'
import './__mocks__/MockBrowser'
import { WebSocket } from 'mock-socket'
const feature = loadFeature('../features/OfferPublishingStream.feature', { loadRelativePath: true, errors: true })

global.RTCRtpSender = {
  getCapabilities: jest.fn()
}

global.WebSocket = WebSocket

beforeEach(() => {
  jest.restoreAllMocks()
  const browserCapabilities = {
    codecs: [
      { clockRate: 90000, mimeType: 'video/VP8' },
      { clockRate: 90000, mimeType: 'video/VP9', sdpFmtpLine: 'profile-id=0' },
      { clockRate: 90000, mimeType: 'video/VP9', sdpFmtpLine: 'profile-id=2' },
      { clockRate: 90000, mimeType: 'video/H264', sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f' },
      { clockRate: 90000, mimeType: 'video/H264', sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f' },
      { clockRate: 90000, mimeType: 'video/H265' },
      { clockRate: 90000, mimeType: 'video/AV1X' }
    ],
    headerExtensions: []
  }
  jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue({ ...browserCapabilities })
})

defineFeature(feature, test => {
  const publishWebSocketLocation = 'ws://localhost:8080'
  const streamName = 'MyStreamName'
  const accountId = 'MyAccountId'
  const publisherId = 'PublisherId1234'
  const offerSdp = (codec = 'h264') => `v=0
    o=alice 2890844526 2890844526 IN IP4 host.anywhere.com
    s=
    c=IN IP4 host.anywhere.com
    t=0 0
    m=audio 49170 RTP/AVP 0
    a=rtpmap:0 PCMU/8000
    a=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f
    a=rtpmap:119 rtx/90000
    a=fmtp:119 apt=124
    a=rtpmap:123 ${codec.toUpperCase()}/90000
    a=rtcp-fb:123 goog-remb
    a=rtcp-fb:123 transport-cc
    a=rtcp-fb:123 ccm fir
    a=rtcp-fb:123 nack
    a=rtcp-fb:123 nack pli
  `

  const localSdp = `v=0
    o=alice 2890844526 2890844526 IN IP4 host.anywhere.com
    s=
    c=IN IP4 host.anywhere.com
    t=0 0
    m=audio 49170 RTP/AVP 0
    a=rtpmap:0 PCMU/8000
    m=video 51372 RTP/AVP 31
    a=rtpmap:31 VP8/90000
    a=rtpmap:31 VP9/90000
    a=rtpmap:31 H264/90000
    a=rtcp-fb:31 goog-remb
    a=rtcp-fb:31 transport-cc
    a=rtcp-fb:31 ccm fir
    a=rtcp-fb:31 nack
    a=rtcp-fb:31 nack pli
    a=rtpmap:31 AV1X/90000
  `
  let server = null

  beforeEach(async () => {
    server = new WS(publishWebSocketLocation, { jsonProtocol: true })
  })

  afterEach(async () => {
    WS.clean()
    server.close()
    server = null
  })

  test('Offer a SDP with no previous connection and h264 codec', ({ given, when, then }) => {
    let response

    given('a local sdp and no previous connection to server', async () => {
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp(),
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local sdp with h264 codec and recording option', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      response = await signaling.publish(localSdp, 'h264', true)
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp())
      expect(response).not.toMatch(/AV1X|VP8|VP9/)
    })
  })

  test('Offer a SDP with previous connection and h264 codec', ({ given, when, then }) => {
    let response
    let signaling

    given('a local sdp and a previous active connection to server', async () => {
      signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      await signaling.connect()
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp(),
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local spd with h264 codec', async () => {
      response = await signaling.publish(localSdp, 'h264')
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp())
      expect(response).not.toMatch(/AV1|VP8|VP9/)
    })
  })

  test('Offer no SDP with no previous connection', ({ given, when, then }) => {
    const errorMessage = 'No sdp'
    let response

    given('I have not previous connection to server', async () => {
      jest.spyOn(TransactionManager.prototype, 'cmd').mockRejectedValue(errorMessage)
    })

    when('I offer a null sdp', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      try {
        await signaling.publish(null, 'h264')
      } catch (error) {
        response = error
      }
    })

    then('throws no sdp error', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(errorMessage, 'h264')
    })
  })

  test('Offer no SDP with previous connection', ({ given, when, then }) => {
    const errorMessage = 'No sdp'
    let response
    let signaling

    given('I have previous connection to server', async () => {
      signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      await signaling.connect()
      jest.spyOn(TransactionManager.prototype, 'cmd').mockRejectedValue(errorMessage)
    })

    when('I offer a null sdp', async () => {
      try {
        await signaling.publish(null, 'h264')
      } catch (error) {
        response = error
      }
    })

    then('throws no sdp error', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(errorMessage)
    })
  })

  test('Offer a SDP with unexistent stream name', ({ given, when, then }) => {
    let response

    given('I have not previous connection to server', async () => {
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp(),
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local spd and an unexistent stream name', async () => {
      const signaling = new Signaling()
      response = await signaling.publish(localSdp, 'h264')
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp())
      expect(response).not.toMatch(/AV1X|VP8|VP9/)
    })
  })

  test('Offer SDP without stream with no previous connection', ({ given, when, then }) => {
    const errorMessage = 'No stream found on sdp'
    let localSdp
    let response

    given('I have not previous connection to server', async () => {
      localSdp = `v=0
      o=alice 2890844526 2890844526 IN IP4 host.anywhere.com
      s=
      c=IN IP4 host.anywhere.com
      t=0 0
    `
      jest.spyOn(TransactionManager.prototype, 'cmd').mockRejectedValue(errorMessage)
    })

    when('I offer a sdp without stream', async () => {
      try {
        const signaling = new Signaling()
        response = await signaling.publish(localSdp, 'h264')
      } catch (error) {
        response = error
      }
    })

    then('throws no stream found error', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(errorMessage)
    })
  })

  test('Offer a SDP with invalid codec', ({ given, when, then }) => {
    const errorMessage = 'Invalid codec'
    let response

    given('I have not previous connection to server', async () => {
      jest.spyOn(TransactionManager.prototype, 'cmd').mockRejectedValue(errorMessage)
    })

    when('I offer a sdp with invalid codec', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      try {
        await signaling.publish(localSdp, 'myCodec264')
      } catch (error) {
        response = error
      }
    })

    then('throws no valid codec error', async () => {
      expect(response).toBeDefined()
      expect(response.message).toEqual(expect.stringContaining(errorMessage))
    })
  })

  test('Offer a SDP with no previous connection and vp8 codec', ({ given, when, then }) => {
    let response

    given('a local sdp and no previous connection to server', async () => {
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp('vp8'),
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local sdp with vp8 codec', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      response = await signaling.publish(localSdp, 'vp8')
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp('vp8'))
      expect(response).not.toMatch(/AV1X|H264|VP9/)
    })
  })

  test('Offer a SDP with no previous connection and vp9 codec', ({ given, when, then }) => {
    let response

    given('a local sdp and no previous connection to server', async () => {
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp('vp9'),
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local sdp with vp9 codec', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      response = await signaling.publish(localSdp, 'vp9')
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp('vp9'))
      expect(response).not.toMatch(/AV1X|VP8|H264/)
    })
  })

  test('Offer a SDP with no previous connection and av1 codec and browser supports av1x', ({ given, when, then }) => {
    let response

    given('a local sdp and no previous connection to server', async () => {
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp('av1'),
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local sdp with av1 codec', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      response = await signaling.publish(localSdp, 'av1')
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toMatch('AV1X/90000')
      expect(response).not.toMatch(/H264|VP8|VP9/)
    })
  })

  test('Offer a SDP with no previous connection and av1 codec and browser supports av1', ({ given, when, then }) => {
    let response

    given('a local sdp and no previous connection to server', async () => {
      jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue({ codecs: [{ clockRate: 90000, mimeType: 'video/AV1' }] })
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp('av1'),
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local sdp with av1 codec', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      response = await signaling.publish(localSdp, 'av1')
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toMatch('AV1/90000')
      expect(response).not.toMatch(/H264|VP8|VP9/)
    })
  })

  test('Offer a SDP with no previous connection and av1 codec and browser does not have getCapabilities', ({ given, when, then }) => {
    let response

    given('a local sdp and no previous connection to server', async () => {
      jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue(undefined)
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp('av1'),
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local sdp with av1 codec', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      response = await signaling.publish(localSdp, 'av1')
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toMatch('AV1/90000')
      expect(response).not.toMatch(/H264|VP8|VP9/)
    })
  })

  test('Offer a SDP with no previous connection and options as object', ({ given, when, then }) => {
    let response

    given('a local sdp and no previous connection to server', async () => {
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp('av1'),
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local sdp using options object', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      const signalingPublishOptions = {
        codec: 'av1'
      }
      response = await signaling.publish(localSdp, signalingPublishOptions)
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toMatch('AV1X/90000')
      expect(response).not.toMatch(/H264|VP8|VP9/)
    })
  })

  test('Offer a SDP with no codec', ({ given, when, then }) => {
    let response

    given('I have not previous connection to server', async () => {
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp(),
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer a sdp', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      response = await signaling.publish(localSdp)
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp())
    })
  })

  test('Offer a SDP with no previous connection and desired events', ({ given, when, then }) => {
    let response

    given('a local sdp and no previous connection to server', async () => {
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp('av1'),
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local sdp and I set the events active and inactive as events that i want to get', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      const signalingPublishOptions = {
        codec: 'av1',
        events: ['active', 'inactive']
      }
      response = await signaling.publish(localSdp, signalingPublishOptions)
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toMatch('AV1X/90000')
      expect(response).not.toMatch(/H264|VP8|VP9/)
    })
  })
})
