import { InputAudio, InputVideo, OutputAudio, OutputVideo } from "@dolbyio/webrtc-stats"

/** Connection statistics description. */
export type ConnectionStats = {
  /**
   * - All RTCPeerConnection stats without parsing. Reference {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport}.
   */
  raw?: RTCStatsReport
  /**
   * - Parsed audio information.
   */
  audio: AudioReport
  /**
   * - Parsed video information.
   */
  video: VideoReport
  /**
   * - The available outbound capacity of the network connection. The higher the value, the more bandwidth you can assume is available for outgoing data. The value is reported in bits per second.
   *
   * This value comes from the nominated candidate-pair.
   */
  availableOutgoingBitrate?: number
  /**
   * - Total round trip time is the total time in seconds that has elapsed between sending STUN requests and receiving the responses.
   *
   * This value comes from the nominated candidate-pair.
   */
  totalRoundTripTime?: number
  /**
   * - Current round trip time indicate the number of seconds it takes for data to be sent by this peer to the remote peer and back over the connection described by this pair of ICE candidates.
   *
   * This value comes from the nominated candidate-pair.
   */
  currentRoundTripTime?: number
}

export type AudioReport = {
  /**
   * - Parsed information of each inbound-rtp.
   */
  inbounds: InboundStats[]
  /**
   * - Parsed information of each outbound-rtp.
   */
  outbounds: OutboundAudioStats[]
}

export type VideoReport = {
  /**
   * - Parsed information of each inbound-rtp.
   */
  inbounds: InboundStats[]
  /**
   * - Parsed information of each outbound-rtp.
   */
  outbounds: OutboundVideoStats[]
}

export type InboundStats = InputAudio & InputVideo & {
  /**
   * - Current framerate if it's video report.
   */
  framesPerSecond?: number
  /**
   * - Current frame height if it's video report.
   */
  frameHeight?: number
  /**
   * - Current frame width if it's video report.
   */
  frameWidth?: number
  /**
   * - Total number of key frames that have been decoded if it's video report.
   */
  keyFramesDecoded?: number
  /**
   * - Total number of frames that have been decoded if it's video report.
   */
  framesDecoded?: number
  /**
   * - Total number of frames that have been dropped if it's video report.
   */
  framesDropped?: number
  /**
   * - Total number of frames that have been received if it's video report.
   */
  framesReceived?: number
  /**
   * - Total packet lost ratio per second.
   */
  packetsLostRatioPerSecond: number
  /**
   * - Total packet lost delta per second.
   */
  packetsLostDeltaPerSecond: number
  /**
   * - Current bitrate in bits per second.
   */
  bitrateBitsPerSecond: number
}

export type OutboundAudioStats = OutputAudio & {
  /**
   * - Current bitrate in bits per second.
   */
  bitrateBitsPerSecond: number
}

export type OutboundVideoStats = OutputVideo & {
  /**
   * - Current bitrate in bits per second.
   */
  bitrateBitsPerSecond: number
}

export type DiagnosticsObject = {
  client: string
  version: string
  timestamp: string
  userAgent: string
  clusterId: string
  accountId: string
  streamName: string
  subscriberId: string
  connection: string
  stats: ConnectionStats[]
  connectionDurationMs: number
  feedId?: string
  streamViewId?: string
  history?: string[]
}

export type DiagnosticsOptions = {
  statsCount: number,
  historySize: number,
  minLogLevel: string,
  statsFormat: string
}

export type CMCDDiagnostics = Omit<DiagnosticsObject, 'stats'> & {
  stats: CMCDStats[]
}

export type CMCDStats = {
  ts: string | number
  ot: string
  bl: number
  br: number
  pld: number
  j: number
  mtp: number
  mid: string
  mimeType: string
}
