import {
  SEIExtractor, SEIMessageType,
  startMetadataSyncService, MessageData,
} from "nal-extractor"

export type Metadata = bigint

startMetadataSyncService(() => {
  const extractor = new SEIExtractor({ enableUserDataUnregistered: true })

  function extractTimestamp(frame: RTCEncodedVideoFrame): MessageData<Metadata> | undefined {
    const metas = extractor.processAU(frame.data)

    const timings = metas.flatMap(meta =>
      meta.type === SEIMessageType.USER_DATA_UNREGISTERED &&
      (meta.uuid === 0x9a21f3be31f04b78b0bec7f7dbb97250n || meta.uuid === 0x00112233445566778899AABBCCDDEEFFn)
      ? [meta.data] : [])
    if (timings.length > 1)
      throw new Error('multiple timecode metadata messages in AU')
    if (timings.length < 1)
      console.warn('timecode metadata not present in AU', frame.timestamp)
    return timings[0] ? [processTimingMeta(timings[0]), []] : undefined
  }

  function processTimingMeta(x: Uint8Array) {
    if (x.length !== 8)
      throw new Error(`invalid payload length ${x.length}`)
    return new DataView(x.buffer, x.byteOffset, x.byteLength).getBigUint64(0)
  }

  return extractTimestamp
})