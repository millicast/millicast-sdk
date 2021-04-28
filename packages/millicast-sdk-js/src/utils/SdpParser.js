import UAParser from 'ua-parser-js'
import SemanticSDP from 'semantic-sdp'
import MillicastLogger from '../MillicastLogger'

const logger = MillicastLogger.get('SdpParser')

export default class SdpParser {
  static setSimulcast (sdp, codec) {
    logger.info('Setting simulcast. Codec: ', codec)
    const browserData = new UAParser(window.navigator.userAgent).getBrowser()
    if (!browserData.name.match(/Chrome/)) {
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

  static setVideoBitrate (sdp, bitrate) {
    if (bitrate < 1) {
      logger.info('Remove bitrate restrictions')
      sdp = sdp.replace(/b=AS:.*\r\n/, '').replace(/b=TIAS:.*\r\n/, '')
    } else {
      const browserData = new UAParser(window.navigator.userAgent).getBrowser()
      const offer = SemanticSDP.SDPInfo.parse(sdp)
      const videoOffer = offer.getMedia('video')

      logger.info('Setting video bitrate')
      videoOffer.setBitrate(bitrate)
      sdp = offer.toString()
      if (sdp.indexOf('b=AS:') > -1 && browserData.name === 'Firefox') {
        logger.info('Updating SDP for firefox browser')
        sdp = sdp.replace('b=AS:', 'b=TIAS:')
        logger.debug('SDP updated for firefox: ', sdp)
      }
    }
    return sdp
  }

  static removeSdpLine (remoteSdp, sdpLine) {
    logger.debug('SDP before trimming: ', remoteSdp)
    remoteSdp = remoteSdp
      .split('\n')
      .filter((line) => {
        return line.trim() !== sdpLine
      })
      .join('\n')
    logger.debug('SDP trimmed result: ', remoteSdp)
    return remoteSdp
  }
}
