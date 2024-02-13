import { version } from '../../package.json'

const MAX_STATS_HISTORY_SIZE = 5
const diagnostics = {
  version: '',
  accountId: '',
  streamName: '',
  subscriberId: '',
  timestamp: '',
  userAgent: '',
  connection: '',
  stats: []
}
const tempStats = []

const setAccountId = (accountId) => { diagnostics.accountId = accountId }

const setStreamNameAndSubscriberId = (streamName, subscriberId) => {
  diagnostics.streamName = streamName
  diagnostics.subscriberId = subscriberId
}

const setStreamViewId = (streamViewId) => { diagnostics.streamViewId = streamViewId }

const setFeedId = (feedId) => { diagnostics.feedId = feedId }

const setConnectionState = (connectionState) => { diagnostics.connection = connectionState }

const setStats = (stats) => {
  if (tempStats.length === MAX_STATS_HISTORY_SIZE) {
    tempStats.shift()
  }
  tempStats.push(stats)
}

const getDiagnostics = (statsCount = MAX_STATS_HISTORY_SIZE) => {
  if (!Number.isInteger(statsCount) && (statsCount > MAX_STATS_HISTORY_SIZE || statsCount <= 0)) {
    statsCount = MAX_STATS_HISTORY_SIZE
  }

  diagnostics.version = version
  diagnostics.timestamp = Date.now()
  diagnostics.userAgent = window?.navigator?.userAgent || 'No user agent available'
  diagnostics.stats = [...tempStats]

  if (tempStats.length) {
    diagnostics.stats = diagnostics.stats.slice(-statsCount)
  }

  return { ...diagnostics }
}

const Diagnostics = {
  setAccountId,
  setStreamNameAndSubscriberId,
  setStreamViewId,
  setFeedId,
  setConnectionState,
  setStats,
  get: getDiagnostics
}

export default Diagnostics
