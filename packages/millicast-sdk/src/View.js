import reemit from 're-emitter'
import jwtDecode from 'jwt-decode'
import Logger from './Logger'
import BaseWebRTC from './utils/BaseWebRTC'
import Signaling, { signalingEvents } from './Signaling'
import PeerConnection, { webRTCEvents } from './PeerConnection'
import FetchError from './utils/FetchError'
import { supportsInsertableStreams, supportsRTCRtpScriptTransform } from './utils/StreamTransform'
import { rtcDrmGetVersion, rtcDrmConfigure, rtcDrmOnTrack, rtcDrmEnvironments } from './drm/rtc-drm-transform.js'
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
 * @typedef {Object} DRMOptions contains the options for DRM playback
 * @property {HTMLVideoElement} videoElement
 * @property {HTMLAudioElement} audioElement
 * /

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
 * @param {DRMOptions} drmOptions - DRM configuration options, includes audio and video HTML elements for main stream
 */
export default class View extends BaseWebRTC {
  constructor (streamName, tokenGenerator, mediaElement = null, autoReconnect = true, drmOptions = null) {
    super(streamName, tokenGenerator, logger, autoReconnect)
    this.codecPayloadTypeMap = {}
    if (mediaElement) {
      this.on(webRTCEvents.track, e => {
        mediaElement.srcObject = e.streams[0]
      })
    }
    // TODO: change the workflow of getting the DRM configurations
    if (drmOptions) {
      console.log('castlab version', rtcDrmGetVersion())
      const merchant = 'dolby'
      const sessionId = ''
      const environment = rtcDrmEnvironments.Staging
      const keyId = this.hexToUint8Array(process.env.MILLICAST_DRM_VID1_KEYID)
      const iv = this.hexToUint8Array(process.env.MILLICAST_DRM_VID1_IV)
      if (keyId.length === 0 || iv.length === 0) {
        throw new Error('Invalid keyId or iv')
      }
      const video = { codec: 'H264', encryption: 'cbcs', keyId, iv }
      const audio = { codec: 'opus', encryption: 'clear' }
      this.defaultDRMConfiguration = {
        merchant,
        environment,
        sessionId,
        video,
        audio
      }
      this.configDRM({ ...this.defaultDRMConfiguration, ...drmOptions }, 'video', 'main')
      this.isDRMOn = true
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

  hexToUint8Array (hexString) {
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

  /**
   * Add remote receving track.
   * @param {String} media - Media kind ('audio' | 'video').
   * @param {Array<MediaStream>} streams - Streams the track will belong to.
   * @param {DRMOptions} [drmOptions] - DRM configuration options, includes audio and video HTML elements for the new remote stream, this must be provided when using DRM.
   * @return {Promise<RTCRtpTransceiver>} Promise that will be resolved when the RTCRtpTransceiver is assigned an mid value.
   */
  async addRemoteTrack (media, streams, drmOptions) {
    logger.info('Viewer adding remote track', media)
    const transceiver = await this.webRTCPeer.addRemoteTrack(media, streams)
    for (const stream of streams) {
      stream.addTrack(transceiver.receiver.track)
    }
    if (this.isDRMOn) {
      if (!drmOptions) throw new Error('DRM options are required when using DRM')
      // TODO: add the work flow of fetching the DRM options
      const configuration = JSON.parse(JSON.stringify(this.defaultDRMConfiguration))
      configuration.environment = rtcDrmEnvironments.Staging // cannot deep clone this object
      configuration.video.keyId = this.hexToUint8Array(process.env.MILLICAST_DRM_VID2_KEYID)
      configuration.video.iv = this.hexToUint8Array(process.env.MILLICAST_DRM_VID2_IV)
      if (configuration.video.keyId.length === 0 || configuration.video.iv.length === 0) {
        throw new Error('Invalid keyId or iv')
      }
      this.configDRM({ ...configuration, ...drmOptions }, media, transceiver.mid)
    }
    return transceiver
  }

  removeRemoteTrack (mediaId) {
    this.transceiverMap?.delete(mediaId)
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
    this.transceiverMap?.clear()
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
      //  Set the iceServers from the subscribe data into the peerConfig
      this.options.peerConfig.iceServers = subscriberData?.iceServers
      // We should not set the encodedInsertableStreams if the DRM and the frame metadata are not enabled
      this.options.peerConfig.encodedInsertableStreams = supportsInsertableStreams && (this.isDRMOn || this.isFrameMetadataOn)
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

    // TODO: add handle function for DRM on Signaling instance

    webRTCPeerInstance.on('track', (trackEvent) => {
      // TODO: DRM mode cannot coexist with frame metadata
      if (this.isDRMOn) {
        const mediaId = trackEvent.transceiver.mid
        const drmOptions = this.getDRMConfiguration(mediaId)
        logger.debug('on track event:', trackEvent.track.kind, drmOptions)
        rtcDrmOnTrack(trackEvent, drmOptions)
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

  /**
   * @typedef {Object} DRMMediaOptions
   * @property {String} codec - h264 for video
   * @property {String} encryption - cbsc or clear
   * @property {String} [keyId] - decryption keyId when encryption is not clear
   * @property {String} [iv] - fairplay iv when encryption is not clear
   */
  /**
   * @typedef {Object} CastLabDRMOptions extends DRMOptions
   * @property {String} merchant - merchant name
   * @property {String} sessionId - the DRM session id
   * @property {HTMLVideoElement} videoElement - video element to be used for playback
   * @property {HTMLAudioElement} audioElement - audio element to be used for playback
   * @property {DRMMediaOptions} video - video DRM options
   * @property {DRMMediaOptions} audio -audio DRM options
   */
  /**
   * config DRM protected stream from transceiver
   * @param {CastLabDRMOptions} options - the DRM options in castlab SDK format
   * @param {'video' | 'audio'} mediaType - 'video' or 'audio'
   * @param {String} mediaId - the transceiver's mediaId, 'main' stands for main stream
   */
  configDRM (options, mediaType, mediaId) {
    if (!options) {
      throw new Error('Required DRM options is not provided')
    }
    if (!this.transceiverMap) {
      this.transceiverMap = new Map()
    }
    this.transceiverMap.set(mediaId, options)
    if (mediaType === 'video') {
      console.log('config DRM options', options, 'and transceiverMap is', this.transceiverMap)
      rtcDrmConfigure(options)
    }
  }

  getDRMConfiguration (mediaId) {
    if (!this.transceiverMap) {
      return null
    }
    return this.transceiverMap.get(mediaId) || this.transceiverMap.get('main')
  }
}
