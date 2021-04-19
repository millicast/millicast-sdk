import { loadFeature, defineFeature } from 'jest-cucumber'
import WS from 'jest-websocket-mock'
import TransactionManager from 'transaction-manager'
import MillicastSignaling from '../../../src/MillicastSignaling'
const feature = loadFeature('../OfferPublishingStream.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  const publishWebSocketLocation = 'ws://localhost:8080'
  let server = null

  afterEach(async () => {
    WS?.clean()
    jest.restoreAllMocks()
    server = null
  })

  test('Offer a SDP with no previous connection', ({ given, when, then }) => {
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
      server = new WS(publishWebSocketLocation)
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
      const millicastSignaling = new MillicastSignaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      response = await millicastSignaling.publish(localSdp)
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      server.close()
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp)
    })
  })

  test('Offer a SDP with previous connection', ({ given, when, then }) => {
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
    let localSdp
    let response
    let millicastSignaling

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
      server = new WS(publishWebSocketLocation)
      millicastSignaling = new MillicastSignaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      await millicastSignaling.connect()
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
      response = await millicastSignaling.publish(localSdp)
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      server.close()
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp)
    })
  })

  test('Offer no SDP with no previous connection', ({ given, when, then }) => {
    const streamName = 'MyStreamName'
    const localSdp = null
    const errorMessage = 'No sdp'
    let response

    given('I have not previous connection to server', async () => {
      server = new WS(publishWebSocketLocation)
      jest.spyOn(TransactionManager.prototype, 'cmd').mockRejectedValue(errorMessage)
    })

    when('I offer a null sdp', async () => {
      const millicastSignaling = new MillicastSignaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      try {
        await millicastSignaling.publish(localSdp)
      } catch (error) {
        response = error
      }
    })

    then('throws no sdp error', async () => {
      server.close()
      expect(response).toBeDefined()
      expect(response).toBe(errorMessage)
    })
  })

  test('Offer no SDP with previous connection', ({ given, when, then }) => {
    const streamName = 'MyStreamName'
    const localSdp = null
    const errorMessage = 'No sdp'
    let response
    let millicastSignaling

    given('I have previous connection to server', async () => {
      server = new WS(publishWebSocketLocation)
      millicastSignaling = new MillicastSignaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      await millicastSignaling.connect()
      jest.spyOn(TransactionManager.prototype, 'cmd').mockRejectedValue(errorMessage)
    })

    when('I offer a null sdp', async () => {
      try {
        await millicastSignaling.publish(localSdp)
      } catch (error) {
        response = error
      }
    })

    then('throws no sdp error', async () => {
      server.close()
      expect(response).toBeDefined()
      expect(response).toBe(errorMessage)
    })
  })

  test('Offer a SDP with unexistent stream name', ({ given, when, then }) => {
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
      server = new WS(publishWebSocketLocation)
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
      const millicastSignaling = new MillicastSignaling()
      response = await millicastSignaling.publish(localSdp)
    })

    then('returns a filtered sdp to offer to remote peer', async () => {
      server.close()
      expect(response).toBeDefined()
      expect(response).toBe(offerSdp)
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
      server = new WS(publishWebSocketLocation)
      jest.spyOn(TransactionManager.prototype, 'cmd').mockRejectedValue(errorMessage)
    })

    when('I offer a sdp without stream', async () => {
      try {
        const millicastSignaling = new MillicastSignaling()
        response = await millicastSignaling.publish(localSdp)
      } catch (error) {
        response = error
      }
    })

    then('throws no stream found error', async () => {
      server.close()
      expect(response).toBeDefined()
      expect(response).toBe(errorMessage)
    })
  })
})
