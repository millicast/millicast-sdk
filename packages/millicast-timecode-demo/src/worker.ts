import {
  PicStruct, PictureTiming, PictureTimestamp as Timestamp,
  SEIExtractor, SEIMessageType, VUIParameters,
  startMetadataSyncService, MessageData,
} from "nal-extractor"

type TimingInfo = NonNullable<VUIParameters['timing_info']>

export interface Metadata {
  lastTimestamp: Timestamp | undefined,
  timestamp: Timestamp,
  timingInfo: TimingInfo,
}

startMetadataSyncService(() => {
  const extractor = new SEIExtractor({ enablePicTiming: true })

  function extractTimestamp(frame: RTCEncodedVideoFrame): MessageData<Metadata> | undefined {
    const metas = extractor.processAU(frame.data)

    const picTimings = metas.flatMap(meta =>
      meta.type === SEIMessageType.PIC_TIMING ? [meta.message] : [])
    if (picTimings.length > 1)
      throw new Error('multiple picture timing messages in AU')
    if (picTimings.length < 1)
      console.warn('picture timing not present in AU', frame.timestamp)
    return picTimings[0] ? [processPicTiming(picTimings[0]), []] : undefined
  }

  let lastTimestamp: Timestamp | undefined

  function processPicTiming(metadata: PictureTiming) {
    if (metadata.pic_struct !== PicStruct.PROGRESSIVE)
      throw new Error(`invalid pic_struct ${metadata.pic_struct}`)
    if (!metadata.timestamps || !metadata.timestamps[0] || metadata.timestamps[0].ct_type !== 0)
      throw new Error(`invalid or omitted timestamp`)
    const timestamp = metadata.timestamps[0]

    const timingInfo = extractor.psManager.currentSPS?.vui_parameters?.timing_info
    if (!timingInfo)
      throw new Error(`no timing info in current SPS`)

    const result = { lastTimestamp, timestamp, timingInfo }
    lastTimestamp = { ...lastTimestamp, ...timestamp }
    return result
  }

  return extractTimestamp
})
