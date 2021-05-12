import axios from 'axios'
import MillicastLogger from './MillicastLogger'

const logger = MillicastLogger.get('MillicastDirector')
const publisherLocation = 'https://director.millicast.com/api/director/publish'
const subscriberLocation = 'https://director.millicast.com/api/director/subscribe'
const streamTypes = {
  WEBRTC: 'WebRtc',
  RTMP: 'Rtmp'
}

/**
 * @typedef {Object} MillicastDirectorResponse
 * @property {Array<String>} urls - WebSocket available URLs.
 * @property {String} jwt - Access token for signaling initialization.
 */

/**
 * Simplify API calls to find the best server and region to publish and subscribe to.
 * For security reasosn all calls will return a [JWT](https://jwt.io) token forn authentication including the required
 * socket path to connect with.
 *
 * You will need your own Publishing token and Stream name, please refer to [Managing Your Tokens](https://dash.millicast.com/docs.html?pg=managing-your-tokens).
 * @namespace
 */

export default class MillicastDirector {
/**
   * Get publisher connection data.
   * @param {String} token - Millicast Publishing Token.
   * @param {String} streamName - Millicast Stream Name.
   * @param {("WebRtc" | "Rtmp")} [streamType] - Millicast Stream Type.
   * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the publishing connection path.
   * @example const response = await MillicastDirector.getPublisher(token, streamName)
   * @example
   * import { MillicastPublish, MillicastDirector } from 'millicast-sdk-js'
   *
   * //Create a new instance
   * const streamName = "My Millicast Stream Name"
   * const token = "My Millicast publishing token"
   * const millicastPublish = new MillicastPublish(streamName)
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
   *    mediaStream: mediaStream
   *  }
   *
   * //Start broadcast
   * await millicastPublish.connect(broadcastOptions)
   */

  static async getPublisher (token, streamName, streamType = streamTypes.WEBRTC) {
    logger.info('Getting publisher connection path for stream name: ', streamName)
    const payload = { streamName, streamType }
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const { data } = await axios.post(publisherLocation, payload, { headers })
      logger.debug('Getting publisher response: ', data)
      return data.data
    } catch (e) {
      logger.error('Error while getting publisher connection path: ', e.response.data)
      throw e
    }
  }

  /**
   * Get subscriber connection data.
   * @param {String} streamName - Millicast publisher Stream Name.
   * @param {String} streamAccountId - Millicast Account ID.
   * @param {String} [subscriberToken] - Token to subscribe to secure streams. If you are subscribing to an unsecure stream, you can omit this param.
   * @param {("WebRtc" | "Rtmp")} [streamType] - Millicast Stream Type.
   * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the subscribe connection data.
   * @example const response = await MillicastDirector.getSubscriber(streamName, streamAccountId)
   * @example
   * import { MillicastView, MillicastDirector } from 'millicast-sdk-js'
   *
   * //Create a new instance
   * const streamName = "Millicast Stream Name where i want to connect"
   * const accountId = "Millicast Publisher account Id"
   * const millicastView = new MillicastView(streamName)
   *
   * //Set new.track event handler.
   * //Event is from RTCPeerConnection ontrack event which contains the peer stream.
   * //More information here: {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack}
   * millicastView.on('newTrack', (event) => {
   *   addStreamToYourVideoTag(event.streams[0])
   * })
   *
   * //Get Millicast Subscriber connection path for an unsecure stream
   * const subscriberData = await MillicastDirector.getSubscriber(streamName, accountId)
   *
   * //... or for an secure stream
   * const subscriberData = await MillicastDirector.getSubscriber(streamName, accountId, '176949b9e57de248d37edcff1689a84a047370ddc3f0dd960939ad1021e0b744')
   *
   * //Options
   * const options = {
   *    subscriberData: subscriberData
   *  }
   *
   * //Start connection to broadcast
   * await millicastView.connect(options)
   */

  static async getSubscriber (streamName, streamAccountId, subscriberToken = null, streamType = streamTypes.WEBRTC) {
    logger.info(`Getting subscriber connection data for stream name: ${streamName} and account id: ${streamAccountId}`)
    const payload = { streamAccountId, streamName, streamType }
    let headers = {}
    if (subscriberToken) {
      headers = { Authorization: `Bearer ${subscriberToken}` }
    }
    try {
      const { data } = await axios.post(subscriberLocation, payload, { headers })
      logger.debug('Getting subscriber response: ', data)
      return data.data
    } catch (e) {
      logger.error('Error while getting subscriber connection path: ', e.response.data)
      throw e
    }
  }
}
