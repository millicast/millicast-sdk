import { version } from '../../package.json'

const MAX_STATS_HISTORY_SIZE = 5
const userAgent = window?.navigator?.userAgent || 'No user agent available'
let accountId = ''
let streamName = ''
let subscriberId = ''
let streamViewId = ''
let feedId = ''
let connection = ''
const stats = []

const Diagnostics = {
  setAccountId: (newAccountId) => { accountId = newAccountId },
  setStreamName: (newStreamName) => { streamName = newStreamName },
  setSubscriberId: (newSubscriberId) => { subscriberId = newSubscriberId },
  setStreamViewId: (newStreamViewId) => { streamViewId = newStreamViewId },
  setFeedId: (newFeedId) => { feedId = newFeedId },
  setConnectionState: (newConnectionState) => { connection = newConnectionState },
  setStats: (statsToSave) => {
    if (stats.length === MAX_STATS_HISTORY_SIZE) {
      stats.shift()
    }
    stats.push(statsToSave)
  },
  get: (statsCount = MAX_STATS_HISTORY_SIZE) => {
    if (!Number.isInteger(statsCount) && (statsCount > MAX_STATS_HISTORY_SIZE || statsCount <= 0)) {
      statsCount = MAX_STATS_HISTORY_SIZE
    }

    const diagnostics = {
      version,
      timestamp: Date.now(),
      userAgent,
      accountId,
      streamName,
      subscriberId,
      connection,
      stats: stats.slice(-statsCount)
    }

    if (feedId !== '') {
      diagnostics.feedId = feedId
    } else if (streamViewId !== '') {
      diagnostics.streamViewId = streamViewId
    }

    return diagnostics
  }
}

export default Diagnostics
