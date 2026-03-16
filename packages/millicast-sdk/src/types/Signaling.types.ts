import { type PublishServerEvent, type ViewServerEvent } from './BaseWebRTC.types'
import { type VideoCodec } from './Codecs.types'
import { type LayerInfo } from './View.types'


type AbrStrategy = 'quality' | 'bandwidth' | 'performance'

interface AbrStrategyMetadata {
  bitrate: number|undefined
}

export interface AbrConfigurationOptions {
  /**

   * The strategy for initial playback behavior.
   * - `"quality"`: Prioritizes highest quality first with high ABR aggressiveness.
   * - `"bandwidth"`: Conservative quality selection based on network estimates with medium ABR aggressiveness.
   * - `"performance"`: Prioritizes lowest quality first with conservative ABR aggressiveness.
   */
  strategy?: AbrStrategy

  /**

   * The metadata configuration for the initial playback strategy. This value is nullable.
   */
  metadata?: AbrStrategyMetadata | null
}

export interface SignalingSubscribeOptions {
  streamId?: string | null
  vad?: boolean
  pinnedSourceId?: string | null
  excludedSourceIds?: string[] | null
  events?: ViewServerEvent[]
  layer?: LayerInfo
  forcePlayoutDelay?: { min: number; max: number }
  disableVideo?: boolean
  disableAudio?: boolean,
  forceSmooth?: boolean,
  abrConfiguration? : AbrConfigurationOptions
}

export interface SignalingPublishOptions {
  codec: VideoCodec
  record?: boolean | null
  sourceId?: string | null
  events?: PublishServerEvent[]
  intraOnlyForwarding?: boolean
  priority?: number
  simulcastId?: string
  live?: boolean
  vod?: boolean
  norestream?: boolean
  overrideBWE?: number
  disableVideo?: boolean
  disableAudio?: boolean
}

export type ViewCmd = SignalingSubscribeOptions & {
  sdp: string
  abr?: AbrConfigurationOptions
}

export interface ViewResponse {
  sdp: string
  subscriberId: string
  clusterId: string
  streamId: string
  streamViewId: string
}

export type PublishCmd = SignalingPublishOptions & {
  sdp: string
}

export interface PublishResponse {
  uuid: string
  feedId: string
  publisherId: string
  clusterId: string
  streamId: string
  sdp: string
}
