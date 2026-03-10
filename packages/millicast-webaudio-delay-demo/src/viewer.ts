import { View, Director, Logger } from '@millicast/sdk'
import CircularSlider from '@maslick/radiaslider/src/slider-circular'
console.log(CircularSlider)

declare global {
  interface Window {
    Logger: typeof Logger
    millicastView: View | null
    stream: MediaStream
  }
}

window.Logger = Logger

Logger.setLevel(Logger.DEBUG)

if (import.meta.env.VITE_DIRECTOR_ENDPOINT) {
  Director.setEndpoint(import.meta.env.VITE_DIRECTOR_ENDPOINT)
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
let millicastView: View | null = null

let delayNode: DelayNode | null = null
const MaxDelay = 30

document.body.onclick = async () => {
  document.getElementById('slider')?.removeChild(document.getElementById('play')!)
  const canvas = document.getElementById('myCanvas') as HTMLElement
  canvas.style.display = 'inherit'

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
    changed: (v: any) => {
      if (!delayNode) {
        return
      }
      const delay = (MaxDelay * v.deg) / 360
      // Set it
      delayNode.delayTime.value = delay
      // UPdate delay
      const valueEl = document.getElementById('value')
      if (valueEl) valueEl.innerHTML = 'Delay: ' + delay.toFixed(3) + 's'
    },
  })

  // Create audio context
  const audioContext = new window.AudioContext({ sampleRate: 48000 })
  const options = { streamName, streamAccountId, subscriberToken: null }
  const tokenGenerator = () => Director.getSubscriber(options)
  window.millicastView = millicastView = new View(undefined, tokenGenerator, undefined, true)
  millicastView.on('track', (event) => {
    if (!event) return
    const track = event.track as MediaStreamTrack
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
    const valueEl = document.getElementById('value')
    if (valueEl) valueEl.innerHTML = 'Delay: 0s'
    // Enable pointer events
    canvas.style.pointerEvents = 'auto'
  })
  // UPdate delay
  const connectingEl = document.getElementById('value')
  if (connectingEl) connectingEl.innerHTML = '...connecting...'
  await millicastView.connect()
}
