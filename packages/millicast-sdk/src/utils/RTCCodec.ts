import {VideoCodec} from "../types/Codecs.types"

export function extractSupportedVideoCodecs (capabilities?: RTCRtpCapabilities | null): VideoCodec[] {
  if (!capabilities?.codecs) {
    return []
  }

  const codecMap: Record<string, VideoCodec> = {
    vp8: VideoCodec.VP8,
    vp9: VideoCodec.VP9,
    h264: VideoCodec.H264,
    av1: VideoCodec.AV1,
    av1x: VideoCodec.AV1, // Normalize AV1X to AV1
    h265: VideoCodec.H265,
  }

  return capabilities.codecs
    .map(codec => {
      const codecName = codec.mimeType.split('/')[1].toLowerCase()
      return codecMap[codecName]
    })
    .filter((codec): codec is VideoCodec => codec !== undefined)
}
