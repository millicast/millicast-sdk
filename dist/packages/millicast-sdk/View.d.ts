import { Media } from './types/BaseWebRTC.types';
import { ViewConnectOptions, LayerInfo, ViewProjectSourceMapping, DRMOptions, ViewerEvents } from './types/View.types.js';
import { TokenGeneratorCallback } from './types/Director.types';
import { DrmConfig } from './drm/rtc-drm-transform.min.js';
import { default as BaseWebRTC } from './utils/BaseWebRTC';

/**
 * @class View
 * @extends BaseWebRTC
 * @classdesc Manages connection with a secure WebSocket path to signal the Millicast server
 * and establishes a WebRTC connection to view a live stream.
 *
 * Before you can view an active broadcast, you will need:
 *
 * - A connection path that you can get from {@link Director} module or from your own implementation.
 * @constructor
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {Boolean} [autoReconnect=true] - Enable auto reconnect to stream.
 */
export default class View extends BaseWebRTC {
    private payloadTypeCodec;
    private tracksMidValues;
    private drmOptionsMap;
    private streamName;
    private DRMProfile;
    private worker;
    private subscriberToken;
    private isMainStreamActive;
    private eventQueue;
    private stopReemitingWebRTCPeerInstanceEvents;
    private stopReemitingSignalingInstanceEvents;
    private events;
    protected options: ViewConnectOptions | null;
    constructor(tokenGenerator: TokenGeneratorCallback, autoReconnect?: boolean);
    on<K extends keyof ViewerEvents>(eventName: K, listener: (payload: ViewerEvents[K]) => void): this;
    off<K extends keyof ViewerEvents>(eventName: K, listener: (payload: ViewerEvents[K]) => void): this;
    emit<K extends keyof ViewerEvents>(eventName: K, payload: ViewerEvents[K]): boolean;
    /**
     * @typedef {Object} LayerInfo
     * @property {String} encodingId         - rid value of the simulcast encoding of the track  (default: automatic selection)
     * @property {Number} spatialLayerId     - The spatial layer id to send to the outgoing stream (default: max layer available)
     * @property {Number} temporalLayerId    - The temporaral layer id to send to the outgoing stream (default: max layer available)
     * @property {Number} maxSpatialLayerId  - Max spatial layer id (default: unlimited)
     * @property {Number} maxTemporalLayerId - Max temporal layer id (default: unlimited)
     */
    /**
     * Connects to an active stream as subscriber.
     *
     * In the example, `addStreamToYourVideoTag` and `getYourSubscriberConnectionPath` is your own implementation.
     * @param {Object} [options]                          - General subscriber options.
     * @param {Boolean} [options.dtx = false]             - True to modify SDP for supporting dtx in opus. Otherwise False.
     * @param {Boolean} [options.absCaptureTime = false]  - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
     * @param {Boolean} [options.metadata = false]        - Enable metadata extraction if stream is compatible.
     * @param {Boolean} [options.drm = false]             - Enable the DRM protected stream playback.
     * @param {Boolean} [options.disableVideo = false]    - Disable the opportunity to receive video stream.
     * @param {Boolean} [options.disableAudio = false]    - Disable the opportunity to receive audio stream.
     * @param {Number} [options.multiplexedAudioTracks]   - Number of audio tracks to recieve VAD multiplexed audio for secondary sources.
     * @param {String} [options.pinnedSourceId]           - Id of the main source that will be received by the default MediaStream.
     * @param {Array<String>} [options.excludedSourceIds] - Do not receive media from the these source ids.
     * @param {Array<String>} [options.events]            - Override which events will be delivered by the server (any of "active" | "inactive" | "vad" | "layers" | "viewercount" | "updated").*
     * @param {RTCConfiguration} [options.peerConfig]     - Options to configure the new RTCPeerConnection.
     * @param {LayerInfo} [options.layer]                 - Select the simulcast encoding layer and svc layers for the main video track, leave empty for automatic layer selection based on bandwidth estimation.
     * @param {Object} [options.forcePlayoutDelay]        - Ask the server to use the playout delay header extension.
     * @param {Number} [options.forcePlayoutDelay.min]    - Set minimum playout delay value.
     * @param {Number} [options.forcePlayoutDelay.max]    - Set maximum playout delay value.
     * @param {Boolean} [options.enableDRM]               - Enable DRM, default is false.
     * @returns {Promise<void>} Promise object which resolves when the connection was successfully established.
     * @fires PeerConnection#track
     * @fires Signaling#broadcastEvent
     * @fires PeerConnection#connectionStateChange
     * @example await millicastView.connect(options)
     * @example
     * import View from '@millicast/sdk'
     *
     * //Define callback for generate new token
     * const tokenGenerator = () => getYourSubscriberInformation(accountId, streamName)
     *
     * //Create a new instance
     * const streamName = "Millicast Stream Name where i want to connect"
     * const millicastView = new View(tokenGenerator)
     *
     * //Set track event handler to receive streams from Publisher.
     * millicastView.on('track', (event) => {
     *   addStreamToYourVideoTag(event.streams[0])
     * })
     *
     * millicastView.on('error', (error) => {
     *   console.error('Error from Millicast SDK', error)
     * })
     *
     * //Start connection to broadcast
     * try {
     *  await millicastView.connect()
     * } catch (e) {
     *  console.log('Connection failed, handle error', e)
     * }
     */
    connect(options?: ViewConnectOptions): Promise<void>;
    /**
     * Select the simulcast encoding layer and svc layers for the main video track
     * @param {LayerInfo} layer - leave empty for automatic layer selection based on bandwidth estimation.
     */
    select(layer?: LayerInfo): Promise<void>;
    /**
     * Add remote receiving track.
     * @param {String} media - Media kind ('audio' | 'video').
     * @param {Array<MediaStream>} streams - Streams the track will belong to.
     * @return {Promise<RTCRtpTransceiver>} Promise that will be resolved when the RTCRtpTransceiver is assigned an mid value.
     */
    addRemoteTrack(media: Media, streams: Array<MediaStream>): Promise<RTCRtpTransceiver>;
    /**
     * Start projecting source in selected media ids.
     * @param {String} sourceId                          - Selected source id.
     * @param {Array<Object>} mapping                    - Mapping of the source track ids to the receiver mids
     * @param {String} [mapping.trackId]                 - Track id from the source (received on the "active" event), if not set the media kind will be used instead.
     * @param {String} [mapping.media]                   - Track kind of the source ('audio' | 'video'), if not set the trackId will be used instead.
     * @param {String} [mapping.mediaId]                 - mid value of the rtp receiver in which the media is going to be projected. If no mediaId is defined, the first track from the main media stream with the same media type as the input source track will be used.
     * @param {LayerInfo} [mapping.layer]                - Select the simulcast encoding layer and svc layers, only applicable to video tracks.
     * @param {Boolean} [mapping.promote]                - To remove all existing limitations from the source, such as restricted bitrate or resolution, set this to true.
     */
    project(sourceId: string, mapping: ViewProjectSourceMapping[]): Promise<void>;
    /**
     * Stop projecting attached source in selected media ids.
     * @param {Array<String>} mediaIds - mid value of the receivers that are going to be detached.
     */
    unproject(mediaIds: Array<string>): Promise<void>;
    replaceConnection(): Promise<void>;
    stop(): void;
    initConnection(data: {
        migrate: boolean;
    }): Promise<void>;
    onTrackEvent(trackEvent: RTCTrackEvent): void;
    getDRMConfiguration(mediaId: string): DrmConfig | null | undefined;
    onRtcDrmFetch(url: string, opts: RequestInit): Promise<Response>;
    /**
     * @typedef {Object} EncryptionParameters
     * @property {String} keyId 16-byte KeyID, in lowercase hexadecimal without separators
     * @property {String} iv 16-byte initialization vector, in lowercase hexadecimal without separators
     * /
  
    /**
     * @typedef {Object} DRMOptions - the options for DRM playback
     * @property {HTMLVideoElement} videoElement - the video HTML element
     * @property {EncryptionParameters} videoEncryptionParams - the video encryption parameters
     * @property {String} videoMid - the video media ID of RTCRtpTransceiver
     * @property {HTMLAudioElement} audioElement - the audio HTML audioElement
     * @property {EncryptionParameters} [audioEncryptionParams] - the audio encryption parameters
     * @property {String} [audioMid] - the audio media ID of RTCRtpTransceiver
     * @property {Number} [mediaBufferMs] - average target latency in milliseconds
     */
    /**
     * Configure DRM protected stream.
     * When there are {@link EncryptionParameters} in the payload of 'active' broadcast event, this method should be called
     * @param {DRMOptions} options - the options for DRM playback
     */
    configureDRM(options: DRMOptions): void;
    /**
     * Remove DRM configuration for a mediaId
     * @param {String} mediaId
     */
    removeDRMConfiguration(mediaId: string): void;
    /**
     * Check if there are any DRM protected Track
     */
    get isDRMOn(): boolean;
    /**
     * Exchange the DRM configuration between two transceivers
     * Both of the transceivers should be used for DRM protected streams
     * @param {String} targetMediaId
     * @param {String} sourceMediaId
     */
    exchangeDRMConfiguration(targetMediaId: string, sourceMediaId: string): void;
}
