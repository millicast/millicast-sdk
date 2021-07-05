import axios from 'axios'
import EventEmitter from 'events'
import reemit from 're-emitter'
import PeerConnectionStats, { peerConnectionStatsEvents } from './PeerConnectionStats'
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

const localSDPOptions = {
  stereo: false,
  mediaStream: null,
  codec: 'h264',
  simulcast: false,
  scalabilityMode: null,
  disableAudio: false,
  disableVideo: false
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
    this.peerConnectionStats = null
  }

  /**
   * Instance new RTCPeerConnection.
   * @param {RTCConfiguration} config - Peer configuration.
   */
  async createRTCPeer (config = null) {
    logger.info('Creating new RTCPeerConnection')
    logger.debug('RTC configuration provided by user: ', config)
    config = await this.getRTCConfiguration(config)
    this.peer = instanceRTCPeerConnection(this, config)
  }

  /**
   * Get current RTC peer connection.
   * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
   */
  getRTCPeer () {
    logger.info('Getting RTC Peer')
    if (this.peer) {
      const connectionState = getConnectionState(this.peer)
      const { currentLocalDescription, currentRemoteDescription } = this.peer
      logger.debug('getRTCPeer return: ', { connectionState, currentLocalDescription, currentRemoteDescription })
    }
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
    this.stopStats()
    this.emit(webRTCEvents.connectionStateChange, 'closed')
  }

  /**
   * Get default RTC configuration with ICE servers from Milicast signaling server and merge it with the user configuration provided. User configuration has priority over defaults.
   * @param {RTCConfiguration} config - Options to configure the new RTCPeerConnection.
   * @returns {Promise<RTCConfiguration>} Promise object which represents the RTCConfiguration.
   */
  async getRTCConfiguration (config) {
    logger.info('Getting RTC configuration')
    const configParsed = config ?? {}
    configParsed.iceServers = configParsed.iceServers ?? await this.getRTCIceServers()
    return configParsed
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
   * @param {Boolean} options.disableAudio - True to not support audio.
   * @param {Boolean} options.disableVideo - True to not support video.
   * @returns {Promise<String>} Promise object which represents the SDP information of the created offer.
   */
  async getRTCLocalSDP (options = localSDPOptions) {
    logger.info('Getting RTC Local SDP')
    options = { ...localSDPOptions, ...options }
    logger.debug('Options: ', options)

    const mediaStream = getValidMediaStream(options.mediaStream)
    if (mediaStream) {
      addMediaStreamToPeer(this.peer, mediaStream, options)
    } else {
      addReceiveTransceivers(this.peer, options)
    }

    logger.info('Creating peer offer')
    const response = await this.peer.createOffer()
    logger.info('Peer offer created')
    logger.debug('Peer offer response: ', response.sdp)

    this.sessionDescription = response
    if (!options.disableAudio) {
      this.sessionDescription.sdp = SdpParser.setMultiopus(this.sessionDescription.sdp, mediaStream)
      if (options.stereo) {
        this.sessionDescription.sdp = SdpParser.setStereo(this.sessionDescription.sdp)
      }
    }
    if (!options.disableVideo && options.simulcast) {
      this.sessionDescription.sdp = SdpParser.setSimulcast(this.sessionDescription.sdp, options.codec)
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
    if (!this.peer) {
      logger.error('Cannot update bitrate. No peer found.')
      throw new Error('Cannot update bitrate. No peer found.')
    }

    logger.info('Updating bitrate to value: ', bitrate)
    this.sessionDescription = await this.peer.createOffer()
    await this.peer.setLocalDescription(this.sessionDescription)
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
   * @property {Array<Object>} codecs
   * @property {String} codecs.codec - Audio or video codec name.
   * @property {String} codecs.mimeType - Audio or video codec mime type.
   * @property {Array<String>} [codecs.scalabilityModes] - In case of SVC support, a list of scalability modes supported.
   * @property {Number} [codecs.channels] - Only for audio, the number of audio channels supported.
   * @property {Array<RTCRtpHeaderExtensionCapability>} headerExtensions - An array specifying the URI of the header extension, as described in RFC 5285.
   */
  /**
   * Gets user's browser media capabilities compared with Millicast Media Server support.
   *
   * @param {"audio"|"video"} kind - Type of media for which you wish to get sender capabilities.
   * @returns {MillicastCapability} Object with all capabilities supported by user's browser and Millicast Media Server.
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

  /**
   * Initialize the statistics monitoring of the RTCPeerConnection.
   *
   * It will be emitted every second.
   * @fires PeerConnection#stats
   * @example peerConnection.initStats()
   * @example
   * import Publish from '@millicast/sdk'
   *
   * //Initialize and connect your Publisher
   * const millicastPublish = new Publish(streamName, tokenGenerator)
   * await millicastPublish.connect(options)
   *
   * //Initialize get stats
   * millicastPublish.webRTCPeer.initStats()
   *
   * //Capture new stats from event every second
   * millicastPublish.webRTCPeer.on('stats', (stats) => {
   *   console.log('Stats from event: ', stats)
   * })
   * @example
   * import View from '@millicast/sdk'
   *
   * //Initialize and connect your Viewer
   * const millicastView = new View(streamName, tokenGenerator)
   * await millicastView.connect()
   *
   * //Initialize get stats
   * millicastView.webRTCPeer.initStats()
   *
   * //Capture new stats from event every second
   * millicastView.webRTCPeer.on('stats', (stats) => {
   *   console.log('Stats from event: ', stats)
   * })
   */
  initStats () {
    if (this.peerConnectionStats) {
      logger.warn('Cannot init peer stats: Already initialized')
    } else if (this.peer) {
      this.peerConnectionStats = new PeerConnectionStats(this.peer)
      this.peerConnectionStats.init()
      reemit(this.peerConnectionStats, this, [peerConnectionStatsEvents.stats])
    } else {
      logger.warn('Cannot init peer stats: RTCPeerConnection not initialized')
    }
  }

  /**
   * Stops the monitoring of RTCPeerConnection statistics.
   * @example peerConnection.stopStats()
   */
  stopStats () {
    this.peerConnectionStats?.stop()
    this.peerConnectionStats = null
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

const addMediaStreamToPeer = (peer, mediaStream, options) => {
  logger.info('Adding mediaStream tracks to RTCPeerConnection')
  for (const track of mediaStream.getTracks()) {
    const initOptions = {
      streams: [mediaStream]
    }

    if (track.kind === 'audio') {
      initOptions.direction = !options.disableAudio ? 'sendonly' : 'inactive'
    }

    if (track.kind === 'video') {
      initOptions.direction = !options.disableVideo ? 'sendonly' : 'inactive'

      if (options.scalabilityMode && new UserAgent().isChrome()) {
        logger.debug(`Video track with scalability mode: ${options.scalabilityMode}.`)
        initOptions.sendEncodings = [
          { scalabilityMode: options.scalabilityMode }
        ]
      } else if (options.scalabilityMode) {
        logger.warn('SVC is only supported in Google Chrome')
      }
    }

    peer.addTransceiver(track, initOptions)
    logger.info(`Track '${track.label}' added: `, `id: ${track.id}`, `kind: ${track.kind}`)
  }
}

const addReceiveTransceivers = (peer, options) => {
  peer.addTransceiver('video', {
    direction: !options.disableVideo ? 'recvonly' : 'inactive'
  })
  peer.addTransceiver('audio', {
    direction: !options.disableAudio ? 'recvonly' : 'inactive'
  })
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
