import Logger from './Logger'
import SemanticSDP from 'semantic-sdp'
import MillicastUtils from './MillicastUtils.js'
const logger = Logger.get('MillicastWebRTC')

export default class MillicastWebRTC {
  constructor () {
    this.desc = null
    this.peer = null
    this.RTCOfferOptions = {
      offerToReceiveVideo: true,
      offerToReceiveAudio: true
    }
  }

  async getRTCPeer (config) {
    logger.info('Getting RTC Peer')
    logger.debug('Config value: ', config)
    if (this.peer) {
      logger.debug('Peer value: ', this.peer)
      return this.peer
    }
    try {
      if (config) config = await this.getRTCConfiguration()
      this.peer = new RTCPeerConnection(config)
      logger.debug('Peer value: ', this.peer)
      return this.peer
    } catch (e) {
      logger.error('Error while creating RTCPeerConnection: ', e)
      throw e
    }
  }

  async closeRTCPeer () {
    try {
      logger.info('Closing RTCPeerConnection')
      this.peer.close()
      this.peer = null
      return this.peer
    } catch (e) {
      logger.error('Error while closing RTCPeerConnection: ', e)
      throw e
    }
  }

  getRTCConfiguration () {
    logger.info('Getting RTC configuration')
    const config = {
      rtcpMuxPolicy: 'require',
      bundlePolicy: 'max-bundle'
    }
    return this.getRTCIceServers()
      .then((res) => {
        config.iceServers = res
        return Promise.resolve(config)
      })
      .catch(() => {
        return Promise.resolve(config)
      })
  }

  getRTCIceServers (location = 'https://turn.millicast.com/webrtc/_turn') {
    logger.info('Getting RTC ICE servers')
    logger.debug('Request location: ', location)
    return new Promise((resolve, reject) => {
      const a = []
      MillicastUtils.request(location, 'PUT')
        .then((result) => {
          logger.debug('RTC ICE servers response: ', result)
          if (result.s === 'ok') {
            logger.info('RTC ICE servers successfully geted')
            const list = result.v.iceServers
            // call returns old format, this updates URL to URLS in credentials path.
            list.forEach((cred) => {
              const v = cred.url
              if (v) {
                cred.urls = v
                delete cred.url
              }
              a.push(cred)
            })
          }
          resolve(a)
        })
        .catch((error) => {
          logger.error('Error while getting RTC ICE servers: ', error)
          resolve(a)
        })
    })
  }

  setRTCRemoteSDP (sdp) {
    logger.info('Setting SDP to peer')
    logger.debug('SDP value: ', sdp)
    const answer = {
      type: 'answer',
      sdp
    }
    return new Promise((resolve, reject) => {
      this.peer.setRemoteDescription(answer).then((response) => {
        logger.info('Remote description to peer sent')
        resolve(response)
      })
        .catch((error) => {
          logger.error('Error while setting remote description to peer: ', error)
          reject(error)
        })
    })
  }

  getRTCLocalSDP (stereo, mediaStream) {
    logger.info('Getting RTC Local SDP')
    logger.debug('Stereo value: ', stereo)
    logger.debug('mediaStream value: ', mediaStream)
    logger.debug('RTC offer options: ', this.RTCOfferOptions)
    if (mediaStream) {
      logger.info('Adding mediaStream tracks to RTCPeerConnection')
      mediaStream.getTracks().forEach((track) => {
        this.peer.addTrack(track, mediaStream)
      })
      logger.info('Tracks added')
    }

    logger.info('Creating peer offer')
    return this.peer
      .createOffer(this.RTCOfferOptions)
      .then((res) => {
        logger.info('Perr offer created')
        logger.debug('Perr offer response: ', res)
        this.desc = res
        if (stereo) {
          logger.info('Replacing SDP response for support stereo')
          this.desc.sdp = this.desc.sdp.replace(
            'useinbandfec=1',
            'useinbandfec=1; stereo=1'
          )
          logger.info('Replaced SDP response for support stereo')
          logger.debug('New SDP value: ', this.desc.sdp)
        }
        logger.info('Setting peer local description')
        return this.peer.setLocalDescription(this.desc)
      })
      .then(() => {
        logger.info('Peer local description sent')
        return Promise.resolve(this.desc.sdp)
      })
      .catch((err) => {
        logger.info('Error while setting peer local description: ', err)
        return Promise.reject(err)
      })
  }

  resolveLocalSDP (stereo, mediaStream) {
    logger.info('Resolving local SDP')
    return this.getRTCConfiguration()
      .then((config) => {
        return this.getRTCPeer(config)
      })
      .then(() => {
        return this.getRTCLocalSDP(stereo, mediaStream)
      })
  }

  /**
   * Establish MillicastStream Update Bandwidth.
   * @param {String} sdp - Remote SDP.
   * @param {Number} bitrate - Bitrate, 0 unlimited bitrate
   * @return {String} sdp - Mangled SDP
   */
  updateBandwidthRestriction (sdp, bitrate = 0) {
    logger.info('Updating bandwith restriction, bitrate value: ', bitrate)
    logger.debug('SDP value: ', sdp)

    const offer = SemanticSDP.SDPInfo.parse(sdp)
    const videoOffer = offer.getMedia('video')

    if (bitrate < 1) {
      logger.info('Changing SDP to remove bitrate restrictions')
      sdp = sdp.replace(/b=AS:.*\r\n/, '').replace(/b=TIAS:.*\r\n/, '')
    } else {
      logger.info('Setting video bitrate')
      videoOffer.setBitrate(bitrate)
      sdp = offer.toString()
      if (window.adapter) {
        if (
          sdp.indexOf('b=AS:') > -1 &&
          window.adapter.browserDetails.browser === 'firefox'
        ) {
          logger.info('Updating SDP for firefox browser')
          sdp = sdp.replace('b=AS:', 'b=TIAS:')
          logger.debug('SDP updated for firefox: ', sdp)
        }
      }
    }
    return sdp
  }

  updateBitrate (bitrate = 0) {
    logger.info('Updating bitrate to value: ', bitrate)
    return this.getRTCPeer()
      .then((pc) => {
        this.peer = pc
        return this.getRTCLocalSDP(true, null)
      })
      .then(() => {
        const sdp = this.updateBandwidthRestriction(this.peer.remoteDescription.sdp, bitrate)
        return this.setRTCRemoteSDP(sdp)
      })
  }

  getRTCPeerStatus () {
    logger.info('Getting RTC peer status')
    let state = 'not_established'
    if (this.peer) { state = this.peer.connectionState }
    logger.info('RTC peer status getted, value: ', state)
    return state
  }
}
