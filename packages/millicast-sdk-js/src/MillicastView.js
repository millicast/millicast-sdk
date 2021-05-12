import reemit from 're-emitter'
import MillicastLogger from './MillicastLogger'
import BaseImplementator from './utils/BaseImplementator'
import MillicastSignaling, { signalingEvents } from './MillicastSignaling'
import { webRTCEvents } from './MillicastWebRTC.js'
const logger = MillicastLogger.get('MillicastView')
const maxReconnectionInterval = 32000

/**
 * @class MillicastView
 * @extends BaseImplementator
 * @classdesc Manages connection with a secure WebSocket path to signal the Millicast server
 * and establishes a WebRTC connection to view a live stream.
 *
 * Before you can view an active broadcast, you will need:
 *
 * - A connection path that you can get from {@link MillicastDirector} module or from your own implementation based on [Get a Connection Path](https://dash.millicast.com/docs.html?pg=how-to-broadcast-in-js#get-connection-paths-sect).
 * @constructor
 * @param {String} streamName - Millicast existing Stream Name where you want to connect.
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {Boolean} autoReconnect - Enable auto reconnect to stream.
 */
export default class MillicastView extends BaseImplementator {
  constructor (streamName, tokenGenerator, autoReconnect = true) {
    super(streamName, tokenGenerator, logger, autoReconnect)
    this.disableVideo = false
    this.disableAudio = false
  }

  /**
   * Connects to an active stream as subscriber.
   *
   * In the example, `addStreamToYourVideoTag` and `getYourSubscriberConnectionPath` is your own implementation.
   * @param {Object} options - General subscriber options.
   * @param {Boolean} [options.disableVideo = false] - Disable the opportunity to receive video stream.
   * @param {Boolean} [options.disableAudio = false] - Disable the opportunity to receive audio stream.
   * @returns {Promise<void>} Promise object which resolves when the connection was successfully established.
   * @fires MillicastWebRTC#track
   * @fires MillicastSignaling#broadcastEvent
   * @fires MillicastWebRTC#connectionStateChange
   * @example await millicastView.connect(options)
   * @example
   * import MillicastView from 'millicast-sdk-js'
   *
   * //Create a new instance
   * const streamName = "Millicast Stream Name where i want to connect"
   * const millicastView = new MillicastView(streamName)
   *
   * //Set track event handler.
   * millicastView.on('track', (event) => {
   *   addStreamToYourVideoTag(event.streams[0])
   * })
   *
   * //Get Millicast Subscriber data
   * const subscriberData = getYourSubscriberInformation(accountId, streamName)
   *
   * //Options
   * const options = {
   *    subscriberData: subscriberData
   *  }
   *
   * //Start connection to broadcast
   * try {
   * await millicastView.connect(options)
   * } catch (e) {
   *  console.log('Connection failed, handle error', e)
   * }
   */
  async connect (
    options = {
      disableVideo: false,
      disableAudio: false
    }
  ) {
    logger.debug('Viewer connect options values: ', options)
    this.disableVideo = options.disableVideo
    this.disableAudio = options.disableAudio
    if (this.isActive()) {
      logger.warn('Viewer currently subscribed')
      throw new Error('Viewer currently subscribed')
    }
    const subscriberData = await this.tokenGenerator()
    if (!subscriberData) {
      logger.error('Error while subscribing. Subscriber data required')
      throw new Error('Subscriber data required')
    }

    this.millicastSignaling = new MillicastSignaling({
      streamName: this.streamName,
      url: `${subscriberData.urls[0]}?token=${subscriberData.jwt}`
    })

    await this.webRTCPeer.getRTCPeer()
    reemit(this.webRTCPeer, this, Object.values(webRTCEvents))

    this.webRTCPeer.RTCOfferOptions = {
      offerToReceiveVideo: !this.disableVideo,
      offerToReceiveAudio: !this.disableAudio
    }
    const localSdp = await this.webRTCPeer.getRTCLocalSDP({ stereo: true })

    const sdpSubscriber = await this.millicastSignaling.subscribe(localSdp)
    reemit(this.millicastSignaling, this, [signalingEvents.broadcastEvent])

    await this.webRTCPeer.setRTCRemoteSDP(sdpSubscriber)

    this.setReconnect()
    logger.info('Connected to streamName: ', this.streamName)
  }

  /**
   * Stops active connection.
   * @example millicastView.stop();
   */
  stop () {
    super.stop()
  }

  /**
   * Get if the current connection is active.
   * @example const isActive = millicastView.isActive();
   * @returns {Boolean} - True if connected, false if not.
   */
  isActive () {
    return super.isActive()
  }

  /**
   * Reconnects to last broadcast.
   */
  reconnect () {
    setTimeout(async () => {
      try {
        if (!this.isActive()) {
          this.stop()
          await this.connect({
            disableVideo: this.disableVideo,
            disableAudio: this.disableAudio
          })
          this.alreadyDisconnected = false
          this.reconnectionInterval = 1000
          this.firstReconnection = true
        }
      } catch (error) {
        this.reconnectionInterval = this.reconnectionInterval < maxReconnectionInterval ? this.reconnectionInterval * 2 : this.reconnectionInterval
        logger.error(`Reconnection failed, retrying in ${this.reconnectionInterval}ms. Error was: `, error)
        this.reconnect()
      }
    }, this.reconnectionInterval)
  }
}
