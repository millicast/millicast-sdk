import { version } from '../../package.json'

const MAX_STATS_HISTORY_SIZE = 5
const userAgent = window?.navigator?.userAgent || 'No user agent available'
let _accountId = ''
let _streamName = ''
let _subscriberId = ''
let _streamViewId = ''
let _feedId = ''
let _connection = ''
const _stats = []

const Diagnostics = {
  setAccountId: (accountId) => { _accountId = accountId },
  setStreamName: (streamName) => { _streamName = streamName },
  setSubscriberId: (subscriberId) => { _subscriberId = subscriberId },
  setStreamViewId: (streamViewId) => { _streamViewId = streamViewId },
  setFeedId: (feedId) => { _feedId = feedId },
  setConnectionState: (connectionState) => { _connection = connectionState },
  addStats: (stats) => {
    if (_stats.length === MAX_STATS_HISTORY_SIZE) {
      _stats.shift()
    }
    _stats.push(stats)
  },
  get: (statsCount = MAX_STATS_HISTORY_SIZE) => {
    if (!Number.isInteger(statsCount) || statsCount > MAX_STATS_HISTORY_SIZE || statsCount <= 0) {
      statsCount = MAX_STATS_HISTORY_SIZE
    }

    const diagnostics = {
      version,
      timestamp: Date.now(),
      userAgent,
      accountId: _accountId,
      streamName: _streamName,
      subscriberId: _subscriberId,
      connection: _connection,
      stats: _stats.slice(-statsCount)
    }

    if (_feedId !== '') {
      diagnostics.feedId = _feedId
    } else if (_streamViewId !== '') {
      diagnostics.streamViewId = _streamViewId
    }

    return diagnostics
  }
}

export default Diagnostics
