/**
 * Event type definitions for the Millicast SDK
 * These types enable TypeScript users to write type-safe event handlers
 */

import type { ConnectionStats } from './stats.types';
import type {
  BroadcastEvent,
  MetadataObject,
} from './View.types';

/**
 * Reconnect event payload
 */
export interface ReconnectEvent {
  /** Next retry interval in milliseconds */
  timeout: number
  /** Error that triggered the reconnection */
  error: Error
}

/**
 * Connection state values from RTCPeerConnection
 */
export type ConnectionState = RTCPeerConnectionState | RTCIceConnectionState

/**
 * Signaling connection success event payload
 */
export interface SignalingConnectionSuccessEvent {
  /** The WebSocket instance */
  ws: WebSocket
  /** The transaction manager instance */
  tm: unknown
}

/**
 * Events emitted by the Signaling class
 */
export interface SignalingEvents {
  /** Fired when WebSocket connection is established */
  wsConnectionSuccess: SignalingConnectionSuccessEvent
  /** Fired when WebSocket connection fails */
  wsConnectionError: string
  /** Fired when WebSocket connection is closed */
  wsConnectionClose: undefined
  /** Fired when a broadcast event is received from the server */
  broadcastEvent: BroadcastEvent
  /** Fired when a migration event is received */
  migrate: undefined
}

/**
 * Events emitted by PeerConnection class
 */
export interface PeerConnectionEvents {
  /** Fired when a new track is received */
  track: RTCTrackEvent
  /** Fired when the connection state changes */
  connectionStateChange: ConnectionState
  /** Fired periodically with connection statistics */
  stats: ConnectionStats
}

/**
 * Events emitted by PeerConnectionStats class
 */
export interface PeerConnectionStatsEvents {
  /** Fired periodically with connection statistics */
  stats: ConnectionStats
}

/**
 * Events emitted by the View class (subscriber)
 */
export interface ViewerEvents {
  /** Fired when a broadcast event is received (active, inactive, layers, etc.) */
  broadcastEvent: BroadcastEvent
  /** Fired when a new media track is received */
  track: RTCTrackEvent
  /** Fired when metadata is extracted from the stream (H.264 only) */
  metadata: MetadataObject
  /** Fired when an error occurs */
  error: Error
  /** Fired when attempting to reconnect */
  reconnect: ReconnectEvent
  /** Fired when the peer connection state changes */
  connectionStateChange: ConnectionState
  /** Fired periodically with connection statistics */
  stats: ConnectionStats
}

/**
 * Events emitted by the Publish class (publisher)
 */
export interface PublisherEvents {
  /** Fired when a broadcast event is received (active, inactive, viewercount) */
  broadcastEvent: BroadcastEvent
  /** Fired when attempting to reconnect */
  reconnect: ReconnectEvent
  /** Fired when the peer connection state changes */
  connectionStateChange: ConnectionState
  /** Fired periodically with connection statistics */
  stats: ConnectionStats
}

/**
 * Base events shared by View and Publish classes
 */
export interface BaseWebRTCEvents {
  /** Fired when attempting to reconnect */
  reconnect: ReconnectEvent
  /** Fired when the peer connection state changes */
  connectionStateChange: ConnectionState
}
