import { DirectorPublisherOptions, DirectorSubscriberOptions, MillicastDirectorResponse } from './types/Director.types';

export declare const defaultApiEndpoint = "https://director.millicast.com";
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
declare const Director: {
    /**
     * @function
     * @name setEndpoint
     * @description Set Director API endpoint where requests will be sent.
     * @param {String} url - New Director API endpoint
     * @returns {void}
     */
    setEndpoint: (url: string) => void;
    /**
     * @function
     * @name getEndpoint
     * @description Get current Director API endpoint where requests will be sent. Default endpoint is 'https://director.millicast.com'.
     * @returns {String} API base url
     */
    getEndpoint: () => string;
    /**
     * @function
     * @name setLiveDomain
     * @description Set Websocket Live domain from Director API response.
     * If it is set to empty, it will not parse the response.
     * @param {String} domain - New Websocket Live domain
     * @returns {void}
     */
    setLiveDomain: (domain: string) => void;
    /**
     * @function
     * @name getLiveDomain
     * @description Get current Websocket Live domain.
     * By default is empty which corresponds to not parse the Director response.
     * @returns {String} Websocket Live domain
     */
    getLiveDomain: () => string;
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
    getPublisher: (options: DirectorPublisherOptions) => Promise<MillicastDirectorResponse>;
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
    getSubscriber: (options: DirectorSubscriberOptions) => Promise<MillicastDirectorResponse>;
};
export default Director;
