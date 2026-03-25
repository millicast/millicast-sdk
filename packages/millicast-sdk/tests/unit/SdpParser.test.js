import SdpParser from '../../src/utils/SdpParser'

describe('SdpParser Opus fmtp munging', () => {
  const baseSdp = [
    'v=0',
    'o=- 46117327 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'm=audio 9 UDP/TLS/RTP/SAVPF 111 0',
    'a=rtpmap:111 opus/48000/2',
    'a=fmtp:111 minptime=10;useinbandfec=1',
    'a=rtpmap:0 PCMU/8000',
    'a=fmtp:0 ptime=20'
  ].join('\r\n')

  test('applies stereo and dtx once when both are enabled', () => {
    const stereo = SdpParser.setStereo(baseSdp)
    const stereoAndDtx = SdpParser.setDTX(stereo)

    expect(stereoAndDtx).toContain('a=fmtp:111 minptime=10;useinbandfec=1;stereo=1;sprop-stereo=1;usedtx=1')
    expect((stereoAndDtx.match(/(?:^|;)stereo=1(?:;|$)/g) || []).length).toBe(1)
    expect((stereoAndDtx.match(/(?:^|;)sprop-stereo=1(?:;|$)/g) || []).length).toBe(1)
    expect((stereoAndDtx.match(/usedtx=1/g) || []).length).toBe(1)
  })

  test('is idempotent for repeated stereo and dtx calls', () => {
    let sdp = baseSdp
    sdp = SdpParser.setStereo(sdp)
    sdp = SdpParser.setStereo(sdp)
    sdp = SdpParser.setDTX(sdp)
    sdp = SdpParser.setDTX(sdp)

    expect((sdp.match(/(?:^|;)stereo=1(?:;|$)/g) || []).length).toBe(1)
    expect((sdp.match(/(?:^|;)sprop-stereo=1(?:;|$)/g) || []).length).toBe(1)
    expect((sdp.match(/usedtx=1/g) || []).length).toBe(1)
  })

  test('does not modify non-opus fmtp lines', () => {
    const sdp = SdpParser.setDTX(SdpParser.setStereo(baseSdp))

    expect(sdp).toContain('a=fmtp:0 ptime=20')
  })

  test('does not modify opus fmtp if useinbandfec=1 is absent', () => {
    const sdpWithoutFec = baseSdp.replace('a=fmtp:111 minptime=10;useinbandfec=1', 'a=fmtp:111 minptime=10')

    const out = SdpParser.setDTX(SdpParser.setStereo(sdpWithoutFec))

    expect(out).toContain('a=fmtp:111 minptime=10')
    expect(out).not.toContain('usedtx=1')
    expect(out).not.toContain('stereo=1')
  })

  test('updates all opus payload types that include useinbandfec=1', () => {
    const multiOpusSdp = [
      'v=0',
      'o=- 46117327 2 IN IP4 127.0.0.1',
      's=-',
      't=0 0',
      'm=audio 9 UDP/TLS/RTP/SAVPF 111 112',
      'a=rtpmap:111 opus/48000/2',
      'a=fmtp:111 minptime=10;useinbandfec=1',
      'a=rtpmap:112 opus/48000/2',
      'a=fmtp:112 minptime=20;useinbandfec=1'
    ].join('\r\n')

    const out = SdpParser.setDTX(SdpParser.setStereo(multiOpusSdp))

    expect(out).toContain('a=fmtp:111 minptime=10;useinbandfec=1;stereo=1;sprop-stereo=1;usedtx=1')
    expect(out).toContain('a=fmtp:112 minptime=20;useinbandfec=1;stereo=1;sprop-stereo=1;usedtx=1')
  })
})
