import { SignalingPublishOptions, SignalingSubscribeOptions } from './types/Signaling.types';
import { default as TransactionManager } from 'transaction-manager';
import { default as EventEmitter } from 'events';

export declare const signalingEvents: {
    connectionSuccess: string;
    connectionError: string;
    connectionClose: string;
    broadcastEvent: string;
};
/**
 * @typedef {Object} LayerInfo
 * @property {String} encodingId         - rid value of the simulcast encoding of the track  (default: automatic selection)
 * @property {Number} spatialLayerId     - The spatial layer id to send to the outgoing stream (default: max layer available)
 * @property {Number} temporalLayerId    - The temporaral layer id to send to the outgoing stream (default: max layer available)
 * @property {Number} maxSpatialLayerId  - Max spatial layer id (default: unlimited)
 * @property {Number} maxTemporalLayerId - Max temporal layer id (default: unlimited)
 */
/**
 * @typedef {Object} SignalingSubscribeOptions
 * @property {String} vad - Enable VAD multiplexing for secondary sources.
 * @property {String} pinnedSourceId - Id of the main source that will be received by the default MediaStream.
 * @property {Array<String>} excludedSourceIds - Do not receive media from the these source ids.
 * @property {Array<String>} events - Override which events will be delivered by the server ("active" | "inactive" | "vad" | "layers" | "updated").
 * @property {LayerInfo} layer - Select the simulcast encoding layer and svc layers for the main video track, leave empty for automatic layer selection based on bandwidth estimation.
 */
/**
 * @typedef {Object} SignalingPublishOptions
 * @property {VideoCodec} [codec="h264"] - Codec for publish stream.
 * @property {Boolean} [record] - Enable stream recording. If record is not provided, use default Token configuration. **Only available in Tokens with recording enabled.**
 * @property {String} [sourceId] - Source unique id. **Only available in Tokens with multisource enabled.***
 * @property {Array<String>} events - Override which events will be delivered by the server ("active" | "inactive").
 */
/**
 * @class Signaling
 * @extends EventEmitter
 * @classdesc Starts WebSocket connection and manages the messages between peers.
 * @example const millicastSignaling = new Signaling(options)
 * @constructor
 * @param {Object} options - General signaling options.
 * @param {String} options.streamName - Millicast stream name to get subscribed.
 * @param {String} options.url - WebSocket URL to signal Millicast server and establish a WebRTC connection.
 */
export default class Signaling extends EventEmitter {
    streamName: string | null;
    wsUrl: string;
    webSocket: WebSocket | null;
    transactionManager: TransactionManager | null;
    serverId: string | null;
    clusterId: string | null;
    streamViewId: string | null;
    constructor(options?: {
        streamName: string | null;
        url: string;
    });
    /**
     * Starts a WebSocket connection with signaling server.
     * @example const response = await millicastSignaling.connect()
     * @returns {Promise<WebSocket>} Promise object which represents the [WebSocket object]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API} of the establshed connection.
     * @fires Signaling#wsConnectionSuccess
     * @fires Signaling#wsConnectionError
     * @fires Signaling#wsConnectionClose
     * @fires Signaling#broadcastEvent
     */
    connect(): Promise<WebSocket>;
    /**
     * Close WebSocket connection with Millicast server.
     * @example millicastSignaling.close()
     */
    close(): void;
    /**
     * Establish WebRTC connection with Millicast Server as Subscriber role.
     * @param {String} sdp - The SDP information created by your offer.
     * @param {SignalingSubscribeOptions} options - Signaling Subscribe Options.
     * @example const response = await millicastSignaling.subscribe(sdp)
     * @return {Promise<String>} Promise object which represents the SDP command response.
     */
    subscribe(sdp?: string, options?: SignalingSubscribeOptions): Promise<string>;
    /**
     * Establish WebRTC connection with Millicast Server as Publisher role.
     * @param {String} sdp - The SDP information created by your offer.
     * @param {SignalingPublishOptions} options - Signaling Publish Options.
     * @example const response = await millicastSignaling.publish(sdp, {codec: 'h264'})
     * @return {Promise<String>} Promise object which represents the SDP command response.
     */
    publish(sdp?: string, options?: SignalingPublishOptions): Promise<string>;
    /**
     * Send command to the server.
     * @param {String} cmd - Command name.
     * @param {Object} [data] - Command parameters.
     * @return {Promise<Object>} Promise object which represents the command response.
     */
    cmd(cmd: string, data?: object): Promise<object>;
}
