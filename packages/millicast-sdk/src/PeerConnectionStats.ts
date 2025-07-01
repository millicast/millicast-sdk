import Logger from './Logger'
import Diagnostics from './utils/Diagnostics'
import { OnStats, WebRTCStats } from '@dolbyio/webrtc-stats'
import { PeerConnectionConfig } from './types/PeerConnection.types'
import { ConnectionStats } from './types/stats.types'
import { ILogger } from 'js-logger'
import { PeerConnectionStatsEvents } from './types/events'
import { TypedEventEmitter } from './utils/TypedEventEmitter'

/**
 * Parses incoming WebRTC statistics
 * This method takes statistical data from @dolbyio/webrtc-stats and transforms it into
 * a structured format compatible with previous versions.
 *
 * @param webRTCStats - The statistics object containing various WebRTC stats
 */
const parseWebRTCStats = (webRTCStats: OnStats): ConnectionStats => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { input, output, rawStats, ...filteredStats } = webRTCStats
  const statsObject: ConnectionStats = {
    ...filteredStats,
    audio: {
      inbounds: webRTCStats.input.audio.map(
        ({
          packetLossRatio: packetsLostRatioPerSecond = 0,
          packetLossDelta: packetsLostDeltaPerSecond = 0,
          bitrate = 0,
          ...rest
        }) => ({
          packetsLostRatioPerSecond,
          packetsLostDeltaPerSecond,
          bitrateBitsPerSecond: bitrate * 8,
          bitrate,
          ...rest,
        })
      ),
      outbounds: webRTCStats.output.audio.map(({ bitrate = 0, ...rest }) => ({
        bitrateBitsPerSecond: bitrate * 8,
        bitrate,
        ...rest,
      })),
    },
    video: {
      inbounds: webRTCStats.input.video.map(
        ({
          packetLossRatio: packetsLostRatioPerSecond = 0,
          packetLossDelta: packetsLostDeltaPerSecond = 0,
          bitrate = 0,
          ...rest
        }) => ({
          packetsLostRatioPerSecond,
          packetsLostDeltaPerSecond,
          bitrateBitsPerSecond: bitrate * 8,
          bitrate,
          ...rest,
        })
      ),
      outbounds: webRTCStats.output.video.map(({ bitrate = 0, ...rest }) => ({
        bitrateBitsPerSecond: bitrate * 8,
        bitrate,
        ...rest,
      })),
    },
    raw: webRTCStats.rawStats,
  }
  return statsObject
}

export class PeerConnectionStats extends TypedEventEmitter<PeerConnectionStatsEvents> {
  #logger: ILogger;
  peer: RTCPeerConnection
  collection: WebRTCStats | null
  initialized: boolean

  constructor(
    peer: RTCPeerConnection,
    options: PeerConnectionConfig = { statsIntervalMs: 1000, autoInitStats: true }
  ) {
    super()

    this.#logger = Logger.get('PeerConnectionStats');
    this.#logger.setLevel(Logger.DEBUG);

    this.peer = peer
    this.collection = null
    this.initialized = false
    if (options.autoInitStats && options.statsIntervalMs) {
      this.init(options.statsIntervalMs)
    }
  }

  /**
   * Initialize the statistics monitoring of the {@link RTCPeerConnection}.
   *
   * @param statsIntervalMs The interval, in Milliseconds, at which stats need to be returned
   */
  public init(statsIntervalMs: number) {
    if (this.initialized) {
      this.#logger.warn('PeerConnectionStats.init() has already been called. Automatic initialization occurs when the PeerConnectionStats object is constructed.');
      return;
    }

    this.#logger.info('Initializing peer connection stats')
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
        const parsedStats = parseWebRTCStats(stats);
        Diagnostics.addStats(parsedStats);
        this.emit('stats', parsedStats);
      });
      this.collection.start();
      this.initialized = true;
    } catch (e) {
      this.#logger.error(e)
    }
  }

  /**
   * Stops the monitoring of {@link RTCPeerConnection} statistics.
   */
  public stop() {
    this.#logger.info('Stopping peer connection stats');
    this.collection?.stop();
  }
}
