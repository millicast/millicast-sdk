import { View, Director, Logger } from '@millicast/sdk'
import { initializeMetadataPlayer } from './player'

window.Logger = Logger

Logger.setLevel(Logger.DEBUG)

// Get our url
const href = new URL(window.location.href)
// Get or set Defaults
const url = href.searchParams.get('url')
  ? href.searchParams.get('url')
  : 'wss://turn.millicast.com/millisock'
const endpoint = href.searchParams.get('endpoint')
const streamName = href.searchParams.get('streamName')
  ? href.searchParams.get('streamName')
  : process.env.MILLICAST_STREAM_NAME
const streamAccountId = href.searchParams.get('streamAccountId')
  ? href.searchParams.get('streamAccountId')
  : process.env.MILLICAST_ACCOUNT_ID

const disableVideo = href.searchParams.get('disableVideo') === 'true'
const disableAudio = href.searchParams.get('disableAudio') === 'true'
const muted =
  href.searchParams.get('muted') === 'true' ||
  href.searchParams.get('muted') === null
const autoplay =
  href.searchParams.get('autoplay') === 'true' ||
  href.searchParams.get('autoplay') === null
const autoReconnect =
  href.searchParams.get('autoReconnect') === 'true' ||
  href.searchParams.get('autoReconnect') === null

// console.log(disableVideo, disableAudio, muted, autoplay, autoReconnect);
const disableControls =
  href.searchParams.get('disableControls') === 'true' &&
  href.searchParams.get('disableControls') !== null
const disableVolume =
  (href.searchParams.get('disableVolume') === 'true' &&
    href.searchParams.get('disableVolume') !== null) ||
  disableControls
const disablePlay =
  (href.searchParams.get('disablePlay') === 'true' &&
    href.searchParams.get('disablePlay') !== null) ||
  disableControls
const disableFull =
  (href.searchParams.get('disableFull') === 'true' &&
    href.searchParams.get('disableFull') !== null) ||
  disableControls

// console.log(disableVolume, disablePlay, disableFull);
let playing = false
const fullBtn = document.querySelector('#fullBtn')
const video = document.querySelector('video')
const muteBtn = document.getElementById('muteBtn')
const playBtn = document.getElementById('playBtn')
const timecodeEl = document.querySelector('#timecode')
let metadataPlayer

const vidPlaceholder = document.querySelector('#vidPlaceholder')
const vidContainer = document.querySelector('#vidContainer')

muteBtn.addEventListener('click', function () {
  const iconElement = muteBtn.querySelector('i')
  if (video.muted) {
    video.muted = false
    iconElement.classList.remove('fa-volume-mute')
    iconElement.classList.add('fa-volume-up')
  } else {
    video.muted = true
    iconElement.classList.remove('fa-volume-up')
    iconElement.classList.add('fa-volume-mute')
  }
})

playBtn.addEventListener('click', function () {
  const iconElement = playBtn.querySelector('i')
  if (video.paused) {
    video.play()
    iconElement.classList.remove('fa-play')
    iconElement.classList.add('fa-pause')
  } else {
    video.pause()
    iconElement.classList.remove('fa-pause')
    iconElement.classList.add('fa-play')
  }
})

const switchElement = document.getElementById('metadata-toggle')
switchElement.addEventListener('change', function () {
  if (this.checked) {
    canvas.style.display = 'block'
  } else {
    canvas.style.display = 'none'
  }
})

// MillicastView object
let millicastView = null
const newViewer = () => {
  if (endpoint) Director.setEndpoint(endpoint)
  const tokenGenerator = () => Director.getSubscriber(streamName, streamAccountId)
  const millicastView = new View(streamName, tokenGenerator, null, autoReconnect)
  millicastView.on('broadcastEvent', (event) => {
    if (!autoReconnect) return

    const layers = event.data.layers !== null ? event.data.layers : {}
    if (event.name === 'layers' && Object.keys(layers).length <= 0) {
    }
  })
  millicastView.on('track', (event) => {
    if (event.track.kind === 'video')
      addStream(event.streams[0], event.receiver)
    else if ('createEncodedStreams' in event.receiver) {
      // enabling encodedInsertableStreams in the connection
      // causes receivers to require an encoded stream in order
      // for frames to flow. we don't want to extract metadata
      // from this receiver, so just pipe reader to writer
      const transformer = event.receiver.createEncodedStreams()
      transformer.readable.pipeTo(transformer.writable)
    }
  })
  return millicastView
}

const toggleFullscreen = () => {
  const fullIcon = fullBtn.children[0]
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    fullIcon.classList.remove('fa-compress')
    fullIcon.classList.add('fa-expand')
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()

      fullIcon.classList.remove('fa-expand')
      fullIcon.classList.add('fa-compress')
    }
  }
}

const addStream = (stream, receiver) => {
  // Create new video element
  playing = true

  // Set same id
  video.id = stream.id
  // Set src stream
  // console.log('addStream');
  if (!muted) {
    video.removeAttribute('muted')
  }
  if (!autoplay) {
    video.autoplay = false
    playing = false
    video.removeAttribute('autoplay')
  }

  metadataPlayer?.() // unmount current player
  video.srcObject = stream
  metadataPlayer = initializeMetadataPlayer(video, timecodeEl, receiver)
  vidPlaceholder.style.display = 'none'
  vidContainer.style.display = null
}

export function toggleSwitchBtns () {
  return
  const toggleSwitch = document.getElementById('metaSwitch')
  const metadata = document.getElementById('metadata-toggle')
  metadata.checked = true
  toggleSwitch.style.display = 'block'
}

let isSubscribed = false

const close = () => {
  video.srcObject = null
  playing = false
  millicastView?.millicastSignaling?.close()
  millicastView = null
  isSubscribed = false
  return Promise.resolve({})
}

const subscribe = async () => {
  if (millicastView?.isActive() || isSubscribed) {
    return
  }

  try {
    isSubscribed = true
    const options = {
      disableVideo: disableVideo,
      disableAudio: disableAudio,
      absCaptureTime: true,
      peerConfig: {
        encodedInsertableStreams: true
      }
    }
    window.millicastView = millicastView = newViewer()
    await millicastView.connect(options)
  } catch (error) {
    if (!autoReconnect) return
    millicastView.reconnect()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let int
  let lastclientX, lastclientY

  const startInt = (evt) => {
    if (int) clearInterval(int)
    int = setInterval(() => {
      const clientX = evt.clientX
      const clientY = evt.clientY
      if (clientX === lastclientX && clientY === lastclientY) {
        clearInterval(int)
      } else {
        lastclientX = clientX
        lastclientY = clientY
      }
    }, 1000)
  }

  if (fullBtn) fullBtn.onclick = toggleFullscreen

  video.onmousemove = (evt) => {
    startInt(evt)
  }
  video.addEventListener(
    'touchstart',
    (evt) => {
      startInt(evt)
    },
    false
  )

  int = setInterval(() => {
    clearInterval(int)
  }, 2000)
  subscribe()
})

const receiverApplicationId = 'B5B8307B'

window.__onGCastApiAvailable = function (isAvailable) {
  if (!isAvailable) {
    return false
  }

  const stateChanged = cast.framework.CastContextEventType.CAST_STATE_CHANGED
  const castContext = cast.framework.CastContext.getInstance()
  castContext.setOptions({
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    receiverApplicationId
  })

  castContext.addEventListener(stateChanged, ({ castState }) => {
    if (castState === cast.framework.CastState.NOT_CONNECTED) {
      subscribe()
    }

    if (castState === cast.framework.CastState.CONNECTED) {
      const castSession = castContext.getCurrentSession()
      const mediaInfo = new chrome.cast.media.MediaInfo(streamName, '')
      mediaInfo.customData = { streamName, streamAccountId }
      mediaInfo.streamType = chrome.cast.media.StreamType.LIVE

      const loadRequest = new chrome.cast.media.LoadRequest(mediaInfo)
      castSession.loadMedia(loadRequest).then(close)
    }
  })
}
