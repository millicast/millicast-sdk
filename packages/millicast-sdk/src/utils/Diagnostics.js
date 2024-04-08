import { version } from '../../package.json'

const MAX_STATS_HISTORY_SIZE = 60

const userAgent = window?.navigator?.userAgent || 'No user agent available'
let _accountId = ''
let _streamName = ''
let _subscriberId = ''
let _streamViewId = ''
let _feedId = ''
let _connection = ''
const _stats = []

function transformWebRTCStatsToCMCD (diagnostics) {
  // Helper function to map individual stat objects to CMCD-like structure
  function mapStats (type, stat) {
    return {
      ts: Math.round(stat.timestamp) || '', // Timestamp to the nearest millisecond
      ot: type === 'audio' ? 'a' : 'v', // 'a' for audio, 'v' for video
      bl: stat.jitterBufferDelay || 0, // Buffer length from jitterBufferDelay, default to 0 if not available
      br: Math.round(stat.bitrate || 0), // Bitrate, rounded to nearest integer, default to 0 if not available
      pld: stat.packetsLostDeltaPerSecond || 0, // Packets lost delta per second, default to 0 if not available
      j: stat.jitter || 0, // Jitter, default to 0 if not available
      mtp: stat.packetRate || 0, // Measured throughput, approximated by packet rate, default to 0 if not available
      mid: stat.mid || '', // Media ID or track identifier, default to empty string if not available
      mimeType: stat.mimeType || '' // MIME type of the media stream, default to empty string if not available
    }
  }

  diagnostics.stats = diagnostics.stats.reduce((acc, stat) => {
    const audioInbounds = stat.audio.inbounds.map(statAudio => mapStats('audio', statAudio))
    const videoInbounds = stat.video.inbounds.map(statVideo => mapStats('video', statVideo))

    return acc.concat([...audioInbounds, ...videoInbounds])
  }, [])

  return diagnostics
}

const Diagnostics = {
  initAccountId: (accountId) => { _accountId = _accountId === '' ? accountId : _accountId },
  initStreamName: (streamName) => { _streamName = _streamName === '' ? streamName : _streamName },
  initSubscriberId: (subscriberId) => { _subscriberId = _subscriberId === '' ? subscriberId : _subscriberId },
  initStreamViewId: (streamViewId) => { _streamViewId = _streamViewId === '' ? streamViewId : _streamViewId },
  initFeedId: (feedId) => { _feedId = _feedId === '' ? feedId : _feedId },
  setConnectionState: (connectionState) => { _connection = connectionState },
  addStats: (stats) => {
    if (_stats.length === MAX_STATS_HISTORY_SIZE) {
      _stats.shift()
    }
    _stats.push(stats)
  },
  get: (statsCount = MAX_STATS_HISTORY_SIZE, statsFormat = 'JSON') => {
    let configuredStatsCount
    if (!Number.isInteger(statsCount) || statsCount > MAX_STATS_HISTORY_SIZE || statsCount <= 0) {
      configuredStatsCount = MAX_STATS_HISTORY_SIZE
    } else {
      configuredStatsCount = statsCount
    }

    const diagnostics = {
      client: '@millicast/millicast-sdk',
      version,
      timestamp: Date.now(),
      userAgent,
      accountId: _accountId,
      streamName: _streamName,
      subscriberId: _subscriberId,
      connection: _connection,
      stats: _stats.slice(-configuredStatsCount)
    }

    if (_feedId !== '') {
      diagnostics.feedId = _feedId
    } else if (_streamViewId !== '') {
      diagnostics.streamViewId = _streamViewId
    }
    if (statsFormat === 'CMCD') {
      return transformWebRTCStatsToCMCD(diagnostics)
    }

    return diagnostics
  }
}

export default Diagnostics
