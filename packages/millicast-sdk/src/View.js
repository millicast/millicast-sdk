import reemit from 're-emitter'
import Logger from './Logger'
import BaseWebRTC from './utils/BaseWebRTC'
import Signaling, { signalingEvents } from './Signaling'
import PeerConnection, { webRTCEvents } from './PeerConnection'
const logger = Logger.get('View')

const connectOptions = {
  disableVideo: false,
  disableAudio: false,
  peerConfig: {}
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
   * @param {Object} [options]                          - General subscriber options.
   * @param {Boolean} [options.dtx = false]             - True to modify SDP for supporting dtx in opus. Otherwise False.
   * @param {Boolean} [options.absCaptureTime = false]  - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
   * @param {Boolean} [options.disableVideo = false]    - Disable the opportunity to receive video stream.
   * @param {Boolean} [options.disableAudio = false]    - Disable the opportunity to receive audio stream.
   * @param {Number} [options.multiplexedAudioTracks]   - Number of audio tracks to recieve VAD multiplexed audio for secondary sources.
   * @param {String} [options.pinnedSourceId]           - Id of the main source that will be received by the default MediaStream.
   * @param {Array<String>} [options.excludedSourceIds] - Do not receive media from the these source ids.
   * @param {Array<String>} [options.events]            - Override which events will be delivered by the server (any of "active" | "inactive" | "vad" | "layers").*
   * @param {RTCConfiguration} [options.peerConfig]     - Options to configure the new RTCPeerConnection.
   * @param {LayerInfo} [options.layer]                 - Select the simulcast encoding layer and svc layers for the main video track, leave empty for automatic layer selection based on bandwidth estimation.
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
    this.options = { ...connectOptions, ...options, setSDPToPeer: false }
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
   */
  async project (sourceId, mapping) {
    for (const map of mapping) {
      if (!map.trackId && !map.media) {
        logger.error('Error in projection mapping, trackId or mediaId must be set')
        throw new Error('Error in projection mapping, trackId or mediaId must be set')
      }
      const peer = this.webRTCPeer.getRTCPeer()
      // Check we have the mediaId in the transceivers
      if (map.mediaId && !peer.getTransceivers().find(t => t.mid === map.mediaId)) {
        logger.error(`Error in projection mapping, ${map.mediaId} mid not found in local transceivers`)
        throw new Error(`Error in projection mapping, ${map.mediaId} mid not found in local transceivers`)
      }
    }
    logger.debug('Viewer project source:%s layer mappings: ', sourceId, mapping)
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

  async initConnection (data) {
    logger.debug('Viewer connect options values: ', this.options)
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
    } catch (error) {
      logger.error('Error generating token.')
      throw error
    }
    if (!subscriberData) {
      logger.error('Error while subscribing. Subscriber data required')
      throw new Error('Subscriber data required')
    }
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

    const getLocalSDPPromise = webRTCPeerInstance.getRTCLocalSDP({ ...this.options, stereo: true })
    const signalingConnectPromise = signalingInstance.connect()
    promises = await Promise.all([getLocalSDPPromise, signalingConnectPromise])
    const localSdp = promises[0]

    const subscribePromise = signalingInstance.subscribe(localSdp, { ...this.options, vad: this.options.multiplexedAudioTracks > 0 })
    const setLocalDescriptionPromise = webRTCPeerInstance.peer.setLocalDescription(webRTCPeerInstance.sessionDescription)
    promises = await Promise.all([subscribePromise, setLocalDescriptionPromise])
    const sdpSubscriber = promises[0]

    await webRTCPeerInstance.setRTCRemoteSDP(sdpSubscriber)

    logger.info('Connected to streamName: ', this.streamName)

    let oldSignaling = this.signaling
    let oldWebRTCPeer = this.webRTCPeer
    this.signaling = signalingInstance
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
