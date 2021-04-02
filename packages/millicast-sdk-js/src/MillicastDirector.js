import axios from 'axios'
import Logger from './Logger'

const logger = Logger.get('MillicastDirector')
const publisherLocation = 'https://director.millicast.com/api/director/publish'
const subscriberLocation = 'https://director.millicast.com/api/director/subscribe'

/**
 * @typedef {Object} MillicastPublisherResponse
 * @property {Array<String>} urls - Web Socket URLs.
 * @property {String} wsUrl - Web Socket URL.
 * @property {String} jwt - Access token for signaling initialization.
 * @property {String} streamAccountId - Millicast publisher account identifier.
 * @property {Boolean} subscribeRequiresAuth - True if subscriber requires authentication, otherwise false.
 */

/**
 * @typedef {Object} MillicastSubscriberResponse
 * @property {Array<String>} urls - Web Socket URLs.
 * @property {String} wsUrl - Web Socket URL.
 * @property {String} jwt - Access token for signaling initialization.
 * @property {String} streamAccountId - Millicast publisher account identifier.
 */

/**
 * @class MillicastDirector
 * @hideconstructor
 * @classdesc Manages get publisher and subscriber connection data.
 */

export default class MillicastDirector {
/**
   * Get publisher connection data.
   * @param {String} token - Millicast publishing token.
   * @param {String} streamName - Millicast stream name.
   * @returns {Promise<MillicastPublisherResponse>} Promise object which represents the result of getting the publishing connection path.
   * @example const response = await MillicastDirector.getPublisher(token, streamName)
   * @example
   * import { MillicastPublish, MillicastDirector } from 'millicast-sdk-js'
   *
   * //Create a new instance
   * const millicastPublish = new MillicastPublish()
   * const streamName = "My Millicast Stream Name"
   * const token = "My Millicast publishing token"
   *
   * //Get MediaStream
   * const mediaStream = getYourMediaStreamImplementation()
   *
   * //Get Millicast publisher connection path
   * const publisherData = await MillicastDirector.getPublisher(token, streamName)
   *
   * //Options
   * const broadcastOptions = {
   *    publisherData: publisherData,
   *    streamName: streamName,
   *    mediaStream: mediaStream,
   *  };
   *
   * //Start broadcast
   * await millicastPublish.broadcast(broadcastOptions)
   */

  static async getPublisher (token, streamName) {
    logger.info('Getting publisher connection data for stream name: ', streamName)
    const payload = { streamName }
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const { data } = await axios.post(publisherLocation, payload, { headers })
      logger.debug('Getting publisher response: ', data)
      return data.data
    } catch (e) {
      logger.error('Error while getting publisher connection data: ', e.response.data)
      throw e
    }
  }

  /**
   * Get subscriber connection data.
   * @param {String} streamAccountId - Millicast account ID.
   * @param {String} streamName - Millicast publisher stream name.
   * @param {Boolean} unauthorizedSubscribe - True if it's a subscription without credentials. Otherwise false.
   * @returns {Promise<MillicastSubscriberResponse>} Promise object which represents the result of getting the subscribe connection data.
   * @example const response = await MillicastDirector.getSubscriber(streamAccountId, streamName)
   * @example
   * import { MillicastView, MillicastDirector } from 'millicast-sdk-js'
   *
   * //Create a new instance
   * const millicastView = new MillicastView();
   * const streamName = "Millicast Stream Name where i want to connect"
   * const accountId = "Millicast Publisher account Id"
   *
   * //Set new.track event handler.
   * //Event is from RTCPeerConnection ontrack event which contains the peer stream.
   * //More information here: {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack}
   * millicastView.on('new.track', (event) => {
   *   addStreamToYourVideoTag(event.streams[0])
   * })
   *
   * //Get Millicast Subscriber connection path
   * const subscriberData = await MillicastDirector.getSubscriber(accountId, streamName)
   *
   * //Options
   * const options = {
   *    subscriberData: subscriberData,
   *    streamName: streamName,
   *  };
   *
   * //Start connection to broadcast
   * const response = await millicastView.connect(options)
   */

  static async getSubscriber (streamAccountId, streamName, unauthorizedSubscribe = true) {
    logger.info(`Getting subscriber connection data for stream name: ${streamName} and account id: ${streamAccountId}`)
    const payload = { streamAccountId, streamName, unauthorizedSubscribe }
    try {
      const { data } = await axios.post(subscriberLocation, payload)
      logger.debug('Getting subscriber response: ', data)
      return data.data
    } catch (e) {
      logger.error('Error while getting subscriber connection data: ', e.response.data)
      throw e
    }
  }
}
