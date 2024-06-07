import { Director, View } from "@millicast/sdk"

if (process.env.MILLICAST_DIRECTOR_ENDPOINT) {
  Director.setEndpoint(process.env.MILLICAST_DIRECTOR_ENDPOINT)
}

const getQueryValueIgnoreCase = (params, key) => {
  for (const [paramKey, value] of params) {
    if (paramKey.toLowerCase() === key.toLowerCase()) {
      return value;
    }
  }
  return null; // or whatever default value you prefer
};

// Query params
const params = new URLSearchParams(window.location.search)
const isDRMOn = getQueryValueIgnoreCase(params, 'drm')

// Config data
const accountId = process.env.MILLICAST_ACCOUNT_ID
const streamName = process.env.MILLICAST_STREAM_NAME

// This will store the main transceiver video mid
const mainVideoMid = '0'
const mainSourceId = 'main'

let remoteVideosContainer
let mainVideoElement
let mainAudioElement

// This will store a mapping: source id => tracks mapping
let sourceTracksMap = {}

// This will store a mapping: transceiver video mid => source id
let transceiverMidToSourceIdMap = {}

// This will store a mapping: transceiver video mid => active layers 
let transceiverToLayersMap = {}

// Create a new viewer instance
const tokenGenerator = () => Director.getSubscriber(streamName, accountId)
let viewer


document.addEventListener('DOMContentLoaded', async () => {
  remoteVideosContainer = document.getElementById('remoteVideos')
  mainVideoElement = document.getElementById('mid-0')
  mainAudioElement = document.getElementById('mid-1')
  console.log(' page loaded, mainVideoElement is', mainVideoElement)
  try {
    viewer = isDRMOn ? new View(streamName, tokenGenerator, null, true,
      { videoElement: mainVideoElement, audioElement: mainAudioElement }) :
      new View(streamName, tokenGenerator)

    // Listen for broadcast events
    viewer.on('broadcastEvent', (event) => {
      // Get event name and data
      const { name, data } = event
      switch (name) {
        case 'active': {
          const sourceId = data.sourceId || mainSourceId
          if (sourceId === mainSourceId) {
            addMainSource(data)
          } else {
            addRemoteSource(data)
          }
          addSourceOption(sourceId)
          break
        }
        case 'inactive': {
          const sourceId = data.sourceId || mainSourceId
          unprojectAndRemoveVideo(sourceId)
          removeSourceOption(sourceId)
          break
        }
        case 'layers': {
          if (sourcesDropDown.value)
            updateLayers(data.medias)
          break
        }
      }
    })

    // This aplication does not support audio only streams. It's not intented to work using audio only streams.
    viewer.on('track', (event) => {
      console.log('track event', event)
      if (!isDRMOn && event.streams.length > 0 && event.track.kind === 'video') {
        addStreamToVideoElement(event.streams[0], event.transceiver.mid)
      }
    })
    await viewer.connect({
      events: ['active', 'inactive', 'layers']
    })
  } catch (e) {
    console.error(e)
    viewer.reconnect()
  }
})

const addRemoteSource = async (data) => {

  const sourceId = data.sourceId
  const mediaStream = new MediaStream()
  const videoElement = createVideoElement()
  const audioElement = createAudioElement()
  const drmOptions = isDRMOn ? { videoElement, audioElement } : null
  const tracksPromises = data.tracks.map(async (track) => {
    const { media } = track
    const mediaTransceiver = await viewer.addRemoteTrack(media, [mediaStream], drmOptions)
    return {
      ...track,
      mediaId: mediaTransceiver.mid
    }
  })
  const tracksMapping = await Promise.all(tracksPromises)
  const videoMediaId = tracksMapping.find(track => track.media === 'video').mediaId
  const audioMediaId = tracksMapping.find(track => track.media === 'audio')?.mediaId
  videoElement.id = 'mid-' +videoMediaId
  if (audioMediaId) {
    audioElement.id = 'mid-' +audioMediaId
  }
  transceiverMidToSourceIdMap[videoMediaId] = sourceId
  sourceTracksMap[sourceId] = tracksMapping
  createVideoEventListener(videoMediaId)
  if (!isDRMOn) videoElement.srcObject = mediaStream
  await viewer.project(sourceId, tracksMapping)
  console.log('source tracks and mapping:', sourceId, sourceTracksMap[sourceId])
}

const addMainSource = async (data) => {
  console.log('add main source')
  const tracksMapping = data.tracks.map(track => {
    const { media } = track
    const mediaId = media === 'video' ? mainVideoMid : '1'
    return {
      ...track,
      mediaId
    }
  })
  transceiverMidToSourceIdMap[mainVideoMid] = mainSourceId
  sourceTracksMap[mainSourceId] = tracksMapping
  mainVideoElement.hidden = false
  console.log('source tracks and mapping:', mainSourceId, sourceTracksMap[mainSourceId])
}

const addStreamToVideoElement = (mediaStream, mediaId) => {
  const video = document.getElementById('mid-' + mediaId)
  video.srcObject = mediaStream
  video.muted = true
  video.autoPlay = true
  video.playsInline = true
  video.addEventListener('error', (e) => {
    console.error('failed to play video: ', e)
  })
  video.play()
}

const unprojectAndRemoveVideo = async (sourceId) => {
  const videoMediaId = sourceTracksMap[sourceId].find(track => track.media === 'video').mediaId
  const audioMediaId = sourceTracksMap[sourceId].find(track => track.media === 'audio')?.mediaId
  const tracksMediaIds = sourceTracksMap[sourceId].map(track => track.mediaId)
  const video = document.getElementById('mid-' + videoMediaId)
  const audio = document.getElementById('mid-' + audioMediaId)

  await viewer.unproject(tracksMediaIds)

  if (videoMediaId !== mainVideoMid) {
    remoteVideosContainer.removeChild(video)
    if (audio) remoteVideosContainer.removeChild(audio)
  }else {
    video.hidden = true
    video.pause()
    audio?.pause()
  }
  delete sourceTracksMap[sourceId]
  delete transceiverMidToSourceIdMap[videoMediaId]
}

const sourcesDropDown = document.getElementById('sourcesDropDown')
const layersDropDown = document.getElementById('layersDropDown')

const updateLayers = (layers) => {
  const sourceId = sourcesDropDown.value === 'main' ? null : sourcesDropDown.value

  transceiverToLayersMap = layers

  const videoMediaId = sourceTracksMap[sourceId]?.find(track => track.media === 'video').mediaId || null
  const activeLayers = layers[videoMediaId]?.active || []
  const selectedLayer = layersDropDown.value

  layersDropDown.innerHTML = `<option hidden selected>Select a source</option>` + activeLayers.map(layer => {
    return `<option value="${layer.id}" ${layer.id === selectedLayer ? 'selected' : ''}>${layer.width}p</option>`
  }).join('')
}

const createVideoElement = () => {
  const video = document.createElement('video')
  video.autoplay = true
  video.playsInline = true
  video.controls = true
  // We mute the video so autoplay always work, this can be removed (https://developer.chrome.com/blog/autoplay/#new-behaviors)
  video.muted = true
  remoteVideosContainer.appendChild(video)
  return video
}

// We only need this for DRM mode
const createAudioElement = () => {
  const audio = document.createElement('audio')
  audio.autoplay = true
  audio.muted = true
  audio.hidden = true
  remoteVideosContainer.appendChild(audio)
  return audio
}

const createVideoEventListener = (mediaId) => {
  const selectedSourceId = transceiverMidToSourceIdMap[mediaId]
  const video = document.getElementById( 'mid-' + mediaId)
  console.log('create video element event listener for:', selectedSourceId, video)
  video.addEventListener('click', async () => {
    // switch main source with selected source
    const selectedSourceId = transceiverMidToSourceIdMap[mediaId]
    const mainVideoSourceId = transceiverMidToSourceIdMap[mainVideoMid]
    console.log('switch main source from:', mainVideoSourceId, 'to:', selectedSourceId)
    await viewer.project(mainVideoSourceId === mainSourceId ? null : mainVideoSourceId, sourceTracksMap[selectedSourceId])
    await viewer.project(selectedSourceId === mainSourceId ? null : selectedSourceId, sourceTracksMap[mainVideoSourceId])
    const tmp = sourceTracksMap[selectedSourceId]
    sourceTracksMap[selectedSourceId] = sourceTracksMap[mainVideoSourceId]
    sourceTracksMap[mainVideoSourceId] = tmp
    transceiverMidToSourceIdMap[mainVideoMid] = selectedSourceId
    transceiverMidToSourceIdMap[mediaId] = mainVideoSourceId
    video.play()
  })
}

const addSourceOption = (sourceId) => {
  if (sourceId === mainSourceId) {
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
  const videoMediaId = sourceTracksMap[sourceId].find(track => track.trackId === 'video').mediaId

  const sourceActiveLayers = transceiverToLayersMap[videoMediaId]?.active || []

  layersDropDown.innerHTML = `<option hidden selected>Select a source</option>` + sourceActiveLayers.map(layer => {
    return `<option value="${layer.id}">${layer.width}p</option>`
  }).join('')
})

layersDropDown.addEventListener('change', (event) => {
  const encodingId = event.target.value
  const sourceId = sourcesDropDown.value === 'main' ? null : sourcesDropDown.value
  const videoTrack = sourceTracksMap[sourceId].find(track => track.trackId === 'video')
  viewer.project(sourceId, [{
    ...videoTrack,
    layer: {
      encodingId
    }
  }])
})
