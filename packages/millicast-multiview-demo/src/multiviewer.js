import { Director, View } from "@millicast/sdk"

if (process.env.MILLICAST_DIRECTOR_ENDPOINT) {
  Director.setEndpoint(process.env.MILLICAST_DIRECTOR_ENDPOINT)
}

// Config data
const accountId = import.meta.env.MILLICAST_ACCOUNT_ID
const streamName = import.meta.env.MILLICAST_STREAM_NAME

// This will store the main transceiver video mid
const mainTransceiver = '0'

// This will store a mapping: source id => tracks
let sourcesTracks = {}

// This will store a mapping: transceiver video mid => source id
let transceiverToSourceIdMap = {}

// This will store a mapping: transceiver video mid => active layers 
let transceiverToLayersMap = {}

// Create a new viewer instance
const tokenGenerator = () => Director.getSubscriber(streamName, accountId)
const viewer = window.millicastView = new View(streamName, tokenGenerator)

// Listen for broadcast events
viewer.on('broadcastEvent', (event) => {
  // Get event name and data
  const { name, data } = event
  switch (name) {
    case 'active': {
      const sourceId = data.sourceId || 'main'
      if (sourceId === 'main') {
        addMainSource(data)
      } else {
        addRemoteSource(data)
      }
      addSourceOption(sourceId)
      break
    }
    case 'inactive': {
      const sourceId = data.sourceId || 'main'
      unprojectAndRemoveVideo(data.sourceId)
      removeSourceOption(sourceId)
      break
    }
    case 'layers': {
      if(sourcesDropDown.value)
        updateLayers(data.medias)
      break
    }
  }
})

// This aplication does not support audio only streams. It's not intented to work using audio only streams.
viewer.on('track', (event) => {
  if (event.streams.length > 0 && event.track.kind === 'video') {
    addStreamToVideoElement(event.streams[0], event.transceiver.mid)
  }
})

viewer.on('onMetadata', (metadata) => {
  console.log(`Metadata event from ${transceiverToSourceIdMap[metadata.mid] || 'main'}:`, metadata)
})

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await viewer.connect({
      events: ['active', 'inactive', 'layers']
    })
  } catch (e) {
    console.error(e)
    viewer.reconnect()
  }
})

const addRemoteSource = async (data) => {

  const mediaStream = new MediaStream()
  const tracksPromises = data.tracks.map(async (track) => {
    const { media } = track
    const mediaTransceiver = await viewer.addRemoteTrack(media, [mediaStream])
    return {
      ...track,
      mediaId: mediaTransceiver.mid
    }
  })

  const tracks = await Promise.all(tracksPromises)

  const videoMediaId = tracks.find(track => track.media === 'video').mediaId

  transceiverToSourceIdMap[videoMediaId] = data.sourceId 
  sourcesTracks[data.sourceId] = tracks

  createVideoElement(mediaStream, videoMediaId)
  createVideoEventListener(videoMediaId)

  await viewer.project(data.sourceId,  tracks)
}

const addMainSource = async (data) => {
  const mainVideo = document.getElementById(mainTransceiver)
  if (!mainVideo) {
    const mediaStream = new MediaStream()
    const tracks = data.tracks.map(track => {
      const { media } = track
      const mediaId = media === 'video' ? mainTransceiver : '1'
      return {
        ...track,
        mediaId
      }
    })

    transceiverToSourceIdMap[mainTransceiver] = data.sourceId 
    sourcesTracks[data.sourceId] = tracks
    
    createVideoElement(mediaStream, mainTransceiver)
    createVideoEventListener(mainTransceiver)
  } else {
    mainVideo.hidden = false
  }
}

const addStreamToVideoElement = (mediaStream, videoMediaId) => {
  const video = document.getElementById(videoMediaId)
  video.srcObject = mediaStream
  video.muted = true
  video.autoPlay = true
  video.playsInline = true
  video.play()
}

const remoteVideosContainer = document.getElementById('remoteVideos')
const mainVideoContainer = document.getElementById('mainVideo')

const unprojectAndRemoveVideo = async (sourceId) => {
  const videoMediaId = sourcesTracks[sourceId].find(track => track.media === 'video').mediaId
  const tracksMediaIds = sourcesTracks[sourceId].map(track => track.mediaId)
  const video = document.getElementById(videoMediaId)

  if (sourceId) {
    await viewer.unproject(tracksMediaIds)
  
    remoteVideosContainer.removeChild(video)
    delete sourcesTracks[sourceId]
    delete transceiverToSourceIdMap[videoMediaId]
  } else {
    video.hidden = true
  }
}

const sourcesDropDown = document.getElementById('sourcesDropDown')
const layersDropDown = document.getElementById('layersDropDown')

const updateLayers = (layers) => {
  const sourceId = sourcesDropDown.value === 'main' ? null : sourcesDropDown.value

  transceiverToLayersMap = layers

  const videoMediaId = sourcesTracks[sourceId]?.find(track => track.media === 'video').mediaId || null
  const activeLayers = layers[videoMediaId]?.active || []
  
  const selectedLayer = layersDropDown.value

  layersDropDown.innerHTML = `<option hidden selected>Select a source</option>` + activeLayers.map(layer => {
    return `<option value="${layer.id}" ${layer.id === selectedLayer ? 'selected' : ''}>${layer.width}p</option>`
  }).join('')
}

const createVideoElement = (mediaStream, videoMediaId) => {
  const video = document.createElement('video')

  video.id = videoMediaId 
  video.srcObject = mediaStream
  video.autoplay = true
  // We mute the video so autoplay always work, this can be removed (https://developer.chrome.com/blog/autoplay/#new-behaviors)
  video.muted = true
  
  if (videoMediaId === mainTransceiver) {
    mainVideoContainer.appendChild(video)
  } else {
    remoteVideosContainer.appendChild(video)
  }
}

const createVideoEventListener = (mediaId) => {
  const video = document.getElementById(mediaId)
  video.addEventListener('click', () => { 
    const selectedSourceId = transceiverToSourceIdMap[mediaId]
    const mainSoruceId = transceiverToSourceIdMap[mainTransceiver]

    viewer.project(mainSoruceId, sourcesTracks[selectedSourceId])

    viewer.project(selectedSourceId, sourcesTracks[mainSoruceId])

    sourcesTracks[selectedSourceId].find(track => track.trackId === 'video').mediaId = mainTransceiver
    sourcesTracks[mainSoruceId].find(track => track.trackId === 'video').mediaId = mediaId
    
    transceiverToSourceIdMap[mainTransceiver] = selectedSourceId
    transceiverToSourceIdMap[mediaId] = mainSoruceId
  })
}

const addSourceOption = (sourceId) => {
  if (sourceId === 'main') {
    sourcesDropDown.value = sourceId
  }
  const option = document.createElement('option')
  option.value = sourceId
  option.text = sourceId
  sourcesDropDown.add(option)
}

const removeSourceOption = (sourceId) => {
  const sourceToRemove = sourcesDropDown.querySelector(`option[value="${sourceId}"]`)
  if (sourceToRemove) {
    sourcesDropDown.removeChild(sourceToRemove)
  }
}

sourcesDropDown.addEventListener('change', () => {
  const sourceId = sourcesDropDown.value === 'main' ? null : sourcesDropDown.value
  const videoMediaId = sourcesTracks[sourceId].find(track => track.trackId === 'video').mediaId

  const sourceActiveLayers = transceiverToLayersMap[videoMediaId]?.active || []

  layersDropDown.innerHTML = `<option hidden selected>Select a source</option>` + sourceActiveLayers.map(layer => {
    return `<option value="${layer.id}">${layer.width}p</option>`
  }).join('')
})

layersDropDown.addEventListener('change', (event) => {
  const encodingId = event.target.value
  const sourceId = sourcesDropDown.value === 'main' ? null : sourcesDropDown.value
  const videoTrack = sourcesTracks[sourceId].find(track => track.trackId === 'video')
  viewer.project(sourceId, [{
    ...videoTrack,
    layer: {
      encodingId
    }
  }])
})
