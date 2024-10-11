import { Media, ViewServerEvent } from './BaseWebRTC.types'
import { VideoCodec } from './Codecs.types'
import { PeerConnectionConfig } from './PeerConnection.types'

export type ViewConnectOptions = {
  /**
   * - True to modify SDP for supporting dtx in opus. Otherwise False.
   */
  dtx?: boolean
  /**
   * - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
   */
  absCaptureTime?: boolean
  /**
   * - Enable metadata extraction. This feature is only supported with the H.264 codec.
   */
  metadata?: boolean
  /**
   * - Disable the opportunity to receive video stream.
   */
  disableVideo?: boolean
  /**
   * - Disable the opportunity to receive audio stream.
   */
  disableAudio?: boolean
  /**
   * - Number of audio tracks to recieve VAD multiplexed audio for secondary sources.
   */
  multiplexedAudioTracks?: number
  /**
   * - Id of the main source that will be received by the default MediaStream.
   */
  pinnedSourceId?: string | null
  /**
   * - Enable Drm
   */
  enableDRM?: boolean
  /**
   * - Do not receive media from the these source ids.
   */
  excludedSourceIds?: Array<string> | null
  /**
   * - Override which events will be delivered by the server (any of "active" | "inactive" | "vad" | "layers" | "viewercount" | "updated").*
   */
  events?: ViewServerEvent[]
  /**
   * - Options to configure the new RTCPeerConnection.
   */
  peerConfig?: PeerConnectionConfig
  /**
   * - Set the SDP to local peer.
   */
  setSDPToPeer?: false
  /**
   * - Select the simulcast encoding layer and svc layers for the main video track, leave empty for automatic layer selection based on bandwidth estimation.
   */
  layer?: LayerInfo
  /**
   * - Ask the server to use the playout delay header extension.
   */
  forcePlayoutDelay?: { min: number; max: number } | boolean
  /**
   * - Ask the server to use the playout delay header extension.
   */
  vad?: boolean
  /**
   * - Codec for View stream.
   */
  codec?: VideoCodec
}

export type ViewProjectSourceMapping = {
  /**
   * - Track id from the source (received on the "active" event), if not set the media kind will be used instead.
   */
  trackId?: string
  /**
   * - mid value of the rtp receiver in which the media is going to be projected. If no mediaId is defined, the first track from the main media stream with the same media type as the input source track will be used.
   */
  mediaId?: string
  /**
   * - Track kind of the source ('audio' | 'video'), if not set the trackId will be used instead.
   */
  media?: Media
  /**
   * - Select the simulcast encoding layer and svc layers, only applicable to video tracks.
   */
  layer?: LayerInfo
}

export type LayerInfo = {
  /**
   * - rid value of the simulcast encoding of the track  (default: automatic selection)
   */
  encodingId: string
  /**
   * - The spatial layer id to send to the outgoing stream (default: max layer available)
   */
  spatialLayerId: number
  /**
   * - The temporaral layer id to send to the outgoing stream (default: max layer available)
   */
  temporalLayerId: number
  /**
   * - Max spatial layer id (default: unlimited)
   */
  maxSpatialLayerId: number
  /**
   * - Max temporal layer id (default: unlimited)
   */
  maxTemporalLayerId: number
}

/**
 * The configuration for DRM playback
 */
export type DRMOptions = {
  /** The video element */
  videoElement: HTMLVideoElement

  /** The video encryption parameters */
  videoEncryptionParams: EncryptionParameters

  /** The video media ID of RTCRtpTransceiver */
  videoMid: string

  /** The audio element */
  audioElement: HTMLAudioElement

  /** The audio encryption parameters */
  audioEncryptionParams?: EncryptionParameters

  /** The audio media ID of RTCRtpTransceiver */
  audioMid?: string

  /**
   * The average target latency, it can be set to 0,
   * enabling zero-buffering mode (which is not recommended as it affects video playback smoothness).
   * The default value is 100 ms, except when PlayReady or Widevine L1 on Windows are used - those
   * require at least 600 ms buffer for SW-secure decryption/playback and 1200 ms for HW-secure one
   */
  mediaBufferMs?: number

  /** PlayReady License URL */
  prLicenseUrl?: string

  /** Widevine License URL */
  wvLicenseUrl?: string

  /** FairPlay License URL */
  fpsLicenseUrl?: string

  /** FairPlay Certificate URL */
  fpsCertificateUrl?: string

  merchant?: string
  sessionId?: string
  environment?: string
  customTransform?: boolean
}

/**
 * DRM encryption parameters
 */
export type EncryptionParameters = {
  /** 16-byte KeyID, in lowercase hexadecimal without separators */
  keyId: string

  /** 16-byte initialization vector, in lowercase hexadecimal without separators */
  iv: string
}

export type SEIUserUnregisteredData = string | object | number

export interface MetadataObject {
  mid: string
  track: MediaStreamTrack
  uuid: string
  unregistered: SEIUserUnregisteredData
  timecode: Date
}

/**
 * Broadcast event
 */
export type BroadcastEventName = ViewServerEvent

export interface BroadcastEvent {
  name: BroadcastEventName
}

/**
 * Active Event
 */
export type TrackInfo = {
  trackId: string
  media: Media
}

export type ActiveEventPayload = {
  streamId: string
  sourceId: string | null
  tracks: TrackInfo[]
  encryption?: EncryptionParameters
}

export interface ActiveEvent extends BroadcastEvent {
  name: Extract<BroadcastEventName, 'active'>
  data: ActiveEventPayload
}


/**
 * Inactive Event
 */
export type InactiveEventPayload = {
  streamId: string
  sourceId: string | null
}

export interface InactiveEvent extends BroadcastEvent {
  name: Extract<BroadcastEventName, 'inactive'>
  data: InactiveEventPayload
}


/**
 * ViewerCount Event
 */
export type ViewerCountEventPayload = {
  viewerCount: number
}

export interface ViewerCountEvent extends BroadcastEvent {
  name: Extract<BroadcastEventName, 'viewercount'>
  data: ViewerCountEventPayload
}

/**
 * Metadata Event
 */
export interface MetadataEvent extends MetadataObject {
  // TODO: seiPicTimingTimeCodeArray
}

/**
 * Events declaration of Viewers that user could listen to
 */
export interface ViewerEvents {
  'broadcastEvent'?: BroadcastEvent
  'track'?: RTCTrackEvent
  'metadata'?: MetadataEvent
  // TODO: elaborate error type
  'error'?: Error
}