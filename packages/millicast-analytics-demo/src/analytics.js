import { View, Publish, Director } from '@millicast/sdk'

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
const publisherStats = {
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
  const publishToken = process.env.MILLICAST_PUBLISH_TOKEN
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

  // Define callback for generate new token
  const tokenGeneratorPublisher = () => Director.getPublisher({
    token: publishToken,
    streamName: streamName
  })

  const millicastPublish = new Publish(streamName, tokenGeneratorPublisher)

  async function publish () {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

    // Initialize local video
    myVideo.srcObject = mediaStream
    myVideo.play()

    // Publishing options
    const broadcastOptions = {
      mediaStream: mediaStream
    }
    // Start broadcast
    try {
      await millicastPublish.connect(broadcastOptions)
    } catch (e) {
      console.error('Connection failed, handle error', e)
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

  const parseStatsPublisher = (stats) => {
    publisherStats.totalRoundTripTime = stats.totalRoundTripTime
    publisherStats.currentRoundTripTime = stats.currentRoundTripTime
    publisherStats.availableOutgoingBitrate = stats.availableOutgoingBitrate
    publisherStats.resolution = stats.video.outbounds[0].frameWidth * stats.video.outbounds[0].frameHeight
    publisherStats.bitrate = stats.video.outbounds[0].bitrate
    publisherStats.qualityLimitationReason = stats.video.outbounds[0].qualityLimitationReason

    console.log('Publisher stats:', publisherStats)
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

  const parseOnConnectionStateChangePublisher = (event) => {
    switch (event) {
      case 'connected':
        publisherStats.connectionStateChanged.connected = publisherStats.connectionStateChanged.connected + 1
        break
      case 'disconnected':
        publisherStats.connectionStateChanged.disconnected = publisherStats.connectionStateChanged.disconnected + 1
        break
      case 'failed':
        publisherStats.connectionStateChanged.failed = publisherStats.connectionStateChanged.failed + 1
        break
      case 'closed':
        publisherStats.connectionStateChanged.closed = publisherStats.connectionStateChanged.closed + 1
        break
      default:
        break
    }

    console.log('Publisher onConnectionStateChanged:', publisherStats)
  }

  const parseOnReconnectSubscriber = (event) => {
    subscriberStats.reconnect = subscriberStats.reconnect + 1

    console.log('Subscriber onReconnect:', subscriberStats)
  }

  const parseOnReconnectPublisher = (event) => {
    publisherStats.reconnect = publisherStats.reconnect + 1

    console.log('Publisher onReconnect:', publisherStats)
  }

  const parseOnMigrateSubscriber = (event) => {
    subscriberStats.migrate = subscriberStats.migrate + 1

    console.log('Subscriber onMigrate:', subscriberStats)
  }

  const parseOnMigratePublisher = (event) => {
    publisherStats.migrate = publisherStats.migrate + 1

    console.log('Publisher onMigrate:', publisherStats)
  }

  function stopStats (e) {
    console.log('Stop stats...')

    millicastView.webRTCPeer.stopStats()
    millicastView.webRTCPeer.removeAllListeners('stats')

    millicastPublish.webRTCPeer.stopStats()
    millicastPublish.webRTCPeer.removeAllListeners('stats')

    e.target.innerText = 'Get Stats'
    e.target.removeEventListener('click', stopStats)
    e.target.addEventListener('click', getStats)
  }

  // Get Stats
  function getStats (e) {
    // Initialize stats
    millicastView.webRTCPeer.initStats()
    millicastPublish.webRTCPeer.initStats()

    console.log('Getting stats...')

    // set 'stats' listener
    millicastView.webRTCPeer.on('stats', parseStatsSubscriber)
    millicastPublish.webRTCPeer.on('stats', parseStatsPublisher)

    // set 'connectionStateChange' listener
    millicastView.webRTCPeer.on('connectionStateChange', parseOnConnectionStateChangeSubscriber)
    millicastPublish.webRTCPeer.on('connectionStateChange', parseOnConnectionStateChangePublisher)

    // set 'reconnect' & 'migrate' listeners
    millicastView.webRTCPeer.on('reconnect', parseOnReconnectSubscriber)
    millicastView.webRTCPeer.on('migrate', parseOnMigrateSubscriber)
    millicastPublish.webRTCPeer.on('reconnect', parseOnReconnectPublisher)
    millicastPublish.webRTCPeer.on('migrate', parseOnMigratePublisher)

    e.target.innerText = 'Stop Stats'
    e.target.removeEventListener('click', getStats)
    e.target.addEventListener('click', stopStats)
  }

  document.getElementById('get-stats').addEventListener('click', getStats)
  document.getElementById('subscribe').addEventListener('click', subscribe)
  document.getElementById('publish').addEventListener('click', publish)
})
