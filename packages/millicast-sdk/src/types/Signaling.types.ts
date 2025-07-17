import { PublisherServerEvent, ViewerServerEvent } from './BaseWebRTC.types';
import { VideoCodec } from './Codecs.types';
import { LayerInfo } from './Viewer.types';

/**
 * Signaling Options
 */
export interface SignalingOptions {
  /**
   * Stream Name to subscribe to.
   */
  streamName: string | null;
  /**
   * WebSocket URL to signal the server and establish a WebRTC connection.
   */
  url: string;
}

/**  */
export interface SignalingSubscribeOptions {
  /** Enable VAD multiplexing for secondary sources. */
  vad?: boolean;
  /** Id of the main source that will be received by the default MediaStream. */
  pinnedSourceId?: string | null;
  /** Do not receive media from the these source ids. */
  excludedSourceIds?: string[] | null;
  /** Override which events will be delivered by the server ("active" | "inactive" | "vad" | "layers" | "updated"). */
  events?: ViewerServerEvent[];
  /** Select the simulcast encoding layer and svc layers for the main video track, leave empty for automatic layer selection based on bandwidth estimation. */
  layer?: LayerInfo;
  forcePlayoutDelay?: { min: number; max: number };
  disableVideo?: boolean;
  disableAudio?: boolean;
  forceSmooth?: boolean;
}

/**  */
export interface SignalingPublishOptions {
  /** Codec for publish stream. */
  codec: VideoCodec;
  /** Enable stream recording. If record is not provided, use default Token configuration. **Only available in Tokens with recording enabled.** */
  record?: boolean | null;
  /** Source unique id. **Only available in Tokens with multisource enabled.*** */
  sourceId?: string | null;
  /** Override which events will be delivered by the server ("active" | "inactive"). */
  events?: PublisherServerEvent[];
  intraOnlyForwarding?: boolean;
  priority?: number;
  simulcastId?: string;
  live?: boolean;
  vod?: boolean;
  norestream?: boolean;
  overrideBWE?: number;
  disableVideo?: boolean;
  disableAudio?: boolean;
}

export type ViewCmd = SignalingSubscribeOptions & {
  sdp: string;
};

export type ViewResponse = {
  sdp: string;
  subscriberId: string;
  clusterId: string;
  streamId: string;
  streamViewId: string;
};

export type PublishCmd = SignalingPublishOptions & {
  sdp: string;
};

export type PublishResponse = {
  uuid: string;
  feedId: string;
  publisherId: string;
  clusterId: string;
  streamId: string;
  sdp: string;
};
