import EventEmitter from 'events'
import Logger from './Logger'

const logger = Logger.get('PeerConnectionStats')

/**
 * @typedef {Object} ConnectionStats
 * @property {RTCStatsReport} raw - All RTCPeerConnection stats without parsing.
 * @property {TrackReport} audio - Parsed audio information.
 * @property {TrackReport} video - Parsed video information.
 * @property {Number} availableOutgoingBitrate - Available outgoing bitrate.
 * @property {Number} totalRoundTripTime - Total round trip time.
 * @property {Number} averageRoundTripTime - Average round trip time. Based on totalRoundTripTime / responseReceived.
 * @property {RTCIceCandidateType} candidateType - Local candidate type.
 */

/**
 * @typedef {Object} TrackReport
 * @property {Array<Object>} inbounds - Parsed information of each inbound-rtp.
 * @property {String} inbounds.id - inbound-rtp Id.
 * @property {Number} inbounds.jitter - Current Jitter.
 * @property {String} [inbounds.mimeType] - Mime type if related report had codec report associated.
 * @property {Number} [inbounds.framesPerSecond] - Current framerate if it's video report.
 * @property {Number} [inbounds.frameHeight] - Current frame height if it's video report.
 * @property {Number} [inbounds.frameWidth] - Current frame width if it's video report.
 * @property {Number} inbounds.timestamp - Timestamp of report.
 * @property {Number} inbounds.totalBytesReceived - Total bytes received.
 * @property {Number} inbounds.totalPacketsReceived - Total packets received.
 * @property {Number} inbounds.totalPacketsLost - Total packets lost.
 * @property {Number} inbounds.packetsLostRatioPerSecond - Packet lost ratio per second.
 * @property {Number} inbounds.bitrate - Current bitrate in bits per second.
 * @property {Array<Object>} outbounds - Parsed information of each outbound-rtp.
 * @property {String} outbounds.id - outbound-rtp Id.
 * @property {String} [outbounds.mimeType] - Mime type if related report had codec report associated.
 * @property {Number} [outbounds.framesPerSecond] - Current framerate if it's video report.
 * @property {Number} [outbounds.frameHeight] - Current frame height if it's video report.
 * @property {Number} [outbounds.frameWidth] - Current frame width if it's video report.
 * @property {String} [outbounds.qualityLimitationReason] - If it's video report, indicate the reason why the media quality in the stream is currently being reduced by the codec during encoding, or none if no quality reduction is being performed.
 * @property {Number} outbounds.timestamp - Timestamp of report.
 * @property {Number} outbounds.totalBytesSent - Total bytes sent.
 * @property {Number} outbounds.bitrate - Current bitrate in bits per second.
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
        inbounds: [],
        outbounds: []
      },
      video: {
        inbounds: [],
        outbounds: []
      },
      raw: rawStats
    }

    for (const report of rawStats.values()) {
      switch (report.type) {
        case 'outbound-rtp': {
          addOutboundRtpReport(report, this.previousStats, statsObject)
          break
        }
        case 'inbound-rtp': {
          addInboundRtpReport(report, this.previousStats, statsObject)
          break
        }
        case 'candidate-pair': {
          if (report.nominated) {
            addCandidateReport(report, statsObject)
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
 * Parse and add incoming outbound-rtp report from RTCPeerConnection to final report.
 * @param {Object} report - JSON object which represents a report from RTCPeerConnection stats.
 * @param {ConnectionStats} previousStats - Previous stats parsed.
 * @param {Object} statsObject - Current stats object being parsed.
 */
const addOutboundRtpReport = (report, previousStats, statsObject) => {
  const mediaType = getMediaType(report)
  const codecInfo = getCodecData(report.codecId, statsObject.raw)
  const additionalData = getBaseRtpReportData(report, mediaType)
  additionalData.totalBytesSent = report.bytesSent
  additionalData.id = report.id

  const previousBytesSent = previousStats ? previousStats[mediaType].outbounds.find(x => x.id === additionalData.id)?.totalBytesSent ?? 0 : null
  additionalData.bitrate = previousBytesSent ? 8 * (report.bytesSent - previousBytesSent) : 0

  if (mediaType === 'video') {
    additionalData.qualityLimitationReason = report.qualityLimitationReason
  }
  statsObject[mediaType].outbounds.push({
    ...codecInfo,
    ...additionalData
  })
}

/**
 * Parse and add incoming inbound-rtp report from RTCPeerConnection to final report.
 * @param {Object} report - JSON object which represents a report from RTCPeerConnection stats.
 * @param {ConnectionStats} previousStats - Previous stats parsed.
 * @param {Object} statsObject - Current stats object being parsed.
 */
const addInboundRtpReport = (report, previousStats, statsObject) => {
  let mediaType = getMediaType(report)
  const codecInfo = getCodecData(report.codecId, statsObject.raw)

  // Safari is missing mediaType and kind for 'inbound-rtp'
  if (!['audio', 'video'].includes(mediaType)) {
    if (report.id.includes('Video')) mediaType = 'video'
    else mediaType = 'audio'
  }
  const additionalData = getBaseRtpReportData(report, mediaType)
  additionalData.totalBytesReceived = report.bytesReceived
  additionalData.totalPacketsReceived = report.packetsReceived
  additionalData.totalPacketsLost = report.packetsLost
  additionalData.jitter = report.jitter
  additionalData.id = report.id

  const previousBytesReceived = previousStats ? previousStats[mediaType].inbounds.find(x => x.id === additionalData.id)?.totalBytesReceived ?? 0 : null
  additionalData.bitrate = previousBytesReceived ? 8 * (report.bytesReceived - previousBytesReceived) : 0
  additionalData.packetsLostRatioPerSecond = previousStats ? calculatePacketsLostRatio(additionalData, previousStats[mediaType].inbounds.find(x => x.id === additionalData.id)) : 0

  statsObject[mediaType].inbounds.push({
    ...codecInfo,
    ...additionalData
  })
}

/**
 * Parse and add incoming candidate-pair report from RTCPeerConnection to final report.
 * Also adds associated local-candidate data to report.
 * @param {Object} report - JSON object which represents a report from RTCPeerConnection stats.
 * @param {Object} statsObject - Current stats object being parsed.
 */
const addCandidateReport = (report, statsObject) => {
  statsObject.totalRoundTripTime = report.totalRoundTripTime
  statsObject.averageRoundTripTime = report.totalRoundTripTime / report.responsesReceived
  statsObject.availableOutgoingBitrate = report.availableOutgoingBitrate
  statsObject.candidateType = statsObject.raw.get(report.localCandidateId).candidateType
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
 * Get common information for RTP reports.
 * @param {Object} report - JSON object which represents a report from RTCPeerConnection stats.
 * @param {String} mediaType - Media type.
 * @returns {Object} Object containing common information.
 */
const getBaseRtpReportData = (report, mediaType) => {
  const additionalData = {}
  if (mediaType === 'video') {
    additionalData.framesPerSecond = report.framesPerSecond
    additionalData.frameHeight = report.frameHeight
    additionalData.frameWidth = report.frameWidth
  }
  additionalData.timestamp = report.timestamp
  return additionalData
}

/**
 * Calculate the packets lost ratio
 * @param {Object} actualReport - JSON object which represents a parsed report.
 * @param {Object} previousReport - JSON object which represents a parsed report.
 * @returns {Number} Packets lost ratio
 */
const calculatePacketsLostRatio = (actualReport, previousReport) => {
  const currentLostPackages = actualReport.totalPacketsLost - previousReport.totalPacketsLost
  const currentReceivedPackages = actualReport.totalPacketsReceived - previousReport.totalPacketsReceived
  return currentLostPackages / currentReceivedPackages
}
