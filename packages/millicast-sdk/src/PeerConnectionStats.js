import EventEmitter from 'events'
import Logger from './Logger'

const logger = Logger.get('PeerConnectionStats')

/**
 * @typedef {Object} ConnectionStats
 * @property {RTCStatsReport} raw - All RTCPeerConnection stats without parsing.
 * @property {Object} data
 * @property {TrackReport} data.audio - Parsed audio information.
 * @property {TrackReport} data.video - Parsed video information.
 */

/**
 * @typedef {Object} TrackReport
 * @property {Object} inbound - Parsed information of inbound-rtp.
 * @property {String|undefined} inbound.mimeType - Mime type if related report had codec report associated.
 * @property {Number|undefined} inbound.framesPerSecond - Current framerate if it's video report.
 * @property {Number} inbound.timestamp - Timestamp of report.
 * @property {Number} inbound.bytesReceived - Total bytes received.
 * @property {Number} inbound.packetsLost - Total packets lost.
 * @property {Number} inbound.bitrate - Current bitrate in bits.
 * @property {Object} outbound - Parsed information of outbound-rtp.
 * @property {String|undefined} outbound.mimeType - Mime type if related report had codec report associated.
 * @property {Number|undefined} outbound.framesPerSecond - Current framerate if it's video report.
 * @property {Number} outbound.timestamp - Timestamp of report.
 * @property {Number} outbound.bytesSent - Total bytes sent.
 * @property {Number} outbound.packetsLost - Total packets lost.
 * @property {Number} outbound.bitrate - Current bitrate in bits.
 */

export const peerConnectionStatsEvents = {
  stats: 'stats'
}

export default class PeerConnectionStats extends EventEmitter {
  constructor (peer) {
    super()
    this.peer = peer
    this.stats = null
    this.firstIntervalExecuted = false
    this.timerInterval = null
    this.emitInterval = null
    this.previousStats = null
    this.interval = null
  }

  /**
   * Initialize the statistics monitoring of the RTCPeerConnection.
   * @param {Number|String} interval - Interval in seconds of how often it should get stats.
   */
  init (interval) {
    logger.info('Initializing get peer connection stats')
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
      this.stats = this.parseStats(stats)
      this.firstIntervalExecuted = true
    }, 1000)

    this.emitInterval = setInterval(() => {
      if (this.firstIntervalExecuted) {
        logger.debug('Emitting stats')
        /**
        * Peer connection incoming stats.
        *
        * @event PeerConnectionStats#stats
        * @type {ConnectionStats}
        */
        this.emit(peerConnectionStatsEvents.stats, this.stats)
      }
    }, this.interval)
  }

  /**
   * Parse incoming RTCPeerConnection stats.
   * @param {RTCStatsReport} latestStats - RTCPeerConnection stats.
   * @returns {ConnectionStats} RTCPeerConnection stats parsed.
   */
  parseStats (latestStats) {
    const statsObject = {
      audio: {
        inbound: {},
        outbound: {}
      },
      video: {
        inbound: {},
        outbound: {}
      }
    }

    for (const report of latestStats.values()) {
      switch (report.type) {
        case 'outbound-rtp': {
          const mediaType = this.getMediaType(report)
          const codecInfo = this.getCodecData(report.codecId, latestStats)
          const additionalData = this.getBaseReportData(report, mediaType)

          const previousBytes = this.previousStats ? this.previousStats[mediaType].outbound.bytesSent : 0
          additionalData.bitrate = 8 * (report.bytesSent - previousBytes)
          additionalData.bytesSent = report.bytesSent

          statsObject[mediaType].outbound = {
            ...codecInfo,
            ...additionalData
          }
          break
        }
        case 'inbound-rtp': {
          let mediaType = this.getMediaType(report)
          const codecInfo = this.getCodecData(report.codecId, latestStats)

          // Safari is missing mediaType and kind for 'inbound-rtp'
          if (!['audio', 'video'].includes(mediaType)) {
            if (report.id.includes('Video')) mediaType = 'video'
            else mediaType = 'audio'
          }
          const additionalData = this.getBaseReportData(report, mediaType)

          const previousBytes = this.previousStats ? this.previousStats[mediaType].inbound.bytesReceived : 0
          additionalData.bitrate = 8 * (report.bytesReceived - previousBytes)
          additionalData.bytesReceived = report.bytesReceived
          additionalData.packetsLost = report.packetsLost

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

    this.previousStats = statsObject
    return { raw: latestStats, data: statsObject }
  }

  /**
   * Get media type.
   * @param {Object} report - JSON object which represents a report from RTCPeerConnection stats.
   * @returns {String} Media type.
   */
  getMediaType (report) {
    return report.mediaType || report.kind
  }

  /**
   * Get codec information from stats.
   * @param {String} codecReportId - Codec report ID.
   * @param {RTCStatsReport} latestStats - RTCPeerConnection stats.
   * @returns {Object} Object containing codec information.
   */
  getCodecData (codecReportId, latestStats) {
    const codecReport = codecReportId ? latestStats.get(codecReportId) : {}
    const codecData = {}
    if (codecReport) {
      codecData.mimeType = codecReport.mimeType
    }
    return codecData
  }

  /**
   * Get common information
   * @param {Object} report - JSON object which represents a report from RTCPeerConnection stats.
   * @param {String} mediaType - Media type.
   * @returns Object containing common information.
   */
  getBaseReportData (report, mediaType) {
    const additionalData = {}
    if (mediaType === 'video') {
      additionalData.framesPerSecond = report.framesPerSecond
    }
    additionalData.timestamp = report.timestamp
    return additionalData
  }

  /**
   * Stops the monitoring of RTCPeerConnection statistics.
   */
  stop () {
    logger.info('Stopping peer connection stats')
    this.firstIntervalExecuted = false
    clearInterval(this.timerInterval)
    clearInterval(this.emitInterval)
  }
}
