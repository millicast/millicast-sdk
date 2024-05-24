import { addH26xSEI, extractH26xMetadata } from '../utils/Codecs'

let uuid = ''
let payload = ''
let codec = ''
let codecMap = {}

function createReceiverTransform (mid) {
  return new TransformStream({
    start () {},
    flush () {},
    async transform (encodedFrame, controller) {
      // eslint-disable-next-line no-undef
      if (encodedFrame instanceof RTCEncodedVideoFrame) {
        const frameCodec = codecMap[encodedFrame.getMetadata().payloadType] || codec.toUpperCase()
        if (frameCodec === 'H264') {
          const metadata = extractH26xMetadata(encodedFrame, frameCodec)
          if (metadata.timecode || metadata.unregistered || metadata.seiPicTimingTimeCodeArray?.length > 0) {
            self.postMessage({ mid, metadata })
          }
        }
      }
      controller.enqueue(encodedFrame)
    }
  })
}

function createSenderTransform () {
  return new TransformStream({
    start () {},
    flush () {},
    async transform (encodedFrame, controller) {
      // eslint-disable-next-line no-undef
      if (encodedFrame instanceof RTCEncodedVideoFrame && uuid && payload) {
        try {
          // Add h265 regex when ready
          if (!/(h26[4])/.test(codec)) {
            throw new Error('Sending metadata is not supported with any other codec other than H.264')
          }
          addH26xSEI({ uuid, payload }, encodedFrame)
        } catch (error) {
          console.error(error)
        } finally {
          uuid = ''
          payload = ''
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
    codecMap = event.transformer.options.codecMap || {}
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
      codecMap = event.data.codecMap || {}
      codec = event.data.codec || ''
      setupPipe(event.data, createReceiverTransform(event.data.mid))
      break
    case 'metadata-sei-user-data-unregistered':
      uuid = event.data.uuid
      payload = event.data.payload
      break
    default:
      break
  }
})
