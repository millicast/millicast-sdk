// Core modules
export { default as Director } from './Director'
export { default as Logger } from './Logger'
export { default as PeerConnectionStats } from './PeerConnectionStats'
export { default as PeerConnection } from './PeerConnection.js'
export { default as Signaling } from './Signaling.js'
export { default as Publish } from './Publish.js'
export { default as View } from './View.js'

// Named exports from core modules
export { default as FetchError } from './utils/FetchError'
export { defaultApiEndpoint } from './Director'
export { signalingEvents } from './Signaling.js'
export { peerConnectionStatsEvents } from './PeerConnectionStats'
export { MillicastEventEmitter } from './EventEmitter'

// Logger types
export type { LogLevel } from './Logger'

// Codec enums and types
export { VideoCodec, AudioCodec } from './types/Codecs.types'

// Director types
export type {
  MillicastDirectorResponse,
  DirectorPublisherOptions,
  DirectorSubscriberOptions,
  DirectorResponse,
  DRMProfile,
  TokenGeneratorCallback,
  DRMObject,
} from './types/Director.types'

// PeerConnection types
export {
  ConnectionType,
  webRTCEvents,
} from './types/PeerConnection.types'

export type {
  ConnectionTypeValue,
  PeerConnectionConfig,
  SdpOptions,
  ICodecs,
  MillicastCapability,
} from './types/PeerConnection.types'

// Signaling types
export type {
  AbrConfigurationOptions,
  SignalingSubscribeOptions,
  SignalingPublishOptions,
} from './types/Signaling.types'

// Publish types
export type { PublishConnectOptions } from './types/Publish.types'

// View types
export type {
  ViewConnectOptions,
  ViewProjectSourceMapping,
  LayerInfo,
  DRMOptions,
  EncryptionParameters,
  SEIUserUnregisteredData,
  MetadataObject,
  BroadcastEventName,
  BroadcastEvent,
  TrackInfo,
  ActiveEventPayload,
  ActiveEvent,
  InactiveEventPayload,
  InactiveEvent,
  ViewerCountEventPayload,
  ViewerCountEvent,
  LayersEventPayload,
  LayersMediaCollection,
  LayerMedia,
  LayerMediaInfo,
  Layer,
  LayersEvent,
  MetadataEvent,
  ViewerEvents,
} from './types/View.types'

// BaseWebRTC types
export type {
  Media,
  ViewServerEvent,
  PublishServerEvent,
  ReconnectData,
} from './types/BaseWebRTC.types'

// Stats types
export type {
  ConnectionStats,
  AudioReport,
  VideoReport,
  InboundStats,
  OutboundAudioStats,
  OutboundVideoStats,
  DiagnosticsObject,
  DiagnosticsOptions,
  CMCDDiagnostics,
  CMCDStats,
} from './types/stats.types'
