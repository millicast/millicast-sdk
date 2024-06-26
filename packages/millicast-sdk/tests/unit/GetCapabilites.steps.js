import { loadFeature, defineFeature } from 'jest-cucumber'
import PeerConnection from '../../src/PeerConnection'
import { changeBrowserMock } from './__mocks__/MockBrowser'

const feature = loadFeature('../features/GetCapabilities.feature', { loadRelativePath: true, errors: true })

beforeEach(() => {
  jest.restoreAllMocks()
})

global.RTCRtpSender = {
  getCapabilities: jest.fn()
}

defineFeature(feature, test => {
  test('Browser supports more codecs than Millicast', ({ given, when, then }) => {
    let capabilities

    const browserCapabilities = {
      codecs: [
        { clockRate: 90000, mimeType: 'video/H264', sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f' },
        { clockRate: 90000, mimeType: 'video/H264', sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f' },
        { clockRate: 90000, mimeType: 'video/H265', sdpFmtpLine: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f' },
        { clockRate: 90000, mimeType: 'video/rtx' },
        { clockRate: 90000, mimeType: 'video/red' }
      ],
      headerExtensions: []
    }

    given('my browser supports H264, H265, red and rtx', async () => {
      jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue({ ...browserCapabilities })
    })

    when('I get video capabilities', async () => {
      capabilities = PeerConnection.getCapabilities('video')
    })

    then('returns H264 and H265 in codecs property', async () => {
      expect(capabilities.codecs).toEqual([
        { codec: 'h264', mimeType: 'video/H264' },
        { codec: 'h265', mimeType: 'video/H265' }
      ])
      expect(capabilities.headerExtensions).toEqual(browserCapabilities.headerExtensions)
    })
  })

  test('Browser supports all codecs of Millicast', ({ given, when, then }) => {
    let capabilities

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

    given('my browser supports H264, H265, VP8, VP9 and AV1', async () => {
      jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue({ ...browserCapabilities })
    })

    when('I get video capabilities', async () => {
      capabilities = PeerConnection.getCapabilities('video')
    })

    then('returns all codecs', async () => {
      expect(capabilities.codecs).toEqual([
        { codec: 'vp8', mimeType: 'video/VP8' },
        { codec: 'vp9', mimeType: 'video/VP9' },
        { codec: 'h264', mimeType: 'video/H264' },
        { codec: 'h265', mimeType: 'video/H265' },
        { codec: 'av1', mimeType: 'video/AV1X' }
      ])
      expect(capabilities.headerExtensions).toEqual(browserCapabilities.headerExtensions)
    })
  })

  test('Browser supports SVC for VP9', ({ given, when, then }) => {
    let capabilities

    const browserCapabilities = {
      codecs: [
        { clockRate: 90000, mimeType: 'video/VP9', sdpFmtpLine: 'profile-id=0', scalabilityModes: ['L1T2', 'L1T3'] },
        { clockRate: 90000, mimeType: 'video/VP9', sdpFmtpLine: 'profile-id=2', scalabilityModes: ['L0T1', 'L0T2'] }
      ],
      headerExtensions: []
    }

    given('my browser supports VP9 with scalability modes', async () => {
      jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue({ ...browserCapabilities })
    })

    when('I get video capabilities', async () => {
      capabilities = PeerConnection.getCapabilities('video')
    })

    then('returns VP9 with all scalability modes available', async () => {
      expect(capabilities.codecs).toEqual([
        { codec: 'vp9', mimeType: 'video/VP9', scalabilityModes: ['L1T2', 'L1T3', 'L0T1', 'L0T2'] }
      ])
      expect(capabilities.headerExtensions).toEqual(browserCapabilities.headerExtensions)
    })
  })

  test('Browser supports SVC for VP9 repeated layers', ({ given, when, then }) => {
    let capabilities

    const browserCapabilities = {
      codecs: [
        { clockRate: 90000, mimeType: 'video/VP9', sdpFmtpLine: 'profile-id=0', scalabilityModes: ['L1T2', 'L1T3'] },
        { clockRate: 90000, mimeType: 'video/VP9', sdpFmtpLine: 'profile-id=2', scalabilityModes: ['L1T2', 'L1T3'] }
      ],
      headerExtensions: []
    }

    given('my browser supports VP9 with scalability modes repeated', async () => {
      jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue({ ...browserCapabilities })
    })

    when('I get video capabilities', async () => {
      capabilities = PeerConnection.getCapabilities('video')
    })

    then('returns VP9 with all scalability modes available', async () => {
      expect(capabilities.codecs).toEqual([
        { codec: 'vp9', mimeType: 'video/VP9', scalabilityModes: ['L1T2', 'L1T3'] }
      ])
      expect(capabilities.headerExtensions).toEqual(browserCapabilities.headerExtensions)
    })
  })

  test('Get video capabilities in Firefox', ({ given, when, then }) => {
    let capabilities
    const browserCapabilities = {
      codecs: [
        { clockRate: 90000, mimeType: 'video/VP8', sdpFmtpLine: 'max-fs=12288;max-fr=60' },
        { clockRate: 90000, mimeType: 'video/VP9', sdpFmtpLine: 'max-fs=12288;max-fr=60' },
        { clockRate: 90000, mimeType: 'video/H264', sdpFmtpLine: 'profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1' },
        { clockRate: 90000, mimeType: 'video/H264', sdpFmtpLine: 'profile-level-id=42e01f;level-asymmetry-allowed=1' },
        { clockRate: 90000, mimeType: 'video/ulpfec' },
        { clockRate: 90000, mimeType: 'video/red' },
        { clockRate: 90000, mimeType: 'video/rtx' }
      ],
      headerExtensions: []
    }
    given('I am in Firefeox', async () => {
      changeBrowserMock('Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0')
      jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue({ ...browserCapabilities })
    })

    when('I get video capabilities', async () => {
      capabilities = PeerConnection.getCapabilities('video')
    })

    then('returns H264, VP8 and VP9 codecs', async () => {
      expect(capabilities.codecs).toEqual([
        { codec: 'vp8', mimeType: 'video/VP8' },
        { codec: 'vp9', mimeType: 'video/VP9' },
        { codec: 'h264', mimeType: 'video/H264' }
      ])
      expect(capabilities.headerExtensions).toEqual(browserCapabilities.headerExtensions)
    })
  })

  test('Get audio capabilities in Chrome', ({ given, when, then }) => {
    let capabilities

    const browserCapabilities = {
      codecs: [
        { channels: 2, clockRate: 48000, mimeType: 'audio/opus', sdpFmtpLine: 'minptime=10;useinbandfec=1' },
        { channels: 1, clockRate: 16000, mimeType: 'audio/ISAC' },
        { channels: 1, clockRate: 32000, mimeType: 'audio/ISAC' }
      ],
      headerExtensions: []
    }

    given('my browser audio capabilities', async () => {
      changeBrowserMock('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36')
      jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue({ ...browserCapabilities })
    })

    when('I get audio capabilities', async () => {
      capabilities = PeerConnection.getCapabilities('audio')
    })

    then('returns opus and multiopus codecs', async () => {
      expect(capabilities.codecs).toEqual([
        { codec: 'multiopus', mimeType: 'audio/multiopus', channels: 6 },
        { codec: 'opus', mimeType: 'audio/opus', channels: 2 }
      ])
      expect(capabilities.headerExtensions).toEqual(browserCapabilities.headerExtensions)
    })
  })

  test('Get audio capabilities in iOS Chrome', ({ given, when, then }) => {
    let capabilities

    const browserCapabilities = {
      codecs: [
        { channels: 2, clockRate: 48000, mimeType: 'audio/opus', sdpFmtpLine: 'minptime=10;useinbandfec=1' },
        { channels: 1, clockRate: 16000, mimeType: 'audio/ISAC' },
        { channels: 1, clockRate: 32000, mimeType: 'audio/ISAC' }
      ],
      headerExtensions: []
    }

    given('my browser audio capabilities', async () => {
      changeBrowserMock('Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1')
      jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue({ ...browserCapabilities })
    })

    when('I get audio capabilities', async () => {
      capabilities = PeerConnection.getCapabilities('audio')
    })

    then('returns opus codec', async () => {
      expect(capabilities.codecs).toEqual([
        { codec: 'opus', mimeType: 'audio/opus', channels: 2 }
      ])
      expect(capabilities.headerExtensions).toEqual(browserCapabilities.headerExtensions)
    })
  })

  test('Get audio capabilities in Firefox', ({ given, when, then }) => {
    let capabilities

    const browserCapabilities = {
      codecs: [
        { channels: 2, clockRate: 48000, mimeType: 'audio/opus', sdpFmtpLine: 'minptime=10;useinbandfec=1' },
        { channels: 1, clockRate: 16000, mimeType: 'audio/ISAC' },
        { channels: 1, clockRate: 32000, mimeType: 'audio/ISAC' }
      ],
      headerExtensions: []
    }

    given('my browser audio capabilities', async () => {
      changeBrowserMock('Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0')
      jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue({ ...browserCapabilities })
    })

    when('I get audio capabilities', async () => {
      capabilities = PeerConnection.getCapabilities('audio')
    })

    then('returns opus codec', async () => {
      expect(capabilities.codecs).toEqual([
        { codec: 'opus', mimeType: 'audio/opus', channels: 2 }
      ])
      expect(capabilities.headerExtensions).toEqual(browserCapabilities.headerExtensions)
    })
  })

  test('Get capabilities from inexistent kind in Chrome', ({ given, when, then }) => {
    let capabilities

    const browserCapabilities = null

    given('I am in Chrome', async () => {
      changeBrowserMock('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36')
    })

    when('I get data capabilities', async () => {
      jest.spyOn(RTCRtpSender, 'getCapabilities').mockReturnValue(browserCapabilities)
      capabilities = PeerConnection.getCapabilities('data')
    })

    then('returns null', async () => {
      expect(capabilities).toEqual(browserCapabilities)
    })
  })

  test('Get capabilities from inexistent kind in Firefox', ({ given, when, then }) => {
    let capabilities

    given('I am in Firefox', async () => {
      changeBrowserMock('Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0')
    })

    when('I get data capabilities', async () => {
      capabilities = PeerConnection.getCapabilities('data')
    })

    then('returns null', async () => {
      expect(capabilities).toEqual(null)
    })
  })
})
