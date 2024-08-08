import { Director, View } from "@millicast/sdk"

if (import.meta.env.MILLICAST_DIRECTOR_ENDPOINT) {
  Director.setEndpoint(import.meta.env.MILLICAST_DIRECTOR_ENDPOINT)
}

// Get query params
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

// Config data
const accountId = params.accountId || import.meta.env.MILLICAST_ACCOUNT_ID
const streamName = params.streamName || import.meta.env.MILLICAST_STREAM_NAME
const metadata = params.metadata === 'true'
const enableDRM = params.drm === 'true'
const subscriberToken = params.token || import.meta.env.MILLICAST_SUBSCRIBER_TOKEN;
const disableVideo = params.disableVideo === 'true'
const disableAudio = params.disableAudio === 'true'
const connectOptions = {
  events: ['active', 'inactive', 'layers'],
  metadata,
  enableDRM,
  disableVideo,
  disableAudio,
}
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
const tokenGenerator = () => Director.getSubscriber(streamName, accountId, subscriberToken, enableDRM)
let viewer

document.addEventListener('DOMContentLoaded', async () => {
  remoteVideosContainer = document.getElementById('remoteVideos')
  mainVideoElement = document.getElementById('mid-0')
  mainAudioElement = document.getElementById('mid-1')
  try {
    viewer = new View(streamName, tokenGenerator)
    viewer.on('metadata', (metadata) => {
      console.log(`Metadata event from ${transceiverToSourceIdMap[metadata.mid] || 'main'}:`, metadata)
    })
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
      if (!viewer.isDRMOn && event.streams.length > 0 && event.track.kind === 'video') {
        addStreamToVideoElement(event.streams[0], event.transceiver.mid)
      }
    })
    await viewer.connect(connectOptions)
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
  const tracksPromises = data.tracks.map(async (track) => {
    const { media } = track
    const mediaTransceiver = await viewer.addRemoteTrack(media, [mediaStream])
    return {
      ...track,
      mediaId: mediaTransceiver.mid
    }
  })
  const tracksMapping = await Promise.all(tracksPromises)
  const videoMediaId = tracksMapping.find(track => track.media === 'video').mediaId
  const audioMediaId = tracksMapping.find(track => track.media === 'audio')?.mediaId
  videoElement.id = 'mid-' + videoMediaId
  if (audioMediaId) {
    audioElement.id = 'mid-' + audioMediaId
  }
  if (data.encryption && enableDRM) {
    const drmOptions = {
      videoElement,
      audioElement,
      videoEncryptionParams: data.encryption,
      videoMid: videoMediaId,
    }
    if (audioMediaId) {
      drmOptions.audioMid = audioMediaId
    }
    viewer.configureDRM(drmOptions)
  }
  transceiverMidToSourceIdMap[videoMediaId] = sourceId
  sourceTracksMap[sourceId] = tracksMapping
  createVideoEventListener(videoMediaId)
  if (!data.encryption) videoElement.srcObject = mediaStream
  await viewer.project(sourceId, tracksMapping)
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
  if (data.encryption && enableDRM) {
    const drmOptions = {
      videoElement: mainVideoElement,
      audioElement: mainAudioElement,
      videoEncryptionParams: data.encryption,
      videoMid: mainVideoMid,
    }
    const audioTrackMapping = tracksMapping.find(track => track.media === 'audio')
    if (audioTrackMapping) {
      drmOptions.audioMid = audioTrackMapping.mediaId
    }
    viewer.configureDRM(drmOptions)
  }
  transceiverMidToSourceIdMap[mainVideoMid] = mainSourceId
  sourceTracksMap[mainSourceId] = tracksMapping
  mainVideoElement.hidden = false
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
    viewer.removeDRMConfiguration(videoMediaId)
    if (audioMediaId) viewer.removeDRMConfiguration(audioMediaId)
    if (audio) remoteVideosContainer.removeChild(audio)
  } else {
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
  const video = document.getElementById('mid-' + mediaId)
  video.addEventListener('click', async () => {
    // switch main source with selected source
    const selectedSourceId = transceiverMidToSourceIdMap[mediaId]
    const mainVideoSourceId = transceiverMidToSourceIdMap[mainVideoMid]
    console.log('switch main source from:', mainVideoSourceId, 'to:', selectedSourceId)
    if (viewer.isDRMOn) {
      viewer.exchangeDRMConfiguration(mediaId, mainVideoMid)
    }
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
