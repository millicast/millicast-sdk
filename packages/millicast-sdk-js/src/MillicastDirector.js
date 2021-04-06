import axios from 'axios'
import Logger from './Logger'

const logger = Logger.get('MillicastDirector')
const publisherLocation = 'https://director.millicast.com/api/director/publish'
const subscriberLocation = 'https://director.millicast.com/api/director/subscribe'

/**
 * @typedef {Object} MillicastDirectorResponse
 * @property {Array<String>} urls - WebSocket available URLs.
 * @property {String} wsUrl - Deprecated: You should use the first url in `urls`.
 * @property {String} jwt - Access token for signaling initialization.
 * @property {String} streamAccountId - Millicast publisher Account ID.
 * @property {Boolean} [subscribeRequiresAuth] - True if subscriber requires authentication, otherwise false.
 */

/**
 * @class MillicastDirector
 * @hideconstructor
 * @classdesc Simplify API calls to find the best server and region to publish and subscribe to.
 * For security reasosn all calls will return a [JWT](https://jwt.io) token forn authentication including the required
 * socket path to connect with.
 *
 * You will need your own Publishing token and Stream name, please refer to [Managing Your Tokens](https://dash.millicast.com/docs.html?pg=managing-your-tokens).
 */

export default class MillicastDirector {
/**
   * Get publisher connection data.
   * @param {String} token - Millicast Publishing Token.
   * @param {String} streamName - Millicast Stream Name.
   * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the publishing connection path.
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
   *  }
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
   * @param {String} streamAccountId - Millicast Account ID.
   * @param {String} streamName - Millicast publisher Stream Name.
   * @param {Boolean} unauthorizedSubscribe - True if it's a subscription without credentials. Otherwise false.
   * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the subscribe connection data.
   * @example const response = await MillicastDirector.getSubscriber(streamAccountId, streamName)
   * @example
   * import { MillicastView, MillicastDirector } from 'millicast-sdk-js'
   *
   * //Create a new instance
   * const millicastView = new MillicastView()
   * const streamName = "Millicast Stream Name where i want to connect"
   * const accountId = "Millicast Publisher account Id"
   *
   * //Set new.track event handler.
   * //Event is from RTCPeerConnection ontrack event which contains the peer stream.
   * //More information here: {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack}
   * millicastView.on('newTrack', (event) => {
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
   *  }
   *
   * //Start connection to broadcast
   * await millicastView.connect(options)
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
