import { VideoCodec } from '../types/Codecs.types'
import { PublishConnectOptions } from '../types/Publish.types'

class ValidationError extends Error {
  messages: string[]

  constructor(messages: string[]) {
    super('Validation Failed')
    this.name = 'ValidationError'
    this.messages = messages
  }
}

const isString = (value: unknown) => typeof value === 'string'

const isNumber = (value: unknown) => typeof value === 'number'

const isBoolean = (value: unknown) => typeof value === 'boolean'

const isArray = (value: unknown) => Array.isArray(value)

const isObject = (value: unknown) => typeof value === 'object' && value !== null && !Array.isArray(value)

const isSupporedVideoCodec = (value: unknown): value is VideoCodec =>
  Object.values(VideoCodec).includes(value as VideoCodec)

export function validatePublishConnectOptions(obj: PublishConnectOptions): {
  error?: ValidationError
  obj: PublishConnectOptions
} {
  const errorMessages: string[] = []
  let error: ValidationError | undefined

  function isPublishConnectOptions(obj: unknown): obj is PublishConnectOptions {
    if (!(typeof obj === 'object' && obj !== null && !Array.isArray(obj))) {
      errorMessages.push(`Publish Connection Options is not an object: ${obj}`)
      return false
    }

    if ('sourceId' in obj && !isString(obj.sourceId)) {
      errorMessages.push(`Invalid sourceId: ${obj.sourceId}`)
    }

    if ('stereo' in obj && !isBoolean(obj.stereo)) {
      errorMessages.push(`Invalid stereo: ${obj.stereo}`)
    }
    if ('dtx' in obj && !isBoolean(obj.dtx)) {
      errorMessages.push(`Invalid dtx: ${obj.dtx}`)
    }
    if ('absCaptureTime' in obj && !isBoolean(obj.absCaptureTime)) {
      errorMessages.push(`Invalid absCaptureTime: ${obj.absCaptureTime}`)
    }
    if ('dependencyDescriptor' in obj && !isBoolean(obj.dependencyDescriptor)) {
      errorMessages.push(`Invalid dependencyDescriptor: ${obj.dependencyDescriptor}`)
    }
    if (!('mediaStream' in obj)) {
      errorMessages.push(`MediaStream required`)
    } else if (isObject(obj.mediaStream) || (isArray(obj.mediaStream) && obj.mediaStream.every(isObject))) {
      errorMessages.push(`Invalid mediaStream: ${obj.mediaStream}`)
    }
    if ('bandwidth' in obj && !isNumber(obj.bandwidth)) {
      errorMessages.push(`Invalid bandwidth: ${obj.bandwidth}`)
    }
    if ('metadata' in obj && !isBoolean(obj.metadata)) {
      errorMessages.push(`Invalid metadata: ${obj.metadata}`)
    }
    if ('disableVideo' in obj && !isBoolean(obj.disableVideo)) {
      errorMessages.push(`Invalid disableVideo: ${obj.disableVideo}`)
    }
    if ('disableAudio' in obj && !isBoolean(obj.disableAudio)) {
      errorMessages.push(`Invalid disableAudio: ${obj.disableAudio}`)
    }
    if ('codec' in obj && isSupporedVideoCodec(obj.codec)) {
      errorMessages.push(`Invalid codec: ${obj.codec}`)
    }
    if ('simulcast' in obj && !isBoolean(obj.simulcast)) {
      errorMessages.push(`Invalid simulcast: ${obj.simulcast}`)
    }
    if ('scalabilityMode' in obj && !isString(obj.scalabilityMode)) {
      errorMessages.push(`Invalid scalabilityMode: ${obj.scalabilityMode}`)
    }
    if ('peerConfig' in obj && !isObject(obj.peerConfig)) {
      errorMessages.push(`Invalid peerConfig: ${obj.peerConfig}`)
    }
    if ('record' in obj && !isBoolean(obj.record)) {
      errorMessages.push(`Invalid record: ${obj.record}`)
    }
    if (
      'events' in obj &&
      (!isArray(obj.events) ||
        obj.events.every(
          (event: unknown) => isString(event) && ['active', 'inactive', 'viewercount'].includes(event)
        ))
    ) {
      errorMessages.push(`Invalid events: ${obj.events}`)
    }
    if ('priority' in obj && !isNumber(obj.priority)) {
      errorMessages.push(`Invalid priority: ${obj.priority}`)
    }

    return true
  }

  isPublishConnectOptions(obj)

  if (errorMessages.length) {
    error = new ValidationError(errorMessages)
  }
  return { error: error, obj }
}
