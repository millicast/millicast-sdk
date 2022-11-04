import { Director, View } from './millicast.esm.js'

// Config data
const accountId = 'ACCOUNT_ID'
const streamName = 'STREAM_NAME'

// Global state
const sources = new Set()
// This will store a mapping: sourceId => transceiver media ids
const sourceIdTransceiversMap = new Map()

// Create a new viewer instance
const tokenGenerator = () => Director.getSubscriber(streamName, accountId)
const viewer = new View(streamName, tokenGenerator)

// Listen for broadcast events
viewer.on('broadcastEvent', (event) => {
  // Get event name and data
  const { name, data } = event
  switch (name) {
    case 'active': {
      const sourceId = data.sourceId || 'main'
      sources.add(sourceId)
      addRemoteTrackAndProject(data.sourceId)
      break
    }
    case 'inactive': {
      const sourceId = data.sourceId || 'main'
      sources.delete(sourceId)
      unprojectAndRemoveVideo(sourceId)
      break
    }
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await viewer.connect({
      events: ['active', 'inactive']
    })
  } catch (e) {
    console.log('Connection failed, handle error', e)
    viewer.reconnect()
  }
})

const addRemoteTrackAndProject = async (sourceId) => {
  const mediaStream = new MediaStream()
  const videoTransceiver = await viewer.addRemoteTrack('video', [mediaStream])
  const audioTransceiver = await viewer.addRemoteTrack('audio', [mediaStream])

  sourceIdTransceiversMap.set(sourceId || 'main', { videoMediaId: videoTransceiver.mid, audioMediaId: audioTransceiver.mid })

  createVideoElement(mediaStream, sourceId)

  await viewer.project(sourceId, [{
    trackId: 'video',
    mediaId: videoTransceiver.mid,
    media: 'video'
  },
  {
    trackId: 'audio',
    mediaId: audioTransceiver.mid,
    media: 'audio'
  }])
}

const unprojectAndRemoveVideo = async (sourceId) => {
  const sourceTransceivers = sourceIdTransceiversMap.get(sourceId)
  await viewer.unproject([sourceTransceivers.videoMediaId, sourceTransceivers.audioMediaId])
  const video = document.getElementById(sourceId)
  document.getElementById('remoteVideos').removeChild(video)
}

const createVideoElement = (mediaStream, sourceId) => {
  const video = document.createElement('video')
  // remoteVideos is already created in the HTML
  const remoteVideos = document.getElementById('remoteVideos')

  video.id = sourceId || 'main'
  video.srcObject = mediaStream
  video.autoplay = true
  // We mute the video so autoplay always work, this can be removed (https://developer.chrome.com/blog/autoplay/#new-behaviors)
  video.muted = true

  remoteVideos.appendChild(video)
}
