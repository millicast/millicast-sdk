import { SimpleMetadataSync } from "nal-extractor"

import type { Metadata } from "./worker"

// start up worker as soon as the module is loaded
const worker = new Worker('./worker.umd.js', { name: 'metadata-extractor' })
// FIXME: handle errors

export function initializeMetadataPlayer(
  video: HTMLVideoElement,
  timecodeEl: HTMLElement,
  receiver: RTCRtpReceiver,
) {
  const clockRate = 90000 // FIXME: ideally grab this from SDP

  // begin extracting metadata, request re-render on change
  const metadataSync = new class extends SimpleMetadataSync<Metadata, Metadata> {
    newFrame(now: DOMHighResTimeStamp, frameMetadata: VideoFrameMetadata) {
      // call super implementation to populate `this.metadata`
      super.newFrame(now, frameMetadata)

      // retrieve metadata and expected display time
      const displayDiff = frameMetadata.expectedDisplayTime - now
      const ts = metadataSync.metadata
      if (!ts) {
        // no metadata for this frame
        timecodeEl.textContent = ''
        return
      }

      // render metadata
      const displayDiffText = Math.round(displayDiff).toString()
      timecodeEl.textContent = `(${displayDiffText}) ${ts}`
    }
  }(clockRate, video, receiver, worker)

  metadataSync.ready.then(() =>
    console.info('Metadata player initialized'))

  // return callback for user to stop/unmount us
  return metadataSync
}