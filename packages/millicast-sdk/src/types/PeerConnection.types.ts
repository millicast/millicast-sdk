import { VideoCodec } from "../utils/Codecs"

export type peerConfigType = RTCConfiguration & {
  autoInitStats?: boolean
  statsIntervalMs?: number
}

export type sdpOptions = {
  stereo?: boolean
  dtx?: boolean
  mediaStream?: MediaStream | Array<MediaStreamTrack>
  codec?: VideoCodec
  simulcast?: boolean
  scalabilityMode?: string | null
  absCaptureTime?: boolean
  dependencyDescriptor?: boolean
  disableAudio?: boolean
  disableVideo?: boolean
  setSDPToPeer?: boolean
  multiplexedAudioTracks?: number
}

export interface CodecsType extends RTCRtpCodec {
  codec: string
  mimeType: string
  scalabilityModes?: Array<String>
  channels?: number
}

export interface MillicastCapability extends RTCRtpCapabilities {
  codecs: CodecsType[]
  headerExtensions: Array<RTCRtpHeaderExtensionCapability>
}