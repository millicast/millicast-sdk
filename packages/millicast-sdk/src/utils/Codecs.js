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
  H265: 'h265'
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
  MULTIOPUS: 'multiopus'
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
  PPS_H265: 34
}

const SEI_Payload_Type = {
  PIC_TIMING: 1,
  USER_DATA_UNREGISTERED: 5
}

class SPSState {
  constructor (codec = 'h264') {
    this.sps = new Map()
    this.pps = new Map()
    this.activeSPS = null
    this.codec = codec
  }

  collectPPS (rbsp) {
    if (this.codec === 'h264') {
      this.collectH264PPS(rbsp)
    } else {
      this.collectH265PPS(rbsp)
    }
  }

  collectSPS (rbsp) {
    if (this.codec === 'h264') {
      this.collectH264SPS(rbsp)
    } else {
      this.collectH265SPS(rbsp)
    }
  }

  collectH264SPS (rbsp) {
    const reader = new BitStreamReader(rbsp)
    const profile_idc = reader.readBits(8)
    reader.skip(8) // skip 8bits constraint set flag and reserved_zero_2bits
    reader.skip(8) // level_idc
    const seq_parameter_set_id = reader.readExpGolombUnsigned()
    if (seq_parameter_set_id > 31 || seq_parameter_set_id < 0) {
      throw new Error('Invalid seq_parameter_set_id')
    }
    if ([100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134, 135].includes(profile_idc)) {
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
        const sizeOfScalingList = (chroma_format_idc !== 3) ? 8 : 12
        for (let i = 0; i < sizeOfScalingList; i++) {
          if (reader.readBits(1)) {
            const sizeOfScalingList = (i < 6) ? 16 : 64
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
      if (reader.readBits(1)) {
        reader.skip(32) // num_units_in_tick
        reader.skip(32) // time_scale
        reader.skip(1) // fixed_frame_rate_flag
      }

      function parseHRDParameters (reader) {
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
          time_offset_length
        }
      }

      const nal_hrd_parameters = reader.readBits(1) ? parseHRDParameters(reader) : undefined
      const vcl_hrd_parameters = reader.readBits(1) ? parseHRDParameters(reader) : undefined
      if (nal_hrd_parameters || vcl_hrd_parameters) {
        reader.skip(1) // low_delay_hrd_flag
      }
      const pic_struct_present_flag = reader.readBits(1)
      vui_parameters = {
        nal_hrd_parameters,
        vcl_hrd_parameters,
        pic_struct_present_flag
      }
    }
    this.sps.set(seq_parameter_set_id, {
      vui_parameters
    })
  }

  collectH265SPS (rbsp) {}

  collectH264PPS (rbsp) {
    const reader = new BitStreamReader(rbsp)
    const pic_parameter_set_id = reader.readExpGolombUnsigned()
    if (pic_parameter_set_id > 255 || pic_parameter_set_id < 0) {
      throw new Error('Invalid pic_parameter_set_id')
    }
    const seq_parameter_set_id = reader.readExpGolombUnsigned()
    this.pps.set(pic_parameter_set_id, {
      seq_parameter_set_id
    })
  }

  collectH265PPS (rbsp) {}

  findActiveSPS (rbsp) {
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

function findStartCodeIndex (frameBuffer, offset) {
  while (offset < frameBuffer.byteLength - 4) {
    if ((frameBuffer[offset] === 0x00 && frameBuffer[offset + 1] === 0x00) &&
        (frameBuffer[offset + 2] === 0x01 ||
        (frameBuffer[offset + 2] === 0x00 && frameBuffer[offset + 3] === 0x01))) {
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
function removePreventionBytes (ebsp) {
  const output = new Uint8Array(ebsp.byteLength)
  let outOffset = 0
  let ebspOffset = 0
  for (let preventionByteIdx = 2; preventionByteIdx < ebsp.byteLength; preventionByteIdx++) {
    if (ebsp[preventionByteIdx] === 0x03 && ebsp[preventionByteIdx - 1] === 0x00 && ebsp[preventionByteIdx - 2] === 0x00) {
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

function getNalus (frameBuffer, codec) {
  let offset = 0
  const headerSize = codec === 'h264' ? 1 : 2
  const nalus = []
  while (offset < frameBuffer.byteLength - 4) {
    const startCodeIndex = findStartCodeIndex(frameBuffer, offset)
    if (startCodeIndex >= offset) {
      // found the NAL unit start code
      const startCodeLength = frameBuffer[startCodeIndex + 2] === 0x01 ? 3 : 4
      // find the start index of next NAL unit
      const nextStartCodeIndex = findStartCodeIndex(frameBuffer, startCodeIndex + startCodeLength + headerSize)
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

function getSeiNalus (frameBuffer, codec) {
  let shouldSearchActiveSPS = true
  return getNalus(frameBuffer, codec).filter((nalu) => {
    const startCodeLength = nalu[2] === 0x01 ? 3 : 4
    const headerLength = codec === 'h264' ? 1 : 2
    const header = nalu[startCodeLength]
    const naluType = codec === 'h264' ? header & 0x1f : header >> 1 & 0x3f
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
          spsState.findActiveSPS(removePreventionBytes(nalu.subarray(startCodeLength + headerLength)))
          shouldSearchActiveSPS = false
          break
        default:
          break
      }
    }
    return [NALUType.SEI_H264, NALUType.SEI_H265_PREFIX, NALUType.SEI_H265_SUFFIX].includes(naluType)
  })
}

function extractSEIPayload (rbsp) {
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
    content: rbsp.subarray(idx, idx + payloadSize)
  }
}

function getSeiUserUnregisteredData (payloadContent) {
  let idx = 0
  const uuid = payloadContent.subarray(idx, idx + 16)
  idx += 16
  const data = payloadContent.subarray(idx)
  return { uuid, data }
}

function getSeiPicTimingTimecode (payloadContent) {
  if (!spsState.activeSPS) {
    throw new Error('Cannot find the active SPS')
  }
  const hrdParameters = spsState.activeSPS.vui_parameters.nal_hrd_parameters ?? spsState.activeSPS.vui_parameters.vcl_hrd_parameters
  const options = {
    cpb_dpb_delays_present_flag: hrdParameters ? 1 : 0,
    cpb_removal_delay_length_minus1: hrdParameters?.cpb_removal_delay_length_minus1 ?? 23,
    dpb_output_delay_length_minus1: hrdParameters?.dpb_output_delay_length_minus1 ?? 23,
    time_offset_length: hrdParameters?.time_offset_length ?? 24,
    pic_struct_present_flag: spsState.activeSPS.vui_parameters.pic_struct_present_flag ?? 0
  }
  if (!options.pic_struct_present_flag) {
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
      try {
        timecode.time_offset = reader.readBits(options.time_offset_length)
      } catch (err) {
        console.error('Failed to read time_offset', err)
        timecode.time_offset = 0
      }
      timecodes.push(timecode)
    }
  }
  return timecodes
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
* @param { 'h264' | 'h265' } codec
* @returns { FrameMetaData }
*/
export function extractH26xMetadata (encodedFrame, codec) {
  if (codec !== 'h264' && codec !== 'h265') {
    throw new Error(`Unsupported codec ${codec}`)
  }
  const seiUserUnregisteredDataArray = []
  let seiPicTimingTimeCodeArray
  spsState.codec = codec
  getSeiNalus(new Uint8Array(encodedFrame.data), codec).forEach((nalu) => {
    const startCodeLength = nalu[2] === 0x01 ? 3 : 4
    const headerLength = codec === 'h264' ? 1 : 2
    const rbsp = removePreventionBytes(nalu.subarray(startCodeLength + headerLength))
    const payload = extractSEIPayload(rbsp)
    switch (payload.type) {
      case SEI_Payload_Type.PIC_TIMING:
        seiPicTimingTimeCodeArray = getSeiPicTimingTimecode(payload.content)
        break
      case SEI_Payload_Type.USER_DATA_UNREGISTERED:
        seiUserUnregisteredDataArray.push(getSeiUserUnregisteredData(payload.content))
        break
      default:
        break
    }
  })
  return {
    timestamp: encodedFrame.timestamp,
    seiUserUnregisteredDataArray,
    seiPicTimingTimeCodeArray
  }
}

export function addH26xSEI ({ uuid, payload }, encodedFrame, codec) {
  if (codec !== 'h264' && codec !== 'h265') {
    throw new Error(`Unsupported codec ${codec}`)
  }
  // TODO: create new Uint8Array as NAL unit. NAL unit format is start code + header + sei type + payload then push to the original NAL units array
  return encodedFrame
}
