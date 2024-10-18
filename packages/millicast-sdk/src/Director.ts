import Logger from './Logger'
import Diagnostics from './utils/Diagnostics'
import FetchError from './utils/FetchError'
import {
  DirectorPublisherOptions,
  DirectorResponse,
  DirectorSubscriberOptions,
  MillicastDirectorResponse,
} from './types/Director.types'

const logger = Logger.get('Director')
enum StreamTypes {
  WEBRTC = 'WebRtc',
  RTMP = 'Rtmp',
}

let liveWebsocketDomain = ''
export const defaultApiEndpoint = 'https://director.millicast.com'
let apiEndpoint = defaultApiEndpoint

/**
 * @module Director
 * @description Simplify API calls to find the best server and region to publish and subscribe to.
 * For security reasons all calls will return a [JWT](https://jwt.io) token for authentication including the required
 * socket path to connect with.
 *
 * You will need your own Publishing token and Stream name, please refer to [Managing Your Tokens](https://docs.dolby.io/streaming-apis/docs/managing-your-tokens).
 */

/**
 * @typedef {Object} DRMObject
 * @property {String} fairPlayCertUrl - URL of the FairPlay certificate server.
 * @property {String} fairPlayUrl - URL of the FairPlay license server.
 * @property {String} widevineUrl - URL of the Widevine license server.
 */

/**
 * @typedef {Object} MillicastDirectorResponse
 * @global
 * @property {Array<String>} urls - WebSocket available URLs.
 * @property {String} jwt - Access token for signaling initialization.
 * @property {Array<RTCIceServer>} iceServers - Object which represents a list of Ice servers.
 * @property {DRMObject} [drmObject] - DRM proxy server information.
 */

/**
 * @typedef {Object} DirectorPublisherOptions
 * @global
 * @property {String} token - Millicast Publishing Token.
 * @property {String} streamName - Millicast Stream Name.
 * @property {("WebRtc" | "Rtmp")} [streamType] - Millicast Stream Type.
 */

/**
 * @typedef {Object} DirectorSubscriberOptions
 * @global
 * @property {String} streamName - Millicast publisher Stream Name.
 * @property {String} streamAccountId - Millicast Account ID.
 * @property {String} [subscriberToken] - Token to subscribe to secure streams. If you are subscribing to an unsecure stream, you can omit this param.
 */

const Director = {
  /**
   * @function
   * @name setEndpoint
   * @description Set Director API endpoint where requests will be sent.
   * @param {String} url - New Director API endpoint
   * @returns {void}
   */
  setEndpoint: (url: string): void => {
    apiEndpoint = url.replace(/\/$/, '')
  },

  /**
   * @function
   * @name getEndpoint
   * @description Get current Director API endpoint where requests will be sent. Default endpoint is 'https://director.millicast.com'.
   * @returns {String} API base url
   */
  getEndpoint: (): string => {
    return apiEndpoint
  },

  /**
   * @function
   * @name setLiveDomain
   * @description Set Websocket Live domain from Director API response.
   * If it is set to empty, it will not parse the response.
   * @param {String} domain - New Websocket Live domain
   * @returns {void}
   */
  setLiveDomain: (domain: string): void => {
    liveWebsocketDomain = domain.replace(/\/$/, '')
  },

  /**
   * @function
   * @name getLiveDomain
   * @description Get current Websocket Live domain.
   * By default is empty which corresponds to not parse the Director response.
   * @returns {String} Websocket Live domain
   */
  getLiveDomain: (): string => {
    return liveWebsocketDomain
  },

  /**
   * @function
   * @name getPublisher
   * @description Get publisher connection data.
   * @param {DirectorPublisherOptions} options - Millicast options.
   * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the publishing connection path.
   * @example const response = await Director.getPublisher(options)
   * @example
   * import { Publish, Director } from '@millicast/sdk'
   *
   * //Define getPublisher as callback for Publish
   * const streamName = "My Millicast Stream Name"
   * const token = "My Millicast publishing token"
   * const options: DirectorPublisherOptions = { token, streamName }
   * const tokenGenerator = () => Director.getPublisher(options)
   *
   * //Create a new instance
   * const millicastPublish = new Publish(tokenGenerator)
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
  getPublisher: async (options: DirectorPublisherOptions): Promise<MillicastDirectorResponse> => {
    options.streamType = options.streamType || StreamTypes.WEBRTC
    logger.info('Getting publisher connection path for stream name: ', options.streamName)
    const payload = {
      streamName: options.streamName,
      streamType: options.streamType,
    }
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${options.token}` }
    const url = `${Director.getEndpoint()}/api/director/publish`
    try {
      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
      let data = await response.json()
      if (data.status === 'fail') {
        const error = new FetchError(data.data.message, response.status)
        throw error
      }
      data = parseIncomingDirectorResponse(data)
      logger.debug('Getting publisher response: ', data)
      Diagnostics.initAccountId(data.data.streamAccountId)

      return data.data
    } catch (e) {
      logger.error('Error while getting publisher connection path. ', e)
      throw e
    }
  },

  /**
   * @function
   * @name getSubscriber
   * @description Get subscriber connection data.
   * @param {DirectorSubscriberOptions} options - Millicast options.
   * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the subscribe connection data.
   * @example const response = await Director.getSubscriber(options)
   * @example
   * import { View, Director } from '@millicast/sdk'
   *
   * //Define getSubscriber as callback for Subscribe
   * const streamName = "My Millicast Stream Name"
   * const accountId = "Millicast Publisher account Id"
   * const options: DirectorSubscriberOptions = { streamName, streamAccountId }
   * const tokenGenerator = () => Director.getSubscriber(options)
   * //... or for an secure stream
   * const options: DirectorSubscriberOptions = { {streamName, accountId, subscriberToken: '176949b9e57de248d37edcff1689a84a047370ddc3f0dd960939ad1021e0b744'} }
   * const tokenGenerator = () => Director.getSubscriber(options)
   *
   * //Create a new instance
   * const millicastView = new View(tokenGenerator)
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

  getSubscriber: async (options: DirectorSubscriberOptions): Promise<MillicastDirectorResponse> => {
    const optionsParsed = getSubscriberOptions(options)
    Diagnostics.initAccountId(optionsParsed.streamAccountId)
    logger.info(
      `Getting subscriber connection data for stream name: ${optionsParsed.streamName} and account id: ${optionsParsed.streamAccountId}`
    )

    const payload = {
      streamAccountId: optionsParsed.streamAccountId,
      streamName: optionsParsed.streamName,
    }
    const subscriberToken = optionsParsed.subscriberToken
    let headers: { 'Content-Type': string; Authorization?: string } = { 'Content-Type': 'application/json' }
    if (subscriberToken) {
      headers = { ...headers, Authorization: `Bearer ${subscriberToken}` }
    }
    const url = `${Director.getEndpoint()}/api/director/subscribe`
    try {
      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
      let data = await response.json()
      if (data.status === 'fail') {
        const error = new FetchError(data.data.message, response.status)
        throw error
      }
      data = parseIncomingDirectorResponse(data)
      logger.debug('Getting subscriber response: ', data)
      if (optionsParsed.subscriberToken) data.data.subscriberToken = optionsParsed.subscriberToken
      return data.data
    } catch (e) {
      logger.error('Error while getting subscriber connection path. ', e)
      throw e
    }
  },
}

const getSubscriberOptions = (options: DirectorSubscriberOptions): DirectorSubscriberOptions => {
  let parsedOptions = typeof options === 'object' ? options : ({} as DirectorSubscriberOptions)
  if (Object.keys(parsedOptions).length === 0) {
    parsedOptions = {
      streamName: options,
    } as unknown as DirectorSubscriberOptions
  }
  return parsedOptions
}

const parseIncomingDirectorResponse = (directorResponse: { data: DirectorResponse }) => {
  if (Director.getLiveDomain()) {
    const domainRegex = /\/\/(.*?)\//
    const urlsParsed = directorResponse.data.urls.map((url) => {
      const matched = domainRegex.exec(url) as RegExpExecArray
      return url.replace(matched[1], Director.getLiveDomain())
    })
    directorResponse.data.urls = urlsParsed
  }
  // TODO: remove this when server returns full path of DRM license server URLs
  if (directorResponse.data.drmObject) {
    const playReadyUrl = directorResponse.data.drmObject.playReadyUrl
    if (playReadyUrl) {
      directorResponse.data.drmObject.playReadyUrl = `${Director.getEndpoint()}${playReadyUrl}`
    }
    const widevineUrl = directorResponse.data.drmObject.widevineUrl
    if (widevineUrl) {
      directorResponse.data.drmObject.widevineUrl = `${Director.getEndpoint()}${widevineUrl}`
    }
    const fairPlayUrl = directorResponse.data.drmObject.fairPlayUrl
    if (fairPlayUrl) {
      directorResponse.data.drmObject.fairPlayUrl = `${Director.getEndpoint()}${fairPlayUrl}`
    }
    const fairPlayCertUrl = directorResponse.data.drmObject.fairPlayCertUrl
    if (fairPlayCertUrl) {
      directorResponse.data.drmObject.fairPlayCertUrl = `${Director.getEndpoint()}${fairPlayCertUrl}`
    }
  }
  return directorResponse
}

export default Director
