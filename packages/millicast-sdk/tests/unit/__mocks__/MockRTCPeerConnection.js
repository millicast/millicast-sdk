export const defaultConfig = {
  bundlePolicy: 'balanced',
  encodedInsertableStreams: false,
  iceCandidatePoolSize: 0,
  iceServers: [],
  iceTransportPolicy: 'all',
  rtcpMuxPolicy: 'require',
  sdpSemantics: 'unified-plan'
}

export const rawStats = [
  {
    type: 'test'
  },
  {
    type: 'outbound-rtp',
    kind: 'audio',
    bytesSent: 1000
  },
  {
    type: 'outbound-rtp',
    mediaType: 'video',
    codecId: 'Codec1',
    bytesSent: 2000,
    framesPerSecond: 30
  },
  {
    type: 'inbound-rtp',
    mediaType: 'otherMediaType',
    id: 'Video123',
    bytesReceived: 2000,
    framesPerSecond: 30
  },
  {
    type: 'inbound-rtp',
    id: 'Audio123',
    mediaType: 'otherMediaType',
    codecId: 'Codec2',
    bytesReceived: 2000
  },
  {
    type: 'inbound-rtp',
    id: 'Audio456',
    mediaType: 'audio',
    bytesReceived: 4000
  },
  {
    type: 'candidate-pair',
    nominated: false
  },
  {
    type: 'candidate-pair',
    nominated: true,
    totalRoundTripTime: 2,
    responsesReceived: 1,
    localCandidateId: '123LocalCandidate'
  }
]

export default class MockRTCPeerConnection {
  constructor (config = null) {
    this.config = config
    this.remoteDescription = {
      type: 'offer',
      sdp: 'v=0\r\no=- 1619467151495 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=msid-semantic: WMS\r\na=ice-lite\r\nm=audio 44505 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 165.227.59.173\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=candidate:1 1 udp 2130706431 165.227.59.173 44505 typ host generation 0\r\na=ice-ufrag:0a537ad0ed093359\r\na=ice-pwd:3b08c9441658c7a72c7d969bbaf8bd0c2e43a5d3e5a40230\r\na=fingerprint:sha-256 20:FC:C7:73:DC:BE:E8:00:10:CB:09:03:23:B0:8E:D0:DA:ED:06:D7:E2:AA:D0:49:1F:78:45:61:65:6D:72:00\r\na=setup:passive\r\na=mid:0\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10;useinbandfec=1\r\nm=video 44505 UDP/TLS/RTP/SAVPF 102 121 125 107 124 119 123 118\r\nc=IN IP4 165.227.59.173\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=candidate:1 1 udp 2130706431 165.227.59.173 44505 typ host generation 0\r\na=ice-ufrag:0a537ad0ed093359\r\na=ice-pwd:3b08c9441658c7a72c7d969bbaf8bd0c2e43a5d3e5a40230\r\na=fingerprint:sha-256 20:FC:C7:73:DC:BE:E8:00:10:CB:09:03:23:B0:8E:D0:DA:ED:06:D7:E2:AA:D0:49:1F:78:45:61:65:6D:72:00\r\na=setup:passive\r\na=mid:1\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:102 H264/90000\r\na=rtcp-fb:102 transport-cc\r\na=rtcp-fb:102 ccm fir\r\na=rtcp-fb:102 nack\r\na=rtcp-fb:102 nack pli\r\na=fmtp:102 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\r\na=rtpmap:121 rtx/90000\r\na=fmtp:121 apt=102\r\na=rtpmap:125 H264/90000\r\na=rtcp-fb:125 transport-cc\r\na=rtcp-fb:125 ccm fir\r\na=rtcp-fb:125 nack\r\na=rtcp-fb:125 nack pli\r\na=fmtp:125 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:107 rtx/90000\r\na=fmtp:107 apt=125\r\na=rtpmap:124 H264/90000\r\na=rtcp-fb:124 transport-cc\r\na=rtcp-fb:124 ccm fir\r\na=rtcp-fb:124 nack\r\na=rtcp-fb:124 nack pli\r\na=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f\r\na=rtpmap:119 rtx/90000\r\na=fmtp:119 apt=124\r\na=rtpmap:123 H264/90000\r\na=rtcp-fb:123 transport-cc\r\na=rtcp-fb:123 ccm fir\r\na=rtcp-fb:123 nack\r\na=rtcp-fb:123 nack pli\r\na=fmtp:123 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f\r\na=rtpmap:118 rtx/90000\r\na=fmtp:118 apt=123\r\n'
    }
    this.signalingState = 'stable'
    this.currentRemoteDescription = null
    this.currentLocalDescription = null
    this.connectionState = 'new'
    this.senders = []
  }

  getConfiguration () {
    return { ...defaultConfig, ...this.config }
  }

  close () {
    this.signalingState = 'closed'
    this.connectionState = 'closed'
  }

  setRemoteDescription (answer) {
    this.currentRemoteDescription = answer
    this.connectionState = 'connected'
  }

  createOffer (rtcOfferOptions) {
    return {
      sdp: 'v=0\r\no=- 6951551582290178118 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS Z1VOhybPunxH0OkYHSjWfuVeQS0hP7KE2VF0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:47zq\r\na=ice-pwd:L1hL3yV+MsLmlx/yuN31ApfQ\r\na=ice-options:trickle\r\na=fingerprint:sha-256 EA:A4:8E:38:4A:31:61:A2:59:78:EB:AD:2E:77:3F:C0:BA:D1:13:93:0A:F3:4F:32:AB:8A:3A:E0:10:4E:95:C3\r\na=setup:actpass\r\na=mid:0\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=sendrecv\r\na=msid:Z1VOhybPunxH0OkYHSjWfuVeQS0hP7KE2VF0 adb18b70-1d59-41e0-a080-f6e57efeac19\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=rtcp-fb:111 transport-cc\r\na=fmtp:111 minptime=10;useinbandfec=1\r\na=rtpmap:103 ISAC/16000\r\na=rtpmap:104 ISAC/32000\r\na=rtpmap:9 G722/8000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:106 CN/32000\r\na=rtpmap:105 CN/16000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:110 telephone-event/48000\r\na=rtpmap:112 telephone-event/32000\r\na=rtpmap:113 telephone-event/16000\r\na=rtpmap:126 telephone-event/8000\r\na=ssrc:2213016228 cname:uMbjTBwYv//E4gZM\r\na=ssrc:2213016228 msid:Z1VOhybPunxH0OkYHSjWfuVeQS0hP7KE2VF0 adb18b70-1d59-41e0-a080-f6e57efeac19\r\na=ssrc:2213016228 mslabel:Z1VOhybPunxH0OkYHSjWfuVeQS0hP7KE2VF0\r\na=ssrc:2213016228 label:adb18b70-1d59-41e0-a080-f6e57efeac19\r\nm=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101 102 121 127 120 125 107 108 109 35 36 124 119 123 118 114 115 116\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:47zq\r\na=ice-pwd:L1hL3yV+MsLmlx/yuN31ApfQ\r\na=ice-options:trickle\r\na=fingerprint:sha-256 EA:A4:8E:38:4A:31:61:A2:59:78:EB:AD:2E:77:3F:C0:BA:D1:13:93:0A:F3:4F:32:AB:8A:3A:E0:10:4E:95:C3\r\na=setup:actpass\r\na=mid:1\r\na=extmap:14 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:13 urn:3gpp:video-orientation\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:12 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay\r\na=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type\r\na=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing\r\na=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space\r\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=sendrecv\r\na=msid:Z1VOhybPunxH0OkYHSjWfuVeQS0hP7KE2VF0 306ab058-0f3b-4a6d-a039-d7495360c506\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:96 VP8/90000\r\na=rtcp-fb:96 goog-remb\r\na=rtcp-fb:96 transport-cc\r\na=rtcp-fb:96 ccm fir\r\na=rtcp-fb:96 nack\r\na=rtcp-fb:96 nack pli\r\na=rtpmap:97 rtx/90000\r\na=fmtp:97 apt=96\r\na=rtpmap:98 VP9/90000\r\na=rtcp-fb:98 goog-remb\r\na=rtcp-fb:98 transport-cc\r\na=rtcp-fb:98 ccm fir\r\na=rtcp-fb:98 nack\r\na=rtcp-fb:98 nack pli\r\na=fmtp:98 profile-id=0\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=98\r\na=rtpmap:100 VP9/90000\r\na=rtcp-fb:100 goog-remb\r\na=rtcp-fb:100 transport-cc\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=fmtp:100 profile-id=2\r\na=rtpmap:101 rtx/90000\r\na=fmtp:101 apt=100\r\na=rtpmap:102 H264/90000\r\na=rtcp-fb:102 goog-remb\r\na=rtcp-fb:102 transport-cc\r\na=rtcp-fb:102 ccm fir\r\na=rtcp-fb:102 nack\r\na=rtcp-fb:102 nack pli\r\na=fmtp:102 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f\r\na=rtpmap:121 rtx/90000\r\na=fmtp:121 apt=102\r\na=rtpmap:127 H264/90000\r\na=rtcp-fb:127 goog-remb\r\na=rtcp-fb:127 transport-cc\r\na=rtcp-fb:127 ccm fir\r\na=rtcp-fb:127 nack\r\na=rtcp-fb:127 nack pli\r\na=fmtp:127 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f\r\na=rtpmap:120 rtx/90000\r\na=fmtp:120 apt=127\r\na=rtpmap:125 H264/90000\r\na=rtcp-fb:125 goog-remb\r\na=rtcp-fb:125 transport-cc\r\na=rtcp-fb:125 ccm fir\r\na=rtcp-fb:125 nack\r\na=rtcp-fb:125 nack pli\r\na=fmtp:125 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:107 rtx/90000\r\na=fmtp:107 apt=125\r\na=rtpmap:108 H264/90000\r\na=rtcp-fb:108 goog-remb\r\na=rtcp-fb:108 transport-cc\r\na=rtcp-fb:108 ccm fir\r\na=rtcp-fb:108 nack\r\na=rtcp-fb:108 nack pli\r\na=fmtp:108 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42e01f\r\na=rtpmap:109 rtx/90000\r\na=fmtp:109 apt=108\r\na=rtpmap:35 AV1X/90000\r\na=rtcp-fb:35 goog-remb\r\na=rtcp-fb:35 transport-cc\r\na=rtcp-fb:35 ccm fir\r\na=rtcp-fb:35 nack\r\na=rtcp-fb:35 nack pli\r\na=rtpmap:36 rtx/90000\r\na=fmtp:36 apt=35\r\na=rtpmap:124 H264/90000\r\na=rtcp-fb:124 goog-remb\r\na=rtcp-fb:124 transport-cc\r\na=rtcp-fb:124 ccm fir\r\na=rtcp-fb:124 nack\r\na=rtcp-fb:124 nack pli\r\na=fmtp:124 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f\r\na=rtpmap:119 rtx/90000\r\na=fmtp:119 apt=124\r\na=rtpmap:123 H264/90000\r\na=rtcp-fb:123 goog-remb\r\na=rtcp-fb:123 transport-cc\r\na=rtcp-fb:123 ccm fir\r\na=rtcp-fb:123 nack\r\na=rtcp-fb:123 nack pli\r\na=fmtp:123 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f\r\na=rtpmap:118 rtx/90000\r\na=fmtp:118 apt=123\r\na=rtpmap:114 red/90000\r\na=rtpmap:115 rtx/90000\r\na=fmtp:115 apt=114\r\na=rtpmap:116 ulpfec/90000\r\na=ssrc-group:FID 3413953811 262260280\r\na=ssrc:3413953811 cname:uMbjTBwYv//E4gZM\r\na=ssrc:3413953811 msid:Z1VOhybPunxH0OkYHSjWfuVeQS0hP7KE2VF0 306ab058-0f3b-4a6d-a039-d7495360c506\r\na=ssrc:3413953811 mslabel:Z1VOhybPunxH0OkYHSjWfuVeQS0hP7KE2VF0\r\na=ssrc:3413953811 label:306ab058-0f3b-4a6d-a039-d7495360c506\r\na=ssrc:262260280 cname:uMbjTBwYv//E4gZM\r\na=ssrc:262260280 msid:Z1VOhybPunxH0OkYHSjWfuVeQS0hP7KE2VF0 306ab058-0f3b-4a6d-a039-d7495360c506\r\na=ssrc:262260280 mslabel:Z1VOhybPunxH0OkYHSjWfuVeQS0hP7KE2VF0\r\na=ssrc:262260280 label:306ab058-0f3b-4a6d-a039-d7495360c506\r\n'
    }
  }

  setLocalDescription (sessionDescription) {
    this.currentLocalDescription = sessionDescription
  }

  addTrack (track, mediaStream) {
    this.senders.push({
      track,
      replaceTrack: (newTrack) => {
        for (const sender of this.senders) {
          if (sender.track.kind === newTrack.kind) {
            sender.track = newTrack
          }
        }
      }
    })
  }

  getSenders () {
    return this.senders
  }

  onconnectionstatechange (state) {
    this.connectionState = state
  }

  emitMockEvent (eventName, data) {
    if (eventName === 'ontrack') {
      this.ontrack(data)
    } else if (eventName === 'onconnectionstatechange') {
      this.onconnectionstatechange(data)
    }
  }

  addTransceiver (track, options) {
    this.senders.push({
      track,
      replaceTrack: (newTrack) => {
        for (const sender of this.senders) {
          if (sender.track.kind === newTrack.kind) {
            sender.track = newTrack
          }
        }
      }
    })
  }

  restartIce () {}

  getStats () {
    return new Promise((resolve) => {
      resolve({
        values: this.peerStatsValue,
        get: this.peerStatsGetReport
      })
    })
  }

  peerStatsGetReport (reportId) {
    if (reportId.toString().toLowerCase().includes('localcandidate')) {
      return {
        candidateType: 'relay'
      }
    }
    return {
      mimeType: 'mime/test'
    }
  }

  peerStatsValue () { return rawStats }
}

global.RTCPeerConnection = MockRTCPeerConnection
