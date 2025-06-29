import Logger from './Logger'
import Diagnostics from './utils/Diagnostics'
import FetchError from './utils/FetchError'
import {
  DirectorPublisherOptions,
  DirectorResponse,
  DirectorSubscriberOptions,
  MillicastDirectorResponse,
} from './types/Director.types'
import { ILogger } from 'js-logger';

/**
 * Simplify API calls to find the best server and region to publish and subscribe to.
 * For security reasons all calls will return a [JWT](https://jwt.io) token for
 * authentication including the required socket path to connect with.
 * @hidden
 */
export class Director {

  static #logger: ILogger = Logger.get('Director');

  /** @ignore */
  static readonly DEFAULT_API_ENDPOINT: string = 'https://director.millicast.com';

  static #liveWebsocketDomain: string = '';
  static #apiEndpoint: string = Director.DEFAULT_API_ENDPOINT;

  /**
   * Sets the Director API endpoint where requests will be sent.
   * 
   * @param url New Director API endpoint
   */
  public static set endpoint(url: string) {
    Director.#apiEndpoint = url.replace(/\/$/, '');
  }

  /**
   * Gets the current Director API endpoint where requests will be sent.
   * 
   * @returns API base url.
   * 
   * @defaultValue `https://director.millicast.com`
   */
  public static get endpoint(): string {
    return Director.#apiEndpoint;
  }

  /**
   * Sets the Websocket Live domain from Director API response.
   * If it is set to empty, it will not parse the response.
   * 
   * @param domain New Websocket Live domain
   */
  public static set liveDomain(domain: string) {
    Director.#liveWebsocketDomain = domain.replace(/\/$/, '');
  }

  /**
   * Get current Websocket Live domain.
   * By default is empty which corresponds to not parse the Director response.
   * 
   * @returns Websocket Live domain
   */
  public static get liveDomain(): string {
    return Director.#liveWebsocketDomain;
  }

  /**
   * Gets the publisher connection data.
   * 
   * @param options Millicast options.
   * 
   * @returns A {@link !Promise Promise} whose fulfillment handler receives a {@link MillicastDirectorResponse} object which represents the result of getting the publishing connection path.
   */
  public static async getPublisher(options: DirectorPublisherOptions): Promise<MillicastDirectorResponse> {
    Director.#logger.info('Getting publisher connection path for stream name: ', options.streamName)
    const payload = {
      streamName: options.streamName,
      streamType: 'WebRtc',
    }
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${options.token}` }
    const url = `${Director.endpoint}/api/director/publish`
    try {
      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
      let data = await response.json()
      if (data.status === 'fail') {
        const error = new FetchError(data.data.message, response.status)
        throw error
      }
      data = Director.parseIncomingDirectorResponse(data)
      Director.#logger.debug('Getting publisher response: ', data)
      Diagnostics.initAccountId(data.data.streamAccountId)

      return data.data
    } catch (e) {
      Director.#logger.error('Error while getting publisher connection path. ', e)
      throw e
    }
  }

  /**
   * Get subscriber connection data.
   * 
   * @param options Millicast options.
   * 
   * @returns A {@link !Promise Promise} whose fulfillment handler receives a {@link MillicastDirectorResponse} object which represents the result of getting the subscribe connection data.
   */
  public static async getSubscriber(options: DirectorSubscriberOptions): Promise<MillicastDirectorResponse> {
    Diagnostics.initAccountId(options.streamAccountId)
    Director.#logger.info(
      `Getting subscriber connection data for stream name: ${options.streamName} and account id: ${options.streamAccountId}`
    )

    const payload = {
      streamAccountId: options.streamAccountId,
      streamName: options.streamName,
    }
    const subscriberToken = options.subscriberToken
    let headers: { 'Content-Type': string; Authorization?: string } = { 'Content-Type': 'application/json' }
    if (subscriberToken) {
      headers = { ...headers, Authorization: `Bearer ${subscriberToken}` }
    }
    const url = `${Director.endpoint}/api/director/subscribe`
    try {
      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
      let data = await response.json()
      if (data.status === 'fail') {
        const error = new FetchError(data.data.message, response.status)
        throw error
      }
      data = Director.parseIncomingDirectorResponse(data)
      Director.#logger.debug('Getting subscriber response: ', data)
      if (options.subscriberToken) data.data.subscriberToken = options.subscriberToken
      return data.data
    } catch (e) {
      Director.#logger.error('Error while getting subscriber connection path. ', e)
      throw e
    }
  }

  /** @ignore */
  private static parseIncomingDirectorResponse = (directorResponse: { data: DirectorResponse }) => {
    if (Director.liveDomain) {
      const domainRegex = /\/\/(.*?)\//
      const urlsParsed = directorResponse.data.urls.map((url) => {
        const matched = domainRegex.exec(url)
        if (!matched) {
          Director.#logger.warn('Unable to parse incoming director response')
          return url
        }
        return url.replace(matched[1], this.liveDomain)
      })
      directorResponse.data.urls = urlsParsed
    }
    // TODO: remove this when server returns full path of DRM license server URLs
    if (directorResponse.data.drmObject) {
      const playReadyUrl = directorResponse.data.drmObject.playReadyUrl
      if (playReadyUrl) {
        directorResponse.data.drmObject.playReadyUrl = `${Director.endpoint}${playReadyUrl}`
      }
      const widevineUrl = directorResponse.data.drmObject.widevineUrl
      if (widevineUrl) {
        directorResponse.data.drmObject.widevineUrl = `${Director.endpoint}${widevineUrl}`
      }
      const fairPlayUrl = directorResponse.data.drmObject.fairPlayUrl
      if (fairPlayUrl) {
        directorResponse.data.drmObject.fairPlayUrl = `${Director.endpoint}${fairPlayUrl}`
      }
      const fairPlayCertUrl = directorResponse.data.drmObject.fairPlayCertUrl
      if (fairPlayCertUrl) {
        directorResponse.data.drmObject.fairPlayCertUrl = `${Director.endpoint}${fairPlayCertUrl}`
      }
    }
    return directorResponse
  }

}
