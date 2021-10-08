import reemit from 're-emitter'
import Logger from './Logger'
import BaseWebRTC from './utils/BaseWebRTC'
import Signaling, { signalingEvents } from './Signaling'
import { webRTCEvents } from './PeerConnection'
const logger = Logger.get('View')

const connectOptions = {
  disableVideo: false,
  disableAudio: false,
  peerConfig: null
}

/**
 * @class View
 * @extends BaseWebRTC
 * @classdesc Manages connection with a secure WebSocket path to signal the Millicast server
 * and establishes a WebRTC connection to view a live stream.
 *
 * Before you can view an active broadcast, you will need:
 *
 * - A connection path that you can get from {@link Director} module or from your own implementation based on [Get a Connection Path](https://dash.millicast.com/docs.html?pg=how-to-broadcast-in-js#get-connection-paths-sect).
 * @constructor
 * @param {String} streamName - Millicast existing Stream Name where you want to connect.
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {HTMLMediaElement} [mediaElement=null] - Target HTML media element to mount stream.
 * @param {Boolean} [autoReconnect=true] - Enable auto reconnect to stream.
 */
export default class View extends BaseWebRTC {
  constructor (streamName, tokenGenerator, mediaElement = null, autoReconnect = true) {
    super(streamName, tokenGenerator, logger, autoReconnect)
    if (mediaElement) {
      this.on(webRTCEvents.track, e => {
        mediaElement.srcObject = e.streams[0]
      })
    }
  }

  /**
   * Connects to an active stream as subscriber.
   *
   * In the example, `addStreamToYourVideoTag` and `getYourSubscriberConnectionPath` is your own implementation.
   * @param {Object} options - General subscriber options.
   * @param {Boolean} options.dtx - True to modify SDP for supporting dtx in opus. Otherwise False.
   * @param {Boolean} options.absCaptureTime - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
   * @param {Boolean} [options.disableVideo = false] - Disable the opportunity to receive video stream.
   * @param {Boolean} [options.disableAudio = false] - Disable the opportunity to receive audio stream.
   * @param {Number} [multiplexedAudioTracks - Number of audio tracks to recieve VAD multiplexed audio for secondary sources.
   * @param {String} pinnedSourceId - Id of the main source that will be received by the default MediaStream.
   * @param {Array<String>} excludedSourceIds - Do not receive media from the these source ids.
   * @param {Array<String>} [options.events] - Override which events will be delivered by the server (any of "active" | "inactive" | "vad" | "layers").* 
   * @param {RTCConfiguration} options.peerConfig - Options to configure the new RTCPeerConnection.
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
    logger.debug('Viewer connect options values: ', options)
    let promises
    this.options = { ...connectOptions, ...options, setSDPToPeer: false }
    if (this.isActive()) {
      logger.warn('Viewer currently subscribed')
      throw new Error('Viewer currently subscribed')
    }
    let subscriberData
    try {
      subscriberData = await this.tokenGenerator()
    } catch (error) {
      logger.error('Error generating token.')
      throw error
    }
    if (!subscriberData) {
      logger.error('Error while subscribing. Subscriber data required')
      throw new Error('Subscriber data required')
    }
    this.signaling = new Signaling({
      streamName: this.streamName,
      url: `${subscriberData.urls[0]}?token=${subscriberData.jwt}`
    })

    await this.webRTCPeer.createRTCPeer(this.options.peerConfig)
    reemit(this.webRTCPeer, this, Object.values(webRTCEvents))

    const getLocalSDPPromise = this.webRTCPeer.getRTCLocalSDP({ ...this.options, stereo: true })
    const signalingConnectPromise = this.signaling.connect()
    promises = await Promise.all([getLocalSDPPromise, signalingConnectPromise])
    const localSdp = promises[0]

    const subscribePromise = this.signaling.subscribe(localSdp, this.options.multiplexedAudioTracks > 0, this.options.pinnedSourceId, this.options.excludedSourceIds, this.options.events)
    const setLocalDescriptionPromise = this.webRTCPeer.peer.setLocalDescription(this.webRTCPeer.sessionDescription)
    promises = await Promise.all([subscribePromise, setLocalDescriptionPromise])
    const sdpSubscriber = promises[0]

    reemit(this.signaling, this, [signalingEvents.broadcastEvent])

    await this.webRTCPeer.setRTCRemoteSDP(sdpSubscriber)

    this.setReconnect()
    logger.info('Connected to streamName: ', this.streamName)
  }

  /**
   * Select the simulcast encoding layer and svc layers for the main video track
   * @param {Object} [layer]			- leave empty for automatic layer selection based on bandwidth estimation.
   * @param {String} [layer.encodingId]		- rid value of the simulcast encoding of the track  (default: automatic selection)
   * @param {Number} [layer.spatialLayerId]	- The spatial layer id to send to the outgoing stream (default: max layer available)
   * @param {Number} [layer.temporalLayerId]	- The temporaral layer id to send to the outgoing stream (default: max layer available)
   * @param {Number} [layer.maxSpatialLayerId]	- Max spatial layer id (default: unlimited)
   * @param {Number} [layer.maxTemporalLayerId]	- Max temporal layer id (default: unlimited)
   */
  async select (layer = {}) {
    logger.debug('Viewer select layer values: ', options)
    await this.signaling.cmd('select', layer)
    logger.info('Connected to streamName: ', this.streamName)
  }

  /**
   * Start projecting source in selected media ids.
   * @param {String} sourceId			        - Selected source id.
   * @param {Array<Object>} mapping		        - Mapping of the source track ids to the receiver mids
   * @param {String} mapping.trackId	                - Track id from the source (received on the "active" event)
   * @param {String} mapping.mediaId	                - mid value of the rtp receiver in which the media is going to be projected.
   * @param {Object} [mapping.layer]	                - Select the simulcast encoding layer and svc layers, only applicable to video tracks.
   * @param {String} [mappinglayer.encodingId]		- rid value of the simulcast encoding of the track  (default: automatic selection)
   * @param {Number} [mappinglayer.spatialLayerId]	- The spatial layer id to send to the outgoing stream (default: max layer available)
   * @param {Number} [mappinglayer.temporalLayerId]	- The temporaral layer id to send to the outgoing stream (default: max layer available)
   * @param {Number} [mappinglayer.maxSpatialLayerId]	- Max spatial layer id (default: unlimited)
   * @param {Number} [mappinglayer.maxTemporalLayerId]	- Max temporal layer id (default: unlimited)
   */
  async project (sourceId, mappings) {
    logger.debug('Viewer project source:%s layer mappings: ',sourceId, mappings)
    await this.signaling.cmd('project', layer)
    logger.info('Projection done')
  }

  /**
   * Stop projecting attached source in selected media ids.
   * @param {Array<String>} mediaIds - mid value of the receivers that are going to be detached.
   */
  async unproject (mediaIds) {
    logger.debug('Viewer unproject mediaIds: ', mediaIds)
    await this.signaling.cmd('project', layer)
    logger.info('Unprojection done')
  }
}

