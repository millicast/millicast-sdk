import { matchCanvasResolution, monitorNaturalResolution, RafHandle, SimpleMetadataSync } from "nal-extractor"

import type { Metadata } from "./worker"
import { toggleSwitchBtns } from "viewer"

export function assertNonNull<T>(x: T | null | undefined): T {
  if (x === null || x === undefined)
    throw new Error(`unexpected null`)
  return x
}

// start up worker as soon as the module is loaded
const worker = new Worker('./worker.umd.js', { name: 'metadata-extractor' })
// FIXME: handle errors

export function initializeMetadataPlayer(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  receiver: RTCRtpReceiver,
) {
  // accumulates tasks to execute (in reverse order as stored) on cleanup
  const cleanupTasks: (() => void)[] = []

  const clockRate = 90000 // FIXME: ideally grab this from SDP

  // begin extracting metadata, request re-render on change
  let displayDiff = 0
  const metadataSync = new class extends SimpleMetadataSync<Metadata, Metadata> {
    newFrame(now: DOMHighResTimeStamp, frameMetadata: VideoFrameMetadata) {
      super.newFrame(now, frameMetadata)
      displayDiff = frameMetadata.expectedDisplayTime - performance.now()
      rafHandle.request()
    }
    async waitMetadata(): Promise<Metadata> {
      if (this.metadata == undefined) {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            clearInterval(interval)
            reject(new Error('timeout waiting for metadata'))
          }, 3000)  
          const interval = setInterval(() => {
            if (this.metadata !== undefined) {
              clearTimeout(timeout)
              clearInterval(interval)
              resolve(this.metadata)
            }
          }, 10)
        })
      }
      return this.metadata!
    }
  }(clockRate, video, receiver, worker)
  cleanupTasks.push(() => metadataSync.stop())

  // monitor for size / resolution changes, request re-render on change
  cleanupTasks.push(monitorNaturalResolution(canvas, () => rafHandle.request()))

  // create RafHandle to manage renders
  const rafHandle = new RafHandle(render)
  rafHandle.request()
  cleanupTasks.push(() => rafHandle.cancel())

  // render logic
  const ctx = assertNonNull(canvas.getContext('2d', { alpha: false }))
  function render(now: DOMHighResTimeStamp) {
    // @ts-expect-error
    video.parentElement.style.aspectRatio = (video.videoWidth / video.videoHeight)

    matchCanvasResolution(canvas)
    
    // paint video, then overlay on top
    ctx.globalAlpha = 1
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    if (!metadataSync.metadata) return
    const ts = metadataSync.metadata

    const date = new Date(Number(ts)).toISOString()
    const text = `${date} (${Math.round(displayDiff).toString().padStart(4)})`
    const textLength = text.length

    ctx.font = `bold ${canvas.height * .045}px monospace`
    
    const borderSize = canvas.width * .01;
    
    const bgWidth = (textLength * ctx.measureText(' ').width) + (borderSize * 2);

    const bgX = (canvas.width - bgWidth) / 2;

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'black';
    ctx.fillRect(bgX, canvas.height * .92,  bgWidth, canvas.height * .07);
   
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    
    //ctx.globalAlpha = present ? 1 : 0.5
    ctx.fillText(text, canvas.width * .5, canvas.height * .98)
  }

  metadataSync.ready.then(() => {
    console.info('Metadata player initialized')
  } )

  metadataSync.waitMetadata()
    .then(() => {
      console.info('Metadata ready')
      toggleSwitchBtns()
  })
  .catch(err => { 
    console.info(err) 
  })

  return () => [...cleanupTasks].reverse().forEach(x => x())
}