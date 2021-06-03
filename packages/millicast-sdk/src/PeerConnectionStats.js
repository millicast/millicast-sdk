import EventEmitter from 'events'
import Logger from './Logger'

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
 * @property {Array<Object>} inbounds - Parsed information of each inbound-rtp.
 * @property {String} inbounds.id - inbound-rtp Id.
 * @property {Number} inbounds.jitter - Current Jitter measured in seconds.
 * @property {String} [inbounds.mimeType] - Mime type if related report had codec report associated.
 * @property {Number} [inbounds.framesPerSecond] - Current framerate if it's video report.
 * @property {Number} [inbounds.frameHeight] - Current frame height if it's video report.
 * @property {Number} [inbounds.frameWidth] - Current frame width if it's video report.
 * @property {Number} inbounds.timestamp - Timestamp of report.
 * @property {Number} inbounds.totalBytesReceived - Total bytes received is an integer value which indicates the total number of bytes received so far from this synchronization source.
 * @property {Number} inbounds.totalPacketsReceived - Total packets received indicates the total number of packets of any kind that have been received on the connection described by the pair of candidates.
 * @property {Number} inbounds.totalPacketsLost - Total packets lost.
 * @property {Number} inbounds.packetsLostRatioPerSecond - Total packet lost ratio per second.
 * @property {Number} inbounds.packetsLostDeltaPerSecond - Total packet lost delta per second.
 * @property {Number} inbounds.bitrate - Current bitrate in bits per second.
 * @property {Array<Object>} outbounds - Parsed information of each outbound-rtp.
 * @property {String} outbounds.id - outbound-rtp Id.
 * @property {String} [outbounds.mimeType] - Mime type if related report had codec report associated.
 * @property {Number} [outbounds.framesPerSecond] - Current framerate if it's video report.
 * @property {Number} [outbounds.frameHeight] - Current frame height if it's video report.
 * @property {Number} [outbounds.frameWidth] - Current frame width if it's video report.
 * @property {String} [outbounds.qualityLimitationReason] - If it's video report, indicate the reason why the media quality in the stream is currently being reduced by the codec during encoding, or none if no quality reduction is being performed.
 * @property {Number} outbounds.timestamp - Timestamp of report.
 * @property {Number} outbounds.totalBytesSent - Total bytes sent indicates the total number of payload bytes that hve been sent so far on the connection described by the candidate pair.
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
    this.emitInterval = null
    this.previousStats = null
  }

  /**
   * Initialize the statistics monitoring of the RTCPeerConnection.
   */
  init () {
    logger.info('Initializing peer connection stats')
    this.emitInterval = setInterval(async () => {
      logger.debug('New interval executed')
      const stats = await this.peer.getStats()
      this.parseStats(stats)
      logger.debug('Emitting stats')
      /**
       * Peer connection incoming stats.
       *
       * @event PeerConnection#stats
       * @type {ConnectionStats}
      */
      this.emit(peerConnectionStatsEvents.stats, this.stats)
    }, 1000)
  }

  /**
   * Parse incoming RTCPeerConnection stats.
   * @param {RTCStatsReport} rawStats - RTCPeerConnection stats.
   * @returns {ConnectionStats} RTCPeerConnection stats parsed.
   */
  parseStats (rawStats) {
    logger.debug('Parsing raw stats')
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
  logger.debug('Parsing outbound-rtp report')
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
  logger.debug('Parsing inbound-rtp report')
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

  additionalData.bitrate = 0
  additionalData.packetsLostRatioPerSecond = 0
  additionalData.packetsLostDeltaPerSecond = 0
  if (previousStats) {
    const previousReport = previousStats[mediaType].inbounds.find(x => x.id === additionalData.id)
    if (previousReport) {
      const previousBytesReceived = previousReport.totalBytesReceived
      additionalData.bitrate = 8 * (report.bytesReceived - previousBytesReceived)
      additionalData.packetsLostRatioPerSecond = calculatePacketsLostRatio(additionalData, previousReport)
      additionalData.packetsLostDeltaPerSecond = calculatePacketsLostDelta(additionalData, previousReport)
    }
  }

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
  logger.debug('Parsing candidate-pair report')
  statsObject.totalRoundTripTime = report.totalRoundTripTime
  statsObject.currentRoundTripTime = report.currentRoundTripTime
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
 * Calculate the ratio packets lost
 * @param {Object} actualReport - JSON object which represents a parsed report.
 * @param {Object} previousReport - JSON object which represents a parsed report.
 * @returns {Number} Packets lost ratio
 */
const calculatePacketsLostRatio = (actualReport, previousReport) => {
  const currentLostPackages = calculatePacketsLostDelta(actualReport, previousReport)
  const currentReceivedPackages = actualReport.totalPacketsReceived - previousReport.totalPacketsReceived
  return currentLostPackages / currentReceivedPackages
}

/**
 * Calculate the delta packets lost
 * @param {Object} actualReport - JSON object which represents a parsed report.
 * @param {Object} previousReport - JSON object which represents a parsed report.
 * @returns {Number} Packets lost ratio
 */
const calculatePacketsLostDelta = (actualReport, previousReport) => {
  return actualReport.totalPacketsLost - previousReport.totalPacketsLost
}
