import reemit from 're-emitter'
import jwtDecode from 'jwt-decode'
import Logger from './Logger'
import BaseWebRTC from './utils/BaseWebRTC'
import Signaling, { signalingEvents } from './Signaling'
import PeerConnection, { webRTCEvents } from './PeerConnection'
import FetchError from './utils/FetchError'
import { supportsInsertableStreams, supportsRTCRtpScriptTransform } from './utils/StreamTransform'
import TransformWorker from './workers/TransformWorker.worker.js?worker&inline'
import SdpParser from './utils/SdpParser'

const logger = Logger.get('View')

const connectOptions = {
  metadata: false,
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
  constructor (streamName, tokenGenerator, mediaElement = null, autoReconnect = true) {
    if (streamName) {
      logger.warn('The streamName property has been deprecated. In a future release, this will be removed. Please do not rely on this value. Instead, set via token generator')
    }
    super(null, tokenGenerator, logger, autoReconnect)
    // States what payload type is associated with each codec from the SDP answer.
    this.payloadTypeCodec = {}
    // Follows the media id values of each transceiver's track from the 'track' events.
    this.tracksMidValues = {}
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
   * @param {Boolean} [options.metadata = false]        - Enable metadata extraction if stream is compatible.
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

  /**
   * Add remote receving track.
   * @param {String} media - Media kind ('audio' | 'video').
   * @param {Array<MediaStream>} streams - Streams the track will belong to.
   * @return {Promise<RTCRtpTransceiver>} Promise that will be resolved when the RTCRtpTransceiver is assigned an mid value.
   */
  async addRemoteTrack (media, streams) {
    logger.info('Viewer adding remote % track', media)
    return this.webRTCPeer.addRemoteTrack(media, streams)
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
    this.worker?.terminate()
    this.worker = null
    this.payloadTypeCodec = {}
    this.tracksMidValues = {}
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
      if (this.options.metadata) {
        this.options.peerConfig.encodedInsertableStreams = supportsInsertableStreams
      }
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

    if (this.options.metadata) {
      if (!this.worker) {
        this.worker = new TransformWorker()
      }

      webRTCPeerInstance.on('track', (trackEvent) => {
        this.tracksMidValues[trackEvent.transceiver?.mid] = trackEvent.track
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
      })

      this.worker.onmessage = (event) => {
        const decoder = new TextDecoder()
        const metadata = event.data.metadata
        metadata.mid = event.data.mid
        metadata.track = this.tracksMidValues[event.data.mid]

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
    }

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
};
