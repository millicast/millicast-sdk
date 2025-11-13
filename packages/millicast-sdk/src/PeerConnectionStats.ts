import EventEmitter from 'events'
import Logger from './Logger'
import Diagnostics from './utils/Diagnostics'
import {WebRTCStats} from '@dolbyio/webrtc-stats'
import {ConnectionStats} from './types/stats.types'
import {PeerConnectionConfig} from './types/PeerConnection.types'

const logger=Logger.get('PeerConnectionStats')

export const peerConnectionStatsEvents = {
  stats: 'stats'
}


/**

 * Parses incoming WebRTC statistics
 * This method takes statistical data from @dolbyio/webrtc-stats and transforms it into
 * a structured format compatible with previous versions.
 *
 * @param webRTCStats - The statistics object containing various WebRTC stats
 */
const parseWebRTCStats=(webRTCStats: any): ConnectionStats => {
  const {input, output, rawStats, ...filteredStats}=webRTCStats
  const statsObject: ConnectionStats={
    ...filteredStats,
    audio: {
      inbounds: webRTCStats.input.audio.map(({
        packetLossRatio: packetsLostRatioPerSecond,
        packetLossDelta: packetsLostDeltaPerSecond,
        bitrate,
        ...rest
      }: any) => ({
        packetsLostRatioPerSecond,
        packetsLostDeltaPerSecond,
        bitrateBitsPerSecond: bitrate*8,
        bitrate,
        ...rest
      })),
      outbounds: webRTCStats.output.audio.map(({
        packetLossRatio: packetsLostRatioPerSecond,
        packetLossDelta: packetsLostDeltaPerSecond,
        bitrate,
        ...rest
      }: any) => ({
        packetsLostRatioPerSecond,
        packetsLostDeltaPerSecond,
        bitrateBitsPerSecond: bitrate*8,
        bitrate,
        ...rest
      }))
    },
    video: {
      inbounds: webRTCStats.input.video.map(({
        packetLossRatio: packetsLostRatioPerSecond,
        packetLossDelta: packetsLostDeltaPerSecond,
        bitrate,
        ...rest
      }: any) => ({
        packetsLostRatioPerSecond,
        packetsLostDeltaPerSecond,
        bitrateBitsPerSecond: bitrate*8,
        bitrate,
        ...rest
      })),
      outbounds: webRTCStats.output.video.map(({
        packetLossRatio: packetsLostRatioPerSecond,
        packetLossDelta: packetsLostDeltaPerSecond,
        bitrate,
        ...rest
      }: any) => ({
        packetsLostRatioPerSecond,
        packetsLostDeltaPerSecond,
        bitrateBitsPerSecond: bitrate*8,
        bitrate,
        ...rest
      }))
    },
    raw: webRTCStats.rawStats
  }
  return statsObject
}

export default class PeerConnectionStats extends EventEmitter {
  private peer: RTCPeerConnection
  private collection: WebRTCStats|null=null
  private initialized: boolean=false

  constructor(
    peer: RTCPeerConnection,
    options: PeerConnectionConfig = { statsIntervalMs: 1000, autoInitStats: true }
  ) {
    super()
    this.peer=peer

    if (options.autoInitStats) {
      this.init(options.statsIntervalMs||1000)
    }
  }

  /**

   * Initialize the statistics monitoring of the RTCPeerConnection.
   *
   * @param statsIntervalMs The interval, in Milliseconds, at which stats need to be returned
   */
  init(statsIntervalMs: number=1000): void {
    if (this.initialized) {
      logger.warn('PeerConnectionStats.init() has already been called. Automatic initialization occurs when the PeerConnectionStats object is constructed.')
      return
    }

    logger.info('Initializing peer connection stats')
    const peer=this.peer

    try {
      this.collection=new WebRTCStats({
        getStatsInterval: statsIntervalMs,
        getStats: () => {
          return peer.getStats()
        },
        includeRawStats: true
      })

      this.collection.on('stats', (stats: any) => {
        const parsedStats=parseWebRTCStats(stats)
        Diagnostics.addStats(parsedStats)
        this.emit(peerConnectionStatsEvents.stats, parsedStats)
      })

      this.collection.start()
      this.initialized=true
    } catch (e) {
      logger.error(e)
    }
  }

  /**

   * Parse incoming RTCPeerConnection stats.
   * @deprecated since version 0.1.45 - will be removed in future releases.
   * @param rawStats - RTCPeerConnection stats.
   * @returns Method deprecated and no longer returns meaningful data.
   */
  parseStats(rawStats: RTCStatsReport): null {
    logger.warn('The parseStats method is deprecated and will be removed in future releases.')
    return null
  }

  /**

   * Stops the monitoring of RTCPeerConnection statistics.
   */
  stop(): void {
    if (this.collection) {
      logger.info('Stopping peer connection stats')
      this.collection.stop()
    }
  }
}