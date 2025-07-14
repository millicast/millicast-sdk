/* eslint-disable */
import { BaseWebRTC } from '../utils/BaseWebRTC';
import { Publisher } from '../Publisher';
import { Viewer } from '../Viewer';
import { PeerConnection } from '../PeerConnection';
import { PeerConnectionStats } from '../PeerConnectionStats';
import { Signaling } from '../Signaling';
import TransactionManager from 'transaction-manager';
import { EncryptionParameters, TrackInfo } from './Viewer.types';
import { EmittedEvents } from '../utils/TypedEventEmitter';
import { ConnectionStats } from './stats.types';
/* eslint-enable */

/**
 * Events triggered by the {@link PeerConnectionStats} class.
 */
export interface PeerConnectionStatsEvents extends EmittedEvents {
  /** Triggered when a new track is available. */
  stats(webRtcStats: ConnectionStats): void;
}

/**
 * Events triggered by the {@link PeerConnection} class.
 */
export interface PeerConnectionEvents extends PeerConnectionStatsEvents, EmittedEvents {
  /** Triggered when a new track is available. */
  track(trackEvent: RTCTrackEvent): void;

  /** Triggered when the state of the connection changes. */
  connectionStateChange(newState: string): void;
}

/**
 * Events triggered by the {@link Signaling} class.
 */
export interface SignalingEvents extends EmittedEvents {
  /**
   * WebSocket connection was successfully established with signaling server.
   */
  wsConnectionSuccess(event: {
    /** WebSocket object which represents active connection. */
    ws: WebSocket,
    /** [TransactionManager](https://github.com/medooze/transaction-manager) object that simplify WebSocket commands. */
    tm: TransactionManager | null
  }): void;

  /**
   * Triggered when there is a web socket connection error.
   * @param url URL of the web socket. 
   */
  wsConnectionError(url: string): void;

  /** Triggered when the web socket connection closes. */
  wsConnectionClose(): void;

  /** Triggered when the stream has stopped for a given reason. */
  stopped(): void;

  /** Triggered when using multiplexed tracks for audio. */
  vad(): void;

  /**
   * Triggered when there is an update of the state of the layers in a stream (when broadcasting with simulcast).
   * @param obj event payload.
   * */
  layers(obj: LayersEventPayload): void;

  /** Triggered when the server is having problems, is shutting down or when viewers need to move for load balancing purposes. */
  migrate(): void;

  /** Triggered when an active stream's tracks are updated. */
  updated(): void;
  
  /**
   * Fires when the live stream is, or has started broadcasting.
   * @param obj event payload.
   */
  active(obj: ActiveEventPayload): void;

  /**
   * Fires when the stream has stopped broadcasting, but is still available.
   * @param obj event payload.
   */
  inactive(obj: InactiveEventPayload): void;
}

/**
 * Events triggered by the {@link Viewer}, {@link Publisher} and {@link BaseWebRTC} classes.
 */
export interface BaseWebRTCEvents extends EmittedEvents {
  /**
   * Event triggered from time to time to indicate the number of viewers connected to the stream.
   *
   * @example
   * ```ts
   * // TODO
   *
   * viewer.on('viewercount', (count: number) => {
   *   console.log(count, 'viewer(s) connected.');
   * });
   * ```
   *
   * @param count Number of viewers connected to the stream.
   */
  viewercount(count: number): void;

  /**
   * Fires when the live stream is, or has started broadcasting.
   * @param obj event payload.
   */
  active(obj: ActiveEventPayload): void;

  /**
   * Fires when the stream has stopped broadcasting, but is still available.
   * @param obj event payload.
   */
  inactive(obj: InactiveEventPayload): void;

  /**
   * Emits with every reconnection attempt made when an active stream
   * stopped unexpectedly.
   * @param obj event payload.
   */
  reconnect(obj: ReconnectEventPayload): void;

  /**
   * Fires when an error occurs.
   * @param error Error that was triggered.
   */
  error(error: Error): void;
}

/**
 * Events triggered by the {@link Publisher} class.
 */
export interface PublisherEvents extends PeerConnectionEvents, SignalingEvents, BaseWebRTCEvents {

}

/**
 * Events triggered by the {@link Viewer} class.
 */
export interface ViewerEvents extends BaseWebRTCEvents {
  /** Track event. */
  track(trackEvent: RTCTrackEvent): void;

  /** Triggered when a video track has metadata. */
  metadata(obj: MetadataEventPayload): void;

  /** Triggered when the stream has stopped for a given reason. */
  stopped(): void;

  /** Triggered when using multiplexed tracks for audio. */
  vad(): void;

  /**
   * Triggered when there is an update of the state of the layers in a stream (when broadcasting with simulcast).
   * @param obj event payload.
   * */
  layers(obj: LayersEventPayload): void;

  /** Triggered when the server is having problems, is shutting down or when viewers need to move for load balancing purposes. */
  migrate(): void;

  /** Triggered when an active stream's tracks are updated. */
  updated(): void;
}

/** Event payload triggered by {@link ViewerEvents.metadata}. */
export interface MetadataEventPayload {
  /**  Media identifier that contains the metadata. */
  mid: string;
  /**  Track object that contains the metadata. */
  track: MediaStreamTrack;
  /**  UUID of the metadata. */
  uuid: string;
  /** Unregistered data. */
  unregistered: SEIUserUnregisteredData;
  /**  Timecode of when the metadata were generated. */
  timecode: Date;
}

/** Represent an SEI unregistered data value. */
export type SEIUserUnregisteredData = string | object | number;

/** Event payload triggered by {@link BaseWebRTCEvents.reconnect}. */
export interface ReconnectEventPayload {
  /** Next retry interval in milliseconds. */
  timeout: number,
  /**
   * Error object with cause of failure. Possible errors are:
   * * `Signaling error: wsConnectionError` if there was an error in the Websocket connection.
   * * `Connection state change: RTCPeerConnectionState disconnected` if there was an error in the RTCPeerConnection.
   * * `Attempting to reconnect` if the reconnect was trigered externally.
   * * Or any internal error thrown by either {@link Publisher.connect}> or {@link Viewer.connect} methods
   */
  error: Error
}

/** Event payload triggered by {@link BaseWebRTCEvents.active}. */
export interface ActiveEventPayload {
  /** */
  streamId: string;
  /** */
  sourceId?: string;
  /** */
  tracks: TrackInfo[];
  /** */
  encryption?: EncryptionParameters;
}

/** Event payload triggered by {@link BaseWebRTCEvents.inactive}. */
export interface InactiveEventPayload {
  /** */
  streamId: string;
  /** */
  sourceId?: string;
}

/** Event payload triggered by {@link BaseWebRTCEvents.inactive}. */
export interface LayersEventPayload {
  medias: LayersMediaCollection
}

/** */
export interface LayersMediaCollection {
  [key: string]: LayerMedia
}

/** */
export interface LayerMedia {
  active: Array<LayerMediaInfo>
  inactive: Array<LayerMediaInfo>
  layers: Array<Layer>
}

/** */
export interface LayerMediaInfo {
  id: string
  simulcastIdx: number
  totalBytes: number
  numPackets: number
  bitrate: number
  totalBitrate: number
  width: number
  height: number
  layers: Array<Layer>
}

/** */
export interface Layer extends Omit<LayerMediaInfo, 'id' | 'layers'> {
  encodingId: string
  spatialLayerId: number
  temporalLayerId: number
}
