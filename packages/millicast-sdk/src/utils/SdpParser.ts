import { SDPInfo, MediaInfo, Direction } from 'semantic-sdp'
import Logger from '../Logger'

const logger = Logger.get('SdpParser')

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
   * @name renegotiate
   * @description Renegotiate remote sdp based on previous description.
   * This function will fill missing m-lines cloning on the remote description by cloning the codec and extensions already negotiated for that media
   * @param {String} localDescription - Updated local sdp
   * @param {String} remoteDescription - Previous remote sdp
   */
  renegotiate (localDescription = '', remoteDescription = '') {
    const offer = SDPInfo.parse(localDescription)
    const answer = SDPInfo.parse(remoteDescription)

    // Check all transceivers on the offer are on the answer
    for (const offeredMedia of offer.getMedias()) {
      // Get associated mid on the answer
      let answeredMedia = answer.getMediaById(offeredMedia.getId())
      // If not found in answer
      if (!answeredMedia) {
        // Create new one
        answeredMedia = new MediaInfo(offeredMedia.getId(), offeredMedia.getType())
        // Set direction
        answeredMedia.setDirection(Direction.reverse(offeredMedia.getDirection()))
        // Find first media line for same kind
        const first = answer.getMedia(offeredMedia.getType())
        // If found
        if (first) {
          // Copy codec info
          answeredMedia.setCodecs(first.getCodecs())
          // Copy extension info
          for (const [id, extension] of first.getExtensions()) {
            // Add it
            answeredMedia.addExtension(id, extension)
          }
        }
        // Add it to answer
        answer.addMedia(answeredMedia)
      }
    }

    return answer.toString()
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
