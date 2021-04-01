import axios from 'axios'
import SemanticSDP from 'semantic-sdp'
import Logger from './Logger'

const logger = Logger.get('MillicastWebRTC')

/**
 * @class MillicastWebRTC
 * @classdesc Manages all WebRTC and SDP related.
 * @example const millicastWebRTC = new MillicastWebRTC();
 * @constructor
 */
export default class MillicastWebRTC {
  constructor () {
    this.sessionDescription = null
    this.peer = null
    this.RTCOfferOptions = {
      offerToReceiveVideo: true,
      offerToReceiveAudio: true
    }
  }

  /**
   * Get current RTC peer connection, creates a new connection if not.
   * @param {RTCConfiguration} config - Peer configuration.
   * @returns {Promise<RTCPeerConnection>} Promise object which represents the RTCPeerConnection.
   */
  async getRTCPeer (config) {
    logger.info('Getting RTC Peer')
    logger.debug('Config value: ', config)
    if (!this.peer) {
      try {
        if (config) {
          config = await this.getRTCConfiguration()
        }
        this.peer = new RTCPeerConnection(config)
      } catch (e) {
        logger.error('Error while creating RTCPeerConnection: ', e)
        throw e
      }
    }

    logger.debug('Peer value: ', this.peer)
    return this.peer
  }

  /**
   * Close RTC peer connection.
   */
  async closeRTCPeer () {
    try {
      logger.info('Closing RTCPeerConnection')
      this.peer.close()
      this.peer = null
    } catch (e) {
      logger.error('Error while closing RTCPeerConnection: ', e)
      throw e
    }
  }

  /**
   * Get RTC configuration, including the RTC Ice servers.
   * @returns {Promise<RTCConfiguration>} Promise object which represents the RTCPConfiguration.
   */
  async getRTCConfiguration () {
    logger.info('Getting RTC configuration')
    const config = {
      rtcpMuxPolicy: 'require',
      bundlePolicy: 'max-bundle'
    }

    config.iceServers = await this.getRTCIceServers()
    return config
  }

  /**
   * Get Ice servers given by location.
   * @param {String} location - URL where the Ice servers will be searched.
   * @returns {Promise<Array<IceServer>>} Promise object which represents a list of Ice servers.
   */
  async getRTCIceServers (location = 'https://turn.millicast.com/webrtc/_turn') {
    logger.info('Getting RTC ICE servers')
    logger.debug('Request location: ', location)

    const iceServers = []
    try {
      const { data } = await axios.put(location)
      logger.debug('RTC ICE servers response: ', data)
      if (data.s === 'ok') {
        logger.info('RTC ICE servers successfully obtained')
        // call returns old format, this updates URL to URLS in credentials path.
        for (const credentials of data.v.iceServers) {
          const url = credentials.url
          if (url) {
            credentials.urls = url
            delete credentials.url
          }
          iceServers.push(credentials)
        }
      }
    } catch (e) {
      logger.error('Error while getting RTC ICE servers: ', e.response.data)
    }

    return iceServers
  }

  /**
   * Set remote description to peer.
   * @param {String} sdp - SDP
   * @returns {Promise<void>}
   */
  async setRTCRemoteSDP (sdp) {
    logger.info('Setting SDP to peer')
    logger.debug('SDP value: ', sdp)
    const answer = { type: 'answer', sdp }

    try {
      const response = this.peer.setRemoteDescription(answer)
      logger.info('Remote description to peer sent')
      return response
    } catch (e) {
      logger.error('Error while setting remote description to peer: ', escape)
      throw e
    }
  }

  /**
   * Set and get local SDP.
   * @param {Boolean} stereo - True to modify SDP for support stereo. Otherwise False.
   * @param {MediaStream} mediaStream - MediaStream to offer in stream.
   * @returns {Promise<String>} Promise object which represents the SDP resulted from the offer.
   */
  async getRTCLocalSDP (stereo, mediaStream) {
    logger.info('Getting RTC Local SDP')
    logger.debug('Stereo value: ', stereo)
    logger.debug('mediaStream value: ', mediaStream)
    logger.debug('RTC offer options: ', this.RTCOfferOptions)
    if (mediaStream) {
      logger.info('Adding mediaStream tracks to RTCPeerConnection')
      for (const track of mediaStream.getTracks()) {
        this.peer.addTrack(track, mediaStream)
      }
      logger.info('Tracks added')
    }

    logger.info('Creating peer offer')
    try {
      const response = await this.peer.createOffer(this.RTCOfferOptions)
      logger.info('Perr offer created')
      logger.debug('Perr offer response: ', response)

      this.sessionDescription = response
      if (stereo) {
        logger.info('Replacing SDP response for support stereo')
        this.sessionDescription.sdp = this.sessionDescription.sdp.replace(
          'useinbandfec=1',
          'useinbandfec=1; stereo=1'
        )
        logger.info('Replaced SDP response for support stereo')
        logger.debug('New SDP value: ', this.sessionDescription.sdp)
      }

      logger.info('Setting peer local description')
      await this.peer.setLocalDescription(this.sessionDescription)

      return this.sessionDescription.sdp
    } catch (e) {
      logger.info('Error while setting peer local description: ', e)
      throw e
    }
  }

  // TODO: Review if it's been used
  async resolveLocalSDP (stereo, mediaStream) {
    logger.info('Resolving local SDP')

    const config = await this.getRTCConfiguration()
    await this.getRTCPeer(config)
    return this.getRTCLocalSDP(stereo, mediaStream)
  }

  /**
   * Establish MillicastStream Update Bandwidth.
   * @param {String} sdp - Remote SDP.
   * @param {Number} bitrate - Bitrate, 0 unlimited bitrate.
   * @return {String} SDP - Mangled SDP.
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
      if (sdp.indexOf('b=AS:') > -1 && window.adapter?.browserDetails?.browser === 'firefox') {
        logger.info('Updating SDP for firefox browser')
        sdp = sdp.replace('b=AS:', 'b=TIAS:')
        logger.debug('SDP updated for firefox: ', sdp)
      }
    }
    return sdp
  }

  /**
   * Update bitrate to peer.
   * @param {Number} bitrate - Bitrate value. 0 for unlimited.
   * @returns {Promise<void>}
   */
  async updateBitrate (bitrate = 0) {
    logger.info('Updating bitrate to value: ', bitrate)

    this.peer = await this.getRTCPeer()
    await this.getRTCLocalSDP(true, null)

    const sdp = this.updateBandwidthRestriction(this.peer.remoteDescription.sdp, bitrate)
    return this.setRTCRemoteSDP(sdp)
  }

  /**
   * Get peer connection state.
   * @returns {RTCPeerConnectionState?} Promise object which represents the peer connection state.
   */
  getRTCPeerStatus () {
    logger.info('Getting RTC peer status')
    if (!this.peer) {
      return null
    }
    const { connectionState } = this.peer
    logger.info('RTC peer status getted, value: ', connectionState)
    return connectionState
  }
}
