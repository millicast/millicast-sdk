/* eslint-disable no-new-wrappers */
/* eslint-disable camelcase */
import BitStreamReader from './BitStreamReader'
/**
 * Enum of Millicast supported Video codecs
 * @readonly
 * @enum {String}
 * @property {String} VP8
 * @property {String} VP9
 * @property {String} H264
 * @property {String} AV1
 * @property {String} H265 - Only available in Safari
 */
export const VideoCodec = {
  VP8: 'vp8',
  VP9: 'vp9',
  H264: 'h264',
  AV1: 'av1',
  H265: 'h265',
}

/**
 * Enum of Millicast supported Audio codecs
 * @readonly
 * @enum {String}
 * @property {String} OPUS
 * @property {String} MULTIOPUS
 */
export const AudioCodec = {
  OPUS: 'opus',
  MULTIOPUS: 'multiopus',
}

const NALUType = {
  SLICE_NON_IDR: 1,
  SLICE_PARTITION_A: 2,
  SLICE_IDR: 5,
  SEI_H264: 6,
  SEI_H265_PREFIX: 39,
  SEI_H265_SUFFIX: 40,
  SPS_H264: 7,
  SPS_H265: 33,
  PPS_H264: 8,
  PPS_H265: 34,
}

const SEI_Payload_Type = {
  PIC_TIMING: 1,
  USER_DATA_UNREGISTERED: 5,
}

const UNREGISTERED_MESSAGE_TYPE = {
  LEGACY: 1,
  NEW: 2,
  TIMECODE: 3,
  OTHER: 4,
}

// Old UUID - used by SDK 0.1.46 and before. No longer actively used (only for backwards compatibility purposes)
export const DOLBY_SEI_DATA_UUID = '6e9cfd2a-5907-49ff-b363-8978a6e8340e'
// AMF/KLV timestamps
export const DOLBY_SEI_TIMESTAMP_UUID = '9a21f3be-31f0-4b78-b0be-c7f7dbb97250'
// When the SDK inserts its own timecode into the unregistered block, it uses this identifier
export const DOLBY_SDK_TIMESTAMP_UUID = 'd40e38ea-d419-4c62-94ed-20ac37b4e4fa'

class SPSState {
  constructor(codec = 'H264') {
    this.sps = new Map()
    this.pps = new Map()
    this.activeSPS = null
    this.codec = codec
  }

  collectPPS(rbsp) {
    if (this.codec === 'H264') {
      this.collectH264PPS(rbsp)
    } else {
      this.collectH265PPS(rbsp)
    }
  }

  collectSPS(rbsp) {
    if (this.codec === 'H264') {
      this.collectH264SPS(rbsp)
    } else {
      this.collectH265SPS(rbsp)
    }
  }

  collectH264SPS(rbsp) {
    const reader = new BitStreamReader(rbsp)
    const profile_idc = reader.readBits(8)
    const supported_profiles = [100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134, 135]
    reader.skip(8) // skip 8bits constraint set flag and reserved_zero_2bits
    reader.skip(8) // level_idc
    const seq_parameter_set_id = reader.readExpGolombUnsigned()
    if (seq_parameter_set_id > 31 || seq_parameter_set_id < 0) {
      throw new Error('Invalid seq_parameter_set_id')
    }
    if (supported_profiles.includes(profile_idc)) {
      const chroma_format_idc = reader.readExpGolombUnsigned()
      if (chroma_format_idc === 3) {
        reader.skip(1) // separate_colour_plane_flag
      }
      reader.readExpGolombUnsigned() // bit_depth_luma_minus8
      reader.readExpGolombUnsigned() // bit_depth_chroma_minus8
      reader.skip(1) // qpprime_y_zero_transform_bypass_flag
      const seq_scaling_matrix_present_flag = reader.readBits(1)
      if (seq_scaling_matrix_present_flag) {
        // parse scaling matrix, since we don't need the result, just read and skip it
        const sizeOfScalingList = chroma_format_idc !== 3 ? 8 : 12
        for (let i = 0; i < sizeOfScalingList; i++) {
          if (reader.readBits(1)) {
            const sizeOfScalingList = i < 6 ? 16 : 64
            let lastScale = 8
            let nextScale = 8
            for (let j = 0; j < sizeOfScalingList; j++) {
              if (nextScale !== 0) {
                const delta_scale = reader.readExpGolombSigned()
                nextScale = (lastScale + delta_scale + 256) % 256
              }
              lastScale = nextScale === 0 ? lastScale : nextScale
            }
          }
        }
      }
    }
    reader.readExpGolombUnsigned() // log2_max_frame_num_minus4
    const pic_order_cnt_type = reader.readExpGolombUnsigned()
    if (pic_order_cnt_type === 0) {
      reader.readExpGolombUnsigned() // log2_max_pic_order_cnt_lsb_minus4
    } else if (pic_order_cnt_type === 1) {
      reader.skip(1) // delta_pic_order_always_zero_flag
      reader.readExpGolombSigned() // offset_for_non_ref_pic
      reader.readExpGolombSigned() // offset_for_top_to_bottom_field
      const num_ref_frames_in_pic_order_cnt_cycle = reader.readExpGolombUnsigned()
      for (let i = 0; i < num_ref_frames_in_pic_order_cnt_cycle; i++) {
        // parse offset_for_ref_frame
        reader.readExpGolombSigned()
      }
    }
    reader.readExpGolombUnsigned() // max_num_ref_frames
    reader.skip(1) // gaps_in_frame_num_value_allowed_flag
    reader.readExpGolombUnsigned() // pic_width_in_mbs_minus1
    reader.readExpGolombUnsigned() // pic_height_in_map_units_minus1
    if (reader.readBits(1) === 0) reader.skip(1) // frame_mbs_only_flag and mb_adaptive_frame_field_flag
    reader.skip(1) // direct_8x8_inference_flag
    // parse frame_crop
    if (reader.readBits(1)) {
      reader.readExpGolombUnsigned() // frame_crop_left_offset
      reader.readExpGolombUnsigned() // frame_crop_right_offset
      reader.readExpGolombUnsigned() // frame_crop_top_offset
      reader.readExpGolombUnsigned() // frame_crop_bottom_offset
    }
    // parse vui_parameters
    let vui_parameters
    if (reader.readBits(1)) {
      // aspect_ratio_info
      if (reader.readBits(1)) {
        const aspect_ratio_idc = reader.readBits(8)
        if (aspect_ratio_idc === 255) {
          // Extended_SAR
          reader.skip(16)
          reader.skip(16)
        }
      }
      // overscan_info
      if (reader.readBits(1)) {
        reader.skip(1)
      }
      // video_signal_type
      if (reader.readBits(1)) {
        reader.skip(3) // video_format
        reader.skip(1) // video_full_range_flag
        if (reader.readBits(1)) {
          // colour_description
          reader.skip(24)
        }
      }
      // chroma_loc_info
      if (reader.readBits(1)) {
        reader.readExpGolombUnsigned() // chroma_sample_loc_type_top_field
        reader.readExpGolombUnsigned() // chroma_sample_loc_type_bottom_field
      }
      // timing_info
      const timing_info = reader.readBits(1)
        ? {
            num_units_in_tick: reader.readBits(32),
            time_scale: reader.readBits(32),
            fixed_frame_rate_flag: reader.readBits(1),
          }
        : undefined

      const parseHRDParameters = (reader) => {
        const cpb_cnt_minus1 = reader.readExpGolombUnsigned()
        reader.skip(4) // bit_rate_scale
        reader.skip(4) // cpb_size_scale
        for (let i = 0; i <= cpb_cnt_minus1; i++) {
          reader.readExpGolombUnsigned() // bit_rate_value_minus1
          reader.readExpGolombUnsigned() // cpb_size_value_minus1
          reader.skip(1) // cbr_flag
        }
        reader.skip(5) // initial_cpb_removal_delay_length_minus1
        const cpb_removal_delay_length_minus1 = reader.readBits(5)
        const dpb_output_delay_length_minus1 = reader.readBits(5)
        const time_offset_length = reader.readBits(5)
        return {
          cpb_removal_delay_length_minus1,
          dpb_output_delay_length_minus1,
          time_offset_length,
        }
      }

      const nal_hrd_parameters = reader.readBits(1) ? parseHRDParameters(reader) : undefined
      const vcl_hrd_parameters = reader.readBits(1) ? parseHRDParameters(reader) : undefined
      if (nal_hrd_parameters || vcl_hrd_parameters) {
        reader.skip(1) // low_delay_hrd_flag
      }
      const pic_struct_present_flag = reader.readBits(1)
      vui_parameters = {
        timing_info,
        nal_hrd_parameters,
        vcl_hrd_parameters,
        pic_struct_present_flag,
      }
    }
    this.sps.set(seq_parameter_set_id, {
      vui_parameters,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  collectH265SPS(rbsp) {
    // TODO: parse H265 SPS
  }

  collectH264PPS(rbsp) {
    const reader = new BitStreamReader(rbsp)
    const pic_parameter_set_id = reader.readExpGolombUnsigned()
    if (pic_parameter_set_id > 255 || pic_parameter_set_id < 0) {
      throw new Error('Invalid pic_parameter_set_id')
    }
    const seq_parameter_set_id = reader.readExpGolombUnsigned()
    this.pps.set(pic_parameter_set_id, {
      seq_parameter_set_id,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  collectH265PPS(rbsp) {
    // TODO: parse H265 PPS
  }

  findActiveSPS(rbsp) {
    // get the seq_parameter_set_id from the slice header
    const reader = new BitStreamReader(rbsp)
    reader.readExpGolombUnsigned() // first_mb_in_slice
    reader.readExpGolombUnsigned() // slice_type
    const pic_parameter_set_id = reader.readExpGolombUnsigned()
    const pps = this.pps.get(pic_parameter_set_id)
    if (pps) {
      const sps = this.sps.get(pps.seq_parameter_set_id)
      if (sps) {
        this.activeSPS = sps
        return
      }
    }
    throw new Error('Cannot find the active SPS')
  }
}

const spsState = new SPSState()

function findStartCodeIndex(frameBuffer, offset) {
  while (offset < frameBuffer.byteLength - 4) {
    if (
      frameBuffer[offset] === 0x00 &&
      frameBuffer[offset + 1] === 0x00 &&
      (frameBuffer[offset + 2] === 0x01 ||
        (frameBuffer[offset + 2] === 0x00 && frameBuffer[offset + 3] === 0x01))
    ) {
      return offset
    } else {
      offset += 1
    }
  }
  return -1
}

// EBSP (Encapsulate Byte Sequence Payload) is a sequence of bytes without start code and header in NAL unit
// which is also aka ...RBSP (Raw Byte Sequence Payload) + 0x03 when there are [0x00, 0x00, <0x01 or 0x02 or 0x03>] in RBSP
// so we need to remove 0x03 byte before we parse the payload data
function removePreventionBytes(ebsp) {
  const output = new Uint8Array(ebsp.byteLength)
  let outOffset = 0
  let ebspOffset = 0
  for (let preventionByteIdx = 2; preventionByteIdx < ebsp.byteLength; preventionByteIdx++) {
    if (
      ebsp[preventionByteIdx] === 0x03 &&
      ebsp[preventionByteIdx - 1] === 0x00 &&
      ebsp[preventionByteIdx - 2] === 0x00
    ) {
      output.set(ebsp.subarray(ebspOffset, preventionByteIdx), outOffset)
      outOffset += preventionByteIdx - ebspOffset
      ebspOffset = preventionByteIdx + 1
    }
  }
  if (ebspOffset < ebsp.byteLength) {
    output.set(ebsp.subarray(ebspOffset), outOffset)
  }
  return output
}

function getNalus(frameBuffer, codec) {
  let offset = 0
  const headerSize = codec === 'H264' ? 1 : 2
  const nalus = []
  while (offset < frameBuffer.byteLength - 4) {
    const startCodeIndex = findStartCodeIndex(frameBuffer, offset)
    if (startCodeIndex >= offset) {
      // found the NAL unit start code
      const startCodeLength = frameBuffer[startCodeIndex + 2] === 0x01 ? 3 : 4
      // find the start index of next NAL unit
      const nextStartCodeIndex = findStartCodeIndex(
        frameBuffer,
        startCodeIndex + startCodeLength + headerSize
      )
      if (nextStartCodeIndex > startCodeIndex) {
        nalus.push(frameBuffer.subarray(startCodeIndex, nextStartCodeIndex))
        offset = nextStartCodeIndex
      } else {
        nalus.push(frameBuffer.subarray(startCodeIndex))
        break
      }
    } else {
      break
    }
  }
  return nalus
}

function getSeiNalus(frameBuffer, codec) {
  let shouldSearchActiveSPS = true
  return getNalus(frameBuffer, codec).filter((nalu) => {
    const startCodeLength = nalu[2] === 0x01 ? 3 : 4
    const headerLength = codec === 'H264' ? 1 : 2
    const header = nalu[startCodeLength]
    const naluType = codec === 'H264' ? header & 0x1f : (header >> 1) & 0x3f
    if (shouldSearchActiveSPS) {
      switch (naluType) {
        case NALUType.PPS_H264:
        case NALUType.PPS_H265:
          spsState.collectPPS(removePreventionBytes(nalu.subarray(startCodeLength + headerLength)))
          break
        case NALUType.SPS_H264:
        case NALUType.SPS_H265:
          spsState.collectSPS(removePreventionBytes(nalu.subarray(startCodeLength + headerLength)))
          break
        case NALUType.SLICE_IDR:
        case NALUType.SLICE_NON_IDR:
        case NALUType.SLICE_PARTITION_A:
          try {
            spsState.findActiveSPS(removePreventionBytes(nalu.subarray(startCodeLength + headerLength)))
            shouldSearchActiveSPS = false
          } catch (err) {
            console.info('Failed to find active SPS. Will not be able to extract PIC timing metadata')
          }
          break
        default:
          break
      }
    }
    return [NALUType.SEI_H264, NALUType.SEI_H265_PREFIX, NALUType.SEI_H265_SUFFIX].includes(naluType)
  })
}

function extractSEIPayload(rbsp) {
  let payloadType = 0
  let idx = 0
  while (rbsp[idx] === 0xff) {
    payloadType += 0xff
    idx++
  }
  payloadType += rbsp[idx]
  idx++
  let payloadSize = 0
  while (rbsp[idx] === 0xff) {
    payloadSize += 0xff
    idx++
  }
  payloadSize += rbsp[idx]
  idx++
  return {
    type: payloadType,
    content: rbsp.subarray(idx, idx + payloadSize),
  }
}

function resolveUnregisteredMessageType(uuid) {
  const timecodeUuid = new Uint8Array(parseUUID(DOLBY_SEI_TIMESTAMP_UUID))
  const legacySdkUuid = new Uint8Array(parseUUID(DOLBY_SEI_DATA_UUID))
  const newSdkUuid = new Uint8Array(parseUUID(DOLBY_SDK_TIMESTAMP_UUID))

  if (timecodeUuid.every((value, index) => value === uuid[index])) return UNREGISTERED_MESSAGE_TYPE.TIMECODE
  if (legacySdkUuid.every((value, index) => value === uuid[index])) return UNREGISTERED_MESSAGE_TYPE.LEGACY
  if (newSdkUuid.every((value, index) => value === uuid[index])) return UNREGISTERED_MESSAGE_TYPE.NEW
  return UNREGISTERED_MESSAGE_TYPE.OTHER
}

function getSeiUserUnregisteredData(metadata, payloadContent) {
  let idx = 0
  metadata.uuid = payloadContent.subarray(idx, idx + 16)
  idx += 16

  // There are 3 possible pathways here
  // the old UUID - where-in there is no timecode in the body
  // the new UUID - where-in there is timecode in the body
  // AMF/KLV timestamps - where there is no other data to parse
  const messageType = resolveUnregisteredMessageType(metadata.uuid)
  const content = payloadContent.subarray(idx)
  switch (messageType) {
    case UNREGISTERED_MESSAGE_TYPE.LEGACY:
    case UNREGISTERED_MESSAGE_TYPE.OTHER:
      metadata.unregistered = content
      break
    case UNREGISTERED_MESSAGE_TYPE.TIMECODE:
      metadata.timecode = convertSEITimestamp(content)
      break
    case UNREGISTERED_MESSAGE_TYPE.NEW: {
      // we need to separate two sub-arrays here - one for timecode and the remainer to unregistered
      // Do not make assumptions on the size of a date object as a byte array
      let index = 0
      const timecodeBufferLength = numberToByteArray(Date.now()).length
      const timecodeSubArray = content.subarray(index, timecodeBufferLength)
      index += timecodeBufferLength
      const metadataSubArray = content.subarray(index)
      metadata.timecode = convertSEITimestamp(timecodeSubArray)
      metadata.unregistered = metadataSubArray
      break
    }
  }
}

function convertSEITimestamp(data) {
  const timestampBigInt = data.reduce((acc, byte) => (acc << BigInt(8)) + BigInt(byte), BigInt(0))
  const milliseconds = Number(timestampBigInt)
  const date = new Date(milliseconds)
  const dateEncoded = new TextEncoder().encode(date.toISOString())
  return dateEncoded
}

function getSeiPicTimingTimecode(metadata, payloadContent) {
  if (!spsState.activeSPS) {
    console.warn('Cannot find the active SPS')
    return
  }
  const hrdParameters =
    spsState.activeSPS.vui_parameters.nal_hrd_parameters ??
    spsState.activeSPS.vui_parameters.vcl_hrd_parameters
  const options = {
    cpb_dpb_delays_present_flag: hrdParameters ? 1 : 0,
    cpb_removal_delay_length_minus1: hrdParameters?.cpb_removal_delay_length_minus1 ?? 23,
    dpb_output_delay_length_minus1: hrdParameters?.dpb_output_delay_length_minus1 ?? 23,
    time_offset_length: hrdParameters ? hrdParameters.time_offset_length ?? 24 : undefined,
    pic_struct_present_flag: spsState.activeSPS.vui_parameters.pic_struct_present_flag ?? 0,
  }
  if (!options.pic_struct_present_flag) {
    console.warn('pic_struct_present_flag is not present')
    return undefined
  }
  const reader = new BitStreamReader(payloadContent)
  if (options.cpb_dpb_delays_present_flag) {
    reader.skip(options.cpb_removal_delay_length_minus1 + 1) // cpb_removal_delay
    reader.skip(options.dpb_output_delay_length_minus1 + 1) // dpb_output_delay
  }

  const picStructNumClockTS = [1, 1, 1, 2, 2, 3, 3, 2, 3]
  const pic_struct = reader.readBits(4)
  if (pic_struct >= picStructNumClockTS.length) {
    throw new Error('Invalid pic_struct')
  }
  const numClockTS = picStructNumClockTS[pic_struct]
  const timecodes = []
  for (let i = 0; i < numClockTS; i++) {
    const clock_timestamp_flag = reader.readBits(1)
    if (clock_timestamp_flag) {
      const timecode = {}
      reader.skip(2) // ct_type
      reader.skip(1) // nuit_field_based_flag
      reader.skip(5) // counting_type
      const full_timestamp_flag = reader.readBits(1)
      reader.skip(2) // discontinuity_flag, cnt_dropped_flag
      timecode.n_frames = reader.readBits(8)
      if (full_timestamp_flag) {
        timecode.seconds_value = reader.readBits(6)
        timecode.minutes_value = reader.readBits(6)
        timecode.hours_value = reader.readBits(5)
      } else {
        const seconds_flag = reader.readBits(1)
        if (seconds_flag) {
          timecode.seconds_value = reader.readBits(6)
          const minutes_flag = reader.readBits(1)
          if (minutes_flag) {
            timecode.minutes_value = reader.readBits(6)
            const hours_flag = reader.readBits(1)
            if (hours_flag) {
              timecode.hours_value = reader.readBits(5)
            }
          }
        }
      }
      if (options.time_offset_length) {
        try {
          timecode.time_offset = reader.readBits(options.time_offset_length)
        } catch (err) {
          console.error('Failed to read time_offset', err)
          timecode.time_offset = 0
        }
      } else {
        timecode.time_offset = 0
      }
      timecodes.push(timecode)
    }
  }
  metadata.seiPicTimingTimeCodeArray = timecodes
}

/**
 * SEI User unregistered data
 * @typedef {object} SEIUserUnregisteredData
 * @global
 * @property {string} uuid - the UUID of the SEI user unregistered data
 * @property {Uint8Array} data - the binary content of the SEI user unregistered data
 */

/**
 * SEI Pic timing time code
 * @typedef {object} SEIPicTimingTimeCode
 * @global
 * @property {number} seconds
 * @property {number} minutes
 * @property {number} hours
 * @property {number} n_frames
 * @property {number} time_offset
 */

/**
 * Metadata of the Encoded Frame
 * @typedef {object} FrameMetaData
 * @global
 * @property {number} timestamp - the time at which frame sampling started, value is a positive integer containing the sampling instant of the first byte in this frame, in microseconds
 * @property { Array<SEIUserUnregisteredData> } seiUserUnregisteredDataArray - the SEI user unregistered data array
 * @property { Array<SEIPicTimingTimeCode> } [seiPicTimingTimeCodeArray] - the SEI pic timing time codes
 */

/**
 * Extract user unregistered metadata from H26x Encoded Frame
 * @param { RTCEncodedFrame } encodedFrame
 * @param { 'H264' | 'H265' } codec
 * @returns { FrameMetaData }
 */
export function extractH26xMetadata(encodedFrame, codec) {
  if (codec !== 'H264' && codec !== 'H265') {
    throw new Error(`Unsupported codec ${codec}`)
  }
  const metadata = {}
  spsState.codec = codec
  getSeiNalus(new Uint8Array(encodedFrame.data), codec).forEach((nalu) => {
    const startCodeLength = nalu[2] === 0x01 ? 3 : 4
    const headerLength = codec === 'H264' ? 1 : 2
    const rbsp = removePreventionBytes(nalu.subarray(startCodeLength + headerLength))
    const payload = extractSEIPayload(rbsp)
    switch (payload.type) {
      case SEI_Payload_Type.PIC_TIMING:
        getSeiPicTimingTimecode(metadata, payload.content)
        break
      case SEI_Payload_Type.USER_DATA_UNREGISTERED:
        getSeiUserUnregisteredData(metadata, payload.content)
        break
      default:
        break
    }
  })
  return metadata
}

function isValidUUID(uuid) {
  const uuidRegEx = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  return uuidRegEx.test(uuid)
}

function parseUUID(uuid) {
  return uuid
    .replace(/-/g, '')
    .match(/.{1,2}/g)
    .map((byte) => parseInt(byte, 16))
}

function createSEIMessageContent(uuid, payload, timecode) {
  const uuidArray = new Uint8Array(parseUUID(uuid))
  const timecodeArray = numberToByteArray(timecode)
  const payloadArray = new TextEncoder().encode(JSON.stringify(payload))
  const content = new Uint8Array(uuidArray.length + timecodeArray.length + payloadArray.length)
  content.set(uuidArray)
  content.set(timecodeArray, uuidArray.length)
  content.set(payloadArray, timecodeArray.length + uuidArray.length)

  return content
}

function createSEITypeAndSize(content) {
  const payloadSize = []
  const ffBytes = Math.floor(content.byteLength / 255)
  const lastPayloadTypeByte = content.byteLength % 255
  for (let i = 0; i < ffBytes; i++) {
    payloadSize.push(0xff)
  }
  payloadSize.push(lastPayloadTypeByte)

  return new Uint8Array([0x05, ...payloadSize])
}

function createSEIMessageContentWithPrevensionBytes(content) {
  const preventionByteArray = []

  for (let i = 0; i < content.byteLength; i++) {
    if (
      i + 2 < content.byteLength &&
      [0x00, 0x01, 0x02, 0x03].includes(content[i + 2]) &&
      content[i] === 0x00 &&
      content[i + 1] === 0x00
    ) {
      preventionByteArray.push(content[i])
      preventionByteArray.push(content[i + 1])
      i += 2
      preventionByteArray.push(0x03)
    } else {
      preventionByteArray.push(content[i])
    }
  }

  // trailing bits
  preventionByteArray.push(0x80)

  return new Uint8Array(preventionByteArray)
}

function numberToByteArray(num) {
  const array = []
  if (!isNaN(num)) {
    const bigint = BigInt(num)
    for (let i = 0; i < Math.ceil(Math.floor(Math.log2(new Number(num)) + 1) / 8); i++) {
      array.unshift(new Number((bigint >> BigInt(8 * i)) & BigInt(255)))
    }
  }
  return new Uint8Array(array)
}

function createSEINalu({ uuid, payload, timecode }) {
  const startCode = [0x00, 0x00, 0x00, 0x01]
  const header = [0x66] // 0b01100110
  const content = createSEIMessageContent(uuid, payload, timecode)
  const seiTypeAndSize = createSEITypeAndSize(content)
  const contentWithPreventionBytes = createSEIMessageContentWithPrevensionBytes(content)

  const naluWithSEI = new Uint8Array(
    startCode.length + header.length + seiTypeAndSize.length + contentWithPreventionBytes.length
  )
  naluWithSEI.set(startCode)
  naluWithSEI.set(header, startCode.length)
  naluWithSEI.set(seiTypeAndSize, startCode.length + header.length)
  naluWithSEI.set(contentWithPreventionBytes, startCode.length + header.length + seiTypeAndSize.length)

  return naluWithSEI
}

export function addH26xSEI({ uuid, payload, timecode }, encodedFrame) {
  if (uuid === '' || payload === '') {
    throw new Error('uuid and payload cannot be empty')
  }
  if (!isValidUUID(uuid)) {
    console.warn('Invalid UUID. Using default UUID.')
    uuid = DOLBY_SDK_TIMESTAMP_UUID
    timecode = Date.now()
  }
  // Case of NALU H264 - User Unregistered Data
  const naluWithSEI = createSEINalu({ uuid, payload, timecode })

  const encodedFrameView = new DataView(encodedFrame.data)
  const encodedFrameWithSEI = new ArrayBuffer(encodedFrame.data.byteLength + naluWithSEI.byteLength)
  const encodedFrameWithSEIView = new DataView(encodedFrameWithSEI)

  for (let i = 0; i < encodedFrame.data.byteLength; i++) {
    encodedFrameWithSEIView.setUint8(i, encodedFrameView.getUint8(i))
  }
  for (let i = 0; i < naluWithSEI.byteLength; i++) {
    encodedFrameWithSEIView.setUint8(encodedFrame.data.byteLength + i, naluWithSEI[i])
  }

  encodedFrame.data = encodedFrameWithSEI
}
