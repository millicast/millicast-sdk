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
    this.timerInterval = null
    this.previousStats = null
    this.interval = null
  }

  init (interval) {
    logger.info('Initializing get peer connection stats')
    if (!Number.isInteger(interval)) {
      const error = `Invalid interval value ${interval}`
      logger.error(error)
      throw new Error(error)
    }
    this.interval = interval * 1000
    this.timerInterval = setInterval(async () => {
      logger.info('New interval executed')
      const stats = await this.peer.getStats()
      this.emit(peerConnectionStatsEvents.stats, this.parseStats(stats))
    }, this.interval)
  }

  parseStats (lastestStats) {
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

    for (const report of lastestStats.values()) {
      switch (report.type) {
        case 'outbound-rtp': {
          const mediaType = report.mediaType || report.kind
          const codecInfo = {}
          const codec = report.codecId ? lastestStats.get(report.codecId) : null
          const additionalData = {}

          if (codec) {
            codecInfo.mimeType = codec.mimeType
          }

          if (mediaType === 'video') {
            additionalData.framesPerSecond = report.framesPerSecond
          }
          const previousBytes = this.previousStats ? this.previousStats[mediaType].outbound.bytesSent : 0
          additionalData.bitrate = 8 * (report.bytesSent - previousBytes)
          additionalData.bytesSent = report.bytesSent
          additionalData.timestamp = report.timestamp

          statsObject[mediaType].outbound = {
            ...codecInfo,
            ...additionalData
          }
          break
        }
        case 'inbound-rtp': {
          let mediaType = report.mediaType || report.kind
          const codecInfo = {}
          const codec = report.codecId ? lastestStats.get(report.codecId) : null
          const additionalData = {}

          // Safari is missing mediaType and kind for 'inbound-rtp'
          if (!['audio', 'video'].includes(mediaType)) {
            if (report.id.includes('Video')) mediaType = 'video'
            else if (report.id.includes('Audio')) mediaType = 'audio'
          }

          if (codec) {
            codecInfo.mimeType = codec.mimeType
          }

          if (mediaType === 'video') {
            additionalData.framesPerSecond = report.framesPerSecond
          }
          const previousBytes = this.previousStats ? this.previousStats[mediaType].inbound.bytesReceived : 0
          additionalData.bitrate = 8 * (report.bytesReceived - previousBytes)
          additionalData.bytesReceived = report.bytesReceived
          additionalData.packetsLost = report.packetsLost
          additionalData.timestamp = report.timestamp

          statsObject[mediaType].inbound = {
            ...codecInfo,
            ...additionalData
          }
          break
        }
      }
    }

    this.previousStats = statsObject
    return { raw: lastestStats, data: statsObject }
  }

  stop () {
    logger.info('Stopping peer connection stats')
    clearInterval(this.timerInterval)
  }
}
