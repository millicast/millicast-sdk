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

export function validatePublishConnectOptions(obj: any): {
  error?: ValidationError
  value: PublishConnectOptions
} {
  const errorMessages: string[] = []
  let error: ValidationError | undefined

  if (!isObject(obj)) {
    return { error: new ValidationError([`Publish Connection Options must be an object`]), value: obj }
  }

  if (obj.sourceId && !isString(obj.sourceId)) {
    errorMessages.push(`Invalid sourceId: ${obj.sourceId}`)
  }

  if (obj.stereo in obj && !isBoolean(obj.stereo)) {
    errorMessages.push(`Invalid stereo: ${obj.stereo}`)
  }
  if (obj.dtx && !isBoolean(obj.dtx)) {
    errorMessages.push(`Invalid dtx: ${obj.dtx}`)
  }
  if (obj.absCaptureTime && !isBoolean(obj.absCaptureTime)) {
    errorMessages.push(`Invalid absCaptureTime: ${obj.absCaptureTime}`)
  }
  if (obj.dependencyDescriptor && !isBoolean(obj.dependencyDescriptor)) {
    errorMessages.push(`Invalid dependencyDescriptor: ${obj.dependencyDescriptor}`)
  }
  if (
    obj.mediaStream !== undefined &&
    !isObject(obj.mediaStream) &&
    !(isArray(obj.mediaStream) && obj.mediaStream.every(isObject))
  ) {
    errorMessages.push(`Invalid mediaStream: ${obj.mediaStream}`)
  }
  if (obj.bandwidth && !isNumber(obj.bandwidth)) {
    errorMessages.push(`Invalid bandwidth: ${obj.bandwidth}`)
  }
  if (obj.metadata && !isBoolean(obj.metadata)) {
    errorMessages.push(`Invalid metadata: ${obj.metadata}`)
  }
  if (obj.disableVideo && !isBoolean(obj.disableVideo)) {
    errorMessages.push(`Invalid disableVideo: ${obj.disableVideo}`)
  }
  if (obj.disableAudio && !isBoolean(obj.disableAudio)) {
    errorMessages.push(`Invalid disableAudio: ${obj.disableAudio}`)
  }
  console.log('!!! videocodec: ', obj.codec)
  console.log('!!!! isSupporedVideoCodec: ', isSupporedVideoCodec(obj.codec))
  if (obj.codec !== undefined && !isSupporedVideoCodec(obj.codec)) {
    errorMessages.push(`Invalid codec: ${obj.codec}`)
  }
  if (obj.simulcast && !isBoolean(obj.simulcast)) {
    errorMessages.push(`Invalid simulcast: ${obj.simulcast}`)
  }
  if (obj.scalabilityMode && !isString(obj.scalabilityMode)) {
    errorMessages.push(`Invalid scalabilityMode: ${obj.scalabilityMode}`)
  }
  if (obj.peerConfig && !isObject(obj.peerConfig)) {
    errorMessages.push(`Invalid peerConfig: ${obj.peerConfig}`)
  }
  if (obj.record && !isBoolean(obj.record)) {
    errorMessages.push(`Invalid record: ${obj.record}`)
  }
  if (
    obj.events &&
    (!isArray(obj.events) ||
      !obj.events.every(
        (event: unknown) => isString(event) && ['active', 'inactive', 'viewercount'].includes(event)
      ))
  ) {
    errorMessages.push(`Invalid events: ${obj.events}`)
  }
  if (obj.priority && !isNumber(obj.priority)) {
    errorMessages.push(`Invalid priority: ${obj.priority}`)
  }

  if (errorMessages.length) {
    error = new ValidationError(errorMessages)
  }
  return { error: error, value: obj }
}
