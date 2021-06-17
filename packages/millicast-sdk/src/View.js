import reemit from 're-emitter'
import Logger from './Logger'
import BaseWebRTC from './utils/BaseWebRTC'
import Signaling, { signalingEvents } from './Signaling'
import { webRTCEvents } from './PeerConnection'
const logger = Logger.get('View')

const connectOptions = {
  disableVideo: false,
  disableAudio: false,
  peerOptions: null
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
   * @param {Boolean} [options.disableVideo = false] - Disable the opportunity to receive video stream.
   * @param {Boolean} [options.disableAudio = false] - Disable the opportunity to receive audio stream.
   * @param {RTCConfiguration} options.peerOptions - Options to configure the new RTCPeerConnection.
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
    this.options = { ...connectOptions, ...options }
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

    await this.webRTCPeer.getRTCPeer(this.options.peerOptions)
    reemit(this.webRTCPeer, this, Object.values(webRTCEvents))

    const localSdp = await this.webRTCPeer.getRTCLocalSDP({ ...this.options, stereo: true })
    const sdpSubscriber = await this.signaling.subscribe(localSdp)
    reemit(this.signaling, this, [signalingEvents.broadcastEvent])

    await this.webRTCPeer.setRTCRemoteSDP(sdpSubscriber)

    this.setReconnect()
    logger.info('Connected to streamName: ', this.streamName)
  }
}
