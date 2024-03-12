import { extractH26xSEI } from '../utils/Codecs'

function createReceiverTransform () {
  return new TransformStream({
    start () {},
    flush () {},
    async transform (encodedFrame, controller) {
      const seis = extractH26xSEI(new Uint8Array(encodedFrame.data), 'h264')
      if (seis.length > 0) {
        self.postMessage({ metadata: seis })
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
      setupPipe(event.data, createSenderTransform())
      break
    case 'insertable-streams-receiver':
      setupPipe(event.data, createReceiverTransform())
      break
    default:
      break
  }
})
