import EventEmitter from 'events'
import reemit from 're-emitter'
import PeerConnectionStats, { peerConnectionStatsEvents } from './PeerConnectionStats'
import SdpParser from './utils/SdpParser'
import UserAgent from './utils/UserAgent'
import Logger from './Logger'
import { VideoCodec, AudioCodec } from './utils/Codecs'

const logger = Logger.get('PeerConnection')

export const ConnectionType = {
  Publisher: 'Publisher',
  Viewer: 'Viewer',
}
export const webRTCEvents = {
  track: 'track',
  connectionStateChange: 'connectionStateChange',
}

const localSDPOptions = {
  stereo: false,
  mediaStream: null,
  codec: 'h264',
  simulcast: false,
  scalabilityMode: null,
  disableAudio: false,
  disableVideo: false,
  setSDPToPeer: true,
}

/**
 * @class PeerConnection
 * @extends EventEmitter
 * @classdesc Manages WebRTC connection and SDP information between peers.
 * @example const peerConnection = new PeerConnection()
 * @constructor
 */
export default class PeerConnection extends EventEmitter {
  public mode: any
  public sessionDescription: any
  public peer: any
  public peerConnectionStats: any
  public transceiverMap: any
  constructor() {
    super()
    this.mode = null
    this.sessionDescription = null
    this.peer = null
    this.peerConnectionStats = null
    this.transceiverMap = new Map()
  }

  /**
   * Instance new RTCPeerConnection.
   * @param {RTCConfiguration} config - Peer configuration.
   * @param {Boolean} [config.autoInitStats = true] - True to initialize statistics monitoring of the RTCPeerConnection accessed via Logger.get(), false to opt-out.
   * @param {Number} [config.statsIntervalMs = 1000] - The default interval at which the SDK will return WebRTC stats to the consuming application.
   * @param {String} [mode = "Viewer"] - Type of connection that is trying to be created, either 'Viewer' or 'Publisher'.
   */
  async createRTCPeer(
    config: any = { autoInitStats: true, statsIntervalMs: 1000 },
    mode = ConnectionType.Viewer
  ) {
    logger.info('Creating new RTCPeerConnection')
    logger.debug('RTC configuration provided by user: ', config)
    this.peer = instanceRTCPeerConnection(this, config)
    this.mode = mode
    if (config.autoInitStats) {
      this.initStats(config)
    }
  }

  /**
   * Get current RTC peer connection.
   * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
   */
  getRTCPeer() {
    logger.info('Getting RTC Peer')
    return this.peer
  }

  /**
   * Close RTC peer connection.
   * @fires PeerConnection#connectionStateChange
   */
  async closeRTCPeer() {
    logger.info('Closing RTCPeerConnection')
    this.peer?.close()
    this.peer = null
    this.stopStats()
    this.emit(webRTCEvents.connectionStateChange, 'closed')
  }

  /**
   * Set SDP information to remote peer.
   * @param {String} sdp - New SDP to be set in the remote peer.
   * @returns {Promise<void>} Promise object which resolves when SDP information was successfully set.
   */
  async setRTCRemoteSDP(sdp: any) {
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
   * Get the SDP modified depending the options. Optionally set the SDP information to local peer.
   * @param {Object} options
   * @param {Boolean} options.stereo - True to modify SDP for support stereo. Otherwise False.
   * @param {Boolean} options.dtx - True to modify SDP for supporting dtx in opus. Otherwise False.*
   * @param {MediaStream|Array<MediaStreamTrack>} options.mediaStream - MediaStream to offer in a stream. This object must have
   * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
   * @param {VideoCodec} options.codec - Selected codec for support simulcast.
   * @param {Boolean} options.simulcast - True to modify SDP for support simulcast. **Only available in Chromium based browsers and with H.264 or VP8 video codecs.**
   * @param {String} options.scalabilityMode - Selected scalability mode. You can get the available capabilities using <a href="PeerConnection#.getCapabilities">PeerConnection.getCapabilities</a> method.
   * **Only available in Google Chrome.**
   * @param {Boolean} options.absCaptureTime - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
   * @param {Boolean} options.dependencyDescriptor - True to modify SDP for supporting aom dependency descriptor header extension. Otherwise False.
   * @param {Boolean} options.disableAudio - True to not support audio.
   * @param {Boolean} options.disableVideo - True to not support video.
   * @param {Boolean} options.setSDPToPeer - True to set the SDP to local peer.
   * @returns {Promise<String>} Promise object which represents the SDP information of the created offer.
   */
  async getRTCLocalSDP(options: any = localSDPOptions) {
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
      if (options.stereo) {
        this.sessionDescription.sdp = SdpParser.setStereo(this.sessionDescription.sdp)
      }
      if (options.dtx) {
        this.sessionDescription.sdp = SdpParser.setDTX(this.sessionDescription.sdp)
      }
      this.sessionDescription.sdp = SdpParser.setMultiopus(this.sessionDescription.sdp, mediaStream!)
    }
    if (!options.disableVideo && options.simulcast) {
      this.sessionDescription.sdp = SdpParser.setSimulcast(this.sessionDescription.sdp, options.codec)
    }
    if (options.absCaptureTime) {
      this.sessionDescription.sdp = SdpParser.setAbsoluteCaptureTime(this.sessionDescription.sdp)
    }
    if (options.dependencyDescriptor) {
      this.sessionDescription.sdp = SdpParser.setDependencyDescriptor(this.sessionDescription.sdp)
    }

    if (options.setSDPToPeer) {
      await this.peer.setLocalDescription(this.sessionDescription)
      logger.info('Peer local description set')
    }

    return this.sessionDescription.sdp
  }

  /**
   * Add remote receiving track.
   * @param {String} media - Media kind ('audio' | 'video').
   * @param {Array<MediaStream>} streams - Streams the track will belong to.
   * @return {Promise<RTCRtpTransceiver>} Promise that will be resolved when the RTCRtpTransceiver is assigned an mid value.
   */
  async addRemoteTrack(media: any, streams: any) {
    return new Promise((resolve, reject) => {
      try {
        const transceiver = this.peer.addTransceiver(media, {
          direction: 'recvonly',
          streams,
        })
        this.transceiverMap.set(transceiver, resolve)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Update remote SDP information to restrict bandwidth.
   * @param {String} sdp - Remote SDP.
   * @param {Number} bitrate - New bitrate value in kbps or 0 unlimited bitrate.
   * @return {String} Updated SDP information with new bandwidth restriction.
   */
  updateBandwidthRestriction(sdp: any, bitrate: any) {
    if (this.mode === ConnectionType.Viewer) {
      logger.error('Viewer attempting to update bitrate, this is not allowed')
      throw new Error('It is not possible for a viewer to update the bitrate.')
    }

    logger.info('Updating bandwidth restriction, bitrate value: ', bitrate)
    logger.debug('SDP value: ', sdp)
    return SdpParser.setVideoBitrate(sdp, bitrate)
  }

  /**
   * Set SDP information to remote peer with bandwidth restriction.
   * @param {Number} bitrate - New bitrate value in kbps or 0 unlimited bitrate.
   * @returns {Promise<void>} Promise object which resolves when bitrate was successfully updated.
   */
  async updateBitrate(bitrate = 0) {
    if (this.mode === ConnectionType.Viewer) {
      logger.error('Viewer attempting to update bitrate, this is not allowed')
      throw new Error('It is not possible for a viewer to update the bitrate.')
    }
    if (!this.peer) {
      logger.error('Cannot update bitrate. No peer found.')
      throw new Error('Cannot update bitrate. No peer found.')
    }

    logger.info('Updating bitrate to value: ', bitrate)
    this.sessionDescription = await this.peer.createOffer()
    await this.peer.setLocalDescription(this.sessionDescription)
    const sdp = this.updateBandwidthRestriction(this.peer.remoteDescription.sdp, bitrate)
    await this.setRTCRemoteSDP(sdp)
    logger.info('Bitrate restrictions updated: ', `${bitrate > 0 ? bitrate : 'unlimited'} kbps`)
  }

  /**
   * Get peer connection state.
   * @returns {RTCPeerConnectionState?} Promise object which represents the peer connection state.
   */
  getRTCPeerStatus() {
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
  replaceTrack(mediaStreamTrack: any) {
    if (!this.peer) {
      logger.error('Could not change track if there is not an active connection.')
      return
    }

    const currentSender = this.peer.getSenders().find((s: any) => s.track.kind === mediaStreamTrack.kind)

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
  static getCapabilities(kind: any) {
    const browserData = new UserAgent()
    const browserCapabilities = RTCRtpSender.getCapabilities(kind)

    if (browserCapabilities) {
      const codecs: any = {}
      let regex = new RegExp(`^video/(${Object.values(VideoCodec).join('|')})x?$`, 'i')

      if (kind === 'audio') {
        regex = new RegExp(`^audio/(${Object.values(AudioCodec).join('|')})$`, 'i')

        if (browserData.isChrome()) {
          codecs.multiopus = { mimeType: 'audio/multiopus', channels: 6 }
        }
      }

      for (const codec of browserCapabilities.codecs) {
        const matches = codec.mimeType.match(regex)
        if (matches) {
          const codecName = matches[1].toLowerCase()
          codecs[codecName] = { ...codecs[codecName], mimeType: codec.mimeType }
          if ((codec as any).scalabilityModes) {
            let modes = codecs[codecName].scalabilityModes || []
            modes = [...modes, ...(codec as any).scalabilityModes]
            codecs[codecName].scalabilityModes = [...new Set(modes)]
          }
          if (codec.channels) {
            codecs[codecName].channels = codec.channels
          }
        }
      }

      browserCapabilities.codecs = Object.keys(codecs).map((key) => {
        return { codec: key, ...codecs[key] }
      })
    }

    return browserCapabilities
  }

  /**
   * Get sender tracks
   * @returns {Array<MediaStreamTrack>} An array with all tracks in sender peer.
   */
  getTracks() {
    return this.peer?.getSenders()?.map((sender: any) => sender.track)
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
   * const millicastPublish = new Publish(tokenGenerator)
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
   * const millicastView = new View(tokenGenerator)
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
  initStats(options: any) {
    if (this.peerConnectionStats) {
      logger.warn(
        'PeerConnection.initStats() has already been called. Automatic initialization occurs via View.connect(), Publish.connect() or this.createRTCPeer(). See options'
      )
    } else if (this.peer) {
      this.peerConnectionStats = new PeerConnectionStats(this.peer, options)
      reemit(this.peerConnectionStats, this, [peerConnectionStatsEvents.stats])
    } else {
      logger.warn('Cannot init peer stats: RTCPeerConnection not initialized')
    }
  }

  /**
   * Stops the monitoring of RTCPeerConnection statistics.
   * @example peerConnection.stopStats()
   */
  stopStats() {
    this.peerConnectionStats?.stop()
    this.peerConnectionStats = null
  }
}

const isMediaStreamValid = (mediaStream: any) =>
  mediaStream?.getAudioTracks().length <= 1 && mediaStream?.getVideoTracks().length <= 1

const getValidMediaStream = (mediaStream: any) => {
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

const instanceRTCPeerConnection = (instanceClass: any, config: any) => {
  const instance = new RTCPeerConnection(config)
  addPeerEvents(instanceClass, instance)
  return instance
}

async function delay(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Emits peer events.
 * @param {PeerConnection} instanceClass - PeerConnection instance.
 * @param {RTCPeerConnection} peer - Peer instance.
 * @fires PeerConnection#track
 * @fires PeerConnection#connectionStateChange
 */
const addPeerEvents = (instanceClass: any, peer: any) => {
  peer.ontrack = async (event: any) => {
    logger.info('New track from peer.')
    logger.debug('Track event value: ', event)
    const resolve = instanceClass.transceiverMap.get(event.transceiver)
    if (resolve) {
      // we could add retry here to avoid unexpected situations
      // that leads to infinite loop and reject it if needed
      while (!event.transceiver.mid) {
        await delay(100)
      }
      resolve(event.transceiver)
      instanceClass.transceiverMap.delete(event.transceiver)
    }

    /**
     * New track event.
     *
     * @event PeerConnection#track
     * @type {RTCTrackEvent}
     */
    setTimeout(() => {
      instanceClass.emit(webRTCEvents.track, event)
    }, 0)
  }

  if (peer.connectionState) {
    peer.onconnectionstatechange = () => {
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
    peer.oniceconnectionstatechange = () => {
      logger.info('Peer ICE connection state change: ', peer.iceConnectionState)
      /**
       * @fires PeerConnection#connectionStateChange
       */
      instanceClass.emit(webRTCEvents.connectionStateChange, peer.iceConnectionState)
    }
  }
  peer.onnegotiationneeded = async () => {
    if (!peer.remoteDescription) return
    logger.info('Peer onnegotiationneeded, updating local description')
    const offer = await peer.createOffer()
    logger.info('Peer onnegotiationneeded, got local offer', offer.sdp)
    offer.sdp = SdpParser.updateMissingVideoExtensions(offer.sdp, peer.remoteDescription.sdp)
    await peer.setLocalDescription(offer)
    const sdp = SdpParser.renegotiate(offer.sdp, peer.remoteDescription.sdp)
    logger.info('Peer onnegotiationneeded, updating remote description', sdp)
    await peer.setRemoteDescription({ type: 'answer', sdp })
    logger.info('Peer onnegotiationneeded, renegotiation done')
  }
}

const addMediaStreamToPeer = (peer: any, mediaStream: any, options: any) => {
  logger.info('Adding mediaStream tracks to RTCPeerConnection')
  for (const track of mediaStream.getTracks()) {
    const initOptions: any = {
      streams: [mediaStream],
    }

    if (track.kind === 'audio') {
      initOptions.direction = !options.disableAudio ? 'sendonly' : 'inactive'
    }

    if (track.kind === 'video') {
      initOptions.direction = !options.disableVideo ? 'sendonly' : 'inactive'

      if (options.scalabilityMode && new UserAgent().isChrome()) {
        logger.debug(`Video track with scalability mode: ${options.scalabilityMode}.`)
        initOptions.sendEncodings = [{ scalabilityMode: options.scalabilityMode }]
      } else if (options.scalabilityMode) {
        logger.warn('SVC is only supported in Google Chrome')
      }
    }

    peer.addTransceiver(track, initOptions)
    logger.info(`Track '${track.label}' added: `, `id: ${track.id}`, `kind: ${track.kind}`)
  }
}

const addReceiveTransceivers = (peer: any, options: any) => {
  const browserData = new UserAgent()
  if (!options.disableVideo) {
    const transceiver = peer.addTransceiver('video', {
      direction: 'recvonly',
    })
    if (browserData.isOpera()) {
      transceiver.setCodecPreferences(
        RTCRtpReceiver.getCapabilities('video')?.codecs.filter(
          (codec) => codec.mimeType !== 'video/H264' || codec.sdpFmtpLine?.includes('profile-level-id=4')
        )
      )
    }
  }
  if (!options.disableAudio) {
    peer.addTransceiver('audio', {
      direction: 'recvonly',
    })
  }
  for (let i = 0; i < options.multiplexedAudioTracks; i++) {
    peer.addTransceiver('audio', {
      direction: 'recvonly',
    })
  }
}

const getConnectionState = (peer: any) => {
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
