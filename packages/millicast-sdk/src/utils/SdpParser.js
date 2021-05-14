import SemanticSDP from 'semantic-sdp'
import Logger from '../Logger'
import UserAgent from './UserAgent'

const logger = Logger.get('SdpParser')

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
      'useinbandfec=1',
      'useinbandfec=1; stereo=1'
    )
    logger.info('Replaced SDP response for support stereo')
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
      const browserData = new UserAgent()
      const offer = SemanticSDP.SDPInfo.parse(sdp)
      const videoOffer = offer.getMedia('video')

      logger.info('Setting video bitrate')
      videoOffer.setBitrate(bitrate)
      sdp = offer.toString()
      if (sdp.indexOf('b=AS:') > -1 && browserData.isFirefox()) {
        logger.info('Updating SDP for firefox browser')
        sdp = sdp.replace('b=AS:', 'b=TIAS:')
        logger.debug('SDP updated for firefox: ', sdp)
      }
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
   * @returns {String} SDP parsed with multiopus support.
   * @example SdpParser.setMultiopus(sdp)
   */
  static setMultiopus (sdp) {
    const browserData = new UserAgent()
    if (browserData.isChrome()) {
      if (!sdp.includes('multiopus/48000/6')) {
        logger.info('Setting multiopus')
        // Find the audio m-line
        const res = /m=audio 9 UDP\/TLS\/RTP\/SAVPF (.*)\r\n/.exec(sdp)
        // Get audio line
        const audio = res[0]
        // Get free payload number for multiopus
        const pt = Math.max(...res[1].split(' ').map(Number)) + 1
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
}
