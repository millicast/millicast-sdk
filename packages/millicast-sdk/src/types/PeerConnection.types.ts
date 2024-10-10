import { VideoCodec } from './Codecs.types'

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

export interface ICodecs {
  codec?: VideoCodec
  mimeType: string
  scalabilityModes?: Array<string>
  channels?: number
}

export interface MillicastCapability {
  codecs: ICodecs[]
  headerExtensions: Array<RTCRtpHeaderExtensionCapability>
}
