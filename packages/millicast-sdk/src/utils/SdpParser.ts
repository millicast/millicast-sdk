/**
 * @module SdpParser
 * @description Simplify SDP parser.
 *
 * NOTE: SDP munging is still required for Opus codec parameters (DTX, stereo) because
 * no browser API supports modifying these at runtime:
 * - setParameters().codecs is read-only per W3C spec — confirmed broken in Chrome, Firefox, Safari.
 *   Chrome returns INTERNAL_ERROR for Opus fmtp changes: https://issues.webrtc.org/issues/443612840
 * - setCodecPreferences() rejects modified sdpFmtpLine with InvalidModificationError.
 * - Chrome engineers recommend SDP munging as the current workaround:
 *   https://github.com/w3c/webrtc-extensions/issues/120
 *
 * The munging approach (modifying the local SDP after createOffer, before setLocalDescription)
 * is the only approach right now (March, 2026).
 */
const SdpParser = {

  /**
   * @function
   * @name setStereo
   * @description Parse SDP for support stereo. Appends stereo=1 and sprop-stereo=1 to the
   * Opus fmtp line in the local SDP offer.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP parsed with stereo support.
   * @example SdpParser.setStereo(sdp)
   */
  setStereo (sdp  = ''): string {
    sdp = sdp.replace(/useinbandfec=1/g, 'useinbandfec=1;stereo=1;sprop-stereo=1')
    return sdp
  },

  /**
   * @function
   * @name setDTX
   * @description Set DTX (Discontinuous Transmission) on the Opus codec. Appends usedtx=1
   * to the Opus fmtp line in the local SDP offer. DTX allows a large reduction in audio
   * traffic when a participant is silent.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP parsed with DTX support.
   * @example SdpParser.setDTX(sdp)
   */
  setDTX (sdp = ''): string {
    sdp = sdp.replace(/useinbandfec=1/g, 'useinbandfec=1;usedtx=1')
    return sdp
  },

  /**
   * @function
   * @name adaptCodecName
   * @description Replace codec name of a SDP.
   * @param {String} sdp - Current SDP.
   * @param {String} codec - Codec name to be replaced.
   * @param {String} newCodecName - New codec name to replace.
   * @returns {String} SDP updated with new codec name.
   */
  adaptCodecName (sdp = '', codec = '', newCodecName = ''): string {
    if (!sdp) {
      return sdp
    }
    const regex = new RegExp(`${codec}`, 'i')

    return sdp.replace(regex, newCodecName)
  },

  /**
   * @function
   * @name getCodecPayloadType
   * @description Gets codec payload type mapping from SDP.
   * @param {String} sdp - Current SDP.
   * @returns {Object} Map of payload type to codec name.
   */
  getCodecPayloadType (sdp = ''): Record<string, string> {
    const reg = new RegExp('a=rtpmap:(\\d+) (\\w+)/\\d+', 'g')
    const matches = sdp.matchAll(reg)
    const codecMap: Record<string, string> = {}

    for (const match of matches) {
      codecMap[match[1]] = match[2]
    }
    return codecMap
  }
}

export default SdpParser
