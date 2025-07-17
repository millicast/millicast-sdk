import { Viewer, Urls, Logger } from '@nx-millicast/millicast-sdk'
import CircularSlider from '@maslick/radiaslider/src/slider-circular'
console.log(CircularSlider)

window.Logger = Logger

Logger.setLevel(Logger.DEBUG)

if (import.meta.env.VITE_DIRECTOR_ENDPOINT) {
  Urls.setEndpoint(import.meta.env.VITE_DIRECTOR_ENDPOINT);
}

// Get our url
const href = new URL(window.location.href)
// Get or set Defaults
const streamName = href.searchParams.get('streamName')
  ? href.searchParams.get('streamName')
  : import.meta.env.VITE_STREAM_NAME
const streamAccountId = href.searchParams.get('streamAccountId')
  ? href.searchParams.get('streamAccountId')
  : import.meta.env.VITE_ACCOUNT_ID

// MillicastView object
let millicastView = null

let delayNode
const MaxDelay = 30

document.body.onclick = async () => {
  document.getElementById('slider').removeChild(document.getElementById('play'))
  document.getElementById('myCanvas').style.display = 'inherit'

  const slider = new CircularSlider({
    canvasId: 'myCanvas',
    continuousMode: true,
    x0: 150,
    y0: 150,
    readOnly: false,
  })
  slider.addSlider({
    id: 1,
    radius: 80,
    min: 0,
    max: 30,
    step: 5,
    color: '#104b63',
    changed: function (v) {
      if (!delayNode) {
        return false
      }
      const delay = (MaxDelay * v.deg) / 360
      // Set it
      delayNode.delayTime.value = delay
      // UPdate delay
      document.getElementById('value').innerHTML = 'Delay: ' + delay.toFixed(3) + 's'
    },
  })

  // Create audio context
  const audioContext = new window.AudioContext({ sampleRate: 48000 })
  window.millicastView = millicastView = new Viewer({
    streamName,
    streamAccountId,
    autoReconnect: true,
  })
  millicastView.on('track', ({ track }) => {
    // Ignore non audio tracks
    if (track.kind !== 'audio') {
      return
    }
    // Create delay node
    delayNode = audioContext.createDelay(MaxDelay)
    // Create stream from track
    const stream = (window.stream = new MediaStream([track]))

    // Chrome needs a dummy audio element to start pumping audio in the webaudio media soruce
    const audio = document.createElement('audio')
    audio.srcObject = stream
    audio.muted = true
    audio.play()

    // Create media source
    const source = audioContext.createMediaStreamSource(stream)

    // Creat primary graph, connect webrtc with the delay node and play it in the default destination
    source.connect(delayNode).connect(audioContext.destination)
    // UPdate delay
    document.getElementById('value').innerHTML = 'Delay: 0s'
    // Enable pointer events
    document.getElementById('myCanvas').style['pointer-events'] = 'auto'
  })
  // UPdate delay
  document.getElementById('value').innerHTML = '...connecting...'
  await millicastView.connect()
}
