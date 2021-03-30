import Logger from './Logger'
import EventEmitter from 'events'
import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from './MillicastWebRTC.js'
const logger = Logger.get('MillicastView')

/**
 * @class MillicastView
 * @classdesc Manages connection to broadcasts.
 * @example const millicastView = new MillicastView();
 * @constructor
 */

export default class MillicastView extends EventEmitter {
  constructor () {
    super()
    this.webRTCPeer = new MillicastWebRTC()
    this.millicastSignaling = new MillicastSignaling()
  }

  /**
   * Connects to active broadcast
   * @param {Object} options - General subscriber options.
   * @param {Object} options.subscriberData - Millicast get subscriber response.
   * @param {String} options.streamName - Millicast stream name.
   * @param {Boolean} [options.disableVideo = false] - Disable peer to let send video.
   * @param {Boolean} [options.disableAudio = false] - Disable peer to let send audio.
   * @returns {String} SDP subscriber response from signaling connection.
   * @example const response = await millicastView.connect(options);
   * @example
   * import MillicastView from 'millicast-sdk-js';
   *
   * //Create a new instance
   * const millicastView = MillicastView();
   *
   * //Set new.track event handler.
   * //Event is from the RTCPeerConnection ontrack event which contains the peer stream.
   * //More information here: {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack}
   * millicastView.on('new.track', (event) => {
   *   addStreamToVideoTag(event.streams[0])
   * })
   *
   * //Get Millicast Subscriber data
   * const subscriberData = //response from Millicast Director API. https://director.millicast.com/api/director/subscribe
   *
   * //Options
   * const options = {
   *    subscriberData: subscriberData,
   *    streamName: "Millicast Stream Name",
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
