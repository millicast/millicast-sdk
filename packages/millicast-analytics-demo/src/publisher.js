import { Publish, Director } from '@millicast/sdk'

const stats = {
  connectionStateChanged: {
    connected: 0,
    disconnected: 0,
    failed: 0,
    closed: 0
  },
  reconnect: 0,
  migrate: 0
}

const publishToken = process.env.MILLICAST_PUBLISH_TOKEN
const streamName = process.env.MILLICAST_STREAM_NAME

// Define callback for generate new token
const tokenGenerator = () => Director.getPublisher({
  token: publishToken,
  streamName: streamName
})

const millicast = new Publish(streamName, tokenGenerator)

const parseStats = (newStats) => {
  stats.totalRoundTripTime = newStats.totalRoundTripTime
  stats.currentRoundTripTime = newStats.currentRoundTripTime
  stats.availableOutgoingBitrate = newStats.availableOutgoingBitrate
  stats.resolution = newStats.video.outbounds[0].frameWidth * newStats.video.outbounds[0].frameHeight
  stats.bitrate = newStats.video.outbounds[0].bitrate
  stats.qualityLimitationReason = newStats.video.outbounds[0].qualityLimitationReason

  console.log('Publisher stats:', stats)
}

const parseOnConnectionStateChange = (event) => {
  switch (event) {
    case 'connected':
      stats.connectionStateChanged.connected = stats.connectionStateChanged.connected + 1
      break
    case 'disconnected':
      stats.connectionStateChanged.disconnected = stats.connectionStateChanged.disconnected + 1
      break
    case 'failed':
      stats.connectionStateChanged.failed = stats.connectionStateChanged.failed + 1
      break
    case 'closed':
      stats.connectionStateChanged.closed = stats.connectionStateChanged.closed + 1
      break
    default:
      break
  }

  console.log('Publisher onConnectionStateChanged:', stats)
}

const parseOnReconnect = (event) => {
  stats.reconnect = stats.reconnect + 1
  console.log('Publisher onReconnect:', stats)
}

const parseOnMigrate = (event) => {
  stats.migrate = stats.migrate + 1
  console.log('Publisher onMigrate:', stats)
}

async function publish (video) {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

  // Initialize local video
  video.srcObject = mediaStream
  video.play()

  // Publishing options
  const broadcastOptions = {
    mediaStream: mediaStream
  }
  // Start broadcast
  try {
    await millicast.connect(broadcastOptions)
    return true
  } catch (e) {
    console.error('Connection failed, handle error', e)
  }
}

async function unpublish (video) {
  try {
    await millicast.stop()
    video.srcObject = null
    return true
  } catch (e) {
    console.log('Disconnection failed, handle error', e)
  }
}

function getStats () {
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

async function stopPublisher (event, video) {
  if (await unpublish(video)) {
    stopStats()

    event.target.innerText = 'Publish'
    event.target.removeEventListener('click', (e) => stopPublisher(e, video))
    event.target.addEventListener('click', (e) => startPublisher(e, video))
  }
}

export async function startPublisher (event, video) {
  if (await publish(video)) {
    getStats()

    event.target.innerText = 'Unpublish'
    event.target.removeEventListener('click', (e) => startPublisher(e, video))
    event.target.addEventListener('click', (e) => stopPublisher(e, video))
  }
}
