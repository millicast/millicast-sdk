/**
 * @module SdpParser
 * @description Simplify SDP parser.
 */
const SdpParser = {

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
  getCodecPayloadType (sdp = '') {
    const reg = new RegExp('a=rtpmap:(\\d+) (\\w+)/\\d+', 'g')
    const matches = sdp.matchAll(reg)
    const codecMap: {[key: string]: string} = {}

    for (const match of matches) {
      codecMap[match[1]] = match[2]
    }
    return codecMap
  }
}

export default SdpParser
