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
