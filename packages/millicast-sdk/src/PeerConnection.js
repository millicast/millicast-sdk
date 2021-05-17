import axios from 'axios'
import EventEmitter from 'events'
import SdpParser from './utils/SdpParser'
import UserAgent from './utils/UserAgent'
import Logger from './Logger'
import { VideoCodec, AudioCodec } from './Signaling'
import mozGetCapabilities from './utils/FirefoxCapabilities'

const logger = Logger.get('PeerConnection')

export const webRTCEvents = {
  track: 'track',
  connectionStateChange: 'connectionStateChange'
}

/**
 * @class PeerConnection
 * @extends EventEmitter
 * @classdesc Manages WebRTC connection and SDP information between peers.
 * @example const peerConnection = new PeerConnection()
 * @constructor
 */
export default class PeerConnection extends EventEmitter {
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
      if (!config) {
        logger.info('RTC configuration not provided by user.')
        config = await this.getRTCConfiguration()
      }
      this.peer = instanceRTCPeerConnection(this, config)
    }

    const connectionState = getConnectionState(this.peer)
    const { currentLocalDescription, currentRemoteDescription } = this.peer
    logger.debug('getRTCPeer return: ', { connectionState, currentLocalDescription, currentRemoteDescription })
    return this.peer
  }

  /**
   * Close RTC peer connection.
   * @fires PeerConnection#connectionStateChange
   */
  async closeRTCPeer () {
    logger.info('Closing RTCPeerConnection')
    this.peer?.close()
    this.peer = null
    this.emit(webRTCEvents.connectionStateChange, 'closed')
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
      logger.error('Error while setting RTC Remote SDP: ', e)
      throw e
    }
  }

  /**
   * Set SDP information to local peer.
   * @param {Object} options
   * @param {Boolean} options.stereo - True to modify SDP for support stereo. Otherwise False.
   * @param {MediaStream|Array<MediaStreamTrack>} options.mediaStream - MediaStream to offer in a stream. This object must have
   * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
   * @param {VideoCodec} options.codec - Selected codec for support simulcast.
   * @param {Boolean} options.simulcast - True to modify SDP for support simulcast. **Only available in Google Chrome and with H.264 or VP8 video codecs.**
   * @param {String} options.scalabilityMode - Selected scalability mode. You can get the available capabilities using <a href="PeerConnection#.getCapabilities">PeerConnection.getCapabilities</a> method.
   * **Only available in Google Chrome.**
   * @returns {Promise<String>} Promise object which represents the SDP information of the created offer.
   */
  async getRTCLocalSDP (options = {
    stereo: false,
    mediaStream: null,
    codec: 'h264',
    simulcast: false,
    scalabilityMode: null
  }) {
    logger.info('Getting RTC Local SDP')
    logger.debug('Stereo value: ', options.stereo)
    logger.debug('RTC offer options: ', this.RTCOfferOptions)

    const mediaStream = getValidMediaStream(options.mediaStream)
    if (mediaStream) {
      logger.info('Adding mediaStream tracks to RTCPeerConnection')
      for (const track of mediaStream.getTracks()) {
        if (track.kind === 'video' && options.scalabilityMode && new UserAgent().isChrome()) {
          logger.debug(`Video track with scalability mode: ${options.scalabilityMode}, adding as transceiver.`)
          this.peer.addTransceiver(track, {
            streams: [mediaStream],
            sendEncodings: [
              { scalabilityMode: options.scalabilityMode }
            ]
          })
        } else {
          if (track.kind === 'video' && options.scalabilityMode) {
            logger.warn('SVC is only supported in Google Chrome')
          }
          this.peer.addTrack(track, mediaStream)
        }
        logger.info(`Track '${track.label}' added: `, `id: ${track.id}`, `kind: ${track.kind}`)
      }
    }

    logger.info('Creating peer offer')
    const response = await this.peer.createOffer(this.RTCOfferOptions)
    logger.info('Peer offer created')
    logger.debug('Peer offer response: ', response.sdp)

    this.sessionDescription = response
    this.sessionDescription.sdp = SdpParser.setMultiopus(this.sessionDescription.sdp)
    if (options.simulcast) {
      this.sessionDescription.sdp = SdpParser.setSimulcast(this.sessionDescription.sdp, options.codec)
    }
    if (options.stereo) {
      this.sessionDescription.sdp = SdpParser.setStereo(this.sessionDescription.sdp)
    }

    await this.peer.setLocalDescription(this.sessionDescription)
    logger.info('Peer local description set')

    return this.sessionDescription.sdp
  }

  /**
   * Update remote SDP information to restrict bandwidth.
   * @param {String} sdp - Remote SDP.
   * @param {Number} bitrate - New bitrate value in kbps or 0 unlimited bitrate.
   * @return {String} Updated SDP information with new bandwidth restriction.
   */
  updateBandwidthRestriction (sdp, bitrate) {
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
    const connectionState = getConnectionState(this.peer)
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
      return
    }

    const currentSender = this.peer.getSenders().find(s => s.track.kind === mediaStreamTrack.kind)

    if (currentSender) {
      currentSender.replaceTrack(mediaStreamTrack)
    } else {
      logger.error(`There is no ${mediaStreamTrack.kind} track in active broadcast.`)
    }
  }

  /**
   * @typedef {Object} MillicastCapability
   * @property {String} codec - Audio or video codec name.
   * @property {String} mimeType - Audio or video codec mime type.
   * @property {Array<String>} [scalabilityModes] - In case of SVC support, a list of scalability modes supported.
   * @property {Number} [channels] - Only for audio, the number of audio channels supported.
   */
  /**
   * Gets user's browser media capabilities compared with Millicast Media Server support.
   *
   * @param {"audio"|"video"} kind - Type of media for which you wish to get sender capabilities.
   * @returns {Array<MillicastCapability>} An array with all capabilities supported by user's browser and Millicast Media Server.
   */
  static getCapabilities (kind) {
    const browserData = new UserAgent()
    if (browserData.isFirefox()) {
      return mozGetCapabilities(kind)
    }

    const browserCapabilites = RTCRtpSender.getCapabilities(kind)

    if (browserCapabilites) {
      const codecs = {}
      let regex = new RegExp(`^video/(${Object.values(VideoCodec).join('|')})x?$`, 'i')

      if (kind === 'audio') {
        regex = new RegExp(`^audio/(${Object.values(AudioCodec).join('|')})$`, 'i')

        if (browserData.isChrome()) {
          codecs.multiopus = { mimeType: 'audio/multiopus', channels: 6 }
        }
      }

      for (const codec of browserCapabilites.codecs) {
        const matches = codec.mimeType.match(regex)
        if (matches) {
          const codecName = matches[1].toLowerCase()
          codecs[codecName] = { ...codecs[codecName], mimeType: codec.mimeType }
          if (codec.scalabilityModes) {
            let modes = codecs[codecName].scalabilityModes || []
            modes = [...modes, ...codec.scalabilityModes]
            codecs[codecName].scalabilityModes = [...new Set(modes)]
          }
          if (codec.channels) {
            codecs[codecName].channels = codec.channels
          }
        }
      }

      browserCapabilites.codecs = Object.keys(codecs).map((key) => { return { codec: key, ...codecs[key] } })
    }

    return browserCapabilites
  }

  /**
   * Get sender tracks
   * @returns {Array<MediaStreamTrack>} An array with all tracks in sender peer.
   */
  getTracks () {
    return this.peer?.getSenders()?.map((sender) => sender.track)
  }
}

const isMediaStreamValid = mediaStream =>
  mediaStream?.getAudioTracks().length <= 1 && mediaStream?.getVideoTracks().length <= 1

const getValidMediaStream = (mediaStream) => {
  if (!mediaStream) {
    return null
  }

  if (mediaStream instanceof MediaStream && isMediaStreamValid(mediaStream)) {
    return mediaStream
  } else if (!(mediaStream instanceof MediaStream)) {
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
 * @param {PeerConnection} instanceClass - PeerConnection instance.
 * @param {RTCPeerConnection} peer - Peer instance.
 * @fires PeerConnection#track
 * @fires PeerConnection#connectionStateChange
 */
const addPeerEvents = (instanceClass, peer) => {
  peer.ontrack = (event) => {
    logger.info('New track from peer.')
    logger.debug('Track event value: ', event)
    /**
     * New track event.
     *
     * @event PeerConnection#track
     * @type {RTCTrackEvent}
     */
    instanceClass.emit(webRTCEvents.track, event)
  }

  if (peer.connectionState) {
    peer.onconnectionstatechange = (event) => {
      logger.info('Peer connection state change: ', peer.connectionState)
      /**
      * Peer connection state change. Could be new, connecting, connected, disconnected, failed or closed.
      *
      * @event PeerConnection#connectionStateChange
      * @type {RTCPeerConnectionState}
      */
      instanceClass.emit(webRTCEvents.connectionStateChange, peer.connectionState)
    }
  } else {
    // ConnectionStateChange does not exists in Firefox.
    peer.oniceconnectionstatechange = (event) => {
      logger.info('Peer ICE connection state change: ', peer.iceConnectionState)
      /**
      * @fires PeerConnection#connectionStateChange
      */
      instanceClass.emit(webRTCEvents.connectionStateChange, peer.iceConnectionState)
    }
  }
}

const getConnectionState = (peer) => {
  const connectionState = peer.connectionState ?? peer.iceConnectionState
  switch (connectionState) {
    case 'checking':
      return 'connecting'
    case 'completed':
      return 'connected'
    default:
      return connectionState
  }
}
