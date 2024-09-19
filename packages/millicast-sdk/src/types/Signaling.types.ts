import { VideoCodec } from "../utils/Codecs"
import { LayerInfo } from "./View.types"

export type SignalingSubscribeOptions = {
  vad?: boolean
  pinnedSourceId?: string | null
  excludedSourceIds?: string[] | null
  events?: ('active' | 'inactive' | 'updated' | 'layers' | 'vad' | 'viewercount')[]
  layer?: LayerInfo
  forcePlayoutDelay?: {min: number, max: number}
  disableVideo?: boolean
  disableAudio?: boolean
}

export type SignalingPublishOptions = {
  codec?: VideoCodec
  record?: boolean | null
  sourceId?: string | null
  events?: ('active' | 'inactive' | 'viewercount')[]
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
}

export type ViewResponse = {
  sdp: string
	subscriberId: string
	clusterId: string
	streamId: string
  streamViewId: string
}

export type PublishCmd = SignalingPublishOptions & {
  sdp: string
}

export type PublishResponse = {
  uuid: string;
	feedId: string;
	publisherId: string;
	clusterId: string;
	streamId: string;
	sdp: string;
}