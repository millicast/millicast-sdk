import {
  SEIExtractor, SEIMessageType,
  startMetadataSyncService, MessageData,
} from "nal-extractor"

export type Metadata = string

startMetadataSyncService(() => {
  const extractor = new SEIExtractor({ enableUserDataUnregistered: true })
  const textDecoder = new TextDecoder()

  return (frame: RTCEncodedVideoFrame): MessageData<Metadata> | undefined => {
    // extract SEI messages
    const metas = extractor.processAU(frame.data)

    // filter only our messages
    const timings = metas.flatMap(meta =>
      meta.type === SEIMessageType.USER_DATA_UNREGISTERED
      ? [meta.data] : [])

    if (timings.length !== 1)
      console.warn(timings.length, 'timecode messages found in AU', frame.timestamp)

    // decode bytes into UTF-8 text
    return timings[0] ? [textDecoder.decode(timings[0]), []] : undefined
  }
})
