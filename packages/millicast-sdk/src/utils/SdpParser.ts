import { SDPInfo, MediaInfo, Direction } from 'semantic-sdp'
import Logger from '../Logger'
import UserAgent from './UserAgent'

const logger = Logger.get('SdpParser')

const firstPayloadTypeLowerRange = 35
const lastPayloadTypeLowerRange = 65

const firstPayloadTypeUpperRange = 96
const lastPayloadTypeUpperRange = 127

const payloadTypeLowerRange = Array.from(
  { length: lastPayloadTypeLowerRange - firstPayloadTypeLowerRange + 1 },
  (_, i) => i + firstPayloadTypeLowerRange
)
const payloadTypeUppperRange = Array.from(
  { length: lastPayloadTypeUpperRange - firstPayloadTypeUpperRange + 1 },
  (_, i) => i + firstPayloadTypeUpperRange
)

const firstHeaderExtensionIdLowerRange = 1
const lastHeaderExtensionIdLowerRange = 14

const firstHeaderExtensionIdUpperRange = 16
const lastHeaderExtensionIdUpperRange = 255

const headerExtensionIdLowerRange = Array.from(
  { length: lastHeaderExtensionIdLowerRange - firstHeaderExtensionIdLowerRange + 1 },
  (_, i) => i + firstHeaderExtensionIdLowerRange
)
const headerExtensionIdUppperRange = Array.from(
  { length: lastHeaderExtensionIdUpperRange - firstHeaderExtensionIdUpperRange + 1 },
  (_, i) => i + firstHeaderExtensionIdUpperRange
)

/**
 * @module SdpParser
 * @description Simplify SDP parser.
 */
const SdpParser = {
  /**
   * @function
   * @name setStereo
   * @description Parse SDP for support stereo.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP parsed with stereo support.
   * @example SdpParser.setStereo(sdp)
   */
  setStereo(sdp = ''): string {
    logger.info('Replacing SDP response for support stereo')
    sdp = sdp.replace(/useinbandfec=1/g, 'useinbandfec=1; stereo=1')
    logger.info('Replaced SDP response for support stereo')
    logger.debug('New SDP value: ', sdp)
    return sdp
  },

  /**
   * @function
   * @name setDTX
   * @description Set DTX (Discontinuous Transmission) to the connection. Advanced configuration of the opus audio codec that allows for a large reduction in the audio traffic. For example, when a participant is silent, the audio packets won't be transmitted.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP parsed with dtx support.
   * @example SdpParser.setDTX(sdp)
   */
  setDTX(sdp = ''): string {
    logger.info('Replacing SDP response for support dtx')
    sdp = sdp.replace('useinbandfec=1', 'useinbandfec=1; usedtx=1')
    logger.info('Replaced SDP response for support dtx')
    logger.debug('New SDP value: ', sdp)
    return sdp
  },

  /**
   * @function
   * @name setAbsoluteCaptureTime
   * @description Mangle SDP for adding absolute capture time header extension.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP mungled with abs-capture-time header extension.
   * @example SdpParser.setAbsoluteCaptureTime(sdp)
   */
  setAbsoluteCaptureTime(sdp = ''): string {
    const id = SdpParser.getAvailableHeaderExtensionIdRange(sdp)[0]
    const header = 'a=extmap:' + id + ' http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time\r\n'

    const regex = /(m=.*\r\n(?:.*\r\n)*?)(a=extmap.*\r\n)/gm

    sdp = sdp.replace(regex, (_match, p1, p2) => p1 + header + p2)

    logger.info('Replaced SDP response for setting absolute capture time')
    logger.debug('New SDP value: ', sdp)

    return sdp
  },

  /**
   * @function
   * @name setDependencyDescriptor
   * @description Mangle SDP for adding dependency descriptor header extension.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP mungled with abs-capture-time header extension.
   * @example SdpParser.setAbsoluteCaptureTime(sdp)
   */
  setDependencyDescriptor(sdp = ''): string {
    const id = SdpParser.getAvailableHeaderExtensionIdRange(sdp)[0]
    const header =
      'a=extmap:' +
      id +
      ' https://aomediacodec.github.io/av1-rtp-spec/#dependency-descriptor-rtp-header-extension\r\n'

    const regex = /(m=.*\r\n(?:.*\r\n)*?)(a=extmap.*\r\n)/gm

    sdp = sdp.replace(regex, (_match, p1, p2) => p1 + header + p2)

    logger.info('Replaced SDP response for setting depency descriptor')
    logger.debug('New SDP value: ', sdp)

    return sdp
  },

  /**
   * @function
   * @name setVideoBitrate
   * @description Parse SDP for desired bitrate.
   * @param {String} sdp - Current SDP.
   * @param {Number} bitrate - Bitrate value in kbps or 0 for unlimited bitrate.
   * @returns {String} SDP parsed with desired bitrate.
   * @example SdpParser.setVideoBitrate(sdp, 1000)
   */
  setVideoBitrate(sdp = '', bitrate = 0): string {
    if (bitrate < 1) {
      logger.info('Remove bitrate restrictions')
      sdp = sdp.replace(/b=AS:.*\r\n/, '').replace(/b=TIAS:.*\r\n/, '')
    } else {
      const offer = SDPInfo.parse(sdp)
      const videoOffer = offer.getMedia('video')

      logger.info('Setting video bitrate')
      videoOffer.setBitrate(bitrate)
      sdp = offer.toString()
    }
    return sdp
  },

  /**
   * @function
   * @name removeSdpLine
   * @description Remove SDP line.
   * @param {String} sdp - Current SDP.
   * @param {String} sdpLine - SDP line to remove.
   * @returns {String} SDP without the line.
   * @example SdpParser.removeSdpLine(sdp, 'custom line')
   */
  removeSdpLine(sdp = '', sdpLine = ''): string {
    logger.debug('SDP before trimming: ', sdp)
    sdp = sdp
      .split('\n')
      .filter((line) => {
        return line.trim() !== sdpLine
      })
      .join('\n')
    logger.debug('SDP trimmed result: ', sdp)
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
  adaptCodecName(sdp = '', codec = '', newCodecName = ''): string {
    if (!sdp) {
      return sdp
    }
    const regex = new RegExp(`${codec}`, 'i')

    return sdp.replace(regex, newCodecName)
  },

  /**
   * @function
   * @name setMultiopus
   * @description Parse SDP for support multiopus.
   * **Only available in Google Chrome.**
   * @param {String} sdp - Current SDP.
   * @param {MediaStream} mediaStream - MediaStream offered in the stream.
   * @returns {String} SDP parsed with multiopus support.
   * @example SdpParser.setMultiopus(sdp, mediaStream)
   */
  setMultiopus(sdp = '', mediaStream?: MediaStream | null): string {
    const browserData = new UserAgent()
    if (!browserData.isFirefox() && (!mediaStream || hasAudioMultichannel(mediaStream))) {
      if (!sdp.includes('multiopus/48000/6')) {
        logger.info('Setting multiopus')
        // Find the audio m-line
        const res = new RegExp('m=audio 9 UDP/TLS/RTP/SAVPF (.*)\\r\\n').exec(sdp) ?? []
        // Get audio line
        const audio = res[0] ?? ''
        // Get free payload number for multiopus
        const pt = SdpParser.getAvailablePayloadTypeRange(sdp)[0]
        // Add multiopus
        const multiopus =
          audio.replace('\r\n', ' ') +
          pt +
          '\r\n' +
          'a=rtpmap:' +
          pt +
          ' multiopus/48000/6\r\n' +
          'a=fmtp:' +
          pt +
          ' channel_mapping=0,4,1,2,3,5;coupled_streams=2;minptime=10;num_streams=4;useinbandfec=1\r\n'
        // Change sdp
        sdp = sdp.replace(audio, multiopus)
        logger.info('Multiopus offer created')
        logger.debug('SDP parsed for multioups: ', sdp)
      } else {
        logger.info('Multiopus already setted')
      }
    }
    return sdp
  },

  /**
   * @function
   * @name getAvailablePayloadTypeRange
   * @description Gets all available payload type IDs of the current Session Description.
   * @param {String} sdp - Current SDP.
   * @returns {Array<Number>} All available payload type ids.
   */
  getAvailablePayloadTypeRange(sdp = ''): Array<number> {
    const regex = new RegExp('m=(?:.*) (?:.*) UDP/TLS/RTP/SAVPF (.*)\\r\\n', 'gm')

    const matches = sdp.matchAll(regex)
    let ptAvailable = payloadTypeUppperRange.concat(payloadTypeLowerRange)

    for (const match of matches) {
      const usedNumbers = match[1].split(' ').map((n) => parseInt(n))
      ptAvailable = ptAvailable.filter((n) => !usedNumbers.includes(n))
    }

    return ptAvailable
  },

  /**
   * @function
   * @name getAvailableHeaderExtensionIdRange
   * @description Gets all available header extension IDs of the current Session Description.
   * @param {String} sdp - Current SDP.
   * @returns {Array<Number>} All available header extension IDs.
   */
  getAvailableHeaderExtensionIdRange(sdp = ''): Array<number> {
    const regex = new RegExp('a=extmap:(\\d+)(?:.*)\\r\\n', 'gm')

    const matches = sdp.matchAll(regex)
    let idAvailable = headerExtensionIdLowerRange.concat(headerExtensionIdUppperRange)

    for (const match of matches) {
      const usedNumbers = match[1].split(' ').map((n) => parseInt(n))
      idAvailable = idAvailable.filter((n) => !usedNumbers.includes(n))
    }

    return idAvailable
  },

  /**
   * @function
   * @name renegotiate
   * @description Renegotiate remote sdp based on previous description.
   * This function will fill missing m-lines cloning on the remote description by cloning the codec and extensions already negotiated for that media
   * @param {String} localDescription - Updated local sdp
   * @param {String} remoteDescription - Previous remote sdp
   */
  renegotiate(localDescription = '', remoteDescription = '') {
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
   * @name updateMissingVideoExtensions
   * @description Adds missing extensions of each video section in the localDescription
   * @param {String} localDescription - Previous local sdp
   * @param {String} remoteDescription - Remote sdp
   * @returns {String} SDP updated with missing extensions.
   */
  updateMissingVideoExtensions(localDescription = '', remoteDescription = ''): string | undefined {
    const offer = SDPInfo.parse(localDescription)
    const answer = SDPInfo.parse(remoteDescription)
    // Get extensions of answer
    const remoteVideoExtensions = answer.getMediasByType('video')[0]?.getExtensions()
    if (!remoteVideoExtensions) {
      return
    }
    for (const offeredMedia of offer.getMediasByType('video')) {
      const offerExtensions = offeredMedia.getExtensions()
      remoteVideoExtensions.forEach((val, key) => {
        // If the extension is not present in offer then add it
        if (!offerExtensions.get(key)) {
          const id = offeredMedia.getId()
          const header = 'a=extmap:' + key + ' ' + val + '\r\n'
          const regex = new RegExp('(a=mid:' + id + '\\r\\n(?:.*\\r\\n)*?)', 'g')
          localDescription = localDescription.replace(regex, (_, p1) => p1 + header)
        }
      })
    }
    return localDescription
  },
  getCodecPayloadType(sdp = '') {
    const reg = new RegExp('a=rtpmap:(\\d+) (\\w+)/\\d+', 'g')
    const matches = sdp.matchAll(reg)
    const codecMap: { [key: string]: string } = {}

    for (const match of matches) {
      codecMap[match[1]] = match[2]
    }
    return codecMap
  },
}

// Checks if mediaStream has more than 2 audio channels.
const hasAudioMultichannel = (mediaStream: MediaStream) => {
  return mediaStream.getAudioTracks().some((value) => (value.getSettings().channelCount as number) > 2)
}

export default SdpParser
