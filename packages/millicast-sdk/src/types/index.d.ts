import * as js_logger from 'js-logger';
import * as events from 'events';

declare module '@millicast/sdk' {
  
  export type LogLevel = {
    /**
     * - The numerical representation of the level.
     */
    value: number;
    /**
     * - Human readable name of the log level.
     */
    name: string;
  };
  /**
   * @module Logger
   * @description Manages all log messages from SDK modules, you can use this logger to add your custom
   * messages and set your custom log handlers to forward all messages to your own monitoring
   * system.
   *
   * By default all loggers are set in level OFF (Logger.OFF), and there are available
   * the following log levels.
   *
   * This module is based on [js-logger](https://github.com/jonnyreeves/js-logger) you can refer
   * to its documentation or following our examples.
   *
   *
   * 
   * @property {LogLevel} TRACE - Logger.TRACE
   * @property {LogLevel} DEBUG - Logger.DEBUG
   * @property {LogLevel} INFO  - Logger.INFO
   * @property {LogLevel} TIME  - Logger.TIME
   * @property {LogLevel} WARN  - Logger.WARN
   * @property {LogLevel} ERROR - Logger.ERROR
   * @property {LogLevel} OFF   - Logger.OFF
   * @example
   * // Log a message
   * Logger.info('This is an info log', 445566)
   * // [Global] 2021-04-05T15:58:44.893Z - This is an info log 445566
   * @example
   * // Create a named logger
   * const myLogger = Logger.get('CustomLogger')
   * myLogger.setLevel(Logger.WARN)
   * myLogger.warn('This is a warning log')
   * // [CustomLogger] 2021-04-05T15:59:53.377Z - This is a warning log
   * @example
   * // Profiling
   * // Start timing something
   * Logger.time('Timer name')
   *
   * // ... some time passes ...
   *
   * // Stop timing something.
   * Logger.timeEnd('Timer name')
   * // Timer name: 35282.997802734375 ms
   */

  export type StatsFormat = Logger.JSON | Logger.CMCD;

  export type DiagnosticReportConfiguration = {
    /**
     *  Number of stats objects to be included in the diagnostics report.
     */
    statsCount : number;

    /**
     *  Amount of history messages to be returned.
     */
    historySize : number;

    /**
     * Levels of history messages to be included. Defaults to Logger.TRACE
     * Possible values include 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'
     */
    minLogLevel : string;

    /**
     * Format of the stats objects in the diagnostics report. Use Logger.JSON or Logger.CMCD.
     */
    statsFormat : StatsFormat;
  }
  
  export type DiagnosticsResponse = {
    /**
     * Represents the Millicast product in use. 
     */
    client: string;
    /**
     * The version of the Millicast client in use
     */
    version: string,
    /**
     * UNIX timestamp to indicate when this report was generated
     */
    timestamp: number,
    /**
     * Device user agent string
     */
    userAgent: string,
    /**
     * The account Id for which the stream is being published/viewed
     */
    accountId:string,
    /**
     * The Millicast stream name being published/viewed
     */
    streamName: string,
    /**
     * A session level identifier for the client instancce
     */
    subscriberId:string,
    /**
     * Connection status.
     */
    connection: string,
    /**
     * 
     */
    streamViewId
    /**
     * A collection of log events reocrded until the diagnose method  was called 
     */
    history : Array<String>,
    /**
     * represents a collection of the webRTC stats collected before the diagnose call. 
     */
    stats : Array<Object>,

    /**
     * Represents how long the stream has been connected for. If a stream disconnects and 
     * re-connects a few times, this will reflect the duration only since the last time a 
     * successful connection was established
     */
    connectionDurationMs: Number
  }

  export class Logger {
    enabledFor: (level: any, loggerName: any) => boolean;
    /**
     * @function
     * @name getHistory
     * @description Get all logs generated during a session.
     * All logs are recollected besides the log level selected by the user.
     * @returns {Array<String>} All logs recollected from level TRACE.
     * @example Logger.getHistory()
     * // Outupt
     * // [
     * //   "[Director] 2021-04-05T14:09:26.625Z - Getting publisher connection data for stream name:  1xxx2",
     * //   "[Director] 2021-04-05T14:09:27.064Z - Getting publisher response",
     * //   "[Publish]  2021-04-05T14:09:27.066Z - Broadcasting"
     * // ]
     */
    getHistory: () => Array<string>;
    /**
     * @function
     * @name getHistoryMaxSize
     * @description Get the maximum count of logs preserved during a session.
     * @example Logger.getHistoryMaxSize()
     */
    getHistoryMaxSize: () => number;
    /**
     * @function
     * @name setHistoryMaxSize
     * @description Set the maximum count of logs to preserve during a session.
     * By default it is set to 10000.
     * @param {Number} maxSize - Max size of log history. Set 0 to disable history or -1 to unlimited log history.
     * @example Logger.setHistoryMaxSize(100)
     */
    setHistoryMaxSize: (maxSize: number) => void;
    /**
     * @function
     * @name setLevel
     * @description Set log level to all loggers.
     * @param {LogLevel} level - New log level to be set.
     * @example
     * // Global Level
     * Logger.setLevel(Logger.DEBUG)
     *
     * // Module Level
     * Logger.get('Publish').setLevel(Logger.DEBUG)
     */
    setLevel: (level: LogLevel) => void;
    /**
     * @function
     * @name getLevel
     * @description Get global current logger level.
     * Also you can get the level of any particular logger.
     * @returns {LogLevel}
     * @example
     * // Global Level
     * Logger.getLevel()
     * // Output
     * // {value: 2, name: 'DEBUG'}
     *
     * // Module Level
     * Logger.get('Publish').getLevel()
     * // Output
     * // {value: 5, name: 'WARN'}
     */
    getLevel: () => LogLevel;
    /**
     * @function
     * @name get
     * @description Gets or creates a named logger. Named loggers are used to group log messages
     * that refers to a common context.
     * @param {String} name
     * @returns {Object} Logger object with same properties and functions as Logger except
     * history and handlers related functions.
     * @example
     * const myLogger = Logger.get('MyLogger')
     * // Set logger level
     * myLogger.setLevel(Logger.DEBUG)
     *
     * myLogger.debug('This is a debug log')
     * myLogger.info('This is a info log')
     * myLogger.warn('This is a warning log')
     *
     * // Get logger level
     * myLogger.getLevel()
     * // {value: 3, name: 'INFO'}
     */
    get: (name: string) => any;
    /**
     * Callback which handles log messages.
     *
     * @callback loggerHandler
     * @global
     * @param {any[]} messages         - Arguments object with the supplied log messages.
     * @param {Object} context
     * @param {LogLevel} context.level - The currrent log level.
     * @param {String?} context.name   - The optional current logger name.
     */
    /**
     * @function
     * @name setHandler
     * @description Add your custom log handler to Logger at the specified level.
     * @param {loggerHandler} handler  - Your custom log handler function.
     * @param {LogLevel} level         - Log level to filter messages.
     * @example
     * const myHandler = (messages, context) => {
     *  // You can filter by logger
     *  if (context.name === 'Publish') {
     *    sendToMyLogger(messages[0])
     *  }
     *
     *  // You can filter by logger level
     *  if (context.level.value >= Logger.INFO.value) {
     *    sendToMyLogger(messages[0])
     *  }
     * }
     *
     * Logger.setHandler(myHandler, Logger.INFO)
     */
    setHandler: (handler: (messages: any[], context: any, level: LogLevel, name: string | null) => any, level: LogLevel) => void;
    /**
     * @function
     * @name diagnose
     * @description Returns diagnostics information about the connection and environment, formatted according to the specified parameters.
     * @param {Object | Number} config - Configuration object for the diagnostic parameters
     * @param {Number} [config.statsCount = 60] - Number of stats objects to be included in the diagnostics report.
     * @param {Number} [config.historySize = 1000]  - Amount of history messages to be returned.
     * @param {String} [config.minLogLevel] - Levels of history messages to be included.
          * examples of minLogLevel values in level order:
          * 1 - TRACE
          * 2 - DEBUG
          * 3 - INFO
          * 4 - WARN
          * 5 - ERROR
          * If 'INFO' (3) given, return INFO (3), WARN (4), and ERROR (5) level messages.
     * @param {String} [config.statsFormat='JSON'] - Format of the stats objects in the diagnostics report. Use Logger.JSON or Logger.CMCD.
     * @returns {Object} An object containing relevant diagnostics information such as userAgent, SDK version, and stats data.
     * @example
     * // Example using default parameters
     * const diagnosticsDefault = Logger.diagnose();
     *
     * // Example specifying statsCount and format
     * const diagnostics = Logger.diagnose({ statsCount: 30, minLogLevel: 'INFO', format: Logger.CMCD });
     *
     * // Output: Diagnostics object with specified configuration
     */
    diagnose: (config: DiagnosticReportConfiguration) => DiagnosticsResponse;
    /**
     * @var
     * @name VERSION
     * @description Returns the current SDK version.
     */
    VERSION: String;
    useDefaults(options?: js_logger.ILoggerOpts): void;
	  createDefaultHandler(options?: any): js_logger.ILogHandler;
    static get TRACE(): js_logger.ILogLevel;
    static get DEBUG(): js_logger.ILogLevel;
    static get INFO(): js_logger.ILogLevel;
    static get TIME(): js_logger.ILogLevel;
    static get WARN(): js_logger.ILogLevel;
    static get ERROR(): js_logger.ILogLevel;
    static get OFF(): js_logger.ILogLevel;
    trace(...x: any[]): void;
    debug(...x: any[]): void;
    info(...x: any[]): void;
    log(...x: any[]): void;
    warn(...x: any[]): void;
    error(...x: any[]): void;
    time(label: string): void;
    timeEnd(label: string): void;
  }

  export type ConnectionStats = {
    /**
     * - All RTCPeerConnection stats without parsing. Reference {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport}.
     */
    raw: RTCStatsReport;
    /**
     * - Parsed audio information.
     */
    audio: TrackReport;
    /**
     * - Parsed video information.
     */
    video: TrackReport;
    /**
     * - The available outbound capacity of the network connection. The higher the value, the more bandwidth you can assume is available for outgoing data. The value is reported in bits per second.
     *
     * This value comes from the nominated candidate-pair.
     */
    availableOutgoingBitrate: number;
    /**
     * - Total round trip time is the total time in seconds that has elapsed between sending STUN requests and receiving the responses.
     *
     * This value comes from the nominated candidate-pair.
     */
    totalRoundTripTime: number;
    /**
     * - Current round trip time indicate the number of seconds it takes for data to be sent by this peer to the remote peer and back over the connection described by this pair of ICE candidates.
     *
     * This value comes from the nominated candidate-pair.
     */
    currentRoundTripTime: number;
    /**
     * - Local candidate type from the nominated candidate-pair which indicates the type of ICE candidate the object represents.
     */
    candidateType: RTCIceCandidateType;
  };
  export type TrackReport = {
    /**
     * - Parsed information of each inbound-rtp.
     */
    inbounds: Array<InboundStats>;
    /**
     * - Parsed information of each outbound-rtp.
     */
    outbounds: Array<OutboundStats>;
  };
  export type InboundStats = {
    /**
     * - inbound-rtp Id.
     */
    id: string;
    /**
     * - Current Jitter measured in seconds.
     */
    jitter: number;
    /**
     * - Mime type if related report had codec report associated.
     */
    mimeType?: string;
    /**
     * - Current framerate if it's video report.
     */
    framesPerSecond?: number;
    /**
     * - Current frame height if it's video report.
     */
    frameHeight?: number;
    /**
     * - Current frame width if it's video report.
     */
    frameWidth?: number;
    /**
     * - Total number of key frames that have been decoded if it's video report.
     */
    keyFramesDecoded?: number;
    /**
     * - Total number of frames that have been decoded if it's video report.
     */
    framesDecoded?: number;
    /**
     * - Total number of frames that have been dropped if it's video report.
     */
    framesDropped?: number;
    /**
     * - Total number of frames that have been received if it's video report.
     */
    framesReceived?: number;
    /**
     * - Timestamp of report.
     */
    timestamp: number;
    /**
     * - Total bytes received is an integer value which indicates the total number of bytes received so far from this synchronization source.
     */
    totalBytesReceived: number;
    /**
     * - Total packets received indicates the total number of packets of any kind that have been received on the connection described by the pair of candidates.
     */
    totalPacketsReceived: number;
    /**
     * - Total packets lost.
     */
    totalPacketsLost: number;
    /**
     * - Total packet lost ratio per second.
     */
    packetsLostRatioPerSecond: number;
    /**
     * - Total packet lost delta per second.
     */
    packetsLostDeltaPerSecond: number;
    /**
     * - Current bitrate in Bytes per second.
     */
    bitrate: number;
    /**
     * - Current bitrate in bits per second.
     */
    bitrateBitsPerSecond: number;
    /**
     * - Total delay in seconds currently experienced by the jitter buffer.
     */
    jitterBufferDelay : number;
    /**
     * - Total number of packets emitted from the jitter buffer.
     */
    jitterBufferEmittedCount : number;
  };

  export type OutboundStats = {
    /**
     * - outbound-rtp Id.
     */
    id: string;
    /**
     * - Mime type if related report had codec report associated.
     */
    mimeType?: string;
    /**
     * - Current framerate if it's video report.
     */
    framesPerSecond?: number;
    /**
     * - Current frame height if it's video report.
     */
    frameHeight?: number;
    /**
     * - Current frame width if it's video report.
     */
    frameWidth?: number;
    /**
     * - If it's video report, indicate the reason why the media quality in the stream is currently being reduced by the codec during encoding, or none if no quality reduction is being performed.
     */
    qualityLimitationReason?: string;
    /**
     * - Timestamp of report.
     */
    timestamp: number;
    /**
     * - Total bytes sent indicates the total number of payload bytes that hve been sent so far on the connection described by the candidate pair.
     */
    totalBytesSent: number;
    /**
     * - Current bitrate in Bytes per second.
     */
    bitrate: number;
    /**
     * - Current bitrate in bits per second.
     */
    bitrateBitsPerSecond: number;
    /**
     *  - Change in the number of bytes sent since the last report.
     */
    bytesSentDelta: number;
    /**
     *  - Total number of packets sent.
     */
    totalPacketsSent : number;
    /**
     * - Change in the number of packets sent since the last report.
     */
    packetsSentDelta : number;
    /**
     * - Rate at which packets are being sent, measured in packets per second.
     */
    packetRate : number;
    /**
     * - The target bitrate for the encoder, in bits per second.
     */
    targetBitrate : number;
    /**
     * - Total number of retransmitted packets sent.
     */
    retransmittedPacketsSent: number; 
    /**
     * - Change in the number of retransmitted packets sent since the last report.
     */
    retransmittedPacketsSentDelta : number;
    /**
     *  - Total number of bytes that have been retransmitted.
     */
    retransmittedBytesSent : number;
    /**
     *  - Change in the number of retransmitted bytes sent since the last report.
     */
    retransmittedBytesSentDelta : number;
    /**
     * - Total number of frames sent(applicable for video).
     */
    framesSent : number;
    /**
     * Durations in seconds for which the quality of the media has been limited by the codec, categorized by the limitation reasons such as bandwidth, CPU, or other factors.
     * 
     */  
    [qualityLimitationDurations] : Date
  };

  class PeerConnectionStats extends events.EventEmitter {
    constructor(peer: PeerConnection, config : PeerConnectionConfig);
    peer: PeerConnection;
    stats: ConnectionStats;
    emitInterval: NodeJS.Timer;
    previousStats: ConnectionStats;
    /**
     * Initialize the statistics monitoring of the RTCPeerConnection.
     * @param {statsIntervalMs} the interval, in ms, at which stats are returned to the user.  
     */
    init(statsIntervalMs : number): void;
    /**
     * Parse incoming RTCPeerConnection stats.
     * @param {RTCStatsReport} rawStats - RTCPeerConnection stats.
     * @returns {ConnectionStats} RTCPeerConnection stats parsed.
     */
    parseStats(rawStats: RTCStatsReport): ConnectionStats;
    /**
     * Stops the monitoring of RTCPeerConnection statistics.
     */
    stop(): void;
  }

  export type ViewerCount = {
    viewercount: number;
  }

  export type MediaTrackInfo = {
    trackId: string;
    media: 'audio' | 'video';
  }

  export type MediaStreamSource = {
    readonly streamId: string;
    sourceId: string;
    readonly tracks: MediaTrackInfo[];
  }

  export type MediaLayer = {
    id: string;
    bitrate: number;
    simulcastIdx: number;
    layers: LayerInfo[];
  }

  export type Media = {
    active: MediaLayer[];
    inactive: MediaLayer[];
    layers: LayerInfo[];
  }

  export type MediaStreamLayers = {
    medias: Media[];
  }

  export type BroadcastEvent = {
    type: string;
    name: Event;
    data: string | ViewerCount | MediaStreamSource | MediaStreamLayers;
  }

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
  export class Signaling extends events.EventEmitter {
    constructor(options?: {
      streamName: any;
      url: string;
    });
    streamName: any;
    wsUrl: string;
    webSocket: WebSocket;
    transactionManager: any;
    serverId: any;
    clusterId: any;
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
    subscribe(sdp: string, options: SignalingSubscribeOptions | boolean, pinnedSourceId?: string, excludedSourceIds?: Array<string>): Promise<string>;
    /**
     * Establish WebRTC connection with Millicast Server as Publisher role.
     * @param {String} sdp - The SDP information created by your offer.
     * @param {SignalingPublishOptions} options - Signaling Publish Options.
     * @example const response = await millicastSignaling.publish(sdp, {codec: 'h264'})
     * @return {Promise<String>} Promise object which represents the SDP command response.
     */
    publish(sdp: string, options: SignalingPublishOptions | VideoCodec, record?: boolean, sourceId?: string): Promise<string>;
    /**
     * Send command to the server.
     * @param {String} cmd - Command name.
     * @param {Object} [data] - Command parameters.
     * @return {Promise<Object>} Promise object which represents the command response.
     */
    cmd(cmd: string, data?: any): Promise<any>;
  }
  export type LayerInfo = {
    /**
     * - rid value of the simulcast encoding of the track  (default: automatic selection)
     */
    encodingId: string;
    /**
     * - The spatial layer id to send to the outgoing stream (default: max layer available)
     */
    spatialLayerId: number;
    /**
     * - The temporaral layer id to send to the outgoing stream (default: max layer available)
     */
    temporalLayerId: number;
    /**
     * - Max spatial layer id (default: unlimited)
     */
    maxSpatialLayerId: number;
    /**
     * - Max temporal layer id (default: unlimited)
     */
    maxTemporalLayerId: number;
  };
  export type SignalingSubscribeOptions = {
    /**
     * - Enable VAD multiplexing for secondary sources.
     */
    vad: string;
    /**
     * - Id of the main source that will be received by the default MediaStream.
     */
    pinnedSourceId: string;
    /**
     * - Do not receive media from the these source ids.
     */
    excludedSourceIds: Array<string>;
    /**
     * - Override which events will be delivered by the server ("active" | "inactive" | "vad" | "layers" | "updated").
     */
    events: Array<string>;
    /**
     * - Select the simulcast encoding layer and svc layers for the main video track, leave empty for automatic layer selection based on bandwidth estimation.
     */
    layer: LayerInfo;
  };
  export type SignalingPublishOptions = {
    /**
     * - Codec for publish stream.
     */
    codec?: VideoCodec;
    /**
     * - Enable stream recording. If record is not provided, use default Token configuration. **Only available in Tokens with recording enabled.**
     */
    record?: boolean;
    /**
     * - Source unique id. **Only available in Tokens with multisource enabled.***
     */
    sourceId?: string;
    /**
     * - Override which events will be delivered by the server ("active" | "inactive").
     */
    events: Array<string>;
  };
  interface CodecInfo {
    /**
     * - Audio or video codec name.
     */
    codec: VideoCodec | AudioCodec;
    /**
     * - Audio or video codec mime type.
     */
    mimetype: string;
  }

  export type VideoCodec = 'vp8' | 'vp9' | 'h264' | 'av1';
  export type AudioCodec = 'opus' | 'multiopus';

  export type MillicastCapabilities = {
    codecs: Array<CodecInfo>;
    /**
     * - In case of SVC support, a list of scalability modes supported.
     */
    scalabilityModes?: Array<string>;
    /**
     * - Only for audio, the number of audio channels supported.
     */
    channels?: number;
    /**
     * - An array specifying the URI of the header extension, as described in RFC 5285.
     */
    headerExtensions: Array<RTCRtpHeaderExtensionCapability>;
  }

  /**
   * @class PeerConnection
   * @extends EventEmitter
   * @classdesc Manages WebRTC connection and SDP information between peers.
   * @example const peerConnection = new PeerConnection()
   * @constructor
   */
  export class PeerConnection extends events.EventEmitter {
    /**
     * 
     * @property {Array<Object>} codecs
     * @property {String} codecs.codec - Audio or video codec name.
     * @property {String} codecs.mimeType - Audio or video codec mime type.
     * @property {Array<String>} [codecs.scalabilityModes] - In case of SVC support, a list of scalability modes supported.
     * @property {Number} [codecs.channels] - Only for audio, the number of audio channels supported.
     * @property {Array<RTCRtpHeaderExtensionCapability>} headerExtensions - An array specifying the URI of the header extension, as described in RFC 5285.
     */
    /**
     * Gets user's browser media capabilities compared with Millicast Media Server support.
     *
     * @param {"audio"|"video"} kind - Type of media for which you wish to get sender capabilities.
     * @returns {MillicastCapabilities} Object with all capabilities supported by user's browser and Millicast Media Server.
     */
    static getCapabilities(kind: "audio" | "video"): MillicastCapabilities;
    sessionDescription: RTCSessionDescriptionInit;
    peer: RTCPeerConnection;
    peerConnectionStats: PeerConnectionStats;
    /**
     * Instantiate a new RTCPeerConnection.
     * @param {PeerConnectionConfig} config - Peer configuration.
     * @param {Boolean} [config.autoInitStats = true] - True to initialize statistics monitoring of the RTCPeerConnection accessed via Logger.get(), false to opt-out.
     * @param {Number} [config.statsIntervalMs = 1000] - The default interval at which the SDK will return WebRTC stats to the consuming application.
     * @param {String} [mode = "Viewer"] - Type of connection that is trying to be created, either 'Viewer' or 'Publisher'.
     */
    createRTCPeer(config?: PeerConnectionConfig, mode : "Publisher" | "Viewer"): Promise<void>;
    /**
     * Get current RTC peer connection.
     * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
     */
    getRTCPeer(): RTCPeerConnection;
    /**
     * Close RTC peer connection.
     * @fires PeerConnection#connectionStateChange
     */
    closeRTCPeer(): Promise<void>;
    /**
     * Set SDP information to remote peer.
     * @param {String} sdp - New SDP to be set in the remote peer.
     * @returns {Promise<void>} Promise object which resolves when SDP information was successfully set.
     */
    setRTCRemoteSDP(sdp: string): Promise<void>;
    /**
     * Get the SDP modified depending the options. Optionally set the SDP information to local peer.
     * @param {Object} options
     * @param {Boolean} options.stereo - True to modify SDP for support stereo. Otherwise False.
     * @param {Boolean} options.dtx - True to modify SDP for supporting dtx in opus. Otherwise False.
     * @param {MediaStream|Array<MediaStreamTrack>} options.mediaStream - MediaStream to offer in a stream. This object must have
     * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
     * @param {VideoCodec} options.codec - Selected codec for support simulcast.
     * @param {Boolean} options.simulcast - True to modify SDP for support simulcast. **Only available in Chromium based browsers and with H.264 or VP8 video codecs.**
     * @param {String} options.scalabilityMode - Selected scalability mode. You can get the available capabilities using <a href="PeerConnection#.getCapabilities">PeerConnection.getCapabilities</a> method.
     * **Only available in Google Chrome.**
     * @param {Boolean} options.absCaptureTime - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
     * @param {Boolean} options.dependencyDescriptor - True to modify SDP for supporting aom dependency descriptor header extension. Otherwise False.
     * @param {Boolean} options.disableAudio - True to not support audio.
     * @param {Boolean} options.disableVideo - True to not support video.
     * @param {Boolean} options.setSDPToPeer - True to set the SDP to local peer.
     * @returns {Promise<String>} Promise object which represents the SDP information of the created offer.
     */
    getRTCLocalSDP(options?: {
      stereo: boolean;
      dtx: boolean;
      mediaStream: MediaStream | Array<MediaStreamTrack>;
      codec: VideoCodec;
      simulcast: boolean;
      scalabilityMode: string;
      absCaptureTime: boolean;
      dependencyDescriptor: boolean;
      disableAudio: boolean;
      disableVideo: boolean;
      setSDPToPeer: boolean;
    }): Promise<string>;
    /**
     * Add remote receiving track.
     * @param {String} media - Media kind ('audio' | 'video').
     * @param {Array<MediaStream>} streams - Streams the track will belong to.
     * @return {Promise<RTCRtpTransceiver>} Promise that will be resolved when the RTCRtpTransceiver is assigned an mid value.
     */
    addRemoteTrack(media: string, streams: Array<MediaStream>): Promise<RTCRtpTransceiver>;
    /**
     * Update remote SDP information to restrict bandwidth.
     * @param {String} sdp - Remote SDP.
     * @param {Number} bitrate - New bitrate value in kbps or 0 unlimited bitrate.
     * @return {String} Updated SDP information with new bandwidth restriction.
     */
    updateBandwidthRestriction(sdp: string, bitrate: number): string;
    /**
     * Set SDP information to remote peer with bandwidth restriction.
     * @param {Number} bitrate - New bitrate value in kbps or 0 unlimited bitrate.
     * @returns {Promise<void>} Promise object which resolves when bitrate was successfully updated.
     */
    updateBitrate(bitrate?: number): Promise<void>;
    /**
     * Get peer connection state.
     * @returns {RTCPeerConnectionState?} Promise object which represents the peer connection state.
     */
    getRTCPeerStatus(): RTCPeerConnectionState | null;
    /**
     * Replace current audio or video track that is being broadcasted.
     * @param {MediaStreamTrack} mediaStreamTrack - New audio or video track to replace the current one.
     */
    replaceTrack(mediaStreamTrack: MediaStreamTrack): void;
    /**
     * Get sender tracks
     * @returns {Array<MediaStreamTrack>} An array with all tracks in sender peer.
     */
    getTracks(): Array<MediaStreamTrack>;
    /**
     * Initialize the statistics monitoring of the RTCPeerConnection.
     *
     * It will be emitted every second.
     * @param autoInitStats - whether to auto initialize stats; defaults to true
     * @param statsIntervalMs  - the default interval, in milliseconds, at which the SDK will report back stats
     * @fires PeerConnection#stats
     * @example peerConnection.initStats()
     * @example
     * import Publish from '@millicast/sdk'
     *
     * //Initialize and connect your Publisher
     * const millicastPublish = new Publish(streamName, tokenGenerator)
     * await millicastPublish.connect(options)
     *
     * //Initialize get stats
     * millicastPublish.webRTCPeer.initStats()
     *
     * //Capture new stats from event every second
     * millicastPublish.webRTCPeer.on('stats', (stats) => {
     *   console.log('Stats from event: ', stats)
     * })
     * @example
     * import View from '@millicast/sdk'
     *
     * //Initialize and connect your Viewer
     * const millicastView = new View(streamName, tokenGenerator)
     * await millicastView.connect()
     *
     * //Initialize get stats
     * millicastView.webRTCPeer.initStats()
     *
     * //Capture new stats from event every second
     * millicastView.webRTCPeer.on('stats', (stats) => {
     *   console.log('Stats from event: ', stats)
     * })
     */
    initStats(options : PeerConnectionConfig): void;
    /**
     * Stops the monitoring of RTCPeerConnection statistics.
     * @example peerConnection.stopStats()
     */
    stopStats(): void;
  }
  /**
   * @typedef {Object} MillicastDirectorResponse
   * @property {Array<String>} urls - WebSocket available URLs.
   * @property {String} jwt - Access token for signaling initialization.
   * @property {Array<RTCIceServer>} iceServers - Object which represents a list of Ice servers.
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
   * For security reasons all calls will return a [JWT](https://jwt.io) token for authentication including the required
   * socket path to connect with.
   *
   * You will need your own Publishing token and Stream name, please refer to [Managing Your Tokens](https://docs.dolby.io/streaming-apis/docs/managing-your-tokens).
   * @namespace
   */
  export class Director {
    /**
     * Set Director API endpoint where requests will be sent.
     *
     * @param {String} url - New Director API endpoint
     */
    static setEndpoint(url: string): void;
    /**
     * Get current Director API endpoint where requests will be sent.
     *
     * By default, https://director.millicast.com is the current API endpoint.
     * @returns {String} API base url
     */
    static getEndpoint(): string;
    /**
     * Set Websocket Live domain from Director API response.
     * If it is set to empty, it will not parse the response.
     *
     * @param {String} domain - New Websocket Live domain
    */
    static setLiveDomain(domain: string): void;
    /**
     * Get current Websocket Live domain.
     *
     * By default is empty which corresponds to not parse the Director response.
     * @returns {String} Websocket Live domain
    */
    static getLiveDomain(): string;
    /**
     * Get publisher connection data.
     * @param {DirectorPublisherOptions} options - Millicast options.
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
    static getPublisher(options: DirectorPublisherOptions | string, streamName?: string, streamType?: ("WebRtc" | "Rtmp")): Promise<MillicastDirectorResponse>;
    /**
     * Get subscriber connection data.
     * @param {DirectorSubscriberOptions | String} options - Millicast options.
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
    static getSubscriber(options: DirectorSubscriberOptions | string, streamAccountId?: string, subscriberToken?: string): Promise<MillicastDirectorResponse>;
  }
  export type MillicastDirectorResponse = {
    /**
     * - WebSocket available URLs.
     */
    urls: Array<string>;
    /**
     * - Access token for signaling initialization.
     */
    jwt: string;
    /**
     * - Object which represents a list of Ice servers.
     */
    iceServers: Array<RTCIceServer>;
  };
  export type DirectorPublisherOptions = {
    /**
     * - Millicast Publishing Token.
     */
    token: string;
    /**
     * - Millicast Stream Name.
     */
    streamName: string;
    /**
     * - Millicast Stream Type.
     */
    streamType?: ("WebRtc" | "Rtmp");
  };
  export type DirectorSubscriberOptions = {
    /**
     * - Millicast publisher Stream Name.
     */
    streamName: string;
    /**
     * - Millicast Account ID.
     */
    streamAccountId: string;
    /**
     * - Token to subscribe to secure streams. If you are subscribing to an unsecure stream, you can omit this param.
     */
    subscriberToken?: string;
  };
  export type Event = 'active' | 'inactive' | 'stopped' | 'vad' | 'layers' | 'migrate' | 'viewercount' | 'updated';

  export type ViewConnectOptions = {
    /**
     * - True to modify SDP for supporting dtx in opus. Otherwise False.
     */
    dtx?: boolean;
    /**
     * - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
     */
    absCaptureTime?: boolean;
    /**
     * - Enable metadata extraction. This feature is only supported with the H.264 codec.
     */
    metadata?: boolean;
    /**
     * - Disable the opportunity to receive video stream.
     */
    disableVideo?: boolean;
    /**
     * - Disable the opportunity to receive audio stream.
     */
    disableAudio?: boolean;
    /**
     * - Number of audio tracks to recieve VAD multiplexed audio for secondary sources.
     */
    multiplexedAudioTracks?: number;
    /**
     * - Id of the main source that will be received by the default MediaStream.
     */
    pinnedSourceId?: string;
    /**
     * - Do not receive media from the these source ids.
     */
    excludedSourceIds?: Array<string>;
    /**
     * - Override which events will be delivered by the server (any of "active" | "inactive" | "vad" | "layers" | "viewercount" | "updated").*
     */
    events?: Array<Event>;
    /**
     * - Options to configure the new RTCPeerConnection.
     */
    peerConfig?: RTCConfiguration;
    /**
     * - Select the simulcast encoding layer and svc layers for the main video track, leave empty for automatic layer selection based on bandwidth estimation.
     */
    layer?: {
      /**
       * - rid value of the simulcast encoding of the track  (default: automatic selection)
       */
      encodingId: string;
      /**
       * - The spatial layer id to send to the outgoing stream (default: max layer available)
       */
      spatialLayerId: number;
      /**
       * - The temporaral layer id to send to the outgoing stream (default: max layer available)
       */
      temporalLayerId: number;
      /**
       * - Max spatial layer id (default: unlimited)
       */
      maxSpatialLayerId: number;
      /**
       * - Max temporal layer id (default: unlimited)
       */
      maxTemporalLayerId: number;
    };
  }

  export type PublishConnectOptions = {
    /**
     * - Source unique id. Only avialable if stream is multisource.
     */
    sourceId?: string;
    /**
     * - True to modify SDP for support stereo. Otherwise False.
     */
    stereo?: boolean;
    /**
     * - True to modify SDP for supporting dtx in opus. Otherwise False.
     */
    dtx?: boolean;
    /**
     * - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
     */
    absCaptureTime?: boolean;
    /**
     * - True to modify SDP for supporting aom dependency descriptor header extension. Otherwise False.
     */
    dependencyDescriptor?: boolean;
    /**
     * - MediaStream to offer in a stream. This object must have
     * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
     */
    mediaStream: MediaStream | Array<MediaStreamTrack>;
    /**
     * - Broadcast bandwidth. 0 for unlimited.
     */
    bandwidth?: number;
    /**
     * - Enable metadata insertion. This feature is only supported with the H.264 codec.
     */
    metadata?: boolean;
    /**
     * - Disable the opportunity to send video stream.
     */
    disableVideo?: boolean;
    /**
     * - Disable the opportunity to send audio stream.
     */
    disableAudio?: boolean;
    /**
     * - Codec for publish stream.
     */
    codec?: VideoCodec;
    /**
     * - Enable simulcast. **Only available in Chromium based browsers with either the H.264 or VP8 video codec.**
     */
    simulcast?: boolean;
    /**
     * - Selected scalability mode. You can get the available capabilities using <a href="PeerConnection#.getCapabilities">PeerConnection.getCapabilities</a> method.
     * **Only available in Google Chrome.**
     */
    scalabilityMode?: string;
    /**
     * - Options to configure the new RTCPeerConnection.
     */
    peerConfig?: PeerConnectionConfig;
    /**
     * - Enable stream recording. If record is not provided, use default Token configuration. **Only available in Tokens with recording enabled.**
     */
    record?: boolean;
    /**
     * - Specify which events will be delivered by the server (any of "active" | "inactive" | "viewercount").*
     */
    events?: Array<string>;
    /**
     * - When multiple ingest streams are provided by the customer, add the ability to specify a priority between all ingest streams. Decimal integer between the range [-2^31, +2^31 - 1]. For more information, visit [our documentation](https://docs.dolby.io/streaming-apis/docs/backup-publishing).
     */
    priority?: Number;
  }

  export interface PeerConnectionConfig extends RTCConfiguration {
    /**
     * - whether stats collection should be auto initialized. Defaults to `true`
     */
    autoInitStats: boolean;

    /**
     * The interval, in milliseconds, at which we poll stats. Defaults to 1s (1000ms)
     */
    statsIntervalMs : number;
  }

  export type ViewProjectSourceMapping = {
    /**
     * - Track id from the source (received on the "active" event), if not set the media kind will be used instead.
     */
    trackId?: string;
    /**
     * - mid value of the rtp receiver in which the media is going to be projected. If no mediaId is defined, the first track from the main media stream with the same media type as the input source track will be used.
     */
    mediaId?: string;
    /**
     * - Track kind of the source ('audio' | 'video'), if not set the trackId will be used instead.
     */
    media?: 'audio' | 'video';
    /**
     * - Select the simulcast encoding layer and svc layers, only applicable to video tracks.
     */
    layer?: LayerInfo;
  }

  export type DirectorResponse = {
    urls: string[];
    jwt: string;
    iceServers: RTCIceServer[];
  };
  export type TokenGeneratorCallback = () => Promise<DirectorResponse>
  class BaseWebRTC extends events.EventEmitter {
    constructor(streamName: string, tokenGenerator: TokenGeneratorCallback, loggerInstance: Logger | any, autoReconnect?: boolean);
    webRTCPeer?: PeerConnection;
    signaling: Signaling;
    streamName: string;
    autoReconnect: boolean | undefined;
    reconnectionInterval: number;
    alreadyDisconnected: boolean;
    firstReconnection: boolean;
    stopReconnection: boolean;
    tokenGenerator: TokenGeneratorCallback;
    options: ViewConnectOptions | PublishConnectOptions;
    /**
    * Get current RTC peer connection.
    * @returns {RTCPeerConnection} Object which represents the RTCPeerConnection.
    */
    getRTCPeerConnection(): RTCPeerConnection;
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
     */
    reconnect(): Promise<void>;
  }
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
   * @param {String} streamName - Deprecated: Millicast stream name to connect to. Use tokenGenerator instead. This field will be removed in a future version.
   * @param {TokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
   * @param {Boolean} [autoReconnect=true] - Enable auto reconnect to stream.
   */
  export class Publish extends BaseWebRTC {
    constructor(streamName: any, tokenGenerator: any, autoReconnect?: boolean);
    /**
     * Starts broadcast to an existing stream name.
     *
     * In the example, `getYourMediaStream` and `getYourPublisherConnection` is your own implementation.
     * @param {PublishConnectOptions} options - General broadcast options.
     * @returns {Promise<void>} Promise object which resolves when the broadcast started successfully.
     * @fires PeerConnection#connectionStateChange
     * @fires Signaling#broadcastEvent
     * @example await publish.connect(options)
     * @example
     * import Publish from '@millicast/sdk'
     *
     * //Define callback for generate new token
     * const tokenGenerator = () => getYourPublisherInformation(token, streamName)
     *
     * //Create a new instance
     * const streamName = "My Millicast Stream Name"
     * const millicastPublish = new Publish(streamName, tokenGenerator)
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
    /**
     * Initialize recording in an active stream and change the current record option.
     */
    record(): Promise<void>;
    /**
     * Finalize recording in an active stream and change the current record option.
     */
    unrecord(): Promise<void>;
    /**
     * Send SEI user unregistered data as part of the frame being streamed. Only available for H.264 codecs.
     * @param {String | Object} message The data to be sent as SEI user unregistered data.
     * @param {String} [uuid="d40e38ea-d419-4c62-94ed-20ac37b4e4fa"] String with UUID format as hex digit (XXXX-XX-XX-XX-XXXXXX).
     */
    sendMetadata(message: String | Object, uuid: String): void;
    webRTCPeer?: PeerConnection;
  }
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
   * @param {String} streamName - Deprecated: Millicast stream name to connect to. Use tokenGenerator instead. This field will be removed in a future version.
   * @param {TokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
   * @param {HTMLMediaElement} [mediaElement=null] - Target HTML media element to mount stream.
   * @param {Boolean} [autoReconnect=true] - Enable auto reconnect to stream.
   */
  export class View extends BaseWebRTC {
    constructor(streamName: string, tokenGenerator: TokenGeneratorCallback, mediaElement?: HTMLVideoElement, autoReconnect?: boolean);
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
     * @param {ViewConnectOptions} [options] - General subscriber options.
     * @returns {Promise<void>} Promise object which resolves when the connection was successfully established.
     * @fires PeerConnection#track
     * @fires Signaling#broadcastEvent
     * @fires PeerConnection#connectionStateChange
     * @example await millicastView.connect(options)
     * @example
     * import View from '@millicast/sdk'
     *
     * // Create media element
     * const videoElement = document.createElement("video")
     *
     * //Define callback for generate new token
     * const tokenGenerator = () => getYourSubscriberInformation(accountId, streamName)
     *
     * //Create a new instance
     * const streamName = "Millicast Stream Name where i want to connect"
     * const millicastView = new View(streamName, tokenGenerator, videoElement)
     *
     * //Start connection to broadcast
     * try {
     *  await millicastView.connect()
     * } catch (e) {
     *  console.log('Connection failed, handle error', e)
     * }
     * @example
     * import View from '@millicast/sdk'
     *
     * //Define callback for generate new token
     * const tokenGenerator = () => getYourSubscriberInformation(accountId, streamName)
     *
     * //Create a new instance
     * const streamName = "Millicast Stream Name where i want to connect"
     * const millicastView = new View(streamName, tokenGenerator)
     *
     * //Set track event handler to receive streams from Publisher.
     * millicastView.on('track', (event) => {
     *   addStreamToYourVideoTag(event.streams[0])
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
    addRemoteTrack(media: 'audio' | 'video', streams: Array<MediaStream>): Promise<RTCRtpTransceiver>;
    /**
     * Start projecting source in selected media ids.
     * @param {String} sourceId                          - Selected source id.
     * @param {Array<Object>} mapping                    - Mapping of the source track ids to the receiver mids
     * @param {String} [mapping.trackId]                 - Track id from the source (received on the "active" event), if not set the media kind will be used instead.
     * @param {String} [mapping.media]                   - Track kind of the source ('audio' | 'video'), if not set the trackId will be used instead.
     * @param {String} [mapping.mediaId]                 - mid value of the rtp receiver in which the media is going to be projected. If no mediaId is defined, the first track from the main media stream with the same media type as the input source track will be used.
     * @param {LayerInfo} [mapping.layer]                - Select the simulcast encoding layer and svc layers, only applicable to video tracks.
     */
    project(sourceId: string, mapping: ViewProjectSourceMapping[]): Promise<void>;
    /**
     * Stop projecting attached source in selected media ids.
     * @param {Array<String>} mediaIds - mid value of the receivers that are going to be detached.
     */
    unproject(mediaIds: Array<string>): Promise<void>;
    replaceConnection(): Promise<void>;
    webRTCPeer?: PeerConnection;
  }
}
