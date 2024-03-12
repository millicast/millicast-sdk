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

// eslint-disable-next-line no-unused-vars
function removePreventionBytes (nalu) {
  // TODO: implementation
}

function getNalus (frameBuffer) {
  let offset = 0
  const nalus = []
  while (offset < frameBuffer.byteLength - 4) {
    const startCodeIndex = findStartCodeIndex(frameBuffer, offset)
    if (startCodeIndex >= offset) {
      // found the NAL unit start code
      const startCodeLength = frameBuffer[startCodeIndex + 2] === 0x01 ? 3 : 4
      // find the start index of next NAL unit
      const nextStartCodeIndex = findStartCodeIndex(frameBuffer, startCodeIndex + startCodeLength)
      if (nextStartCodeIndex > startCodeIndex) {
        nalus.push(frameBuffer.slice(startCodeIndex, nextStartCodeIndex))
        offset = nextStartCodeIndex
      } else {
        nalus.push(frameBuffer.slice(startCodeIndex))
        break
      }
    } else {
      break
    }
  }
  return nalus
}

function getSeiNalus (frameBuffer, codec) {
  return getNalus(frameBuffer).filter((nalu) => {
    const startCodeLength = nalu[2] === 0x01 ? 3 : 4
    const header = nalu[startCodeLength]
    const naluType = codec === 'h264' ? header & 0x1f : header >> 1 & 0x3f
    return [6, 39, 40].includes(naluType)
  })
}

function getSeiUserUnregisteredPayload (nalu, codec) {
  const startCodeLength = nalu[2] === 0x01 ? 3 : 4
  const headerLength = codec === 'h264' ? 1 : 2
  let idx = startCodeLength + headerLength
  let payloadType = 0
  while (nalu[idx] === 0xff) {
    payloadType += 0xff
    idx++
  }
  payloadType += nalu[idx]
  if (payloadType !== 5) {
    return null
  }
  idx++
  let payloadSize = 0
  while (nalu[idx] === 0xff) {
    payloadSize += 0xff
    idx++
  }
  payloadSize += nalu[idx]
  idx++
  const uuid = nalu.slice(idx, idx + 16)
  idx += 16
  const payload = nalu.slice(idx, idx + payloadSize - 16)
  return { uuid, payload }
}

// eslint-disable-next-line no-unused-vars
function getSeiPicTimingPayload (nalu, codec) {
  // TODO: implementation
}

/**
* Extract user unregistered metadata from H26x Encoded Frame
* @param { Uint8Array } frameBuffer
* @param { 'h264' | 'h265' } codec
*/
export function extractH26xSEI (frameBuffer, codec) {
  if (codec !== 'h264' && codec !== 'h265') {
    throw new Error(`Unsupported codec ${codec}`)
  }
  return getSeiNalus(frameBuffer, codec).map((nalu) => getSeiUserUnregisteredPayload(nalu, codec)).filter((sei) => sei !== null)
}

export function addH26xSEI ({ uuid, payload }, encodedFrame, codec) {
  if (codec !== 'h264' && codec !== 'h265') {
    throw new Error(`Unsupported codec ${codec}`)
  }
  // TODO: create new Uint8Array as NAL unit. NAL unit format is start code + header + sei type + payload then push to the original NAL units array
  return encodedFrame
}
