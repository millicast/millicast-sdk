import { PublisherServerEvent } from './BaseWebRTC.types';
import { VideoCodec } from './Codecs.types';
import { PeerConnectionConfig } from './PeerConnection.types';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PeerConnection } from '../PeerConnection';

/**
 * Publisher Options.
 */
export interface PublisherOptions {
  /**
   * Millicast publisher Stream Name.
   */
  streamName: string;
  /**
   * Publish token.
   */
  publishToken: string;
  /**
   * Enable auto reconnect in case of disconnection.
   * @default true
   */
  autoReconnect?: boolean;
}

/**
 * Options to publish a stream.
 */
export interface PublishConnectOptions {
  /**
   * Source unique id. Only avialable if stream is multisource.
   */
  sourceId?: string | null;
  /**
   * True to modify SDP for support stereo. Otherwise False.
   */
  stereo?: boolean;
  /**
   * True to modify SDP for supporting dtx in opus. Otherwise False.
   */
  dtx?: boolean;
  /**
   * True to modify SDP for supporting absolute capture time header extension. Otherwise False.
   */
  absCaptureTime?: boolean;
  /**
   * True to modify SDP for supporting aom dependency descriptor header extension. Otherwise False.
   */
  dependencyDescriptor?: boolean;
  /**
   * MediaStream to offer in a stream. This object must have
   * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
   */
  mediaStream: MediaStream | Array<MediaStreamTrack> | null;
  /**
   * Broadcast bandwidth. 0 for unlimited.
   */
  bandwidth?: number;
  /**
   * Enable metadata insertion. This feature is only supported with the H.264 codec.
   */
  metadata?: boolean;
  /**
   * Number of audio tracks to receive VAD multiplexed audio for secondary sources.
   */
  multiplexedAudioTracks?: number;
  /**
   * Disable the opportunity to send video stream.
   */
  disableVideo?: boolean;
  /**
   * Disable the opportunity to send audio stream.
   */
  disableAudio?: boolean;
  /**
   * Codec for publish stream.
   */
  codec?: VideoCodec;
  /**
   * Enable simulcast.
   * @remarks Only available in Chromium based browsers with either the H.264 or VP8 video codec.
   */
  simulcast?: boolean;
  /**
   * Selected scalability mode. You can get the available capabilities using {@link PeerConnection.getCapabilities} method.
   * @remarks nly available in Google Chrome.
   */
  scalabilityMode?: string | null;
  /**
   * Options to configure the new RTCPeerConnection.
   */
  peerConfig?: PeerConnectionConfig;
  /**
   * Enable stream recording. If record is not provided, use default Token configuration.
   * @remarks Only available in Tokens with recording enabled.
   */
  record?: boolean;
  /**
   * - Enable Drm
   */
  enableDRM?: boolean;
  /**
   * Specify which events will be delivered by the server (any of "active" | "inactive" | "viewercount").
   */
  events?: PublisherServerEvent[];
  /**
   * When multiple ingest streams are provided by the customer, add the ability to specify a priority between all ingest streams.
   * Decimal integer between the range [-2^31, +2^31 - 1].
   * For more information, visit [our documentation](https://optiview.dolby.com/docs/millicast/broadcast/redundant-ingest/#4-set-priorities).
   */
  priority?: number;
  /** */
  setSDPToPeer?: boolean;
}
