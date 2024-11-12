import Logger from 'js-logger'
import { DOLBY_SDK_TIMESTAMP_UUID, addH26xSEI, extractH26xMetadata } from '../utils/Codecs'
import { VideoCodec } from '../types/Codecs.types'
import { TransformEvent, TransformWorkerSeiMetadata } from '../types/TransformWorker.types'
const logger = Logger.get('TransformWorker')
logger.setLevel(Logger.DEBUG)

const DROPPED_SOURCE_TIMEOUT = 2000
const metadata: TransformWorkerSeiMetadata[] = []
let codec = ''
let payloadTypeCodec: { [key: number]: string } = {}
// When simulcast is enabled, each resolution (height and width) frame has a different syncronization source (ssrc).
// This object keeps track of the last timestamp each ssrc frame came in, so if that resolution stoped from been sent, after a timeout, it will be not taken into account for sending metadata.
const synchronizationSources: { [key: string]: number } = {}
let synchronizationSourcesWithMetadata: number[] = []

function createReceiverTransform(mid: string) {
  return new TransformStream({
    start() {
      // This function is intentionally left empty
    },
    flush() {
      // This function is intentionally left empty
    },
    async transform(encodedFrame: RTCEncodedVideoFrame, controller) {
      // eslint-disable-next-line no-undef
      if (encodedFrame instanceof RTCEncodedVideoFrame) {
        const payloadType = encodedFrame.getMetadata().payloadType
        const frameCodec = payloadType ? payloadTypeCodec[payloadType].toLowerCase() : codec
        if (frameCodec === VideoCodec.H264) {
          const metadata = extractH26xMetadata(encodedFrame, frameCodec as VideoCodec)
          if (
            metadata.timecode ||
            metadata.unregistered ||
            (metadata.seiPicTimingTimeCodeArray && metadata.seiPicTimingTimeCodeArray?.length > 0)
          ) {
            self.postMessage({ event: 'metadata', mid, metadata })
          }
        }
        self.postMessage({
          event: 'complete',
          frame: { type: encodedFrame.type, timestamp: encodedFrame.timestamp, data: encodedFrame.data },
        })
      }
      controller.enqueue(encodedFrame)
    },
  })
}

function clearMetadata() {
  if (
    Object.keys(synchronizationSources).sort().join() === synchronizationSourcesWithMetadata.sort().join()
  ) {
    metadata.shift()
    synchronizationSourcesWithMetadata = []
  }
}

function refreshSynchronizationSources(newSyncSource: number) {
  const now = new Date().getTime()
  synchronizationSources[newSyncSource] = now

  const sourcesToDelete = Object.keys(synchronizationSources).filter(
    (source) => now - synchronizationSources[source] > DROPPED_SOURCE_TIMEOUT
  )

  sourcesToDelete.forEach((source: string) => {
    delete synchronizationSources[source]
    delete synchronizationSourcesWithMetadata[parseInt(source)]
  })
  clearMetadata()
}

function createSenderTransform(): TransformStream {
  return new TransformStream({
    start() {
      // This function is intentionally left empty
    },
    flush() {
      // This function is intentionally left empty
    },
    async transform(encodedFrame: RTCEncodedVideoFrame, controller) {
      // eslint-disable-next-line no-undef
      if (encodedFrame instanceof RTCEncodedVideoFrame) {
        const frameMetadata = encodedFrame.getMetadata()
        const newSyncSource = frameMetadata.synchronizationSource as number

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
            console.log('Metadata:', metadata[0])
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
    },
  })
}

function setupPipe(
  { readable, writable }: { readable: ReadableStream; writable: WritableStream },
  transform: TransformStream
) {
  readable.pipeThrough(transform).pipeTo(writable)
}

// eslint-disable-next-line no-undef
addEventListener('rtctransform', (event: unknown) => {
  const transformEvent = event as TransformEvent
  let transform: TransformStream
  if (transformEvent.transformer.options.name === 'senderTransform') {
    codec = transformEvent.transformer.options.codec
    transform = createSenderTransform()
  } else if (transformEvent.transformer.options.name === 'receiverTransform') {
    payloadTypeCodec = transformEvent.transformer.options.payloadTypeCodec || {}
    codec = transformEvent.transformer.options.codec || ''
    transform = createReceiverTransform(transformEvent.transformer.options.mid)
  } else {
    return
  }
  setupPipe(transformEvent.transformer, transform)
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
        payload: event.data.payload,
      })
      break
    default:
      break
  }
})
