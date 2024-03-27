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
  return getNalus(frameBuffer, codec).filter((nalu) => {
    const startCodeLength = nalu[2] === 0x01 ? 3 : 4
    const header = nalu[startCodeLength]
    const naluType = codec === 'h264' ? header & 0x1f : header >> 1 & 0x3f
    return [6, 39, 40].includes(naluType)
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

// eslint-disable-next-line no-unused-vars
function getSeiPicTimingTimecode (payloadContent) {
  // TODO: implementation
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
 * @property {number} [time_offset]
 */

/**
 * Metadata of the Encoded Frame
 * @typedef {object} FrameMetaData
 * @global
 * @property {number} timestamp - the time at which frame sampling started, value is a positive integer containing the sampling instant of the first byte in this frame, in microseconds
 * @property { Array<SEIUserUnregisteredData> } seiUserUnregisteredDataArray - the SEI user unregistered data array
 * @property { SEIPicTimingTimeCode } [seiPicTimingTimeCode] - the SEI pic timing time code
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
  let seiPicTimingTimeCode
  getSeiNalus(new Uint8Array(encodedFrame.data), codec).forEach((nalu) => {
    const startCodeLength = nalu[2] === 0x01 ? 3 : 4
    const headerLength = codec === 'h264' ? 1 : 2
    const rbsp = removePreventionBytes(nalu.subarray(startCodeLength + headerLength))
    const payload = extractSEIPayload(rbsp)
    switch (payload.type) {
      case 1:
        seiPicTimingTimeCode = getSeiPicTimingTimecode(payload.content)
        break
      case 5:
        seiUserUnregisteredDataArray.push(getSeiUserUnregisteredData(payload.content))
        break
      default:
        break
    }
  })
  return {
    timestamp: encodedFrame.timestamp,
    seiUserUnregisteredDataArray,
    seiPicTimingTimeCode
  }
}

export function addH26xSEI ({ uuid, payload }, encodedFrame, codec) {
  if (codec !== 'h264' && codec !== 'h265') {
    throw new Error(`Unsupported codec ${codec}`)
  }
  if (uuid === '' && payload === '') {
    return
  }
  // TODO: create new Uint8Array as NAL unit. NAL unit format is start code + header + sei type (1-SEI_PIC_TIMING, 5-UNREGISTERED) + payload then push to the original NAL units array
  // Example of NALU H264 - unregistered: 0x00 0x00 0x00 0x01 - 0b01100110 (0x66) - 0x05 - uuid+payload
  const startCode = new Uint8Array([0x00, 0x00, 0x00, 0x01])
  const header = new Uint8Array([0x66]) // 0b01100110
  const seiType = new Uint8Array([0x05])
  const content = new TextEncoder().encode(uuid + payload)
  const preventionByteArray = []

  for (let i = 2; i < content.byteLength; i++) {
    if ([0x00, 0x01, 0x02, 0x03].includes(content[i]) && content[i - 1] === 0x00 && content[i - 2] === 0x00) {
      preventionByteArray.push(content[i - 2])
      preventionByteArray.push(content[i - 1])
      i += 2
      preventionByteArray.push([0x03])
    } else {
      preventionByteArray.push(content[i])
    }
  }

  const contentWithPreventionBytes = new Uint8Array(preventionByteArray)

  const naluWithSEI = new Uint8Array(startCode.length + header.length + seiType.length + contentWithPreventionBytes.length)
  naluWithSEI.set(startCode)
  naluWithSEI.set(header, startCode.length)
  naluWithSEI.set(seiType, startCode.length + header.length)
  naluWithSEI.set(contentWithPreventionBytes, startCode.length + header.length + seiType.length)

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
