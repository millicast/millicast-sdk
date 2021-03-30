import Logger from './Logger'
import EventEmitter from 'events'
import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from './MillicastWebRTC.js'
const logger = Logger.get('MillicastView')

/**
 * @class MillicastView
 * @classdesc <p>Manages connection to broadcasts.</p>
 * <p>Before you can view an active broadcast, you will need:
 * <br>
 * - Access to the Millicast Subscribe API. This will be used by the connect method so it can establish the connection. More information here: <a href="https://dash.millicast.com/docs.html?pg=how-to-broadcast-in-js#get-connection-paths-sect">Subscribe</a>
 * </p>
 */

export default class MillicastView extends EventEmitter {
  constructor () {
    super()
    this.webRTCPeer = new MillicastWebRTC()
    this.millicastSignaling = new MillicastSignaling()
  }

  /**
   * Connects to active broadcast where addStreamToYourVideoTag and getYourSubscriberInformation is your own implementation.
   * @param {Object} options - General subscriber options.
   * @param {Object} options.subscriberData - Millicast get subscriber response.
   * @param {String} options.streamName - Millicast stream name where you want to connect.
   * @param {Boolean} [options.disableVideo = false] - Disable peer to let send video.
   * @param {Boolean} [options.disableAudio = false] - Disable peer to let send audio.
   * @returns {Promise<String>} Promise object which represents the SDP subscriber response from signaling connection.
   * @example const response = await millicastView.connect(options);
   * @example
   * import MillicastView from 'millicast-sdk-js';
   *
   * //Create a new instance
   * const millicastView = MillicastView();
   * const streamName = "Millicast Stream Name where i want to connect"
   *
   * //Set new.track event handler.
   * //Event is from RTCPeerConnection ontrack event which contains the peer stream.
   * //More information here: {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack}
   * millicastView.on('new.track', (event) => {
   *   addStreamToYourVideoTag(event.streams[0])
   * })
   *
   * //Get Millicast Subscriber data
   * const subscriberData = getYourSubscriberInformation(accountId, streamName)
   *
   * //Options
   * const options = {
   *    subscriberData: subscriberData,
   *    streamName: streamName,
   *  };
   *
   * //Start connection to broadcast
   * const response = await millicastView.connect(options);
   */

  async connect (options = { subscriberData: null, streamName: null, disableVideo: false, disableAudio: false }) {
    logger.info(`Connecting to publisher. Stream name: ${options.streamName}`)
    logger.debug('All viewer connect options values: ', options)
    this.millicastSignaling.wsUrl = `${options.subscriberData.wsUrl}?token=${options.subscriberData.jwt}`
    const rtcConfiguration = await this.webRTCPeer.getRTCConfiguration()
    const peer = await this.webRTCPeer.getRTCPeer(rtcConfiguration)
    peer.ontrack = (event) => {
      logger.info('New track from peer.')
      logger.debug('Track event value: ', event)
      this.emit('new.track', event)
    }
    this.webRTCPeer.RTCOfferOptions = {
      offerToReceiveVideo: !options.disableVideo,
      offerToReceiveAudio: !options.disableAudio
    }
    const localSDP = await this.webRTCPeer.getRTCLocalSDP(true, null)
    const SDPSubscriber = await this.millicastSignaling.subscribe(localSDP, options.streamName)
    if (SDPSubscriber) {
      await this.webRTCPeer.setRTCRemoteSDP(SDPSubscriber)
    } else {
      logger.error('Failed to connect to publisher: ', SDPSubscriber)
      throw new Error('Failed to connect to publisher: ', SDPSubscriber)
    }

    return SDPSubscriber
  }
}
