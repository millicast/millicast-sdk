import { extractSupportedVideoCodecs } from '../../src/utils/RTCCodec'
import { VideoCodec } from '../../src/types/Codecs.types'

describe('extractSupportedVideoCodecs', () => {
  it('should return empty array when capabilities is undefined', () => {
    const result = extractSupportedVideoCodecs(undefined)
    expect(result).toEqual([])
  })

  it('should return empty array when capabilities is null', () => {
    const result = extractSupportedVideoCodecs(null)
    expect(result).toEqual([])
  })

  it('should return empty array when codecs is undefined', () => {
    const result = extractSupportedVideoCodecs({ codecs: undefined })
    expect(result).toEqual([])
  })

  it('should extract codec names from mimeType', () => {
    const capabilities = {
      codecs: [
        { mimeType: 'video/VP8', clockRate: 90000, channels: undefined },
        { mimeType: 'video/H264', clockRate: 90000, channels: undefined },
        { mimeType: 'video/VP9', clockRate: 90000, channels: undefined }
      ],
      headerExtensions: []
    }

    const result = extractSupportedVideoCodecs(capabilities)
    expect(result).toEqual([VideoCodec.VP8, VideoCodec.H264, VideoCodec.VP9])
  })

  it('should normalize AV1X to AV1', () => {
    const capabilities = {
      codecs: [
        { mimeType: 'video/AV1X', clockRate: 90000, channels: undefined }
      ],
      headerExtensions: []
    }

    const result = extractSupportedVideoCodecs(capabilities)
    expect(result).toEqual([VideoCodec.AV1]) // Not 'AV1X'
  })

  it('should handle both AV1 and AV1X as the same codec', () => {
    const capabilities = {
      codecs: [
        { mimeType: 'video/AV1', clockRate: 90000, channels: undefined },
        { mimeType: 'video/AV1X', clockRate: 90000, channels: undefined }
      ],
      headerExtensions: []
    }

    const result = extractSupportedVideoCodecs(capabilities)
    expect(result).toEqual([VideoCodec.AV1, VideoCodec.AV1])
  })

  it('should convert codec names to lowercase for matching', () => {
    const capabilities = {
      codecs: [
        { mimeType: 'video/vp8', clockRate: 90000, channels: undefined }
      ],
      headerExtensions: []
    }

    const result = extractSupportedVideoCodecs(capabilities)
    expect(result).toEqual([VideoCodec.VP8])
  })

  it('should filter out unsupported codecs', () => {
    const capabilities = {
      codecs: [
        { mimeType: 'video/VP8', clockRate: 90000, channels: undefined },
        { mimeType: 'video/UNKNOWN', clockRate: 90000, channels: undefined },
        { mimeType: 'video/H264', clockRate: 90000, channels: undefined }
      ],
      headerExtensions: []
    }

    const result = extractSupportedVideoCodecs(capabilities)
    expect(result).toEqual([VideoCodec.VP8, VideoCodec.H264])
  })

  it('should handle all supported codecs', () => {
    const capabilities = {
      codecs: [
        { mimeType: 'video/VP8', clockRate: 90000, channels: undefined },
        { mimeType: 'video/VP9', clockRate: 90000, channels: undefined },
        { mimeType: 'video/H264', clockRate: 90000, channels: undefined },
        { mimeType: 'video/AV1', clockRate: 90000, channels: undefined },
        { mimeType: 'video/H265', clockRate: 90000, channels: undefined }
      ],
      headerExtensions: []
    }

    const result = extractSupportedVideoCodecs(capabilities)
    expect(result).toEqual([
      VideoCodec.VP8,
      VideoCodec.VP9,
      VideoCodec.H264,
      VideoCodec.AV1,
      VideoCodec.H265
    ])
  })
})
