import { View, Director } from '@millicast/sdk'

const stats = {
  connectionStateChange: {
    connected: 0,
    disconnected: 0,
    failed: 0,
    closed: 0
  },
  reconnect: 0,
  migrate: 0,
  videoSource: {},
  audioSource: {}
}

// document.addEventListener('DOMContentLoaded', async (event) => {
const accountId = process.env.MILLICAST_ACCOUNT_ID
const streamName = process.env.MILLICAST_STREAM_NAME

// Define callback for generate new token
const tokenGenerator = () => Director.getSubscriber({
  streamName: streamName,
  streamAccountId: accountId
})

const viewer = document.getElementById('viewer')
const millicast = new View(streamName, tokenGenerator, viewer)
// })

millicast.on('broadcastEvent', (event) => {
  // Get event name and data
  const { name, data } = event
  if (name === 'active') {
    const sourceId = data.sourceId || 'main'
    console.log(data)
    if (sourceId !== 'main') {
      addRemoteSource(data)
    }// else {
    //   const mediaStream = new MediaStream()
    //   const tracks = data.tracks.map(track => {
    //     const { media } = track
    //     const mediaId = media === 'video' ? '0' : '1'
    //     return {
    //       ...track,
    //       mediaId
    //     }
    //   })
    //   viewer.srcObject = mediaStream
    //   viewer.autoplay = true
    //   viewer.muted = true
    //   console.log(viewer)
    // }
  }
})

const parseStats = (newStats) => {
  stats.totalRoundTripTime = newStats.totalRoundTripTime
  stats.currentRoundTripTime = newStats.currentRoundTripTime
  stats.availableOutgoingBitrate = newStats.availableOutgoingBitrate
  newStats.video.inbounds.forEach(video => {
    stats.videoSource['mid_' + video.mid] = {
      videoPacketsLost: video.totalPacketsLost,
      videoJitter: video.jitter,
      resolution: video.frameWidth * video.frameHeight,
      bitrate: video.bitrate
    }
  })
  newStats.audio.inbounds.forEach(audio => {
    stats.audioSource['mid_' + audio.mid] = {
      audioPacketsLost: newStats.audio.inbounds[0].totalPacketsLost,
      audioJitter: newStats.audio.inbounds[0].jitter
    }
  })

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

const addRemoteSource = async (data) => {
  const mediaStream = new MediaStream()
  const tracksPromises = data.tracks.map(async (track) => {
    const { media } = track
    const mediaTransceiver = await millicast.addRemoteTrack(media, [mediaStream])
    return {
      ...track,
      mediaId: mediaTransceiver.mid
    }
  })

  const tracks = await Promise.all(tracksPromises)

  await millicast.project(data.sourceId, tracks)
}
