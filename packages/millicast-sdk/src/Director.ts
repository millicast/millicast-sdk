import Logger from './Logger';
import Diagnostics from './utils/Diagnostics';
import FetchError from './utils/FetchError';
import {
  type DirectorPublisherOptions,
  type DirectorResponse,
  type DirectorSubscriberOptions,
  type MillicastDirectorResponse,
} from './types/Director.types';

const logger = Logger.get('Director');
enum StreamTypes {
  WEBRTC = 'WebRtc',
  RTMP = 'Rtmp'
}

let liveWebsocketDomain = '';
export const defaultApiEndpoint = 'https://director.millicast.com';
let apiEndpoint = defaultApiEndpoint;

/**
 * @module Director
 * @description Simplify API calls to find the best server and region to publish and subscribe to.
 * For security reasons all calls will return a [JWT](https://jwt.io) token for authentication including the required
 * socket path to connect with.
 *
 * You will need your own Publishing token and Stream name, please refer to [Managing Your Tokens](https://docs.dolby.io/streaming-apis/docs/managing-your-tokens).
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
    apiEndpoint = url.replace(/\/$/, '');
  },

  /**
   * @function
   * @name getEndpoint
   * @description Get current Director API endpoint where requests will be sent. Default endpoint is 'https://director.millicast.com'.
   * @returns {String} API base url
   */
  getEndpoint: (): string => {
    return apiEndpoint;
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
    liveWebsocketDomain = domain.replace(/\/$/, '');
  },

  /**
   * @function
   * @name getLiveDomain
   * @description Get current Websocket Live domain.
   * By default is empty which corresponds to not parse the Director response.
   * @returns {String} Websocket Live domain
   */
  getLiveDomain: (): string => {
    return liveWebsocketDomain;
  },

  /**
   * import { Publish, Director } from '@millicast/sdk'
   *
   * //Define getPublisher as callback for Publish
   * const streamName = "My Millicast Stream Name"
   * const token = "My Millicast publishing token"
   * const tokenGenerator = () => Director.getPublisher({token, streamName})
   *
   * //Create a new instance
   * const millicastPublish = new Publish(undefined, tokenGenerator)
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
  getPublisher: async (
    options: DirectorPublisherOptions | string,
    streamName: string | null = null,
    streamType: StreamTypes = StreamTypes.WEBRTC,
  ): Promise<MillicastDirectorResponse> => {

    const optionsParsed = getPublisherOptions(options, streamName, streamType);


    logger.info(
      'Getting publisher connection path for stream name: ',
      optionsParsed.streamName,
    );
    const payload = {
      streamName: optionsParsed.streamName,
      streamType: optionsParsed.streamType,
    };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${optionsParsed.token}`,
    };
    const url = `${getDirectorPath('publish')}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      let data = await response.json();
      if (data.status === 'fail') {
        const error = new FetchError(data.data.message, response.status);
        throw error;
      }
      data = parseIncomingDirectorResponse(data);
      logger.debug('Getting publisher response: ', data);
      Diagnostics.initAccountId(data.data.streamAccountId);

      return data.data;
    } catch (e) {
      logger.error('Error while getting publisher connection path. ', e);
      throw e;
    }
  },

  /**
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
   * const millicastView = new View(undefined, tokenGenerator)
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

  getSubscriber: async (
    options: DirectorSubscriberOptions | string,
     
    streamAccountId: string | null = null,
    subscriberToken: string | null = null,
  ) => {
    const optionsParsed = getSubscriberOptions(options, streamAccountId, subscriberToken);

    Diagnostics.initAccountId(optionsParsed.streamAccountId);

    logger.info(
      `Getting subscriber connection data for stream name: ${optionsParsed.streamName} and account id: ${optionsParsed.streamAccountId}`,
    );

    const payload = {
      streamAccountId: optionsParsed.streamAccountId,
      streamName: optionsParsed.streamName,
    };
    let headers: { 'Content-Type': string; Authorization?: string } = {
      'Content-Type': 'application/json',
    };
    if (optionsParsed.subscriberToken) {
      headers = { ...headers, Authorization: `Bearer ${optionsParsed.subscriberToken}` };
    }

    const url = `${getDirectorPath('subscribe')}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      let data = await response.json();
      if (data.status === 'fail') {
        const error = new FetchError(data.data.message, response.status);
        throw error;
      }
      data = parseIncomingDirectorResponse(data);
      logger.debug('Getting subscriber response: ', data);
      
      if (optionsParsed.subscriberToken){
        data.data.subscriberToken = optionsParsed.subscriberToken;
      }
      return data.data;
    } catch (e) {
      logger.error('Error while getting subscriber connection path. ', e);
      throw e;
    }
  },
};

const getPublisherOptions = (
  options: string | DirectorPublisherOptions,
  legacyStreamName: string | null,
  legacyStreamType: 'WebRtc' | 'Rtmp' = StreamTypes.WEBRTC,
): DirectorPublisherOptions => {
  let parsedOptions: DirectorPublisherOptions | Record<string, never> =
    typeof options === 'object' ? options : {};

  if (Object.keys(parsedOptions).length === 0) {
    parsedOptions = {
      token: options as string,
      streamName: legacyStreamName!,
      streamType: legacyStreamType,
    };
  }

  return parsedOptions as DirectorPublisherOptions;
};

const getSubscriberOptions = (
  options: string | DirectorSubscriberOptions,
  legacyStreamAccountId: string | null,
  legacySubscriberToken: string | null,
): DirectorSubscriberOptions => {
  let parsedOptions: DirectorSubscriberOptions | Record<string, never> =
    typeof options === 'object' ? options : {};

  if (Object.keys(parsedOptions).length === 0) {
    parsedOptions = {
      streamName: options as string,
      streamAccountId: legacyStreamAccountId!,
      subscriberToken: legacySubscriberToken,
    };
  }

  return parsedOptions as DirectorSubscriberOptions;
};



const parseIncomingDirectorResponse = (directorResponse: {
  data: DirectorResponse
}) => {
  if (Director.getLiveDomain()) {
    const domainRegex = /\/\/(.*?)\//;
    const urlsParsed = directorResponse.data.urls.map(url => {
      const matched = domainRegex.exec(url);
      if (!matched) {
        logger.warn('Unable to parse incoming director response');
        return url;
      }
      return url.replace(matched[1], Director.getLiveDomain());
    });
    directorResponse.data.urls = urlsParsed;
  }
  // TODO: remove this when server returns full path of DRM license server URLs
  if (directorResponse.data.drmObject) {
    const playReadyUrl = directorResponse.data.drmObject.playReadyUrl;
    if (playReadyUrl) {
      directorResponse.data.drmObject.playReadyUrl = `${Director.getEndpoint()}${playReadyUrl}`;
    }
    const widevineUrl = directorResponse.data.drmObject.widevineUrl;
    if (widevineUrl) {
      directorResponse.data.drmObject.widevineUrl = `${Director.getEndpoint()}${widevineUrl}`;
    }
    const fairPlayUrl = directorResponse.data.drmObject.fairPlayUrl;
    if (fairPlayUrl) {
      directorResponse.data.drmObject.fairPlayUrl = `${Director.getEndpoint()}${fairPlayUrl}`;
    }
    const fairPlayCertUrl = directorResponse.data.drmObject.fairPlayCertUrl;
    if (fairPlayCertUrl) {
      directorResponse.data.drmObject.fairPlayCertUrl = `${Director.getEndpoint()}${fairPlayCertUrl}`;
    }
  }
  return directorResponse;
};


const getDirectorPath = (mode = 'subscribe') : string | null => {
  try {
    const url = new URL(apiEndpoint);
    // length > 1 because pathname is '/' when there is no path
    if (url.pathname && url.pathname.length > 1) {
      return url.toString();
    }
    return `${apiEndpoint}/api/director/${mode}`;
  } catch (e) {
    logger.error(`Director URL ${apiEndpoint} is invalid`, e);
    return null;
  }
};

export default Director;
