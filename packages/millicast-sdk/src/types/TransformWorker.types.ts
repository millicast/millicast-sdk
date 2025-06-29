import { VideoCodec } from './Codecs.types'
import { SEIUserUnregisteredData } from './events'

export interface TransformWorkerSeiMetadata {
  uuid: string
  timecode?: number
  payload: SEIUserUnregisteredData
}

export interface TransformEvent {
  transformer: {
    options: {
      name: string
      payloadTypeCodec: { [key: number]: string }
      codec: VideoCodec
      mid: string
    }
    readable: ReadableStream
    writable: WritableStream
  }
}
