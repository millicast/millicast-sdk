import EventEmitter from 'events'
import Logger from './Logger'
import Diagnostics from './utils/Diagnostics'
import { WebRTCStats } from '@dolbyio/webrtc-stats'
import { peerConfigType } from './types/PeerConnection.types'

const logger = Logger.get('PeerConnectionStats')

/**
 * @typedef {Object} ConnectionStats
 * @property {RTCStatsReport} raw - All RTCPeerConnection stats without parsing. Reference {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport}.
 * @property {TrackReport} audio - Parsed audio information.
 * @property {TrackReport} video - Parsed video information.
 * @property {Number} availableOutgoingBitrate - The available outbound capacity of the network connection. The higher the value, the more bandwidth you can assume is available for outgoing data. The value is reported in bits per second.
 *
 * This value comes from the nominated candidate-pair.
 * @property {Number} totalRoundTripTime - Total round trip time is the total time in seconds that has elapsed between sending STUN requests and receiving the responses.
 *
 * This value comes from the nominated candidate-pair.
 * @property {Number} currentRoundTripTime - Current round trip time indicate the number of seconds it takes for data to be sent by this peer to the remote peer and back over the connection described by this pair of ICE candidates.
 *
 * This value comes from the nominated candidate-pair.
 * @property {RTCIceCandidateType} candidateType - Local candidate type from the nominated candidate-pair which indicates the type of ICE candidate the object represents.
 */

/**
 * @typedef {Object} TrackReport
 * @property {Array<InboundStats>} inbounds - Parsed information of each inbound-rtp.
 * @property {Array<OutboundStats>} outbounds - Parsed information of each outbound-rtp.
 */

/**
 * @typedef {Object} InboundStats
 * @property {String} id - inbound-rtp Id.
 * @property {Number} jitter - Current Jitter measured in seconds.
 * @property {String} [mimeType] - Mime type if related report had codec report associated.
 * @property {Number} [framesPerSecond] - Current framerate if it's video report.
 * @property {Number} [frameHeight] - Current frame height if it's video report.
 * @property {Number} [frameWidth] - Current frame width if it's video report.
 * @property {Number} [keyFramesDecoded] - Total number of key frames that have been decoded if it's video report.
 * @property {Number} [framesDecoded] - Total number of frames that have been decoded if it's video report.
 * @property {Number} [framesDropped] - Total number of frames that have been dropped if it's video report.
 * @property {Number} [framesReceived] - Total number of frames that have been received if it's video report.
 * @property {Number} timestamp - Timestamp of report.
 * @property {Number} totalBytesReceived - Total bytes received is an integer value which indicates the total number of bytes received so far from this synchronization source.
 * @property {Number} totalPacketsReceived - Total packets received indicates the total number of packets of any kind that have been received on the connection described by the pair of candidates.
 * @property {Number} totalPacketsLost - Total packets lost.
 * @property {Number} packetsLostRatioPerSecond - Total packet lost ratio per second.
 * @property {Number} packetsLostDeltaPerSecond - Total packet lost delta per second.
 * @property {Number} bitrate - Current bitrate in Bytes per second.
 * @property {Number} bitrateBitsPerSecond - Current bitrate in bits per second.
 * @property {Number} packetRate - The rate at which packets are being received, measured in packets per second.
 * @property {Number} jitterBufferDelay - Total delay in seconds currently experienced by the jitter buffer.
 * @property {Number} jitterBufferEmittedCount - Total number of packets emitted from the jitter buffer.
 */

/**
 * @typedef {Object} OutboundStats
 * @property {String} id - outbound-rtp Id.
 * @property {String} [mimeType] - Mime type if related report had codec report associated.
 * @property {Number} [framesPerSecond] - Current framerate if it's video report.
 * @property {Number} [frameHeight] - Current frame height if it's video report.
 * @property {Number} [frameWidth] - Current frame width if it's video report.
 * @property {String} [qualityLimitationReason] - If it's video report, indicate the reason why the media quality in the stream is currently being reduced by the codec during encoding, or none if no quality reduction is being performed.
 * @property {Number} timestamp - Timestamp of report.
 * @property {Number} totalBytesSent - Total bytes sent indicates the total number of payload bytes that hve been sent so far on the connection described by the candidate pair.
 * @property {Number} bitrate - Current bitrate in Bytes per second.
 * @property {Number} bitrateBitsPerSecond - Current bitrate in bits per second.
 * @property {Number} bytesSentDelta - Change in the number of bytes sent since the last report.
 * @property {Number} totalPacketsSent - Total number of packets sent.
 * @property {Number} packetsSentDelta - Change in the number of packets sent since the last report.
 * @property {Number} packetRate - Rate at which packets are being sent, measured in packets per second.
 * @property {Number} targetBitrate - The target bitrate for the encoder, in bits per second.
 * @property {Number} retransmittedPacketsSent - Total number of retransmitted packets sent.
 * @property {Number} retransmittedPacketsSentDelta - Change in the number of retransmitted packets sent since the last report.
 * @property {Number} retransmittedBytesSent - Total number of bytes that have been retransmitted.
 * @property {Number} retransmittedBytesSentDelta - Change in the number of retransmitted bytes sent since the last report.
 * @property {Number} framesSent - Total number of frames sent (applicable for video).
 * @property {Object} [qualityLimitationDurations] - Durations in seconds for which the quality of the media has been limited by the codec, categorized by the limitation reasons such as bandwidth, CPU, or other factors.
 */

export const peerConnectionStatsEvents = {
  stats: 'stats',
}

/**
 * Parses incoming WebRTC statistics
 * This method takes statistical data from @dolbyio/webrtc-stats and transforms it into
 * a structured format compatible with previous versions.
 *
 * @param {Object} webRTCStats - The statistics object containing various WebRTC stats
 */
const parseWebRTCStats = (webRTCStats) => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { input, output, rawStats, ...filteredStats } = webRTCStats
  const statsObject = {
    ...filteredStats,
    audio: {
      inbounds: webRTCStats.input.audio.map(
        ({
          packetLossRatio: packetsLostRatioPerSecond,
          packetLossDelta: packetsLostDeltaPerSecond,
          bitrate,
          ...rest
        }) => ({
          packetsLostRatioPerSecond,
          packetsLostDeltaPerSecond,
          bitrateBitsPerSecond: bitrate * 8,
          bitrate,
          ...rest,
        })
      ),
      outbounds: webRTCStats.output.audio.map(
        ({
          packetLossRatio: packetsLostRatioPerSecond,
          packetLossDelta: packetsLostDeltaPerSecond,
          bitrate,
          ...rest
        }) => ({
          packetsLostRatioPerSecond,
          packetsLostDeltaPerSecond,
          bitrateBitsPerSecond: bitrate * 8,
          bitrate,
          ...rest,
        })
      ),
    },
    video: {
      inbounds: webRTCStats.input.video.map(
        ({
          packetLossRatio: packetsLostRatioPerSecond,
          packetLossDelta: packetsLostDeltaPerSecond,
          bitrate,
          ...rest
        }) => ({
          packetsLostRatioPerSecond,
          packetsLostDeltaPerSecond,
          bitrateBitsPerSecond: bitrate * 8,
          bitrate,
          ...rest,
        })
      ),
      outbounds: webRTCStats.output.video.map(
        ({
          packetLossRatio: packetsLostRatioPerSecond,
          packetLossDelta: packetsLostDeltaPerSecond,
          bitrate,
          ...rest
        }) => ({
          packetsLostRatioPerSecond,
          packetsLostDeltaPerSecond,
          bitrateBitsPerSecond: bitrate * 8,
          bitrate,
          ...rest,
        })
      ),
    },
    raw: webRTCStats.rawStats,
  }
  return statsObject
}

export default class PeerConnectionStats extends EventEmitter {
  constructor(peer, options: peerConfigType = { statsIntervalMs: 1000, autoInitStats: true }) {
    super()
    this.peer = peer
    this.collection = null
    this.initialized = false
    if (options.autoInitStats) {
      this.init(options.statsIntervalMs)
    }
  }

  /**
   * Initialize the statistics monitoring of the RTCPeerConnection.
   *
   * @param {number} [statsIntervalMs] The interval, in Milliseconds, at which stats need to be returned
   */
  init(statsIntervalMs) {
    if (this.initialized) {
      logger.warn(
        'PeerConnectionStats.init() has already been called. Automatic initialization occurs when the PeerConnectionStats object is constructed.'
      )
      return
    }
    logger.info('Initializing peer connection stats')
    const peer = this.peer
    try {
      this.collection = new WebRTCStats({
        getStatsInterval: statsIntervalMs,
        getStats: () => {
          return peer.getStats()
        },
        includeRawStats: true,
      })

      this.collection.on('stats', (stats) => {
        const parsedStats = parseWebRTCStats(stats)
        Diagnostics.addStats(parsedStats)
        this.emit(peerConnectionStatsEvents.stats, parsedStats)
      })
      this.collection.start()
      this.initialized = true
    } catch (e) {
      logger.error(e)
    }
  }

  /**
   * Parse incoming RTCPeerConnection stats.
   * @deprecated since version 0.1.45 - will be removed in future releases.
   * @param {RTCStatsReport} rawStats - RTCPeerConnection stats.
   * @returns {null} Method deprecated and no longer returns meaningful data.
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  parseStats(rawStats) {
    logger.warn('The parseStats method is deprecated and will be removed in future releases.')
    return null
  }

  /**
   * Stops the monitoring of RTCPeerConnection statistics.
   */
  stop() {
    logger.info('Stopping peer connection stats')
    this.collection.stop()
  }
}
