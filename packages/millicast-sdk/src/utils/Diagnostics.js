import Logger from '../Logger'
import { version } from '../../package.json'

const MAX_STATS_HISTORY_SIZE = 5
const MAX_HISTORY_SIZE = 100
const LOG_LEVELS = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR']
const userAgent = window?.navigator?.userAgent || 'No user agent available'
let _accountId = ''
let _streamName = ''
let _subscriberId = ''
let _streamViewId = ''
let _feedId = ''
let _connection = ''
let _history = []
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
  get: (statsCount = MAX_STATS_HISTORY_SIZE, historySize = MAX_HISTORY_SIZE, minLogLevel = 'TRACE') => {
    if (!Number.isInteger(statsCount) || statsCount > MAX_STATS_HISTORY_SIZE || statsCount <= 0) {
      statsCount = MAX_STATS_HISTORY_SIZE
    }

    if (!Number.isInteger(historySize) || historySize > MAX_HISTORY_SIZE || historySize <= 0) {
      throw new Error('Invalid Argument Exception : historySize must be a positive integer that is equal to or less than 100.')
    }

    _history = Logger.getHistory()

    if (!LOG_LEVELS.includes(minLogLevel.toUpperCase())) {
      throw new Error('Invalid Argument Exception : the minLogLevel parameter only excepts "trace", "debug", "info", "warn", and "error" as arguments.')
    }

    if (LOG_LEVELS.includes(minLogLevel.toUpperCase())) {
      const filteredLogLevels = LOG_LEVELS.slice(LOG_LEVELS.indexOf(minLogLevel.toUpperCase()))
      const filteredLevels = _history.filter((log) => filteredLogLevels.some(level => log.includes(level)))
      _history = filteredLevels
    }

    const diagnostics = {
      version,
      timestamp: Date.now(),
      userAgent,
      accountId: _accountId,
      streamName: _streamName,
      subscriberId: _subscriberId,
      connection: _connection,
      history: _history.slice(-historySize),
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
