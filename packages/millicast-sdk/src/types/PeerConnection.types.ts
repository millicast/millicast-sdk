import { type AudioCodec, type VideoCodec } from './Codecs.types'

export const ConnectionType = {
  Publisher: 'Publisher',
  Viewer: 'Viewer',
} as const

export type ConnectionTypeValue = (typeof ConnectionType)[keyof typeof ConnectionType]

export const webRTCEvents = {
  track: 'track',
  connectionStateChange: 'connectionStateChange',
} as const


export interface PeerConnectionConfig extends RTCConfiguration {
  /**
   * - whether stats collection should be auto initialized. Defaults to `true`
   */
  autoInitStats?: boolean

  /**
   * The interval, in milliseconds, at which we poll stats. Defaults to 1s (1000ms)
   */
  statsIntervalMs?: number
  /**
   * encoded insertable streams
   */
  encodedInsertableStreams?: boolean
}

export interface SdpOptions {
  stereo?: boolean
  dtx?: boolean
  mediaStream?: MediaStream | MediaStreamTrack[]
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

export interface ICodecs {
  codec?: VideoCodec | AudioCodec
  mimeType?: string
  scalabilityModes?: string[]
  channels?: number
}

export interface MillicastCapability {
  codecs: ICodecs[]
  headerExtensions: RTCRtpHeaderExtensionCapability[]
}
