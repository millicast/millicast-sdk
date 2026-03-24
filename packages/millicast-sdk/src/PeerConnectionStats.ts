import Logger from './Logger';
import Diagnostics from './utils/Diagnostics';
import { type OnStats, WebRTCStats } from '@dolbyio/webrtc-stats';
import { type PeerConnectionConfig } from './types/PeerConnection.types';
import { type ConnectionStats } from './types/stats.types';
import { type PeerConnectionStatsEvents } from './types/Events.types';
import { MillicastEventEmitter } from './EventEmitter';

const logger = Logger.get('PeerConnectionStats');


export const peerConnectionStatsEvents = {
  stats: 'stats' as const,
} as const;

/**
 * Parses incoming WebRTC statistics
 * This method takes statistical data from @dolbyio/webrtc-stats and transforms it into
 * a structured format compatible with previous versions.
 *
 * @param {Object} webRTCStats - The statistics object containing various WebRTC stats
 */
const parseWebRTCStats = (webRTCStats: OnStats): ConnectionStats => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { input, output, rawStats, ...filteredStats } = webRTCStats;
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
        }),
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
        }),
      ),
      outbounds: webRTCStats.output.video.map(({ bitrate = 0, ...rest }) => ({
        bitrateBitsPerSecond: bitrate * 8,
        bitrate,
        ...rest,
      })),
    },
    raw: webRTCStats.rawStats,
  };
  return statsObject;
};

export default class PeerConnectionStats extends MillicastEventEmitter<PeerConnectionStatsEvents> {
  peer: RTCPeerConnection;
  collection: WebRTCStats | null;
  initialized: boolean;

  constructor (
    peer: RTCPeerConnection,
    options: PeerConnectionConfig = { statsIntervalMs: 1000, autoInitStats: true },
  ) {
    super();
    this.peer = peer;
    this.collection = null;
    this.initialized = false;
    if (options.autoInitStats && options.statsIntervalMs) {
      this.init(options.statsIntervalMs);
    }
  }

  /**
   * Initialize the statistics monitoring of the RTCPeerConnection.
   *
   * @param {number} [statsIntervalMs] The interval, in Milliseconds, at which stats need to be returned
   */
  init (statsIntervalMs: number) {
    if (this.initialized) {
      logger.warn(
        'PeerConnectionStats.init() has already been called. Automatic initialization occurs when the PeerConnectionStats object is constructed.',
      );
      return;
    }
    logger.info('Initializing peer connection stats');
    const peer = this.peer;
    try {
      this.collection = new WebRTCStats({
        getStatsInterval: statsIntervalMs,
        getStats: () => {
          return peer.getStats();
        },
        includeRawStats: true,
      });

      this.collection.on('stats', stats => {
        const parsedStats = parseWebRTCStats(stats);
        Diagnostics.addStats(parsedStats);
        this.emit(peerConnectionStatsEvents.stats, parsedStats);
      });
      this.collection.start();
      this.initialized = true;
    } catch (e) {
      logger.error(e);
    }
  }

  /**
   * Parse incoming RTCPeerConnection stats.
   * @deprecated since version 0.1.45 - will be removed in future releases.
   * @param {RTCStatsReport} rawStats - RTCPeerConnection stats.
   * @returns {null} Method deprecated and no longer returns meaningful data.
   */
  parseStats (rawStats: RTCStatsReport): null {
    logger.warn('The parseStats method is deprecated and will be removed in future releases.');
    return null;
  }

  /**
   * Stops the monitoring of RTCPeerConnection statistics.
   */
  stop () {
    logger.info('Stopping peer connection stats');
    this.collection?.stop();
  }
}
