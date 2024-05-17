import { addH26xSEI, extractH26xMetadata } from '../utils/Codecs'

let uuid = ''
let payload = ''
let codec = ''

function createReceiverTransform () {
  return new TransformStream({
    start () {},
    flush () {},
    async transform (encodedFrame, controller) {
      if (codec === 'video/H264') {
        const metadata = extractH26xMetadata(encodedFrame, 'h264')
        if (metadata.timecode || metadata.unregistered || metadata.seiPicTimingTimeCodeArray?.length > 0) {
          self.postMessage({ metadata })
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
      if (uuid && payload) {
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
    transform = createReceiverTransform()
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
      setupPipe(event.data, createReceiverTransform())
      break
    case 'metadata-sei-user-data-unregistered':
      uuid = event.data.uuid
      payload = event.data.payload
      break
    case 'set-codec':
      codec = event.data.codec || ''
      break
    default:
      break
  }
})
