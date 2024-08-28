import Logger from 'js-logger'
import { DOLBY_SDK_TIMESTAMP_UUID, addH26xSEI, extractH26xMetadata, resetCodecs } from '../utils/Codecs'
const logger = Logger.get('TransformWorker')
logger.setLevel(Logger.DEBUG)

const DROPPED_SOURCE_TIMEOUT = 2000
const metadata = []
let codec = ''
let payloadTypeCodec = {}
// When simulcast is enabled, each resolution (height and width) frame has a different syncronization source (ssrc).
// This object keeps track of the last timestamp each ssrc frame came in, so if that resolution stoped from been sent, after a timeout, it will be not taken into account for sending metadata.
const synchronizationSources = {}
let synchronizationSourcesWithMetadata = []

function createReceiverTransform (mid) {
  const closedCaptionReady = (startTime, endTime, text) => {
    self.postMessage({ mid, event: 'closedCaption', startTime, endTime, text })
  }
  resetCodecs()
  return new TransformStream({
    async transform (encodedFrame, controller) {
      // eslint-disable-next-line no-undef
      if (encodedFrame instanceof RTCEncodedVideoFrame) {
        const frameCodec = payloadTypeCodec[encodedFrame.getMetadata().payloadType]?.toUpperCase() || codec?.toUpperCase()
        if (frameCodec === 'H264') {
          const metadata = extractH26xMetadata(encodedFrame, frameCodec, closedCaptionReady)
          if (metadata.timecode || metadata.unregistered || metadata.seiPicTimingTimeCodeArray?.length > 0) {
            self.postMessage({ event: 'metadata', mid, metadata })
          }
        }
        self.postMessage({
          event: 'complete',
          frame: { type: encodedFrame.type, timestamp: encodedFrame.timestamp, data: encodedFrame.data }
        })
      }
      controller.enqueue(encodedFrame)
    }
  })
}

function clearMetadata () {
  if (Object.keys(synchronizationSources).sort().join() === synchronizationSourcesWithMetadata.sort().join()) {
    metadata.shift()
    synchronizationSourcesWithMetadata = []
  }
}

function refreshSynchronizationSources (newSyncSource) {
  const now = new Date().getTime()
  synchronizationSources[newSyncSource] = now

  const sourcesToDelete = Object.keys(synchronizationSources)
    .filter(source => (now - synchronizationSources[source] > DROPPED_SOURCE_TIMEOUT))

  sourcesToDelete.forEach(source => {
    delete synchronizationSources[source]
    delete synchronizationSourcesWithMetadata[source]
  })
  clearMetadata()
}

function createSenderTransform () {
  return new TransformStream({
    start () {},
    flush () {},
    async transform (encodedFrame, controller) {
      // eslint-disable-next-line no-undef
      if (encodedFrame instanceof RTCEncodedVideoFrame) {
        const frameMetadata = encodedFrame.getMetadata()
        const newSyncSource = frameMetadata.synchronizationSource

        refreshSynchronizationSources(newSyncSource)

        if (!synchronizationSourcesWithMetadata.includes(newSyncSource) && metadata.length) {
          try {
            // Add h265 regex when ready
            if (!/(h26[4])/.test(codec)) {
              throw new Error('Sending metadata is not supported with any other codec other than H.264')
            }
            if (metadata[0].uuid === DOLBY_SDK_TIMESTAMP_UUID) {
              metadata[0].timecode = Date.now()
            }
            addH26xSEI(metadata[0], encodedFrame)
            synchronizationSourcesWithMetadata.push(newSyncSource)
          } catch (error) {
            console.error(error)
          } finally {
            clearMetadata()
          }
        }
      }
      controller.enqueue(encodedFrame)
    }
  })
}

function setupPipe ({ readable, writable }, transform) {
  readable
    .pipeThrough(transform)
    .pipeTo(writable)
}

// eslint-disable-next-line no-undef
addEventListener('rtctransform', (event) => {
  let transform
  if (event.transformer.options.name === 'senderTransform') {
    codec = event.transformer.options.codec
    transform = createSenderTransform()
  } else if (event.transformer.options.name === 'receiverTransform') {
    payloadTypeCodec = event.transformer.options.payloadTypeCodec || {}
    codec = event.transformer.options.codec || ''
    transform = createReceiverTransform(event.transformer.options.mid)
  } else {
    return
  }
  setupPipe(event.transformer, transform)
})

addEventListener('message', (event) => {
  const { action } = event.data
  switch (action) {
    case 'insertable-streams-sender':
      codec = event.data.codec
      setupPipe(event.data, createSenderTransform())
      break
    case 'insertable-streams-receiver':
      payloadTypeCodec = event.data.payloadTypeCodec || {}
      codec = event.data.codec || ''
      setupPipe(event.data, createReceiverTransform(event.data.mid))
      break
    case 'metadata-sei-user-data-unregistered':
      metadata.push({
        uuid: event.data.uuid,
        payload: event.data.payload
      })
      break
    default:
      break
  }
})
