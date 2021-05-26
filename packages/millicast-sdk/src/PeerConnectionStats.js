import EventEmitter from 'events'
import Logger from './Logger'

const logger = Logger.get('PeerConnectionStats')

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
        this.emit(peerConnectionStatsEvents.stats, this.stats)
      }
    }, this.interval)
  }

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

  getMediaType (report) {
    return report.mediaType || report.kind
  }

  getCodecData (codecReportId, latestStats) {
    const codecReport = codecReportId ? latestStats.get(codecReportId) : {}
    const codecData = {}
    if (codecReport) {
      codecData.mimeType = codecReport.mimeType
    }
    return codecData
  }

  getBaseReportData (report, mediaType) {
    const additionalData = {}
    if (mediaType === 'video') {
      additionalData.framesPerSecond = report.framesPerSecond
    }
    additionalData.timestamp = report.timestamp
    return additionalData
  }

  stop () {
    logger.info('Stopping peer connection stats')
    this.firstIntervalExecuted = false
    clearInterval(this.timerInterval)
    clearInterval(this.emitInterval)
  }
}
