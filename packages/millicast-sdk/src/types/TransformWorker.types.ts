import { type VideoCodec } from './Codecs.types'
import { type SEIUserUnregisteredData } from './View.types'

export interface TransformWorkerSeiMetadata {
  uuid: string
  timecode?: number
  payload: SEIUserUnregisteredData
}

export interface TransformEvent {
  transformer: {
    options: {
      name: string
      payloadTypeCodec: Record<number, string>
      codec: VideoCodec
      mid: string
    }
    readable: ReadableStream
    writable: WritableStream
  }
}
