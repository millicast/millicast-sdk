import axios from 'axios'
import EventEmitter from 'events'
import SdpParser from './utils/SdpParser'
import MillicastLogger from './MillicastLogger'

const logger = MillicastLogger.get('MillicastWebRTC')

export const webRTCEvents = {
  track: 'track',
  connectionStateChange: 'connectionStateChange'
}

/**
 * @class MillicastWebRTC
 * @extends EventEmitter
 * @classdesc Manages WebRTC connection and SDP information between peers.
 * @example const millicastWebRTC = new MillicastWebRTC()
 * @constructor
 */
export default class MillicastWebRTC extends EventEmitter {
  constructor () {
    super()
    this.sessionDescription = null
    this.peer = null
    this.RTCOfferOptions = {
      offerToReceiveVideo: true,
      offerToReceiveAudio: true
    }
  }

  /**
   * Get current RTC peer connection or establish a new connection.
   * @param {RTCConfiguration} config - Peer configuration.
   * @returns {Promise<RTCPeerConnection>} Promise object which represents the RTCPeerConnection.
   */
  async getRTCPeer (config = null) {
    logger.info('Getting RTC Peer')
    logger.debug('RTC configuration provided by user: ', config)
    if (!this.peer) {
      try {
        if (!config) {
          logger.info('RTC configuration not provided by user.')
          config = await this.getRTCConfiguration()
        }
        this.peer = instanceRTCPeerConnection(this, config)
      } catch (e) {
        logger.error('Error while creating RTCPeerConnection: ', e)
        throw e
      }
    }

    const { connectionState, currentLocalDescription, currentRemoteDescription } = this.peer
    logger.debug('getRTCPeer return: ', { connectionState, currentLocalDescription, currentRemoteDescription })
    return this.peer
  }

  /**
   * Close RTC peer connection.
   */
  async closeRTCPeer () {
    try {
      logger.info('Closing RTCPeerConnection')
      this.peer?.close()
      this.peer = null
      this.emit(webRTCEvents.connectionStateChange, 'closed')
    } catch (e) {
      logger.error('Error while closing RTCPeerConnection: ', e)
      throw e
    }
  }

  /**
   * Get RTC configurations with ICE servers get from Milicast signaling server.
   * @returns {Promise<RTCConfiguration>} Promise object which represents the RTCConfiguration.
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
   * Get Ice servers from a Millicast signaling server.
   * @param {String} location - URL of signaling server where Ice servers will be obtained.
   * @returns {Promise<Array<RTCIceServer>>} Promise object which represents a list of Ice servers.
   */
  async getRTCIceServers (location = 'https://turn.millicast.com/webrtc/_turn') {
    logger.info('Getting RTC ICE servers')
    logger.debug('RTC ICE servers request location: ', location)

    const iceServers = []
    try {
      const { data } = await axios.put(location)
      logger.debug('RTC ICE servers response: ', data)
      if (data.s === 'ok') {
        // call returns old format, this updates URL to URLS in credentials path.
        for (const credentials of data.v.iceServers) {
          const url = credentials.url
          if (url) {
            credentials.urls = url
            delete credentials.url
          }
          iceServers.push(credentials)
        }
        logger.info('RTC ICE servers successfully obtained.')
      }
    } catch (e) {
      logger.error('Error while getting RTC ICE servers: ', e.response.data)
    }

    return iceServers
  }

  /**
   * Set SDP information to remote peer.
   * @param {String} sdp - New SDP to be set in the remote peer.
   * @returns {Promise<void>} Promise object which resolves when SDP information was successfully set.
   */
  async setRTCRemoteSDP (sdp) {
    logger.info('Setting RTC Remote SDP')
    const answer = { type: 'answer', sdp }

    try {
      await this.peer.setRemoteDescription(answer)
      logger.info('RTC Remote SDP was set successfully.')
      logger.debug('RTC Remote SDP new value: ', sdp)
    } catch (e) {
      logger.error('Error while setting RTC Remote SDP: ', escape)
      throw e
    }
  }

  /**
   * Set SDP information to local peer.
   * @param {Object} options
   * @param {Boolean} options.stereo - True to modify SDP for support stereo. Otherwise False.
   * @param {MediaStream|Array<MediaStreamTrack>} options.mediaStream - MediaStream to offer in a stream. This object must have
   * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
   * @param {'h264'|'vp8'|'vp9'|'av1'} options.codec - Selected codec for support simulcast.
   * @param {Boolean} options.simulcast - True to modify SDP for support simulcast.
   * @returns {Promise<String>} Promise object which represents the SDP information of the created offer.
   */
  async getRTCLocalSDP (options = {
    stereo: false,
    mediaStream: null,
    codec: 'h264',
    simulcast: false
  }) {
    logger.info('Getting RTC Local SDP')
    logger.debug('Stereo value: ', options.stereo)
    logger.debug('RTC offer options: ', this.RTCOfferOptions)

    const mediaStream = getValidMediaStream(options.mediaStream)
    if (mediaStream) {
      logger.info('Adding mediaStream tracks to RTCPeerConnection')
      for (const track of mediaStream.getTracks()) {
        this.peer.addTrack(track, mediaStream)
        logger.info(`Track '${track.label}' added: `, `id: ${track.id}`, `kind: ${track.kind}`)
      }
    }

    logger.info('Creating peer offer')
    try {
      const response = await this.peer.createOffer(this.RTCOfferOptions)
      logger.info('Peer offer created')
      logger.debug('Peer offer response: ', response.sdp)

      this.sessionDescription = response
      if (options.simulcast) {
        window.MISDP = this.sessionDescription.sdp
        this.sessionDescription.sdp = SdpParser.setSimulcast(this.sessionDescription.sdp, options.codec)
      }
      if (options.stereo) {
        this.sessionDescription.sdp = SdpParser.setStereo(this.sessionDescription.sdp)
      }

      await this.peer.setLocalDescription(this.sessionDescription)
      logger.info('Peer local description set')

      return this.sessionDescription.sdp
    } catch (e) {
      logger.info('Error while setting peer local description: ', e)
      throw e
    }
  }

  /**
   * Update remote SDP information to restrict bandwidth.
   * @param {String} sdp - Remote SDP.
   * @param {Number} bitrate - New bitrate value in kbps or 0 unlimited bitrate.
   * @return {String} Updated SDP information with new bandwidth restriction.
   */
  updateBandwidthRestriction (sdp, bitrate = 0) {
    logger.info('Updating bandwidth restriction, bitrate value: ', bitrate)
    logger.debug('SDP value: ', sdp)
    return SdpParser.setVideoBitrate(sdp, bitrate)
  }

  /**
   * Set SDP information to remote peer with bandwidth restriction.
   * @param {Number} bitrate - New bitrate value in kbps or 0 unlimited bitrate.
   * @returns {Promise<void>} Promise object which resolves when bitrate was successfully updated.
   */
  async updateBitrate (bitrate = 0) {
    logger.info('Updating bitrate to value: ', bitrate)

    this.peer = await this.getRTCPeer()
    await this.getRTCLocalSDP(true, null)

    const sdp = this.updateBandwidthRestriction(this.peer.remoteDescription.sdp, bitrate)
    await this.setRTCRemoteSDP(sdp)
    logger.info('Bitrate restirctions updated: ', `${bitrate > 0 ? bitrate : 'unlimited'} kbps`)
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

  /**
   * Replace current audio or video track that is being broadcasted.
   * @param {MediaStreamTrack} mediaStreamTrack - New audio or video track to replace the current one.
   */
  replaceTrack (mediaStreamTrack) {
    if (!this.peer) {
      logger.error('Could not change track if there is not an active connection.')
    }

    const currentSender = this.peer.getSenders().find(s => s.track.kind === mediaStreamTrack.kind)

    if (currentSender) {
      currentSender.replaceTrack(mediaStreamTrack)
    } else {
      logger.error(`There is no ${mediaStreamTrack.kind} track in active broadcast.`)
    }
  }

  /**
   * Parse remote SDP for correct format when setting in peer.
   * @param {String} remoteSdp - Remote SDP.
   * @return {String} Updated SDP information.
   */
  parseRemoteSDP (remoteSdp) {
    if (remoteSdp?.indexOf('\na=extmap-allow-mixed') !== -1) {
      remoteSdp = SdpParser.removeSdpLine(remoteSdp, 'a=extmap-allow-mixed')
    }
    return remoteSdp
  }
}

const isMediaStreamValid = mediaStream =>
  mediaStream?.getAudioTracks().length === 1 || mediaStream?.getVideoTracks().length === 1

const getValidMediaStream = (mediaStream) => {
  if (!mediaStream) {
    return null
  }

  if (mediaStream instanceof MediaStream && isMediaStreamValid(mediaStream)) {
    return mediaStream
  } else {
    logger.info('Creating MediaStream to add received tracks.')
    const stream = new MediaStream()
    for (const track of mediaStream) {
      stream.addTrack(track)
    }

    if (isMediaStreamValid(stream)) {
      return stream
    }
  }

  logger.error('MediaStream must have 1 audio track and 1 video track, or at least one of them.')
  throw new Error('MediaStream must have 1 audio track and 1 video track, or at least one of them.')
}

const instanceRTCPeerConnection = (instanceClass, config) => {
  const instance = new RTCPeerConnection(config)
  addPeerEvents(instanceClass, instance)
  return instance
}

/**
 * Emits peer events.
 * @param {MillicastWebRTC} instanceClass - MillicastWebRTC instance.
 * @param {RTCPeerConnection} peer - Peer instance.
 * @fires MillicastWebRTC#track
 * @fires MillicastWebRTC#connectionStateChange
 */
const addPeerEvents = (instanceClass, peer) => {
  peer.ontrack = (event) => {
    logger.info('New track from peer.')
    logger.debug('Track event value: ', event)
    /**
     * New track event.
     *
     * @event MillicastWebRTC#track
     * @type {RTCTrackEvent}
     */
    instanceClass.emit(webRTCEvents.track, event)
  }
  peer.onconnectionstatechange = (event) => {
    logger.info('Peer connection state change: ', peer.connectionState)
    /**
    * Peer connection state change. Could be new, connecting, connected, disconnected, failed or closed.
    *
    * @event MillicastWebRTC#connectionStateChange
    * @type {RTCPeerConnectionState}
    */
    instanceClass.emit(webRTCEvents.connectionStateChange, peer.connectionState)
  }
}
