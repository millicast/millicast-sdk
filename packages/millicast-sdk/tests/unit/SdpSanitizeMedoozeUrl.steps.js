import { loadFeature, defineFeature } from 'jest-cucumber'
import SdpParser from '../../src/utils/SdpParser'
const feature = loadFeature('../features/SdpSanitizeMedoozeUrl.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  test('Replace single https://medooze occurrence', ({ given, when, then }) => {
    let inputSdp
    let outputSdp

    given('an SDP containing a single https://medooze identifier', async () => {
      inputSdp = 'v=0\r\no=- 1619467151495 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=msid-semantic: WMS https://medooze\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
    })

    when('I sanitize the SDP', async () => {
      outputSdp = SdpParser.sanitizeMedoozeUrl(inputSdp)
    })

    then('the SDP contains optiview instead of https://medooze', async () => {
      expect(outputSdp).not.toContain('https://medooze')
      expect(outputSdp).toContain('optiview')
      expect(outputSdp).toEqual('v=0\r\no=- 1619467151495 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=msid-semantic: WMS optiview\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n')
    })
  })

  test('Replace multiple https://medooze occurrences', ({ given, when, then }) => {
    let inputSdp
    let outputSdp

    given('an SDP containing multiple https://medooze identifiers', async () => {
      inputSdp = 'v=0\r\na=msid-semantic: WMS https://medooze\r\na=ssrc:12345 msid:https://medooze track0\r\n'
    })

    when('I sanitize the SDP', async () => {
      outputSdp = SdpParser.sanitizeMedoozeUrl(inputSdp)
    })

    then('the SDP contains optiview instead of https://medooze', async () => {
      expect(outputSdp).not.toContain('https://medooze')
      expect(outputSdp).toEqual('v=0\r\na=msid-semantic: WMS optiview\r\na=ssrc:12345 msid:optiview track0\r\n')
    })
  })

  test('SDP without https://medooze is unchanged', ({ given, when, then }) => {
    let inputSdp
    let outputSdp

    given('an SDP without any https://medooze identifier', async () => {
      inputSdp = 'v=0\r\no=- 1619467151495 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=msid-semantic: WMS\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
    })

    when('I sanitize the SDP', async () => {
      outputSdp = SdpParser.sanitizeMedoozeUrl(inputSdp)
    })

    then('the SDP is unchanged', async () => {
      expect(outputSdp).toEqual(inputSdp)
    })
  })
})
