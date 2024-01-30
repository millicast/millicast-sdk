import { loadFeature, defineFeature } from 'jest-cucumber'
import SdpParser from '../../../src/utils/SdpParser'
import { changeBrowserMock } from './__mocks__/MockBrowser'
const feature = loadFeature('../SdpBitrate.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  afterEach(() => {
    changeBrowserMock('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36')
  })

  test('Update bitrate with restrictions', ({ given, when, then }) => {
    let localSdp
    let parsedSdp

    given('a local sdp', async () => {
      localSdp = 'v=0\r\no=- 1619467151495 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=msid-semantic: WMS\r\na=ice-lite\r\nm=audio 44505 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 165.227.59.173\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=candidate:1 1 udp 2130706431 165.227.59.173 44505 typ host generation 0\r\na=ice-ufrag:0a537ad0ed093359\r\na=ice-pwd:3b08c9441658c7a72c7d969bbaf8bd0c2e43a5d3e5a40230\r\na=fingerprint:sha-256 20:FC:C7:73:DC:BE:E8:00:10:CB:09:03:23:B0:8E:D0:DA:ED:06:D7:E2:AA:D0:49:1F:78:45:61:65:6D:72:00\r\na=setup:passive\r\na=mid:0\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10;useinbandfec=1\r\nm=video 44505 UDP/TLS/RTP/SAVPF 102 121 125 107 124 119 123 118\r\nc=IN IP4 165.227.59.173\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=candidate:1 1 udp 2130706431 165.227.59.173 44505 typ host generation 0\r\na=ice-ufrag:0a537ad0ed093359\r\na=ice-pwd:3b08c9441658c7a72c7d969bbaf8bd0c2e43a5d3e5a40230\r\na=fingerprint:sha-256 20:FC:C7:73:DC:BE:E8:00:10:CB:09:03:23:B0:8E:D0:DA:ED:06:D7:E2:AA:D0:49:1F:78:45:61:65:6D:72:00\r\na=setup:passive\r\na=mid:1\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:102 H264/90000\r\na=rtcp-fb:102 transport-cc\r\na=rtcp-fb:102 ccm fir\r\na=rtcp-fb:102 nack\r\na=rtcp-fb:102 nack pli\r\na=fmtp:102 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\r\na=rtpmap:121 rtx/90000\r\na=fmtp:121 apt=102\r\na=rtpmap:125 H264/90000\r\na=rtcp-fb:125 transport-cc\r\na=rtcp-fb:125 ccm fir\r\na=rtcp-fb:125 nack\r\na=rtcp-fb:125 nack pli\r\na=fmtp:125 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:107 rtx/90000\r\na=fmtp:107 apt=125\r\na=rtpmap:124 H264/90000\r\na=rtcp-fb:124 transport-cc\r\na=rtcp-fb:124 ccm fir\r\na=rtcp-fb:124 nack\r\na=rtcp-fb:124 nack pli\r\na=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f\r\na=rtpmap:119 rtx/90000\r\na=fmtp:119 apt=124\r\na=rtpmap:123 H264/90000\r\na=rtcp-fb:123 transport-cc\r\na=rtcp-fb:123 ccm fir\r\na=rtcp-fb:123 nack\r\na=rtcp-fb:123 nack pli\r\na=fmtp:123 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f\r\na=rtpmap:118 rtx/90000\r\na=fmtp:118 apt=123\r\n'
    })

    when('I want to update the bitrate to 1000 kbps', async () => {
      parsedSdp = SdpParser.setVideoBitrate(localSdp, 1000)
    })

    then('returns the sdp with the bitrate updated', async () => {
      expect(localSdp).not.toEqual(parsedSdp)
    })
  })

  test('Update bitrate with no restrictions', ({ given, when, then }) => {
    let localSdp

    given('a local sdp with bitrate setted in 1000 kbps', async () => {
      localSdp = 'v=0\r\no=- 1619467151495 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=msid-semantic: WMS\r\na=ice-lite\r\nm=audio 44505 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 165.227.59.173\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=candidate:1 1 udp 2130706431 165.227.59.173 44505 typ host generation 0\r\na=ice-ufrag:0a537ad0ed093359\r\na=ice-pwd:3b08c9441658c7a72c7d969bbaf8bd0c2e43a5d3e5a40230\r\na=fingerprint:sha-256 20:FC:C7:73:DC:BE:E8:00:10:CB:09:03:23:B0:8E:D0:DA:ED:06:D7:E2:AA:D0:49:1F:78:45:61:65:6D:72:00\r\na=setup:passive\r\na=mid:0\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10;useinbandfec=1\r\nm=video 44505 UDP/TLS/RTP/SAVPF 102 121 125 107 124 119 123 118\r\nc=IN IP4 165.227.59.173\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=candidate:1 1 udp 2130706431 165.227.59.173 44505 typ host generation 0\r\na=ice-ufrag:0a537ad0ed093359\r\na=ice-pwd:3b08c9441658c7a72c7d969bbaf8bd0c2e43a5d3e5a40230\r\na=fingerprint:sha-256 20:FC:C7:73:DC:BE:E8:00:10:CB:09:03:23:B0:8E:D0:DA:ED:06:D7:E2:AA:D0:49:1F:78:45:61:65:6D:72:00\r\na=setup:passive\r\na=mid:1\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:102 H264/90000\r\na=rtcp-fb:102 transport-cc\r\na=rtcp-fb:102 ccm fir\r\na=rtcp-fb:102 nack\r\na=rtcp-fb:102 nack pli\r\na=fmtp:102 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\r\na=rtpmap:121 rtx/90000\r\na=fmtp:121 apt=102\r\na=rtpmap:125 H264/90000\r\na=rtcp-fb:125 transport-cc\r\na=rtcp-fb:125 ccm fir\r\na=rtcp-fb:125 nack\r\na=rtcp-fb:125 nack pli\r\na=fmtp:125 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:107 rtx/90000\r\na=fmtp:107 apt=125\r\na=rtpmap:124 H264/90000\r\na=rtcp-fb:124 transport-cc\r\na=rtcp-fb:124 ccm fir\r\na=rtcp-fb:124 nack\r\na=rtcp-fb:124 nack pli\r\na=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f\r\na=rtpmap:119 rtx/90000\r\na=fmtp:119 apt=124\r\na=rtpmap:123 H264/90000\r\na=rtcp-fb:123 transport-cc\r\na=rtcp-fb:123 ccm fir\r\na=rtcp-fb:123 nack\r\na=rtcp-fb:123 nack pli\r\na=fmtp:123 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f\r\na=rtpmap:118 rtx/90000\r\na=fmtp:118 apt=123\r\n'
      localSdp = SdpParser.setVideoBitrate(localSdp, 1000)
      expect(localSdp).toEqual(expect.stringMatching(/b=AS:.*\r\n/))
    })

    when('I want to update the bitrate to unlimited', async () => {
      localSdp = SdpParser.setVideoBitrate(localSdp, 0)
    })

    then('returns the sdp with the bitrate updated', async () => {
      expect(localSdp).toEqual(expect.not.stringMatching(/b=AS:.*\r\n/))
    })
  })

  test('Update bitrate with restrictions in Firefox', ({ given, when, then }) => {
    let localSdp
    let parsedSdp

    given('I am using Firefox and a local sdp', async () => {
      changeBrowserMock('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0')
      localSdp = 'v=0\r\no=- 1619467151495 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=msid-semantic: WMS\r\na=ice-lite\r\nm=audio 44505 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 165.227.59.173\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=candidate:1 1 udp 2130706431 165.227.59.173 44505 typ host generation 0\r\na=ice-ufrag:0a537ad0ed093359\r\na=ice-pwd:3b08c9441658c7a72c7d969bbaf8bd0c2e43a5d3e5a40230\r\na=fingerprint:sha-256 20:FC:C7:73:DC:BE:E8:00:10:CB:09:03:23:B0:8E:D0:DA:ED:06:D7:E2:AA:D0:49:1F:78:45:61:65:6D:72:00\r\na=setup:passive\r\na=mid:0\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10;useinbandfec=1\r\nm=video 44505 UDP/TLS/RTP/SAVPF 102 121 125 107 124 119 123 118\r\nc=IN IP4 165.227.59.173\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=candidate:1 1 udp 2130706431 165.227.59.173 44505 typ host generation 0\r\na=ice-ufrag:0a537ad0ed093359\r\na=ice-pwd:3b08c9441658c7a72c7d969bbaf8bd0c2e43a5d3e5a40230\r\na=fingerprint:sha-256 20:FC:C7:73:DC:BE:E8:00:10:CB:09:03:23:B0:8E:D0:DA:ED:06:D7:E2:AA:D0:49:1F:78:45:61:65:6D:72:00\r\na=setup:passive\r\na=mid:1\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:102 H264/90000\r\na=rtcp-fb:102 transport-cc\r\na=rtcp-fb:102 ccm fir\r\na=rtcp-fb:102 nack\r\na=rtcp-fb:102 nack pli\r\na=fmtp:102 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\r\na=rtpmap:121 rtx/90000\r\na=fmtp:121 apt=102\r\na=rtpmap:125 H264/90000\r\na=rtcp-fb:125 transport-cc\r\na=rtcp-fb:125 ccm fir\r\na=rtcp-fb:125 nack\r\na=rtcp-fb:125 nack pli\r\na=fmtp:125 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:107 rtx/90000\r\na=fmtp:107 apt=125\r\na=rtpmap:124 H264/90000\r\na=rtcp-fb:124 transport-cc\r\na=rtcp-fb:124 ccm fir\r\na=rtcp-fb:124 nack\r\na=rtcp-fb:124 nack pli\r\na=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f\r\na=rtpmap:119 rtx/90000\r\na=fmtp:119 apt=124\r\na=rtpmap:123 H264/90000\r\na=rtcp-fb:123 transport-cc\r\na=rtcp-fb:123 ccm fir\r\na=rtcp-fb:123 nack\r\na=rtcp-fb:123 nack pli\r\na=fmtp:123 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f\r\na=rtpmap:118 rtx/90000\r\na=fmtp:118 apt=123\r\n'
      expect(localSdp).toEqual(expect.not.stringMatching('b=TIAS:'))
    })

    when('I want to update the bitrate to 1000 kbps', async () => {
      parsedSdp = SdpParser.setVideoBitrate(localSdp, 1000)
    })

    then('returns the sdp with the bitrate updated', async () => {
      expect(localSdp).not.toEqual(parsedSdp)
      expect(parsedSdp).toEqual(expect.stringMatching('b=TIAS:'))
    })
  })
})
