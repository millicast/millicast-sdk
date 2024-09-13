import reemit from 're-emitter'
import jwtDecode from 'jwt-decode'
import Logger from './Logger'
import BaseWebRTC from './utils/BaseWebRTC'
import Signaling, { signalingEvents } from './Signaling'
import PeerConnection, { webRTCEvents } from './PeerConnection'
import { hexToUint8Array } from './utils/StringUtils'
import { swapPropertyValues } from './utils/ObjectUtils'
import FetchError from './utils/FetchError'
import { supportsInsertableStreams, supportsRTCRtpScriptTransform } from './utils/StreamTransform'
import { rtcDrmConfigure, rtcDrmOnTrack, rtcDrmEnvironments, rtcDrmFeedFrame } from './drm/rtc-drm-transform.js'
import TransformWorker from './workers/TransformWorker.worker.js?worker&inline'
import SdpParser from './utils/SdpParser'

const logger = Logger.get('View')
logger.setLevel(Logger.DEBUG)

const connectOptions = {
  metadata: false,
  enableDRM: false,
  disableVideo: false,
  disableAudio: false,
  peerConfig: {
    autoInitStats: true,
    statsIntervalMs: 1000
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
 * @param {String} streamName - Deprecated: Millicast existing stream name.
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {HTMLMediaElement} [mediaElement=null] - Deprecated: Target HTML media element to mount stream.
 * @param {Boolean} [autoReconnect=true] - Enable auto reconnect to stream.
 */
export default class View extends BaseWebRTC {
  constructor (streamName, tokenGenerator, mediaElement = null, autoReconnect = true) {
    if (streamName) {
      logger.warn('The streamName property has been deprecated. In a future release, this will be removed. Please do not rely on this value. Instead, set via token generator')
    }
    super(null, tokenGenerator, logger, autoReconnect)
    // States what payload type is associated with each codec from the SDP answer.
    this.payloadTypeCodec = {}
    // Follows the media id values of each transceiver's track from the 'track' events.
    this.tracksMidValues = {}
    // mapping media ID of RTCRtcTransceiver to DRM Options
    this.drmOptionsMap = null
    // cache of events to coordinate re-emitting
    this.eventQueue = []
    this.isMainStreamActive = false
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
   * @param {Boolean} [options.metadata = false]        - Enable metadata extraction if stream is compatible.
   * @param {Boolean} [options.drm = false]             - Enable the DRM protected stream playback.
   * @param {Boolean} [options.disableVideo = false]    - Disable the opportunity to receive video stream.
   * @param {Boolean} [options.disableAudio = false]    - Disable the opportunity to receive audio stream.
   * @param {Number} [options.multiplexedAudioTracks]   - Number of audio tracks to recieve VAD multiplexed audio for secondary sources.
   * @param {String} [options.pinnedSourceId]           - Id of the main source that will be received by the default MediaStream.
   * @param {Array<String>} [options.excludedSourceIds] - Do not receive media from the these source ids.
   * @param {Array<String>} [options.events]            - Override which events will be delivered by the server (any of "active" | "inactive" | "vad" | "layers" | "viewercount" | "updated").*
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
   * millicastView.on('error', (error) => {
   *   console.error('Error from Millicast SDK', error)
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
    this.eventQueue.length = 0
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

  /**
   * Add remote receiving track.
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
    this.DRMProfile = null
    this.worker?.terminate()
    this.worker = null
    this.payloadTypeCodec = {}
    this.tracksMidValues = {}
    this.eventQueue.length = 0
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
      this.options.peerConfig.encodedInsertableStreams = supportsInsertableStreams && (this.options.enableDRM || this.options.metadata)
    } catch (error) {
      // TODO: handle DRM error when DRM is enabled but no subscribe token is provided
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
    if (subscriberData.drmObject) {
      // cache the DRM license server URLs
      this.DRMProfile = subscriberData.drmObject
    }
    if (subscriberData.subscriberToken) {
      this.subscriberToken = subscriberData.subscriberToken
    }
    const webRTCPeerInstance = data.migrate ? new PeerConnection() : this.webRTCPeer

    await webRTCPeerInstance.createRTCPeer(this.options.peerConfig)
    // Stop emiting events from the previous instances
    this.stopReemitingWebRTCPeerInstanceEvents?.()
    this.stopReemitingSignalingInstanceEvents?.()
    // And start emitting from the new ones
    this.stopReemitingWebRTCPeerInstanceEvents = reemit(webRTCPeerInstance, this, Object.values(webRTCEvents).filter(e => e !== webRTCEvents.track))
    this.stopReemitingSignalingInstanceEvents = reemit(signalingInstance, this, [signalingEvents.broadcastEvent])

    if (this.options.metadata) {
      if (!this.worker) {
        this.worker = new TransformWorker()
      }
      this.worker.onmessage = (message) => {
        if (message.data.event === 'metadata') {
          const decoder = new TextDecoder()
          const metadata = message.data.metadata
          metadata.mid = message.data.mid
          metadata.track = this.tracksMidValues[message.data.mid]
          if (metadata.uuid) {
            const uuid = metadata.uuid
            metadata.uuid = uuid.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
            metadata.uuid = metadata.uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
          }
          if (metadata.timecode) {
            metadata.timecode = new Date(decoder.decode(metadata.timecode))
          }
          if (metadata.unregistered) {
            const content = decoder.decode(metadata.unregistered)
            try {
              const json = JSON.parse(content)
              metadata.unregistered = json
            } catch (e) {
              // was not a JSON, just return the raw bytes (i.e. do nothing)
              logger.info('The content could not be converted to JSON, returning raw bytes instead')
            }
          }
          this.emit('metadata', metadata)
          // FIXME : Remove in v0.3.0
          this.emit('onMetadata', metadata)
        }
      }
    }

    webRTCPeerInstance.on(webRTCEvents.track, (trackEvent) => {
      if (!this.isMainStreamActive) {
        this.eventQueue.push(trackEvent)
        return
      }
      this.onTrackEvent(trackEvent)
    })

    signalingInstance.on(signalingEvents.broadcastEvent, (event) => {
      if (event.data.sourceId === null) {
        switch (event.name) {
          case 'active':
            this.isMainStreamActive = true
            while (this.eventQueue.length > 0) {
              this.onTrackEvent(this.eventQueue.shift())
            }
            break
          case 'inactive':
            this.isMainStreamActive = false
            break
          default:
            break
        }
      }
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

    this.payloadTypeCodec = SdpParser.getCodecPayloadType(sdpSubscriber)

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

  onTrackEvent (trackEvent) {
    this.tracksMidValues[trackEvent.transceiver?.mid] = trackEvent.track
    if (this.isDRMOn) {
      const mediaId = trackEvent.transceiver.mid
      const drmOptions = this.getDRMConfiguration(mediaId)
      try {
        rtcDrmOnTrack(trackEvent, drmOptions)
      } catch (error) {
        logger.error('Failed to apply DRM on media Id:', mediaId, 'error is: ', error)
        this.emit('error', new Error('Failed to apply DRM on media Id: ' + mediaId + ' error is: ' + error))
      }
      if (!this.worker) {
        this.worker = new TransformWorker()
      }
      this.worker.addEventListener('message', (message) => {
        if (message.data.event === 'complete') {
          // feed the frame to DRM processing worker
          rtcDrmFeedFrame(message.data.frame, null, drmOptions)
        }
      })
    }
    if (this.options.metadata) {
      if (supportsRTCRtpScriptTransform) {
        // eslint-disable-next-line no-undef
        trackEvent.receiver.transform = new RTCRtpScriptTransform(this.worker, {
          name: 'receiverTransform',
          payloadTypeCodec: { ...this.payloadTypeCodec },
          codec: this.options.metadata && 'h264',
          mid: trackEvent.transceiver?.mid
        })
      } else if (supportsInsertableStreams) {
        const { readable, writable } = trackEvent.receiver.createEncodedStreams()
        this.worker.postMessage({
          action: 'insertable-streams-receiver',
          payloadTypeCodec: { ...this.payloadTypeCodec },
          codec: this.options.metadata && 'h264',
          mid: trackEvent.transceiver?.mid,
          readable,
          writable
        }, [readable, writable])
      }
    }
    this.emit(webRTCEvents.track, trackEvent)
  }

  getDRMConfiguration (mediaId) {
    return this.drmOptionsMap ? this.drmOptionsMap.get(mediaId) : null
  }

  async onRtcDrmFetch (url, opts) {
    if (!opts.headers) {
      opts.headers = new Headers()
    }
    // our server doesn't support x-dt-custom-data
    if (opts.headers.get('x-dt-custom-data')) {
      opts.headers.delete('x-dt-custom-data')
    }
    if (this.subscriberToken) {
      opts.headers.append('Authorization', `Bearer ${this.subscriberToken}`)
    } else {
      logger.warn('onRtcDrmFetch: no subscriberToken')
    }
    return fetch(url, opts)
  }

  /**
   * @typedef {Object} EncryptionParameters
   * @property {String} keyId 16-byte KeyID, in lowercase hexadecimal without separators
   * @property {String} iv 16-byte initialization vector, in lowercase hexadecimal without separators
   * /

  /**
   * @typedef {Object} DRMOptions - the options for DRM playback
   * @property {HTMLVideoElement} videoElement - the video HTML element
   * @property {EncryptionParameters} videoEncryptionParams - the video encryption parameters
   * @property {String} videoMid - the video media ID of RTCRtpTransceiver
   * @property {HTMLAudioElement} audioElement - the audio HTML audioElement
   * @property {EncryptionParameters} [audioEncryptionParams] - the audio encryption parameters
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
    if (!this.drmOptionsMap) {
      // map transceiver's mediaId to its DRM options
      this.drmOptionsMap = new Map()
    }
    const drmOptions = {
      merchant: 'dolby',
      environment: rtcDrmEnvironments.Production,
      customTransform: this.options.metadata,
      videoElement: options.videoElement,
      audioElement: options.audioElement,
      video: { codec: 'h264', encryption: 'cbcs', keyId: hexToUint8Array(options.videoEncryptionParams.keyId), iv: hexToUint8Array(options.videoEncryptionParams.iv) },
      audio: { codec: 'opus', encryption: 'clear' },
      onFetch: this.onRtcDrmFetch.bind(this)
    }
    if (this.DRMProfile) {
      if (this.DRMProfile.playReadyUrl) {
        drmOptions.prLicenseUrl = this.DRMProfile.playReadyUrl
      }
      if (this.DRMProfile.widevineUrl) {
        drmOptions.wvLicenseUrl = this.DRMProfile.widevineUrl
      }
      if (this.DRMProfile.fairPlayUrl) {
        drmOptions.fpsLicenseUrl = this.DRMProfile.fairPlayUrl
      }
      if (this.DRMProfile.fairPlayCertUrl) {
        drmOptions.fpsCertificateUrl = this.DRMProfile.fairPlayCertUrl
      }
    }
    try {
      rtcDrmConfigure(drmOptions)
      this.drmOptionsMap.set(options.videoMid, drmOptions)
      if (options.audioMid) {
        this.drmOptionsMap.set(options.audioMid, drmOptions)
      }
      drmOptions.videoElement.addEventListener('rtcdrmerror', (event) => {
        logger.error('DRM error: ', event.detail.message, 'in video element:', drmOptions.videoElement.id)
        this.emit('error', new Error(event.detail.message))
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
    return !!this.drmOptionsMap && this.drmOptionsMap.size > 0
  }

  /**
   * Exchange the DRM configuration between two transceivers
   * Both of the transceivers should be used for DRM protected streams
   * @param {String} targetMediaId
   * @param {String} sourceMediaId
   */
  exchangeDRMConfiguration (targetMediaId, sourceMediaId) {
    const targetDRMOptions = this.getDRMConfiguration(targetMediaId)
    const sourceDRMOptions = this.getDRMConfiguration(sourceMediaId)
    if (targetDRMOptions === null) {
      throw new Error('No DRM configuration found for ' + targetMediaId)
    }
    if (sourceDRMOptions === null) {
      throw new Error('No DRM configuration found for ' + sourceMediaId)
    }
    swapPropertyValues(targetDRMOptions.video, sourceDRMOptions.video, 'keyId')
    swapPropertyValues(targetDRMOptions.video, sourceDRMOptions.video, 'iv')
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
