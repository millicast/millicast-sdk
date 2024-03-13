import {
  SEIExtractor, SEIMessageType,
  startMetadataSyncService, MessageData,
} from "nal-extractor"

export type Metadata = string

function unregRawData(uuid: bigint, data: Uint8Array): Uint8Array {
  const rawData = new Uint8Array(16 + data.length)
  for (let i = 0; i < 16; i++)
    rawData[15-i] = Number((uuid >> BigInt(i*8)) & 0xFFn)
  rawData.set(data, 16)
  return rawData
}

startMetadataSyncService(() => {
  const extractor = new SEIExtractor({ enableUserDataUnregistered: true })
  const textDecoder = new TextDecoder()

  return (frame: RTCEncodedVideoFrame): MessageData<Metadata> | undefined => {
    const metas = extractor.processAU(frame.data)

    const timings = metas.flatMap(meta =>
      meta.type === SEIMessageType.USER_DATA_UNREGISTERED
      ? [unregRawData(meta.uuid, meta.data)] : [])
    if (timings.length !== 1)
      console.warn(timings.length, 'timecode messages found in AU', frame.timestamp)
    return timings[0] ? [textDecoder.decode(timings[0]), []] : undefined
  }
})
