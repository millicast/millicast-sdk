import { loadFeature, defineFeature } from 'jest-cucumber'
import WS from 'jest-websocket-mock'
import TransactionManager from 'transaction-manager'
import Signaling from '../../../src/Signaling'
const feature = loadFeature('../OfferSubscribingStream.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  const publishWebSocketLocation = 'ws://localhost:8080'
  const streamName = 'MyStreamName'
  const accountId = 'MyAccountId'
  const publisherId = 'PublisherId1234'
  const offerSdp = `v=0
    o=alice 2890844526 2890844526 IN IP4 host.anywhere.com
    s=
    c=IN IP4 host.anywhere.com
    t=0 0
    m=audio 49170 RTP/AVP 0
    a=rtpmap:0 PCMU/8000
    a=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f
    a=rtpmap:119 rtx/90000
    a=fmtp:119 apt=124
    a=rtpmap:123 H264/90000
    a=rtcp-fb:123 goog-remb
    a=rtcp-fb:123 transport-cc
    a=rtcp-fb:123 ccm fir
    a=rtcp-fb:123 nack
    a=rtcp-fb:123 nack pli
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

  test('Offer a SDP with no previous connection', ({ given, when, then }) => {
    let localSdp
    let response

    given('a local sdp and no previous connection to server', async () => {
      localSdp = `v=0
        o=alice 2890844526 2890844526 IN IP4 host.anywhere.com
        s=
        c=IN IP4 host.anywhere.com
        t=0 0
        m=audio 49170 RTP/AVP 0
        a=rtpmap:0 PCMU/8000
        m=video 51372 RTP/AVP 31
        a=rtpmap:31 H261/90000
        m=video 53000 RTP/AVP 32
        a=rtpmap:32 MPV/90000
        a=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f
        a=rtpmap:119 rtx/90000
        a=fmtp:119 apt=124
        a=rtpmap:123 H264/90000
        a=rtcp-fb:123 goog-remb
        a=rtcp-fb:123 transport-cc
        a=rtcp-fb:123 ccm fir
        a=rtcp-fb:123 nack
        a=rtcp-fb:123 nack pli
      `
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp,
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local sdp', async () => {
      const signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      response = await signaling.subscribe(localSdp)
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp)
    })
  })

  test('Offer a SDP with previous connection', ({ given, when, then }) => {
    let localSdp
    let response
    let signaling

    given('a local sdp and a previous active connection to server', async () => {
      localSdp = `v=0
        o=alice 2890844526 2890844526 IN IP4 host.anywhere.com
        s=
        c=IN IP4 host.anywhere.com
        t=0 0
        m=audio 49170 RTP/AVP 0
        a=rtpmap:0 PCMU/8000
        m=video 51372 RTP/AVP 31
        a=rtpmap:31 H261/90000
        m=video 53000 RTP/AVP 32
        a=rtpmap:32 MPV/90000
        a=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f
        a=rtpmap:119 rtx/90000
        a=fmtp:119 apt=124
        a=rtpmap:123 H264/90000
        a=rtcp-fb:123 goog-remb
        a=rtcp-fb:123 transport-cc
        a=rtcp-fb:123 ccm fir
        a=rtcp-fb:123 nack
        a=rtcp-fb:123 nack pli
      `
      signaling = new Signaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      await signaling.connect()
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp,
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local spd', async () => {
      response = await signaling.subscribe(localSdp)
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp)
    })
  })

  test('Offer no SDP with no previous connection', ({ given, when, then }) => {
    const localSdp = null
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
        await signaling.subscribe(localSdp)
      } catch (error) {
        response = error
      }
    })

    then('throws no sdp error', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(errorMessage)
    })
  })

  test('Offer no SDP with previous connection', ({ given, when, then }) => {
    const localSdp = null
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
        await signaling.subscribe(localSdp)
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
    let localSdp
    let response

    given('I have not previous connection to server', async () => {
      localSdp = `v=0
      o=alice 2890844526 2890844526 IN IP4 host.anywhere.com
      s=
      c=IN IP4 host.anywhere.com
      t=0 0
      m=audio 49170 RTP/AVP 0
      a=rtpmap:0 PCMU/8000
      m=video 51372 RTP/AVP 31
      a=rtpmap:31 H261/90000
      m=video 53000 RTP/AVP 32
      a=rtpmap:32 MPV/90000
      a=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f
      a=rtpmap:119 rtx/90000
      a=fmtp:119 apt=124
      a=rtpmap:123 H264/90000
      a=rtcp-fb:123 goog-remb
      a=rtcp-fb:123 transport-cc
      a=rtcp-fb:123 ccm fir
      a=rtcp-fb:123 nack
      a=rtcp-fb:123 nack pli
    `
      jest.spyOn(TransactionManager.prototype, 'cmd').mockImplementation(() => {
        return {
          feedId: 12345,
          publisherId,
          sdp: offerSdp,
          streamId: `${accountId}/${streamName}`,
          uuid: 'feeds://uuid1234/5678'
        }
      })
    })

    when('I offer my local spd and an unexistent stream name', async () => {
      const signaling = new Signaling()
      response = await signaling.subscribe(localSdp)
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp)
    })
  })
})
