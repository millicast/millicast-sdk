import { SEIUserUnregisteredData } from './types/View.types';
import { ReconnectData } from './types/BaseWebRTC.types';
import { TokenGeneratorCallback } from './types/Director.types';
import { PublishConnectOptions } from './types/Publish.types';
import { default as BaseWebRTC } from './utils/BaseWebRTC';

/**
 * @class Publish
 * @extends BaseWebRTC
 * @classdesc Manages connection with a secure WebSocket path to signal the Millicast server
 * and establishes a WebRTC connection to broadcast a MediaStream.
 *
 * Before you can broadcast, you will need:
 *
 * - [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API) which has at most one audio track and at most one video track. This will be used for stream the contained tracks.
 *
 * - A connection path that you can get from {@link Director} module or from your own implementation.
 * @constructor
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {Boolean} [autoReconnect=true] - Enable auto reconnect to stream.
 */
export default class Publish extends BaseWebRTC {
    private recordingAvailable;
    private worker;
    private streamName;
    private stopReemitingWebRTCPeerInstanceEvents;
    private stopReemitingSignalingInstanceEvents;
    protected options: PublishConnectOptions;
    constructor(tokenGenerator: TokenGeneratorCallback, autoReconnect?: boolean);
    /**
     * Starts broadcast to an existing stream name.
     *
     * In the example, `getYourMediaStream` and `getYourPublisherConnection` is your own implementation.
     * @param {Object} options - General broadcast options.
     * @param {String} options.sourceId - Source unique id. Only avialable if stream is multisource.
     * @param {Boolean} [options.stereo = false] - True to modify SDP for support stereo. Otherwise False.
     * @param {Boolean} [options.dtx = false] - True to modify SDP for supporting dtx in opus. Otherwise False.
     * @param {Boolean} [options.absCaptureTime = false] - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
     * @param {Boolean} [options.dependencyDescriptor = false] - True to modify SDP for supporting aom dependency descriptor header extension. Otherwise False.
     * @param {MediaStream|Array<MediaStreamTrack>} options.mediaStream - MediaStream to offer in a stream. This object must have
     * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
     * @param {Number} [options.bandwidth = 0] - Broadcast bandwidth. 0 for unlimited.
     * @param {Boolean} [options.metadata = false] - Enable metadata insertion if stream is compatible.
     * @param {Boolean} [options.disableVideo = false] - Disable the opportunity to send video stream.
     * @param {Boolean} [options.disableAudio = false] - Disable the opportunity to send audio stream.
     * @param {VideoCodec} [options.codec = 'h264'] - Codec for publish stream.
     * @param {Boolean} [options.simulcast = false] - Enable simulcast. **Only available in Chromium based browsers and with H.264 or VP8 video codecs.**
     * @param {String} [options.scalabilityMode = null] - Selected scalability mode. You can get the available capabilities using <a href="PeerConnection#.getCapabilities">PeerConnection.getCapabilities</a> method.
     * **Only available in Google Chrome.**
     * @param {RTCConfiguration} [options.peerConfig = null] - Options to configure the new RTCPeerConnection.
     * @param {Boolean} [options.record = false ] - Enable stream recording. If record is not provided, use default Token configuration. **Only available in Tokens with recording enabled.**
     * @param {Array<String>} [options.events = null] - Specify which events will be delivered by the server (any of "active" | "inactive" | "viewercount").*
     * @param {Number} [options.priority = null] - When multiple ingest streams are provided by the customer, add the ability to specify a priority between all ingest streams. Decimal integer between the range [-2^31, +2^31 - 1]. For more information, visit [our documentation](https://docs.dolby.io/streaming-apis/docs/backup-publishing).
     * @returns {Promise<void>} Promise object which resolves when the broadcast started successfully.
     * @fires PeerConnection#connectionStateChange
     * @fires Signaling#broadcastEvent
     * @example await publish.connect(options)
     * @example
     * import Publish from '@millicast/sdk'
     *
     * //Define callback for generate new token
     * const tokenGenerator = () => getYourPublisherConnection(token, streamName)
     *
     * //Create a new instance
     * const millicastPublish = new Publish(tokenGenerator)
     *
     * //Get MediaStream
     * const mediaStream = getYourMediaStream()
     *
     * //Options
     * const broadcastOptions = {
     *    mediaStream: mediaStream
     *  }
     *
     * //Start broadcast
     * try {
     *  await millicastPublish.connect(broadcastOptions)
     * } catch (e) {
     *  console.log('Connection failed, handle error', e)
     * }
     */
    connect(options?: PublishConnectOptions): Promise<void>;
    reconnect(data?: ReconnectData): Promise<void>;
    replaceConnection(): Promise<void>;
    /**
     * Initialize recording in an active stream and change the current record option.
     */
    record(): Promise<void>;
    /**
     * Finalize recording in an active stream and change the current record option.
     */
    unrecord(): Promise<void>;
    stop(): void;
    initConnection(data: {
        migrate: boolean;
    }): Promise<void>;
    /**
     * Send SEI user unregistered data as part of the frame being streamed. Only available for H.264 codec.
     * @param {SEIUserUnregisteredData} message The data to be sent as SEI user unregistered data.
     * @param {String} [uuid="d40e38ea-d419-4c62-94ed-20ac37b4e4fa"] String with UUID format as hex digit (XXXX-XX-XX-XX-XXXXXX).
     */
    sendMetadata(message: SEIUserUnregisteredData, uuid?: string): void;
}
