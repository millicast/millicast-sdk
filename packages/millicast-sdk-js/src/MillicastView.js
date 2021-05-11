import EventEmitter from 'events'
import reemit from 're-emitter'
import MillicastLogger from './MillicastLogger'
import MillicastSignaling, { signalingEvents } from './MillicastSignaling'
import MillicastWebRTC, { webRTCEvents } from './MillicastWebRTC.js'
const logger = MillicastLogger.get('MillicastView')
const maxReconnectionInterval = 32000

/**
 * Callback invoke when a new token for viewer is needed.
 *
 * @callback subscriberTokenGeneratorCallback
 * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the subscriber connection path.
 *
 * You can use your own token generator or use the <a href='MillicastDirector#.getSubscriber'>getSubscriber method</a>.
 */

/**
 * @class MillicastView
 * @extends EventEmitter
 * @classdesc Manages connection with a secure WebSocket path to signal the Millicast server
 * and establishes a WebRTC connection to view a live stream.
 *
 * Before you can view an active broadcast, you will need:
 *
 * - A connection path that you can get from {@link MillicastDirector} module or from your own implementation based on [Get a Connection Path](https://dash.millicast.com/docs.html?pg=how-to-broadcast-in-js#get-connection-paths-sect).
 * @constructor
 * @param {String} streamName - Millicast existing Stream Name where you want to connect.
 * @param {subscriberTokenGeneratorCallback} tokenGenerator - Callback function executed when a new token for viewer is needed.
 * @param {Boolean} autoReconnect - Enable auto reconnect to stream.
 */
export default class MillicastView extends EventEmitter {
  constructor (streamName, tokenGenerator, autoReconnect = true) {
    super()
    if (!streamName) {
      logger.error('Stream Name is required to construct a viewer.')
      throw new Error('Stream Name is required to construct a viewer.')
    }
    if (!tokenGenerator) {
      logger.error('Token generator is required to construct a viewer.')
      throw new Error('Token generator is required to construct a viewer.')
    }
    this.webRTCPeer = new MillicastWebRTC()
    this.millicastSignaling = null
    this.streamName = streamName
    this.autoReconnect = autoReconnect
    this.disableVideo = false
    this.disableAudio = false
    this.reconnectionInterval = 1000
    this.alreadyDisconnected = false
    this.firstReconnection = true
    this.tokenGenerator = tokenGenerator
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
    logger.info('Stopping connection')
    this.webRTCPeer.closeRTCPeer()
    this.millicastSignaling?.close()
    this.millicastSignaling = null
  }

  /**
   * Get if the current connection is active.
   * @example const isActive = millicastView.isActive();
   * @returns {Boolean} - True if connected, false if not.
   */
  isActive () {
    const rtcPeerState = this.webRTCPeer.getRTCPeerStatus()
    logger.info('Connection status: ', rtcPeerState || 'not_established')
    return rtcPeerState === 'connected'
  }

  setReconnect () {
    if (this.autoReconnect) {
      this.millicastSignaling.on(signalingEvents.connectionError, () => {
        if (this.firstReconnection || !this.alreadyDisconnected) {
          this.firstReconnection = false
          this.reconnect()
        }
      })

      this.webRTCPeer.on(webRTCEvents.connectionStateChange, (state) => {
        if ((state === 'failed' || (state === 'disconnected' && this.alreadyDisconnected)) && this.firstReconnection) {
          this.firstReconnection = false
          this.reconnect()
        } else if (state === 'disconnected') {
          this.alreadyDisconnected = true
          setTimeout(() => this.reconnect(), 1500)
        } else {
          this.alreadyDisconnected = false
        }
      })
    }
  }

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
