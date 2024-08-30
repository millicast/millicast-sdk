export type ConnectionStats = {
  /**
   * - All RTCPeerConnection stats without parsing. Reference {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport}.
   */
  raw: RTCStatsReport
  /**
   * - Parsed audio information.
   */
  audio: TrackReport
  /**
   * - Parsed video information.
   */
  video: TrackReport
  /**
   * - The available outbound capacity of the network connection. The higher the value, the more bandwidth you can assume is available for outgoing data. The value is reported in bits per second.
   *
   * This value comes from the nominated candidate-pair.
   */
  availableOutgoingBitrate: number
  /**
   * - Total round trip time is the total time in seconds that has elapsed between sending STUN requests and receiving the responses.
   *
   * This value comes from the nominated candidate-pair.
   */
  totalRoundTripTime: number
  /**
   * - Current round trip time indicate the number of seconds it takes for data to be sent by this peer to the remote peer and back over the connection described by this pair of ICE candidates.
   *
   * This value comes from the nominated candidate-pair.
   */
  currentRoundTripTime: number
  /**
   * - Local candidate type from the nominated candidate-pair which indicates the type of ICE candidate the object represents.
   */
  candidateType: RTCIceCandidateType
}

export type TrackReport = {
  /**
   * - Parsed information of each inbound-rtp.
   */
  inbounds: Array<InboundStats>
  /**
   * - Parsed information of each outbound-rtp.
   */
  outbounds: Array<OutboundStats>
}

export type InboundStats = {
  /**
   * - inbound-rtp Id.
   */
  id: string
  /**
   * - Current Jitter measured in seconds.
   */
  jitter: number
  /**
   * - Mime type if related report had codec report associated.
   */
  mimeType?: string
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
   * - Timestamp of report.
   */
  timestamp: number
  /**
   * - Total bytes received is an integer value which indicates the total number of bytes received so far from this synchronization source.
   */
  totalBytesReceived: number
  /**
   * - Total packets received indicates the total number of packets of any kind that have been received on the connection described by the pair of candidates.
   */
  totalPacketsReceived: number
  /**
   * - Total packets lost.
   */
  totalPacketsLost: number
  /**
   * - Total packet lost ratio per second.
   */
  packetsLostRatioPerSecond: number
  /**
   * - Total packet lost delta per second.
   */
  packetsLostDeltaPerSecond: number
  /**
   * - Current bitrate in Bytes per second.
   */
  bitrate: number
  /**
   * - Current bitrate in bits per second.
   */
  bitrateBitsPerSecond: number
  /**
   * - Total delay in seconds currently experienced by the jitter buffer.
   */
  jitterBufferDelay: number
  /**
   * - Total number of packets emitted from the jitter buffer.
   */
  jitterBufferEmittedCount: number
}

export type OutboundStats = {
  /**
   * - outbound-rtp Id.
   */
  id: string
  /**
   * - Mime type if related report had codec report associated.
   */
  mimeType?: string
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
   * - If it's video report, indicate the reason why the media quality in the stream is currently being reduced by the codec during encoding, or none if no quality reduction is being performed.
   */
  qualityLimitationReason?: string
  /**
   * - Timestamp of report.
   */
  timestamp: number
  /**
   * - Total bytes sent indicates the total number of payload bytes that hve been sent so far on the connection described by the candidate pair.
   */
  totalBytesSent: number
  /**
   * - Current bitrate in Bytes per second.
   */
  bitrate: number
  /**
   * - Current bitrate in bits per second.
   */
  bitrateBitsPerSecond: number
  /**
   *  - Change in the number of bytes sent since the last report.
   */
  bytesSentDelta: number
  /**
   *  - Total number of packets sent.
   */
  totalPacketsSent: number
  /**
   * - Change in the number of packets sent since the last report.
   */
  packetsSentDelta: number
  /**
   * - Rate at which packets are being sent, measured in packets per second.
   */
  packetRate: number
  /**
   * - The target bitrate for the encoder, in bits per second.
   */
  targetBitrate: number
  /**
   * - Total number of retransmitted packets sent.
   */
  retransmittedPacketsSent: number
  /**
   * - Change in the number of retransmitted packets sent since the last report.
   */
  retransmittedPacketsSentDelta: number
  /**
   *  - Total number of bytes that have been retransmitted.
   */
  retransmittedBytesSent: number
  /**
   *  - Change in the number of retransmitted bytes sent since the last report.
   */
  retransmittedBytesSentDelta: number
  /**
   * - Total number of frames sent(applicable for video).
   */
  framesSent: number
  /**
   * Durations in seconds for which the quality of the media has been limited by the codec, categorized by the limitation reasons such as bandwidth, CPU, or other factors.
   *
   */
  qualityLimitationDurations: Record<string, number>
  /**
   * Media Id
   *
   */
  mid?: string
}

export interface Diagnostics {
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

export type CMCDDiagnostics = Omit<Diagnostics, 'stats'> & {
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
