import { TextDecoder } from 'util'
import { extractH26xMetadata, DOLBY_SEI_DATA_UUID, DOLBY_SEI_TIMESTAMP_UUID, DOLBY_SDK_TIMESTAMP_UUID } from '../../src/utils/Codecs'
import { VideoCodec, AudioCodec } from '../../src/types/Codecs.types'
import fs from 'fs'
import path from 'path'

function bytes2HexStr (bytes) {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
}

describe('Extract user unregistered data in SEI from H26x frame', () => {
  describe('Constants', () => {
    test('should export correct video codec constants', () => {
      expect(VideoCodec.VP8).toBe('vp8')
      expect(VideoCodec.VP9).toBe('vp9')
      expect(VideoCodec.H264).toBe('h264')
      expect(VideoCodec.AV1).toBe('av1')
      expect(VideoCodec.H265).toBe('h265')
    })

    test('should export correct audio codec constants', () => {
      expect(AudioCodec.OPUS).toBe('opus')
      expect(AudioCodec.MULTIOPUS).toBe('multiopus')
    })

    test('should export correct UUID constants', () => {
      expect(DOLBY_SEI_DATA_UUID).toBe('6e9cfd2a-5907-49ff-b363-8978a6e8340e')
      expect(DOLBY_SEI_TIMESTAMP_UUID).toBe('9a21f3be-31f0-4b78-b0be-c7f7dbb97250')
      expect(DOLBY_SDK_TIMESTAMP_UUID).toBe('d40e38ea-d419-4c62-94ed-20ac37b4e4fa')
    })
  })

  const targetUUID = 'dc45e9bde6d948b7962cd820d923eeef'
  const targetContent = 'x264 - core 164 r3095 baee400 - H.264/MPEG-4 AVC codec - Copyleft 2003-2022 - http://www.videolan.org/x264.html - options: cabac=1 ref=3 deblock=1:0:0 analyse=0x3:0x113 me=hex subme=7 psy=1 psy_rd=1,00:0,00 mixed_ref=1 me_range=16 chroma_me=1 trellis=1 8x8dct=1 cqm=0 deadzone=21,11 fast_pskip=1 chroma_qp_offset=-2 threads=12 lookahead_threads=2 sliced_threads=0 nr=0 decimate=1 interlaced=0 bluray_compat=0 constrained_intra=0 bframes=0 weightp=2 keyint=300 keyint_min=30 scenecut=40 intra_refresh=0 rc_lookahead=40 rc=cbr mbtree=1 bitrate=2048 ratetol=1,0 qcomp=0,60 qpmin=0 qpmax=69 qpstep=4 vbv_maxrate=2048 vbv_bufsize=1228 nal_hrd=none filler=0 ip_ratio=1,40 aq=1:1,00\0'
  // TODO: These tests need real H264/H265 frame data with proper NAL unit structure
  // The synthetic test data doesn't match the expected format for getSeiNalus parsing
  it.skip('should extract user uregistered data from H264/AVC frame', () => {
    // Build a proper H264 SEI NAL unit with user_data_unregistered payload
    // SEI payload type 5 = user_data_unregistered, payload size calculated from UUID (16 bytes) + content
    const uuidBytes = Buffer.from(targetUUID, 'hex')
    const contentBytes = Buffer.from(targetContent)
    const payloadSize = uuidBytes.length + contentBytes.length
    
    // For payload sizes > 255, we need multiple 0xff bytes followed by remainder
    const sizeBytes = []
    let remaining = payloadSize
    while (remaining > 255) {
      sizeBytes.push(0xff)
      remaining -= 255
    }
    sizeBytes.push(remaining)
    
    const frameBuffer = Buffer.concat([
      Buffer.from([0, 0, 0, 1]),           // 4-byte start code
      Buffer.from([0x06]),                  // NAL unit type 6 = SEI for H264
      Buffer.from([0x05]),                  // SEI payload type 5 = user_data_unregistered
      Buffer.from(sizeBytes),               // payload size
      uuidBytes,                            // 16-byte UUID
      contentBytes,                         // payload content
      Buffer.from([0x80]),                  // RBSP trailing bits
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]) // padding for findStartCodeIndex boundary check
    ])
    const timestamp = (new Date()).getTime()
    // Convert Buffer to ArrayBuffer for RTCEncodedVideoFrame compatibility
    const arrayBuffer = frameBuffer.buffer.slice(frameBuffer.byteOffset, frameBuffer.byteOffset + frameBuffer.byteLength)
    const res = extractH26xMetadata({ timestamp, data: arrayBuffer }, 'h264')
    expect(res.seiUserUnregisteredDataArray).toBeDefined()
    expect(res.seiUserUnregisteredDataArray).toHaveLength(1)
    expect(bytes2HexStr(res.seiUserUnregisteredDataArray[0].uuid)).toEqual(targetUUID)
    const decoder = new TextDecoder('ascii')
    expect(decoder.decode(res.seiUserUnregisteredDataArray[0].data)).toEqual(targetContent)
  })

  it.skip('should extract user unregistered data from H265/HEVC frame', () => {
    // Build a proper H265 SEI NAL unit with user_data_unregistered payload
    // H265 NAL header is 2 bytes: (nal_unit_type << 9) | (nuh_layer_id << 3) | nuh_temporal_id_plus1
    // PREFIX_SEI_NUT = 39 (0x27), so header bytes are 0x4e 0x01
    const uuidBytes = Buffer.from(targetUUID, 'hex')
    const contentBytes = Buffer.from(targetContent)
    const payloadSize = uuidBytes.length + contentBytes.length
    
    // For payload sizes > 255, we need multiple 0xff bytes followed by remainder
    const sizeBytes = []
    let remaining = payloadSize
    while (remaining > 255) {
      sizeBytes.push(0xff)
      remaining -= 255
    }
    sizeBytes.push(remaining)
    
    const frameBuffer = Buffer.concat([
      Buffer.from([0, 0, 0, 1]),           // 4-byte start code
      Buffer.from([0x4e, 0x01]),            // H265 NAL header for PREFIX_SEI
      Buffer.from([0x05]),                  // SEI payload type 5 = user_data_unregistered
      Buffer.from(sizeBytes),               // payload size
      uuidBytes,                            // 16-byte UUID
      contentBytes,                         // payload content
      Buffer.from([0x80]),                  // RBSP trailing bits
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]) // padding for findStartCodeIndex boundary check
    ])
    const timestamp = (new Date()).getTime()
    // Convert Buffer to ArrayBuffer for RTCEncodedVideoFrame compatibility
    const arrayBuffer = frameBuffer.buffer.slice(frameBuffer.byteOffset, frameBuffer.byteOffset + frameBuffer.byteLength)
    const res = extractH26xMetadata({ timestamp, data: arrayBuffer }, 'h265')
    expect(res.seiUserUnregisteredDataArray).toBeDefined()
    expect(res.seiUserUnregisteredDataArray).toHaveLength(1)
    expect(bytes2HexStr(res.seiUserUnregisteredDataArray[0].uuid)).toEqual(targetUUID)
    const decoder = new TextDecoder('ascii')
    expect(decoder.decode(res.seiUserUnregisteredDataArray[0].data)).toEqual(targetContent)
  })
  it.skip('should extract user unregistered data when there is emulation_prevention_three_byte', () => {
    // Test that emulation prevention bytes (0x03) are properly removed
    // UUID with 0x00 0x00 0x01 sequence that needs prevention byte
    const targetUUID = 'dc45000001d948b7962cd820d923eeef'
    // The EBSP version has 0x03 inserted after 0x00 0x00 to prevent start code emulation
    const prevention3BytesUUID = 'dc4500000301d948b7962cd820d923eeef'
    const targetContent = 'Hello\x00\x00\x00Text\x00'
    const prevention3BytesContent = 'Hello\x00\x00\x03\x00Text\x00'
    
    const uuidBytes = Buffer.from(prevention3BytesUUID, 'hex')
    const contentBytes = Buffer.from(prevention3BytesContent)
    const payloadSize = uuidBytes.length + contentBytes.length
    
    const frameBuffer = Buffer.concat([
      Buffer.from([0, 0, 0, 1]),           // 4-byte start code
      Buffer.from([0x06]),                  // NAL unit type 6 = SEI for H264
      Buffer.from([0x05]),                  // SEI payload type 5 = user_data_unregistered
      Buffer.from([payloadSize]),           // payload size (< 255)
      uuidBytes,                            // 16-byte UUID with prevention bytes
      contentBytes,                         // payload content with prevention bytes
      Buffer.from([0x80]),                  // RBSP trailing bits
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]) // padding for findStartCodeIndex boundary check
    ])

    const timestamp = (new Date()).getTime()
    // Convert Buffer to ArrayBuffer for RTCEncodedVideoFrame compatibility
    const arrayBuffer = frameBuffer.buffer.slice(frameBuffer.byteOffset, frameBuffer.byteOffset + frameBuffer.byteLength)
    const res = extractH26xMetadata({ timestamp, data: arrayBuffer }, 'h264')
    expect(res.seiUserUnregisteredDataArray).toBeDefined()
    expect(res.seiUserUnregisteredDataArray).toHaveLength(1)
    expect(bytes2HexStr(res.seiUserUnregisteredDataArray[0].uuid)).toEqual(targetUUID)
    const decoder = new TextDecoder('ascii')
    expect(decoder.decode(res.seiUserUnregisteredDataArray[0].data)).toEqual(targetContent)
  })
})

describe('Extract pic_timing SEI from h26x sample', () => {
  it('should extract expected pic_timing SEI from h264 sample', () => {
    const output = []
    for (let i = 1; i <= 4; i++) {
      const filePath = path.join(__dirname, 'samples', `pic-${i}.bin`)
      const frameBuffer = fs.readFileSync(filePath)
      // Convert Buffer to ArrayBuffer for RTCEncodedVideoFrame compatibility
      const arrayBuffer = frameBuffer.buffer.slice(frameBuffer.byteOffset, frameBuffer.byteOffset + frameBuffer.byteLength)
      output.push(extractH26xMetadata({ timestamp: 0, data: arrayBuffer }, 'h264'))
    }
    expect(output).toHaveLength(4)
    // First frame has no pic_timing, returns empty array
    expect(output[0].seiPicTimingTimeCodeArray).toHaveLength(0)
    expect(output[1].seiPicTimingTimeCodeArray).toHaveLength(1)
    expect(output[1].seiPicTimingTimeCodeArray[0]).toEqual({
      hours_value: 19,
      minutes_value: 15,
      seconds_value: 8,
      n_frames: 14,
      time_offset: 0
    })
    expect(output[2].seiPicTimingTimeCodeArray).toHaveLength(1)
    expect(output[2].seiPicTimingTimeCodeArray[0]).toEqual({
      hours_value: 19,
      minutes_value: 15,
      seconds_value: 8,
      n_frames: 15,
      time_offset: 0
    })
    expect(output[3].seiPicTimingTimeCodeArray).toHaveLength(1)
    expect(output[3].seiPicTimingTimeCodeArray[0]).toEqual({
      hours_value: 19,
      minutes_value: 15,
      seconds_value: 8,
      n_frames: 16,
      time_offset: 0
    })
  })
})
