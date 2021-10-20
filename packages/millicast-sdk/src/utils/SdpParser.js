import SemanticSDP from 'semantic-sdp'
import Logger from '../Logger'
import UserAgent from './UserAgent'

const logger = Logger.get('SdpParser')

const firstPayloadTypeLowerRange = 35
const lastPayloadTypeLowerRange = 65

const firstPayloadTypeUpperRange = 96
const lastPayloadTypeUpperRange = 127

const payloadTypeLowerRange = Array.from({ length: (lastPayloadTypeLowerRange - firstPayloadTypeLowerRange) + 1 }, (_, i) => i + firstPayloadTypeLowerRange)
const payloadTypeUppperRange = Array.from({ length: (lastPayloadTypeUpperRange - firstPayloadTypeUpperRange) + 1 }, (_, i) => i + firstPayloadTypeUpperRange)

const firstHeaderExtensionIdLowerRange = 1
const lastHeaderExtensionIdLowerRange = 14

const firstHeaderExtensionIdUpperRange = 16
const lastHeaderExtensionIdUpperRange = 255

const headerExtensionIdLowerRange = Array.from({ length: (lastHeaderExtensionIdLowerRange - firstHeaderExtensionIdLowerRange) + 1 }, (_, i) => i + firstHeaderExtensionIdLowerRange)
const headerExtensionIdUppperRange = Array.from({ length: (lastHeaderExtensionIdUpperRange - firstHeaderExtensionIdUpperRange) + 1 }, (_, i) => i + firstHeaderExtensionIdUpperRange)

/**
 * Simplify SDP parser.
 *
 * @namespace
 */
export default class SdpParser {
  /**
   * Parse SDP for support simulcast.
   *
   * **Only available in Google Chrome.**
   * @param {String} sdp - Current SDP.
   * @param {String} codec - Codec.
   * @returns {String} SDP parsed with simulcast support.
   * @example SdpParser.setSimulcast(sdp, 'h264')
   */
  static setSimulcast (sdp, codec) {
    logger.info('Setting simulcast. Codec: ', codec)
    const browserData = new UserAgent()
    if (!browserData.isChrome()) {
      logger.warn('Simulcast is only available in Google Chrome browser')
      return sdp
    }
    if (codec !== 'h264' && codec !== 'vp8') {
      logger.warn('Simulcast is only available in h264 and vp8 codecs')
      return sdp
    }

    try {
      const reg1 = /m=video.*?a=ssrc:(\d*) cname:(.+?)\r\n/s
      const reg2 = /m=video.*?a=ssrc:(\d*) mslabel:(.+?)\r\n/s
      const reg3 = /m=video.*?a=ssrc:(\d*) msid:(.+?)\r\n/s
      const reg4 = /m=video.*?a=ssrc:(\d*) label:(.+?)\r\n/s
      // Get ssrc and cname
      const res = reg1.exec(sdp)
      const ssrc = res[1]
      const cname = res[2]
      // Get other params
      const mslabel = reg2.exec(sdp)[2]
      const msid = reg3.exec(sdp)[2]
      const label = reg4.exec(sdp)[2]
      // Add simulcasts ssrcs
      const num = 2
      const ssrcs = [ssrc]
      for (let i = 0; i < num; ++i) {
        // Create new ssrcs
        const ssrc = 100 + i * 2
        const rtx = ssrc + 1
        // Add to ssrc list
        ssrcs.push(ssrc)
        // Add sdp stuff
        sdp += 'a=ssrc-group:FID ' + ssrc + ' ' + rtx + '\r\n' +
            'a=ssrc:' + ssrc + ' cname:' + cname + '\r\n' +
            'a=ssrc:' + ssrc + ' msid:' + msid + '\r\n' +
            'a=ssrc:' + ssrc + ' mslabel:' + mslabel + '\r\n' +
            'a=ssrc:' + ssrc + ' label:' + label + '\r\n' +
            'a=ssrc:' + rtx + ' cname:' + cname + '\r\n' +
            'a=ssrc:' + rtx + ' msid:' + msid + '\r\n' +
            'a=ssrc:' + rtx + ' mslabel:' + mslabel + '\r\n' +
            'a=ssrc:' + rtx + ' label:' + label + '\r\n'
      }
      // Conference flag
      sdp += 'a=x-google-flag:conference\r\n'
      // Add SIM group
      sdp += 'a=ssrc-group:SIM ' + ssrcs.join(' ') + '\r\n'

      logger.info('Simulcast setted')
      logger.debug('Simulcast SDP: ', sdp)
      return sdp
    } catch (e) {
      logger.error('Error setting SDP for simulcast: ', e)
      throw e
    }
  }

  /**
   * Parse SDP for support stereo.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP parsed with stereo support.
   * @example SdpParser.setStereo(sdp)
   */
  static setStereo (sdp) {
    logger.info('Replacing SDP response for support stereo')
    sdp = sdp.replace(
      /useinbandfec=1/g,
      'useinbandfec=1; stereo=1'
    )
    logger.info('Replaced SDP response for support stereo')
    logger.debug('New SDP value: ', sdp)
    return sdp
  }

  /**
   * Parse SDP for support dtx.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP parsed with dtx support.
   * @example SdpParser.setDTX(sdp)
   */
  static setDTX (sdp) {
    logger.info('Replacing SDP response for support dtx')
    sdp = sdp.replace(
      'useinbandfec=1',
      'useinbandfec=1; usedtx=1'
    )
    logger.info('Replaced SDP response for support dtx')
    logger.debug('New SDP value: ', sdp)
    return sdp
  }

  /**
   * Mangle SDP for adding absolute capture time header extension.
   * @param {String} sdp - Current SDP.
   * @returns {String} SDP mungled with abs-catpure-time header extension.
   * @example SdpParser.setAbsoluteCaptureTime(sdp)
   */
  static setAbsoluteCaptureTime (sdp) {
    const id = SdpParser.getAvailableHeaderExtensionIdRange(sdp)[0]
    const header = 'a=extmap:' + id + ' http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time\r\n'

    const regex = /(m=.*\r\n(?:.*\r\n)*?)(a=extmap.*\r\n)/gm

    sdp = sdp.replace(regex, (match, p1, p2) => p1 + header + p2)

    logger.info('Replaced SDP response for set absolute capture time')
    logger.debug('New SDP value: ', sdp)

    return sdp
  }

  /**
   * Parse SDP for desired bitrate.
   * @param {String} sdp - Current SDP.
   * @param {Number} bitrate - Bitrate value in kbps or 0 for unlimited bitrate.
   * @returns {String} SDP parsed with desired bitrate.
   * @example SdpParser.setVideoBitrate(sdp, 1000)
   */
  static setVideoBitrate (sdp, bitrate) {
    if (bitrate < 1) {
      logger.info('Remove bitrate restrictions')
      sdp = sdp.replace(/b=AS:.*\r\n/, '').replace(/b=TIAS:.*\r\n/, '')
    } else {
      const offer = SemanticSDP.SDPInfo.parse(sdp)
      const videoOffer = offer.getMedia('video')

      logger.info('Setting video bitrate')
      videoOffer.setBitrate(bitrate)
      sdp = offer.toString()
    }
    return sdp
  }

  /**
   * Remove SDP line.
   * @param {String} sdp - Current SDP.
   * @param {String} sdpLine - SDP line to remove.
   * @returns {String} SDP without the line.
   * @example SdpParser.removeSdpLine(sdp, 'custom line')
   */
  static removeSdpLine (sdp, sdpLine) {
    logger.debug('SDP before trimming: ', sdp)
    sdp = sdp
      .split('\n')
      .filter((line) => {
        return line.trim() !== sdpLine
      })
      .join('\n')
    logger.debug('SDP trimmed result: ', sdp)
    return sdp
  }

  /**
   * Replace codec name of a SDP.
   * @param {String} sdp - Current SDP.
   * @param {String} codec - Codec name to be replaced.
   * @param {String} newCodecName - New codec name to replace.
   * @returns {String} SDP updated with new codec name.
   */
  static adaptCodecName (sdp, codec, newCodecName) {
    if (!sdp) {
      return sdp
    }
    const regex = new RegExp(`${codec}`, 'i')

    return sdp.replace(regex, newCodecName)
  }

  /**
   * Parse SDP for support multiopus.
   *
   * **Only available in Google Chrome.**
   * @param {String} sdp - Current SDP.
   * @param {MediaStream} mediaStream - MediaStream offered in the stream.
   * @returns {String} SDP parsed with multiopus support.
   * @example SdpParser.setMultiopus(sdp, mediaStream)
   */
  static setMultiopus (sdp, mediaStream) {
    const browserData = new UserAgent()
    if (browserData.isChrome() && (!mediaStream || hasAudioMultichannel(mediaStream))) {
      if (!sdp.includes('multiopus/48000/6')) {
        logger.info('Setting multiopus')
        // Find the audio m-line
        const res = /m=audio 9 UDP\/TLS\/RTP\/SAVPF (.*)\r\n/.exec(sdp)
        // Get audio line
        const audio = res[0]
        // Get free payload number for multiopus
        const pt = SdpParser.getAvailablePayloadTypeRange(sdp)[0]
        // Add multiopus
        const multiopus = audio.replace('\r\n', ' ') + pt + '\r\n' +
              'a=rtpmap:' + pt + ' multiopus/48000/6\r\n' +
              'a=fmtp:' + pt + ' channel_mapping=0,4,1,2,3,5;coupled_streams=2;minptime=10;num_streams=4;useinbandfec=1\r\n'
        // Change sdp
        sdp = sdp.replace(audio, multiopus)
        logger.info('Multiopus offer created')
        logger.debug('SDP parsed for multioups: ', sdp)
      } else {
        logger.info('Multiopus already setted')
      }
    }
    return sdp
  }

  /**
   * Gets all available payload type IDs of the current Session Description.
   *
   * @param {String} sdp - Current SDP.
   * @returns {Array<Number>} All available payload type ids.
   */
  static getAvailablePayloadTypeRange (sdp) {
    const regex = /m=(?:.*) (?:.*) UDP\/TLS\/RTP\/SAVPF (.*)\r\n/gm

    const matches = sdp.matchAll(regex)
    let ptAvailable = payloadTypeUppperRange.concat(payloadTypeLowerRange)

    for (const match of matches) {
      const usedNumbers = match[1].split(' ').map(n => parseInt(n))
      ptAvailable = ptAvailable.filter(n => !usedNumbers.includes(n))
    }

    return ptAvailable
  }

  /**
   * Gets all available header extension IDs of the current Session Description.
   *
   * @param {String} sdp - Current SDP.
   * @returns {Array<Number>} All available header extension IDs.
   */
  static getAvailableHeaderExtensionIdRange (sdp) {
    const regex = /a=extmap:(\d+)(?:.*)\r\n/gm

    const matches = sdp.matchAll(regex)
    let idAvailable = headerExtensionIdLowerRange.concat(headerExtensionIdUppperRange)

    for (const match of matches) {
      const usedNumbers = match[1].split(' ').map(n => parseInt(n))
      idAvailable = idAvailable.filter(n => !usedNumbers.includes(n))
    }

    return idAvailable
  }
}

/**
 * Checks if mediaStream has more than 2 audio channels.
 * @param {MediaStream} mediaStream - MediaStream to verify.
 * @returns {Boolean} returns true if MediaStream has more than 2 channels.
 */
const hasAudioMultichannel = (mediaStream) => {
  return mediaStream.getAudioTracks().some(value => value.getSettings().channelCount > 2)
}
