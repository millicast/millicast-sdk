import { TextDecoder } from 'util'
import { extractH26xSEI } from '../../src/utils/Codecs'

function bytes2HexStr(bytes) {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
}

describe('Extract user unregistered data in SEI from H26x frame', () => {
  const targetUUID = 'dc45e9bde6d948b7962cd820d923eeef'
  const targetContent = 'x264 - core 164 r3095 baee400 - H.264/MPEG-4 AVC codec - Copyleft 2003-2022 - http://www.videolan.org/x264.html - options: cabac=1 ref=3 deblock=1:0:0 analyse=0x3:0x113 me=hex subme=7 psy=1 psy_rd=1,00:0,00 mixed_ref=1 me_range=16 chroma_me=1 trellis=1 8x8dct=1 cqm=0 deadzone=21,11 fast_pskip=1 chroma_qp_offset=-2 threads=12 lookahead_threads=2 sliced_threads=0 nr=0 decimate=1 interlaced=0 bluray_compat=0 constrained_intra=0 bframes=0 weightp=2 keyint=300 keyint_min=30 scenecut=40 intra_refresh=0 rc_lookahead=40 rc=cbr mbtree=1 bitrate=2048 ratetol=1,0 qcomp=0,60 qpmin=0 qpmax=69 qpstep=4 vbv_maxrate=2048 vbv_bufsize=1228 nal_hrd=none filler=0 ip_ratio=1,40 aq=1:1,00\0'
  it('should extract user uregistered data from H264/AVC frame', () => {
    const dirtyBuffer = Buffer.from([0x00, 0x00, 0x05, 0x45, 0x99, 0xff])
    const frameBuffer = Buffer.concat([
      dirtyBuffer,
      Buffer.from([0, 0, 1]),
      // NAL unit header is 0x06 which means SEI
      Buffer.from([0x06, 0x05, 0xff, 0xff, 0xb6]),
      Buffer.from(targetUUID, 'hex'),
      Buffer.from(targetContent),
      Buffer.from([0x80]),
      dirtyBuffer
    ])
    const data = new Uint8Array(frameBuffer.buffer, frameBuffer.byteOffset, frameBuffer.byteLength)
    const res = extractH26xSEI(data, 'h264')
    expect(res).toHaveLength(1)
    expect(bytes2HexStr(res[0].uuid)).toEqual(targetUUID)
    const decoder = new TextDecoder('ascii')
    expect(decoder.decode(res[0].payload)).toEqual(targetContent)
  })

  it('should extract user unregistered data from H265/HEVC frame', () => {
    const frameBuffer = Buffer.concat([
      Buffer.from([0, 0, 0, 1]),
      // NAL unit header is 0x4e 0x01 which means hevc prefix SEI
      Buffer.from([0x4e, 0x01, 0x05, 0xff, 0xff, 0xb6]),
      Buffer.from(targetUUID, 'hex'),
      Buffer.from(targetContent),
      Buffer.from([0x80])])
    const data = new Uint8Array(frameBuffer.buffer, frameBuffer.byteOffset, frameBuffer.byteLength)
    const res = extractH26xSEI(data, 'h265')
    expect(res).toHaveLength(1)
    expect(bytes2HexStr(res[0].uuid)).toEqual(targetUUID)
    const decoder = new TextDecoder('ascii')
    expect(decoder.decode(res[0].payload)).toEqual(targetContent)
  })
  it('should extract user unregistered data when there is emulation_prevention_three_byte', () => {
    const targetUUID = 'dc45000001d948b7962cd820d923eeef'
    const prevention3BytesUUID = 'dc4500000301d948b7962cd820d923eeef'
    const targetContent = 'Hello\x00\x00\x00Text\x00'
    const prevention3BytesContent = 'Hello\x00\x00\x03\x00Text\x00'
    const frameBuffer = Buffer.concat([
      Buffer.from([0, 0, 1]),
      Buffer.from([0x06, 0x05, 0x1d]),
      Buffer.from(prevention3BytesUUID, 'hex'),
      Buffer.from(prevention3BytesContent),
      Buffer.from([0x89])
    ])
    const data = new Uint8Array(frameBuffer.buffer, frameBuffer.byteOffset, frameBuffer.byteLength)
    const res = extractH26xSEI(data, 'h264')
    expect(res).toHaveLength(1)
    expect(bytes2HexStr(res[0].uuid)).toEqual(targetUUID)
    const decoder = new TextDecoder('ascii')
    expect(decoder.decode(res[0].payload)).toEqual(targetContent)
  })
})
