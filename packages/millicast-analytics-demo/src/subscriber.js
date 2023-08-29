import { View, Director } from '@millicast/sdk'

const stats = {
  connectionStateChange: {
    connected: 0,
    disconnected: 0,
    failed: 0,
    closed: 0
  },
  reconnect: 0,
  migrate: 0
}

const accountId = process.env.MILLICAST_ACCOUNT_ID
const streamName = process.env.MILLICAST_STREAM_NAME

// Define callback for generate new token
const tokenGenerator = () => Director.getSubscriber({
  streamName: streamName,
  streamAccountId: accountId
})

const viewer = document.getElementById('viewer')
const millicast = new View(streamName, tokenGenerator, viewer)

const parseStats = (newStats) => {
  stats.totalRoundTripTime = newStats.totalRoundTripTime
  stats.currentRoundTripTime = newStats.currentRoundTripTime
  stats.availableOutgoingBitrate = newStats.availableOutgoingBitrate
  stats.audioPacketsLost = newStats.audio.inbounds[0].totalPacketsLost
  stats.videoPacketsLost = newStats.video.inbounds[0].totalPacketsLost
  stats.audioJitter = newStats.audio.inbounds[0].jitter
  stats.videoJitter = newStats.video.inbounds[0].jitter
  stats.resolution = newStats.video.inbounds[0].frameWidth * newStats.video.inbounds[0].frameHeight
  stats.bitrate = newStats.video.inbounds[0].bitrate

  console.log('Subscriber stats:', stats)
}

const parseOnConnectionStateChange = (event) => {
  switch (event) {
    case 'connected':
      stats.connectionStateChange.connected = stats.connectionStateChange.connected + 1
      break
    case 'disconnected':
      stats.connectionStateChange.disconnected = stats.connectionStateChange.disconnected + 1
      break
    case 'failed':
      stats.connectionStateChange.failed = stats.connectionStateChange.failed + 1
      break
    case 'closed':
      stats.connectionStateChange.closed = stats.connectionStateChange.closed + 1
      break
    default:
      break
  }

  console.log('Subscriber onConnectionStateChange:', stats)
}

const parseOnReconnect = (event) => {
  stats.reconnect = stats.reconnect + 1

  console.log('Subscriber onReconnect:', stats)
}

const parseOnMigrate = (event) => {
  stats.migrate = stats.migrate + 1

  console.log('Subscriber onMigrate:', stats)
}

async function subscribe () {
  try {
    await millicast.connect()
    return true
  } catch (e) {
    console.log('Connection failed, handle error', e)
  }
}

async function unsubscribe () {
  try {
    await millicast.stop()
    return true
  } catch (e) {
    console.log('Disconnection failed, handle error', e)
  }
}

export function getStats () {
  // Initialize stats
  millicast.webRTCPeer.initStats()

  // set 'stats' listener
  millicast.webRTCPeer.on('stats', parseStats)

  // set 'connectionStateChange' listener
  millicast.webRTCPeer.on('connectionStateChange', parseOnConnectionStateChange)

  // set 'reconnect' & 'migrate' listeners
  millicast.webRTCPeer.on('reconnect', parseOnReconnect)
  millicast.webRTCPeer.on('migrate', parseOnMigrate)
}

function stopStats () {
  millicast.webRTCPeer.stopStats()
  millicast.webRTCPeer.removeAllListeners('stats')
}

async function stop (event) {
  if (await unsubscribe()) {
    stopStats()

    event.target.innerText = 'Subscribe'
    event.target.removeEventListener('click', stop)
    event.target.addEventListener('click', start)
  }
}

export async function start (event) {
  if (await subscribe()) {
    getStats()

    event.target.innerText = 'Unsubscribe'
    event.target.removeEventListener('click', start)
    event.target.addEventListener('click', stop)
  }
}
