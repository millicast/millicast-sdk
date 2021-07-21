import axios from 'axios'
import jwtDecode from 'jwt-decode'
import Logger from './Logger'

const logger = Logger.get('Director')
const streamTypes = {
  WEBRTC: 'WebRtc',
  RTMP: 'Rtmp'
}

export const defaultApiEndpoint = 'https://director.millicast.com'
let apiEndpoint = defaultApiEndpoint

/**
 * @typedef {Object} MillicastDirectorResponse
 * @property {Array<String>} urls - WebSocket available URLs.
 * @property {String} jwt - Access token for signaling initialization.
 * @property {Object} jwtDecoded - Access token decoded.
 */

/**
 * @typedef {Object} DirectorPublisherOptions
 * @property {String} token - Millicast Publishing Token.
 * @property {String} streamName - Millicast Stream Name.
 * @property {("WebRtc" | "Rtmp")} [streamType] - Millicast Stream Type.
 */

/**
 * @typedef {Object} DirectorSubscriberOptions
 * @property {String} streamName - Millicast publisher Stream Name.
 * @property {String} streamAccountId - Millicast Account ID.
 * @property {String} [subscriberToken] - Token to subscribe to secure streams. If you are subscribing to an unsecure stream, you can omit this param.
 */

/**
 * Simplify API calls to find the best server and region to publish and subscribe to.
 * For security reasosn all calls will return a [JWT](https://jwt.io) token forn authentication including the required
 * socket path to connect with.
 *
 * You will need your own Publishing token and Stream name, please refer to [Managing Your Tokens](https://dash.millicast.com/docs.html?pg=managing-your-tokens).
 * @namespace
 */

export default class Director {
  /**
   * Set Director API endpoint where requests will be sent.
   *
   * @param {String} url - New Director API endpoint
   */
  static setEndpoint (url) {
    apiEndpoint = url.replace(/\/$/, '')
  }

  /**
   * Get current Director API endpoint where requests will be sent.
   *
   * By default, https://director.millicast.com is the current API endpoint.
   * @returns {String} API base url
   */
  static getEndpoint () {
    return apiEndpoint
  }

  /**
   * Get publisher connection data.
   * @param {DirectorPublisherOptions | String} options - Millicast options or *Deprecated Millicast Publishing Token.*
   * @param {String} [streamName] - *Deprecated, use options parameter instead* Millicast Stream Name.
   * @param {("WebRtc" | "Rtmp")} [streamType] - *Deprecated, use options parameter instead* Millicast Stream Type.
   * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the publishing connection path.
   * @example const response = await Director.getPublisher(options)
   * @example
   * import { Publish, Director } from '@millicast/sdk'
   *
   * //Define getPublisher as callback for Publish
   * const streamName = "My Millicast Stream Name"
   * const token = "My Millicast publishing token"
   * const tokenGenerator = () => Director.getPublisher({token, streamName})
   *
   * //Create a new instance
   * const millicastPublish = new Publish(streamName, tokenGenerator)
   *
   * //Get MediaStream
   * const mediaStream = getYourMediaStreamImplementation()
   *
   * //Options
   * const broadcastOptions = {
   *    mediaStream: mediaStream
   *  }
   *
   * //Start broadcast
   * await millicastPublish.connect(broadcastOptions)
   */

  static async getPublisher (options, streamName = null, streamType = streamTypes.WEBRTC) {
    const optionsParsed = getPublisherOptions(options, streamName, streamType)
    logger.info('Getting publisher connection path for stream name: ', optionsParsed.streamName)
    const payload = { streamName: optionsParsed.streamName, streamType: optionsParsed.streamType }
    const headers = { Authorization: `Bearer ${optionsParsed.token}` }
    const url = `${this.getEndpoint()}/api/director/publish`
    try {
      const { data } = await axios.post(url, payload, { headers })
      logger.debug('Getting publisher response: ', data)
      return { ...data.data, jwtDecoded: jwtDecode(data.data.jwt).millicast }
    } catch (e) {
      logger.error('Error while getting publisher connection path: ', e.response?.data)
      throw e
    }
  }

  /**
   * Get subscriber connection data.
   * @param {DirectorSubscriberOptions | String} options - Millicast options or *Deprecated Millicast publisher Stream Name.*
   * @param {String} [streamAccountId] - *Deprecated, use options parameter instead* Millicast Account ID.
   * @param {String} [subscriberToken] - *Deprecated, use options parameter instead* Token to subscribe to secure streams. If you are subscribing to an unsecure stream, you can omit this param.
   * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the subscribe connection data.
   * @example const response = await Director.getSubscriber(options)
   * @example
   * import { View, Director } from '@millicast/sdk'
   *
   * //Define getSubscriber as callback for Subscribe
   * const streamName = "My Millicast Stream Name"
   * const accountId = "Millicast Publisher account Id"
   * const tokenGenerator = () => Director.getSubscriber({streamName, accountId})
   * //... or for an secure stream
   * const tokenGenerator = () => Director.getSubscriber({streamName, accountId, subscriberToken: '176949b9e57de248d37edcff1689a84a047370ddc3f0dd960939ad1021e0b744'})
   *
   * //Create a new instance
   * const millicastView = new View(streamName, tokenGenerator)
   *
   * //Set track event handler to receive streams from Publisher.
   * millicastView.on('track', (event) => {
   *   addStreamToYourVideoTag(event.streams[0])
   * })
   *
   * //View Options
   * const options = {
   *  }
   *
   * //Start connection to broadcast
   * await millicastView.connect(options)
   */

  static async getSubscriber (options, streamAccountId = null, subscriberToken = null) {
    const optionsParsed = getSubscriberOptions(options, streamAccountId, subscriberToken)
    logger.info(`Getting subscriber connection data for stream name: ${optionsParsed.streamName} and account id: ${optionsParsed.streamAccountId}`)

    const payload = { streamAccountId: optionsParsed.streamAccountId, streamName: optionsParsed.streamName }
    let headers = {}
    if (optionsParsed.subscriberToken) {
      headers = { Authorization: `Bearer ${optionsParsed.subscriberToken}` }
    }
    const url = `${this.getEndpoint()}/api/director/subscribe`
    try {
      const { data } = await axios.post(url, payload, { headers })
      logger.debug('Getting subscriber response: ', data)
      return { ...data.data, jwtDecoded: jwtDecode(data.data.jwt).millicast }
    } catch (e) {
      logger.error('Error while getting subscriber connection path: ', e.response?.data)
      throw e
    }
  }
}

const getPublisherOptions = (options, legacyStreamName, legacyStreamType) => {
  let parsedOptions = (typeof options === 'object') ? options : {}
  if (Object.keys(parsedOptions).length === 0) {
    parsedOptions = {
      token: options,
      streamName: legacyStreamName,
      streamType: legacyStreamType
    }
  }
  return parsedOptions
}

const getSubscriberOptions = (options, legacyStreamAccountId, legacySubscriberToken) => {
  let parsedOptions = (typeof options === 'object') ? options : {}
  if (Object.keys(parsedOptions).length === 0) {
    parsedOptions = {
      streamName: options,
      streamAccountId: legacyStreamAccountId,
      subscriberToken: legacySubscriberToken
    }
  }
  return parsedOptions
}
