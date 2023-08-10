import { View, Director } from '@millicast/sdk'
import * as publisher from './publisher.js'

// initial schema
const subscriberStats = {
  connectionStateChanged: {
    connected: 0,
    disconnected: 0,
    failed: 0,
    closed: 0
  },
  reconnect: 0,
  migrate: 0
}

document.addEventListener('DOMContentLoaded', async (event) => {
  // Get media element
  const myVideo = document.getElementById('my-video')
  const remoteVideo = document.getElementById('remote-video')

  // Set the credentials for the streaming subscription

  // Config data
  const accountId = process.env.MILLICAST_ACCOUNT_ID
  const streamName = process.env.MILLICAST_STREAM_NAME
  const directorUrl = process.env.MILLICAST_DIRECTOR_URL

  // Define callback for generate new token
  const tokenGeneratorSubscriber = () => Director.getSubscriber({
    streamName: streamName,
    streamAccountId: accountId
  })

  Director.setEndpoint(directorUrl)

  // Create a new instance
  const millicastView = new View(streamName, tokenGeneratorSubscriber, remoteVideo)

  async function subscribe () {
    try {
      await millicastView.connect()
    } catch (e) {
      console.log('Connection failed, handle error', e)
    }
  }

  const parseStatsSubscriber = (stats) => {
    subscriberStats.totalRoundTripTime = stats.totalRoundTripTime
    subscriberStats.currentRoundTripTime = stats.currentRoundTripTime
    subscriberStats.availableOutgoingBitrate = stats.availableOutgoingBitrate
    subscriberStats.audioPacketsLost = stats.audio.inbounds[0].totalPacketsLost
    subscriberStats.videoPacketsLost = stats.video.inbounds[0].totalPacketsLost
    subscriberStats.audioJitter = stats.audio.inbounds[0].jitter
    subscriberStats.videoJitter = stats.video.inbounds[0].jitter
    subscriberStats.resolution = stats.video.inbounds[0].frameWidth * stats.video.inbounds[0].frameHeight
    subscriberStats.bitrate = stats.video.inbounds[0].bitrate

    console.log('Subscriber stats:', subscriberStats)
  }

  const parseOnConnectionStateChangeSubscriber = (event) => {
    switch (event) {
      case 'connected':
        subscriberStats.connectionStateChanged.connected = subscriberStats.connectionStateChanged.connected + 1
        break
      case 'disconnected':
        subscriberStats.connectionStateChanged.disconnected = subscriberStats.connectionStateChanged.disconnected + 1
        break
      case 'failed':
        subscriberStats.connectionStateChanged.failed = subscriberStats.connectionStateChanged.failed + 1
        break
      case 'closed':
        subscriberStats.connectionStateChanged.closed = subscriberStats.connectionStateChanged.closed + 1
        break
      default:
        break
    }

    console.log('Subscriber onConnectionStateChanged:', subscriberStats)
  }

  const parseOnReconnectSubscriber = (event) => {
    subscriberStats.reconnect = subscriberStats.reconnect + 1

    console.log('Subscriber onReconnect:', subscriberStats)
  }

  const parseOnMigrateSubscriber = (event) => {
    subscriberStats.migrate = subscriberStats.migrate + 1

    console.log('Subscriber onMigrate:', subscriberStats)
  }

  function stopStats (e) {
    console.log('Stop stats...')

    millicastView.webRTCPeer.stopStats()
    millicastView.webRTCPeer.removeAllListeners('stats')

    publisher.stopStats()

    e.target.innerText = 'Get stats'
    e.target.removeEventListener('click', stopStats)
    e.target.addEventListener('click', getStats)
  }

  // Get Stats
  function getStats (e) {
    // Initialize stats
    millicastView.webRTCPeer.initStats()

    console.log('Getting stats...')

    // set 'stats' listener
    millicastView.webRTCPeer.on('stats', parseStatsSubscriber)

    // set 'connectionStateChange' listener
    millicastView.webRTCPeer.on('connectionStateChange', parseOnConnectionStateChangeSubscriber)

    // set 'reconnect' & 'migrate' listeners
    millicastView.webRTCPeer.on('reconnect', parseOnReconnectSubscriber)
    millicastView.webRTCPeer.on('migrate', parseOnMigrateSubscriber)

    publisher.getStats()

    e.target.innerText = 'Stop stats'
    e.target.removeEventListener('click', getStats)
    e.target.addEventListener('click', stopStats)
  }

  document.getElementById('get-stats').addEventListener('click', getStats)
  document.getElementById('subscribe').addEventListener('click', subscribe)
  document.getElementById('publish').addEventListener('click', (event) => publisher.publish(myVideo))
})
