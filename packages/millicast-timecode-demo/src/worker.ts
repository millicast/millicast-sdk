import {
  PicStruct, PictureTiming, PictureTimestamp as Timestamp,
  SEIExtractor, SEIMessageType, VUIParameters,
  startMetadataSyncService, MessageData,
} from "nal-extractor"

export type Metadata = bigint

startMetadataSyncService(() => {
  const extractor = new SEIExtractor({ enableUserDataUnregistered: true })

  function extractTimestamp(frame: RTCEncodedVideoFrame): MessageData<Metadata> | undefined {
    const metas = extractor.processAU(frame.data)

    const picTimings = metas.flatMap(meta =>
      meta.type === SEIMessageType.USER_DATA_UNREGISTERED &&
      meta.uuid === 0x00112233445566778899AABBCCDDEEFFn
      ? [meta.data] : [])
    if (picTimings.length > 1)
      throw new Error('multiple picture timing messages in AU')
    if (picTimings.length < 1)
      console.warn('picture timing not present in AU', frame.timestamp)
    return picTimings[0] ? [processPicTiming(picTimings[0]), []] : undefined
  }

  function processPicTiming(x: Uint8Array) {
    if (x.length !== 8)
      throw new Error(`invalid payload length ${x.length}`)
    return new DataView(x.buffer, x.byteOffset, x.byteLength).getBigUint64(0)
  }

  return extractTimestamp
})