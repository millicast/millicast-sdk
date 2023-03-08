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
  const metadataSync = new class extends SimpleMetadataSync<Metadata, Metadata> {
    newFrame(now: DOMHighResTimeStamp, frameMetadata: VideoFrameMetadata) {
      super.newFrame(now, frameMetadata)
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
    const { timestamp: ts, lastTimestamp: prevTs, timingInfo: { time_scale, num_units_in_tick } } = metadataSync.metadata
    const ats = { ...prevTs, ...ts }
    const fractional = (ts.n_frames * num_units_in_tick * (ts.nuit_field_based_flag ? 2 : 1) + ts.time_offset) / time_scale

    const textParts: [string, boolean][] = [
      [ ats.hours_value   !== undefined ? `${ats.hours_value.toString().padStart(2, '0')}:` : '', ts.hours_value !== undefined ],
      [ ats.minutes_value !== undefined ? `   ${ats.minutes_value.toString().padStart(2, '0')}:` : '', ts.minutes_value !== undefined ],
      [ ats.seconds_value !== undefined ? `      ${ats.seconds_value.toString().padStart(2, '0')}` : '', ts.seconds_value !== undefined ],
      [                                   `        :${ts.n_frames.toString().padStart(2, '0')}`, true ],
    ]
    const textLength = textParts.map(x => x[0].length).reduce((a, b) => Math.max(a, b))

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
    
    for (const [text, present] of textParts) {
      ctx.globalAlpha = present ? 1 : 0.5
      ctx.fillText(text.padEnd(textLength), canvas.width * .5, canvas.height * .98)
    }
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