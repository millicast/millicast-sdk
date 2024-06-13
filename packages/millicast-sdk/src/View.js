import reemit from 're-emitter'
import jwtDecode from 'jwt-decode'
import Logger from './Logger'
import BaseWebRTC from './utils/BaseWebRTC'
import Signaling, { signalingEvents } from './Signaling'
import PeerConnection, { webRTCEvents } from './PeerConnection'
import FetchError from './utils/FetchError'
import { supportsInsertableStreams, supportsRTCRtpScriptTransform } from './utils/StreamTransform'
import { rtcDrmConfigure, rtcDrmOnTrack, rtcDrmEnvironments } from './drm/rtc-drm-transform.js'
import workerString from './TransformWorker.worker.js'
import SdpParser from './utils/SdpParser'

const logger = Logger.get('View')
logger.setLevel(Logger.DEBUG)

const connectOptions = {
  disableVideo: false,
  disableAudio: false,
  peerConfig: {
    autoInitStats: true
  }
}

/**
 * @class View
 * @extends BaseWebRTC
 * @classdesc Manages connection with a secure WebSocket path to signal the Millicast server
 * and establishes a WebRTC connection to view a live stream.
 *
 * Before you can view an active broadcast, you will need:
 *
 * - A connection path that you can get from {@link Director} module or from your own implementation.
 * @constructor
 * @deprecated streamName is no longer used, use tokenGenerator
 * @param {String} streamName - Deprecated: Millicast existing stream name.
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {HTMLMediaElement} [mediaElement=null] - Target HTML media element to mount stream.
 * @param {Boolean} [autoReconnect=true] - Enable auto reconnect to stream.
 */
export default class View extends BaseWebRTC {
  // mapping media ID of RTCRtcTransceiver to DRM Options
  #drmOptionsMap
  constructor (streamName, tokenGenerator, mediaElement = null, autoReconnect = true) {
    super(streamName, tokenGenerator, logger, autoReconnect)
    this.codecPayloadTypeMap = {}
    if (mediaElement) {
      this.on(webRTCEvents.track, e => {
        mediaElement.srcObject = e.streams[0]
      })
    }
  }

  /**
   * @typedef {Object} LayerInfo
   * @property {String} encodingId         - rid value of the simulcast encoding of the track  (default: automatic selection)
   * @property {Number} spatialLayerId     - The spatial layer id to send to the outgoing stream (default: max layer available)
   * @property {Number} temporalLayerId    - The temporaral layer id to send to the outgoing stream (default: max layer available)
   * @property {Number} maxSpatialLayerId  - Max spatial layer id (default: unlimited)
   * @property {Number} maxTemporalLayerId - Max temporal layer id (default: unlimited)
   */

  /**
   * Connects to an active stream as subscriber.
   *
   * In the example, `addStreamToYourVideoTag` and `getYourSubscriberConnectionPath` is your own implementation.
   * @param {Object} [options]                          - General subscriber options.
   * @param {Boolean} [options.dtx = false]             - True to modify SDP for supporting dtx in opus. Otherwise False.
   * @param {Boolean} [options.absCaptureTime = false]  - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
   * @param {Boolean} [options.disableVideo = false]    - Disable the opportunity to receive video stream.
   * @param {Boolean} [options.disableAudio = false]    - Disable the opportunity to receive audio stream.
   * @param {Number} [options.multiplexedAudioTracks]   - Number of audio tracks to recieve VAD multiplexed audio for secondary sources.
   * @param {String} [options.pinnedSourceId]           - Id of the main source that will be received by the default MediaStream.
   * @param {Array<String>} [options.excludedSourceIds] - Do not receive media from the these source ids.
   * @param {Array<String>} [options.events]            - Override which events will be delivered by the server (any of "active" | "inactive" | "vad" | "layers" | "viewercount").*
   * @param {RTCConfiguration} [options.peerConfig]     - Options to configure the new RTCPeerConnection.
   * @param {LayerInfo} [options.layer]                 - Select the simulcast encoding layer and svc layers for the main video track, leave empty for automatic layer selection based on bandwidth estimation.
   * @param {Object} [options.forcePlayoutDelay = false]- Ask the server to use the playout delay header extension.
   * @param {Number} [options.forcePlayoutDelay.min]    - Set minimum playout delay value.
   * @param {Number} [options.forcePlayoutDelay.max]    - Set maximum playout delay value.
   * @param {Boolean} [options.enableDRM]               - Enable DRM, default is false.
   * @returns {Promise<void>} Promise object which resolves when the connection was successfully established.
   * @fires PeerConnection#track
   * @fires Signaling#broadcastEvent
   * @fires PeerConnection#connectionStateChange
   * @example await millicastView.connect(options)
   * @example
   * import View from '@millicast/sdk'
   *
   * // Create media element
   * const videoElement = document.createElement("video")
   *
   * //Define callback for generate new token
   * const tokenGenerator = () => getYourSubscriberInformation(accountId, streamName)
   *
   * //Create a new instance
   * // Stream name is not necessary in the constructor anymore, could be null | undefined
   * const streamName = "Millicast Stream Name where i want to connect"
   * const millicastView = new View(streamName, tokenGenerator, videoElement)
   *
   * //Start connection to broadcast
   * try {
   *  await millicastView.connect()
   * } catch (e) {
   *  console.log('Connection failed, handle error', e)
   * }
   * @example
   * import View from '@millicast/sdk'
   *
   * //Define callback for generate new token
   * const tokenGenerator = () => getYourSubscriberInformation(accountId, streamName)
   *
   * //Create a new instance
   * const streamName = "Millicast Stream Name where i want to connect"
   * const millicastView = new View(streamName, tokenGenerator)
   *
   * //Set track event handler to receive streams from Publisher.
   * millicastView.on('track', (event) => {
   *   addStreamToYourVideoTag(event.streams[0])
   * })
   *
   * //Start connection to broadcast
   * try {
   *  await millicastView.connect()
   * } catch (e) {
   *  console.log('Connection failed, handle error', e)
   * }
   */
  async connect (options = connectOptions) {
    this.options = { ...connectOptions, ...options, peerConfig: { ...connectOptions.peerConfig, ...options.peerConfig }, setSDPToPeer: false }
    await this.initConnection({ migrate: false })
  }

  /**
   * Select the simulcast encoding layer and svc layers for the main video track
   * @param {LayerInfo} layer - leave empty for automatic layer selection based on bandwidth estimation.
   */
  async select (layer = {}) {
    logger.debug('Viewer select layer values: ', layer)
    await this.signaling.cmd('select', { layer })
    logger.info('Connected to streamName: ', this.streamName)
  }

  #hexToUint8Array (hexString) {
    if (!hexString) {
      return new Uint8Array()
    }
    const length = hexString.length
    const uint8Array = new Uint8Array(length / 2)
    for (let i = 0; i < length; i += 2) {
      uint8Array[i / 2] = parseInt(hexString.substr(i, 2), 16)
    }
    return uint8Array
  }

  #swapPropertyValues (obj1, obj2, key) {
    // Check if both objects have the property
    //
    if (Object.prototype.hasOwnProperty.call(obj1, key) &&
        Object.prototype.hasOwnProperty.call(obj2, key)) {
      const temp = obj1[key]
      obj1[key] = obj2[key]
      obj2[key] = temp
    } else {
      console.error(`One or both objects do not have the property "${key}"`)
    }
  }

  /**
   * Add remote receving track.
   * @param {String} media - Media kind ('audio' | 'video').
   * @param {Array<MediaStream>} streams - Streams the track will belong to.
   * @return {Promise<RTCRtpTransceiver>} Promise that will be resolved when the RTCRtpTransceiver is assigned an mid value.
   */
  async addRemoteTrack (media, streams) {
    logger.info('Viewer adding remote track', media)
    const transceiver = await this.webRTCPeer.addRemoteTrack(media, streams)
    for (const stream of streams) {
      stream.addTrack(transceiver.receiver.track)
    }
    return transceiver
  }

  /**
   * Start projecting source in selected media ids.
   * @param {String} sourceId                          - Selected source id.
   * @param {Array<Object>} mapping                    - Mapping of the source track ids to the receiver mids
   * @param {String} [mapping.trackId]                 - Track id from the source (received on the "active" event), if not set the media kind will be used instead.
   * @param {String} [mapping.media]                   - Track kind of the source ('audio' | 'video'), if not set the trackId will be used instead.
   * @param {String} [mapping.mediaId]                 - mid value of the rtp receiver in which the media is going to be projected. If no mediaId is defined, the first track from the main media stream with the same media type as the input source track will be used.
   * @param {LayerInfo} [mapping.layer]                - Select the simulcast encoding layer and svc layers, only applicable to video tracks.
   * @param {Boolean} [mapping.promote]                - To remove all existing limitations from the source, such as restricted bitrate or resolution, set this to true.
   */
  async project (sourceId, mapping) {
    for (const map of mapping) {
      if (!map.trackId && !map.media) {
        logger.error('Error in projection mapping, trackId or mediaId must be set')
        throw new Error('Error in projection mapping, trackId or mediaId must be set')
      }
      const peer = this.webRTCPeer.getRTCPeer()
      // Check we have the mediaId in the transceivers
      if (map.mediaId && !peer.getTransceivers().find(t => t.mid === map.mediaId.toString())) {
        logger.error(`Error in projection mapping, ${map.mediaId} mid not found in local transceivers`)
        throw new Error(`Error in projection mapping, ${map.mediaId} mid not found in local transceivers`)
      }
    }
    logger.debug('Viewer project source: layer mappings: ', sourceId, mapping)
    await this.signaling.cmd('project', { sourceId, mapping })
    logger.info('Projection done')
  }

  /**
   * Stop projecting attached source in selected media ids.
   * @param {Array<String>} mediaIds - mid value of the receivers that are going to be detached.
   */
  async unproject (mediaIds) {
    logger.debug('Viewer unproject mediaIds: ', mediaIds)
    await this.signaling.cmd('unproject', { mediaIds })
    logger.info('Unprojection done')
  }

  async replaceConnection () {
    logger.info('Migrating current connection')
    await this.initConnection({ migrate: true })
  }

  stop () {
    super.stop()
    this.drmOptionsMap?.clear()
    this.worker?.terminate()
  }

  async initConnection (data) {
    logger.debug('Viewer connect options values: ', this.options)
    this.stopReconnection = false
    let promises
    if (!data.migrate && this.isActive()) {
      logger.warn('Viewer currently subscribed')
      throw new Error('Viewer currently subscribed')
    }
    let subscriberData
    try {
      subscriberData = await this.tokenGenerator()
      // Set the iceServers from the subscribe data into the peerConfig
      this.options.peerConfig.iceServers = subscriberData?.iceServers
      // We should not set the encodedInsertableStreams if the DRM and the frame metadata are not enabled
      this.options.peerConfig.encodedInsertableStreams = supportsInsertableStreams && this.options.enableDRM
    } catch (error) {
      logger.error('Error generating token.')
      if (error instanceof FetchError) {
        if (error.status === 401 || !this.autoReconnect) {
          // should not reconnect
          this.stopReconnection = true
        } else {
          // should reconnect with exponential back off if autoReconnect is true
          this.reconnect()
        }
      }
      throw error
    }
    if (!subscriberData) {
      logger.error('Error while subscribing. Subscriber data required')
      throw new Error('Subscriber data required')
    }
    const decodedJWT = jwtDecode(subscriberData.jwt)
    this.streamName = decodedJWT.millicast.streamName
    const signalingInstance = new Signaling({
      streamName: this.streamName,
      url: `${subscriberData.urls[0]}?token=${subscriberData.jwt}`
    })
    if (subscriberData.DRMProfile) {
      // TODO: cache the DRM license server URLs
    }
    const webRTCPeerInstance = data.migrate ? new PeerConnection() : this.webRTCPeer

    await webRTCPeerInstance.createRTCPeer(this.options.peerConfig)
    // Stop emiting events from the previous instances
    this.stopReemitingWebRTCPeerInstanceEvents?.()
    this.stopReemitingSignalingInstanceEvents?.()
    // And start emitting from the new ones
    this.stopReemitingWebRTCPeerInstanceEvents = reemit(webRTCPeerInstance, this, Object.values(webRTCEvents))
    this.stopReemitingSignalingInstanceEvents = reemit(signalingInstance, this, [signalingEvents.broadcastEvent])

    const workerBlob = new Blob([workerString])
    const workerURL = URL.createObjectURL(workerBlob)

    webRTCPeerInstance.on('track', (trackEvent) => {
      // TODO: DRM mode cannot coexist with frame metadata
      if (this.isDRMOn) {
        const mediaId = trackEvent.transceiver.mid
        const drmOptions = this.#getDRMConfiguration(mediaId)
        try {
          rtcDrmOnTrack(trackEvent, drmOptions)
        } catch (error) {
          logger.error('Failed to apply DRM on media Id:', mediaId, 'error is: ', error)
        }
        return
      }
      if (!this.isFrameMetadataOn || trackEvent.track?.kind !== 'video') return
      const worker = new Worker(workerURL)
      if (supportsRTCRtpScriptTransform) {
        // eslint-disable-next-line no-undef
        trackEvent.receiver.transform = new RTCRtpScriptTransform(worker, { name: 'receiverTransform', codecMap: this.codecPayloadTypeMap, codec: this.options.codec })
      } else if (supportsInsertableStreams) {
        const { readable, writable } = trackEvent.receiver.createEncodedStreams()
        worker.postMessage({
          action: 'insertable-streams-receiver',
          codecMap: this.codecPayloadTypeMap,
          codec: this.options.codec,
          readable,
          writable
        }, [readable, writable])
      }
      worker.onmessage = (event) => {
        const decoder = new TextDecoder()
        const metadata = event.data.metadata
        metadata.track = trackEvent.track

        const uuid = metadata.uuid
        metadata.uuid = uuid.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
        metadata.uuid = metadata.uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')

        if (metadata.timecode) {
          metadata.timecode = new Date(decoder.decode(metadata.timecode))
        } else if (metadata.unregistered) {
          metadata.unregistered = JSON.parse(decoder.decode(metadata.unregistered))
        }
        this.emit('onMetadata', metadata)
      }
      if (this.worker) {
        this.worker.terminate()
        this.worker = null
      }
      this.worker = worker
    })

    const getLocalSDPPromise = webRTCPeerInstance.getRTCLocalSDP({ ...this.options, stereo: true })
    const signalingConnectPromise = signalingInstance.connect()
    promises = await Promise.all([getLocalSDPPromise, signalingConnectPromise])
    const localSdp = promises[0]

    let oldSignaling = this.signaling
    this.signaling = signalingInstance

    const subscribePromise = this.signaling.subscribe(localSdp, { ...this.options, vad: this.options.multiplexedAudioTracks > 0 })
    const setLocalDescriptionPromise = webRTCPeerInstance.peer.setLocalDescription(webRTCPeerInstance.sessionDescription)
    promises = await Promise.all([subscribePromise, setLocalDescriptionPromise])
    const sdpSubscriber = promises[0]

    this.codecPayloadTypeMap = SdpParser.getCodecPayloadType(sdpSubscriber)

    await webRTCPeerInstance.setRTCRemoteSDP(sdpSubscriber)

    logger.info('Connected to streamName: ', this.streamName)

    let oldWebRTCPeer = this.webRTCPeer
    this.webRTCPeer = webRTCPeerInstance
    this.setReconnect()

    if (data.migrate) {
      this.webRTCPeer.on(webRTCEvents.connectionStateChange, (state) => {
        if (state === 'connected') {
          setTimeout(() => {
            oldSignaling?.close?.()
            oldWebRTCPeer?.closeRTCPeer?.()
            oldSignaling = oldWebRTCPeer = null
            logger.info('Current connection migrated')
          }, 1000)
        } else if (['disconnected', 'failed', 'closed'].includes(state)) {
          oldSignaling?.close?.()
          oldWebRTCPeer?.closeRTCPeer?.()
          oldSignaling = oldWebRTCPeer = null
        }
      })
    }
  }

  #getDRMConfiguration (mediaId) {
    return this.#drmOptionsMap ? this.#drmOptionsMap.get(mediaId) : null
  }

  /**
   * @typedef {Object} EncryptionParameters
   * @property {String} keyId 16-byte KID, in lowercase hexadecimal without separators
   * @property {String} iv 16-byte initialization vector, in lowercase hexadecimal without separators
   * /

  /**
   * @typedef {Object} DRMOptions - the options for DRM playback
   * @property {HTMLVideoElement} videoElement - the video HTML element
   * @property {EncryptionParameters} videoEncParams - the video encryption parameters
   * @property {String} videoMid - the video media ID of RTCRtpTransceiver
   * @property {HTMLAudioElement} audioElement - the audio HTML audioElement
   * @property {EncryptionParameters} [audioEncParams] - the audio encryption parameters
   * @property {String} [audioMid] - the audio media ID of RTCRtpTransceiver
   */

  /**
   * Configure DRM protected stream.
   * When there are {@link EncryptionParameters} in the payload of 'active' broadcast event, this method should be called
   * @param {DRMOptions} options - the options for DRM playback
  */
  configureDRM (options) {
    if (!options) {
      throw new Error('Required DRM options is not provided')
    }
    if (!this.#drmOptionsMap) {
      // map transceiver's mediaId to its DRM options
      this.#drmOptionsMap = new Map()
    }
    const drmOptions = {
      merchant: 'dolby',
      sessionId: '',
      environment: rtcDrmEnvironments.Staging,
      videoElement: options.videoElement,
      audioElement: options.audioElement,
      video: { codec: 'h264', encryption: 'cbcs', keyId: this.#hexToUint8Array(options.videoEncParams.keyId), iv: this.#hexToUint8Array(options.videoEncParams.iv) },
      audio: { codec: 'opus', encryption: 'clear' }
    }
    try {
      rtcDrmConfigure(drmOptions)
      this.#drmOptionsMap.set(options.videoMid, drmOptions)
      if (options.audioMid) {
        this.#drmOptionsMap.set(options.audioMid, drmOptions)
      }
      drmOptions.videoElement.addEventListener('rtcdrmerror', (event) => {
        logger.error('DRM error: ', event.detail.message, 'in video element:', drmOptions.videoElement.id)
      })
    } catch (error) {
      logger.error('Failed to configure DRM with options:', options, 'error is:', error)
    }
  }

  /**
   * Remove DRM configuration for a mediaId
   * @param {String} mediaId
   */
  removeDRMConfiguration (mediaId) {
    this.drmOptionsMap?.delete(mediaId)
  }

  /**
   * Check if there are any DRM protected Track
   */
  get isDRMOn () {
    return !!this.#drmOptionsMap && this.#drmOptionsMap.size > 0
  }

  /**
   * Exchange the DRM configuration between two transceivers
   * Both of the transceivers should be used for DRM protected streams
   * @param {String} targetMediaId
   * @param {String} sourceMediaId
   */
  exchangeDRMConfiguration (targetMediaId, sourceMediaId) {
    const targetDRMOptions = this.#getDRMConfiguration(targetMediaId)
    const sourceDRMOptions = this.#getDRMConfiguration(sourceMediaId)
    if (targetDRMOptions === null) {
      throw new Error('No DRM configuration found for ' + targetMediaId)
    }
    if (sourceDRMOptions === null) {
      throw new Error('No DRM configuration found for ' + sourceMediaId)
    }
    this.#swapPropertyValues(targetDRMOptions.video, sourceDRMOptions.video, 'keyId')
    this.#swapPropertyValues(targetDRMOptions.video, sourceDRMOptions.video, 'iv')
    try {
      rtcDrmConfigure(targetDRMOptions)
    } catch (error) {
      logger.error('Failed to configure DRM with options:', targetDRMOptions, 'error is:', error)
    }
    try {
      rtcDrmConfigure(sourceDRMOptions)
    } catch (error) {
      logger.error('Failed to configure DRM with options:', sourceDRMOptions, 'error is:', error)
    }
  }
}
