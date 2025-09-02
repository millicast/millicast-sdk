import { ViewConnectOptions } from '../types/View.types';
import { PublishConnectOptions } from '../types/Publish.types';
import { ReconnectData } from '../types/BaseWebRTC.types';
import { ILogger } from 'js-logger';
import { TokenGeneratorCallback } from '../types/Director.types';
import { default as Signaling } from '../Signaling';
import { default as PeerConnection } from '../PeerConnection';
import { default as EventEmitter } from 'events';

/**
 * @typedef {Object} MillicastDirectorResponse
 * @property {Array<String>} urls - WebSocket available URLs.
 * @property {String} jwt - Access token for signaling initialization.
 * @property {Array<RTCIceServer>} iceServers - Object which represents a list of Ice servers.
 */
/**
 * Callback invoke when a new connection path is needed.
 *
 * @callback tokenGeneratorCallback
 * @returns {Promise<MillicastDirectorResponse>} Promise object which represents the result of getting the new connection path.
 *
 * You can use your own token generator or use the <a href='Director'>Director available methods</a>.
 */
/**
 * @class BaseWebRTC
 * @extends EventEmitter
 * @classdesc Base class for common actions about peer connection and reconnect mechanism for Publishers and Viewer instances.
 *
 * @constructor
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {Object} loggerInstance - Logger instance from the extended classes.
 * @param {Boolean} autoReconnect - Enable auto reconnect.
 */
export default class BaseWebRTC extends EventEmitter {
    protected webRTCPeer: PeerConnection;
    protected signaling: Signaling | null;
    protected autoReconnect: boolean;
    private reconnectionInterval;
    private alreadyDisconnected;
    private firstReconnection;
    protected stopReconnection: boolean;
    private isReconnecting;
    protected tokenGenerator: TokenGeneratorCallback;
    protected options: ViewConnectOptions | PublishConnectOptions | null;
    constructor(tokenGenerator: TokenGeneratorCallback, loggerInstance: ILogger, autoReconnect: boolean);
    /**
     * Get current RTC peer connection.
     * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
     */
    getRTCPeerConnection(): RTCPeerConnection | null;
    /**
     * Stops connection.
     */
    stop(): void;
    /**
     * Get if the current connection is active.
     * @returns {Boolean} - True if connected, false if not.
     */
    isActive(): boolean;
    /**
     * Sets reconnection if autoReconnect is enabled.
     */
    setReconnect(): void;
    /**
     * Reconnects to last broadcast.
     * @fires BaseWebRTC#reconnect
     * @param {ReconnectData} [data] - This object contains the error property. It may be expanded to contain more information in the future.
     * @property {String} error - The value sent in the first [reconnect event]{@link BaseWebRTC#event:reconnect} within the error key of the payload
     */
    reconnect(data?: ReconnectData): Promise<void>;
    replaceConnection(): Promise<void>;
    connect(_options: unknown): Promise<void>;
}
