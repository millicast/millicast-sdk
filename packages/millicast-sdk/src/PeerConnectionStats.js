import EventEmitter from 'events'
import Logger from './Logger'

const logger = Logger.get('PeerConnectionStats')

/**
 * @typedef {Object} ConnectionStats
 * @property {RTCStatsReport} raw - All RTCPeerConnection stats without parsing.
 * @property {TrackReport} audio - Parsed audio information.
 * @property {TrackReport} video - Parsed video information.
 */

/**
 * @typedef {Object} TrackReport
 * @property {Object} inbound - Parsed information of inbound-rtp.
 * @property {String} [inbound.mimeType] - Mime type if related report had codec report associated.
 * @property {Number} [inbound.framesPerSecond] - Current framerate if it's video report.
 * @property {Number} inbound.timestamp - Timestamp of report.
 * @property {Number} inbound.bytesReceived - Total bytes received.
 * @property {Number} inbound.packetsLost - Total packets lost.
 * @property {Number} inbound.bitrate - Current bitrate in bits per second.
 * @property {Object} outbound - Parsed information of outbound-rtp.
 * @property {String} [outbound.mimeType] - Mime type if related report had codec report associated.
 * @property {Number} [outbound.framesPerSecond] - Current framerate if it's video report.
 * @property {Number} outbound.timestamp - Timestamp of report.
 * @property {Number} outbound.bytesSent - Total bytes sent.
 * @property {Number} outbound.bitrate - Current bitrate in bits per second.
 */

export const peerConnectionStatsEvents = {
  stats: 'stats'
}

export default class PeerConnectionStats extends EventEmitter {
  constructor (peer) {
    super()
    this.peer = peer
    this.stats = null
    this.timerInterval = null
    this.emitInterval = null
    this.previousStats = null
    this.interval = null
  }

  /**
   * Initialize the statistics monitoring of the RTCPeerConnection.
   * @param {Number} interval - Interval in seconds of how often it should get stats.
   */
  init (interval) {
    logger.info('Initializing peer connection stats')
    const intervalCast = parseInt(interval)
    if (!Number.isInteger(intervalCast) || intervalCast < 1) {
      const error = `Invalid interval value ${interval}`
      logger.error(error)
      throw new Error(error)
    }
    this.interval = intervalCast * 1000
    this.timerInterval = setInterval(async () => {
      logger.debug('New internal interval executed')
      const stats = await this.peer.getStats()
      this.parseStats(stats)
    }, 1000)

    this.emitInterval = setInterval(() => {
      if (this.stats) {
        logger.debug('Emitting stats')
        /**
        * Peer connection incoming stats.
        *
        * @event PeerConnection#stats
        * @type {ConnectionStats}
        */
        this.emit(peerConnectionStatsEvents.stats, this.stats)
      }
    }, this.interval)
  }

  /**
   * Parse incoming RTCPeerConnection stats.
   * @param {RTCStatsReport} rawStats - RTCPeerConnection stats.
   * @returns {ConnectionStats} RTCPeerConnection stats parsed.
   */
  parseStats (rawStats) {
    this.previousStats = this.stats
    const statsObject = {
      audio: {
        inbound: {},
        outbound: {}
      },
      video: {
        inbound: {},
        outbound: {}
      },
      raw: rawStats
    }

    for (const report of rawStats.values()) {
      switch (report.type) {
        case 'outbound-rtp': {
          const mediaType = getMediaType(report)
          const codecInfo = getCodecData(report.codecId, rawStats)
          const additionalData = getBaseReportData(report, mediaType)
          additionalData.bytesSent = report.bytesSent

          additionalData.bitrate = this.previousStats ? 8 * (report.bytesSent - this.previousStats[mediaType].outbound.bytesSent) : 0

          statsObject[mediaType].outbound = {
            ...codecInfo,
            ...additionalData
          }
          break
        }
        case 'inbound-rtp': {
          let mediaType = getMediaType(report)
          const codecInfo = getCodecData(report.codecId, rawStats)

          // Safari is missing mediaType and kind for 'inbound-rtp'
          if (!['audio', 'video'].includes(mediaType)) {
            if (report.id.includes('Video')) mediaType = 'video'
            else mediaType = 'audio'
          }
          const additionalData = getBaseReportData(report, mediaType)
          additionalData.bytesReceived = report.bytesReceived
          additionalData.packetsLost = report.packetsLost

          additionalData.bitrate = this.previousStats ? 8 * (report.bytesReceived - this.previousStats[mediaType].inbound.bytesReceived) : 0

          statsObject[mediaType].inbound = {
            ...codecInfo,
            ...additionalData
          }
          break
        }
        default:
          break
      }
    }
    this.stats = statsObject
  }

  /**
   * Stops the monitoring of RTCPeerConnection statistics.
   */
  stop () {
    logger.info('Stopping peer connection stats')
    clearInterval(this.timerInterval)
    clearInterval(this.emitInterval)
  }
}

/**
 * Get media type.
 * @param {Object} report - JSON object which represents a report from RTCPeerConnection stats.
 * @returns {String} Media type.
 */
const getMediaType = (report) => {
  return report.mediaType || report.kind
}

/**
 * Get codec information from stats.
 * @param {String} codecReportId - Codec report ID.
 * @param {RTCStatsReport} rawStats - RTCPeerConnection stats.
 * @returns {Object} Object containing codec information.
 */
const getCodecData = (codecReportId, rawStats) => {
  const { mimeType } = codecReportId ? rawStats.get(codecReportId) ?? {} : {}
  return { mimeType }
}

/**
 * Get common information
 * @param {Object} report - JSON object which represents a report from RTCPeerConnection stats.
 * @param {String} mediaType - Media type.
 * @returns {Object} Object containing common information.
 */
const getBaseReportData = (report, mediaType) => {
  const additionalData = {}
  if (mediaType === 'video') {
    additionalData.framesPerSecond = report.framesPerSecond
  }
  additionalData.timestamp = report.timestamp
  return additionalData
}
