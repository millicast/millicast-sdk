/**
 * Millicast SDK Exports
 *
 * This file defines the public API of the SDK.
 * All exports here are part of the public contract and should maintain backwards compatibility.
 */

// =============================================================================
// CORE MODULES
// These are the primary classes users interact with
// =============================================================================
export { default as Director } from './Director';
export { default as Logger } from './Logger';
export { default as PeerConnection } from './PeerConnection';
export { default as Signaling } from './Signaling';
export { default as Publish } from './Publish';
export { default as View } from './View';

// =============================================================================
// NAMED EXPORTS 
// =============================================================================
export { defaultApiEndpoint } from './Director';
export { signalingEvents } from './Signaling';
export { ConnectionType, webRTCEvents } from './types/PeerConnection.types';
export { VideoCodec, AudioCodec } from './types/Codecs.types';

export { default as PeerConnectionStats } from './PeerConnectionStats';
export { peerConnectionStatsEvents } from './PeerConnectionStats';
export { default as FetchError } from './utils/FetchError';
export { MillicastEventEmitter } from './EventEmitter';

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Logger types
export type { LogLevel } from './Logger';

// Director types
export type {
  MillicastDirectorResponse,
  DirectorPublisherOptions,
  DirectorSubscriberOptions,
  DirectorResponse,
  DRMProfile,
  TokenGeneratorCallback,
  DRMObject,
} from './types/Director.types';

// PeerConnection types
export type {
  ConnectionTypeValue,
  PeerConnectionConfig,
  SdpOptions,
  ICodecs,
  MillicastCapability,
} from './types/PeerConnection.types';

// Signaling types
export type {
  AbrConfigurationOptions,
  SignalingSubscribeOptions,
  SignalingPublishOptions,
} from './types/Signaling.types';

// Publish types
export type { PublishConnectOptions } from './types/Publish.types';

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
} from './types/View.types';

// Event types for event handling
export type {
  ViewerEvents,
  PublisherEvents,
  PeerConnectionEvents,
  PeerConnectionStatsEvents,
  SignalingEvents,
  SignalingConnectionSuccessEvent,
  ReconnectEvent,
  ConnectionState,
  BaseWebRTCEvents,
} from './types/Events.types';

// BaseWebRTC types
export type {
  Media,
  ViewServerEvent,
  PublishServerEvent,
  ReconnectData,
} from './types/BaseWebRTC.types';

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
} from './types/stats.types';
