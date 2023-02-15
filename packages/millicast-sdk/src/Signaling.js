import EventEmitter from 'events'
import TransactionManager from 'transaction-manager'
import Logger from './Logger'
import SdpParser from './utils/SdpParser'
import UserAgent from './utils/UserAgent'

const logger = Logger.get('Signaling')

export const signalingEvents = {
  connectionSuccess: 'wsConnectionSuccess',
  connectionError: 'wsConnectionError',
  connectionClose: 'wsConnectionClose',
  broadcastEvent: 'broadcastEvent'
}

/**
 * Enum of Millicast supported Video codecs
 * @readonly
 * @enum {String}
 * @property {String} VP8
 * @property {String} VP9
 * @property {String} H264
 * @property {String} AV1
 * @property {String} H265 - Only available in Safari
 */
export const VideoCodec = {
  VP8: 'vp8',
  VP9: 'vp9',
  H264: 'h264',
  AV1: 'av1'
}

/**
 * Enum of Millicast supported Audio codecs
 * @readonly
 * @enum {String}
 * @property {String} OPUS
 * @property {String} MULTIOPUS
 */
export const AudioCodec = {
  OPUS: 'opus',
  MULTIOPUS: 'multiopus'
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
 * @property {Array<String>} events - Override which events will be delivered by the server ("active" | "inactive" | "vad" | "layers").
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
  constructor (options = {
    streamName: null,
    url: 'ws://localhost:8080/'
  }
  ) {
    super()
    this.streamName = options.streamName
    this.wsUrl = options.url
    this.webSocket = null
    this.transactionManager = null
    this.serverId = null
    this.clusterId = null
    const browserData = new UserAgent()
    if (browserData.isSafari()) {
      VideoCodec.H265 = 'h265'
    }
  }

  /**
   * Starts a WebSocket connection with signaling server.
   * @example const response = await millicastSignaling.connect()
   * @returns {Promise<WebSocket>} Promise object which represents the [WebSocket object]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API} of the establshed connection.
   * @fires Signaling#wsConnectionSuccess
   * @fires Signaling#wsConnectionError
   * @fires Signaling#wsConnectionClose
   * @fires Signaling#broadcastEvent
   */
  async connect () {
    logger.info('Connecting to Signaling Server')
    if (this.transactionManager && this.webSocket?.readyState === WebSocket.OPEN) {
      logger.info('Connected to server: ', this.webSocket.url)
      logger.debug('WebSocket value: ', {
        url: this.webSocket.url,
        protocol: this.webSocket.protocol,
        readyState: this.webSocket.readyState,
        binaryType: this.webSocket.binaryType,
        extensions: this.webSocket.extensions
      })
      /**
       * WebSocket connection was successfully established with signaling server.
       *
       * @event Signaling#wsConnectionSuccess
       * @type {Object}
       * @property {WebSocket} ws - WebSocket object which represents active connection.
       * @property {TransactionManager} tm - [TransactionManager](https://github.com/medooze/transaction-manager) object that simplify WebSocket commands.
       */
      this.emit(signalingEvents.connectionSuccess, { ws: this.webSocket, tm: this.transactionManager })
      return this.webSocket
    }

    return new Promise((resolve, reject) => {
      this.webSocket = new WebSocket(this.wsUrl)
      this.transactionManager = new TransactionManager(this.webSocket)
      this.webSocket.onopen = () => {
        logger.info('WebSocket opened')
        this.transactionManager.on('event', (evt) => {
          /**
           * Passthrough of available Millicast broadcast events.
           *
           * Active - Fires when the live stream is, or has started broadcasting.
           *
           * Inactive - Fires when the stream has stopped broadcasting, but is still available.
           *
           * Stopped - This event is not currently used, but is reserved for future usage.
           *
           * Viewercount - Fires when the viewer count changes.
           *
           * More information here: {@link https://docs.dolby.io/streaming-apis/docs/web#broadcast-events}
           *
           * @event Signaling#broadcastEvent
           * @type {Object}
           * @property {String} type - In this case the type of this message is "event".
           * @property {("active" | "inactive" | "stopped" | "vad" | "layers" | "migrate" | "viewercount")} name - Event name.
           * @property {String|Date|Array|Object} data - Custom event data.
           */
          this.emit(signalingEvents.broadcastEvent, evt)
        })
        logger.info('Connected to server: ', this.webSocket.url)
        logger.debug('WebSocket value: ', {
          url: this.webSocket.url,
          protocol: this.webSocket.protocol,
          readyState: this.webSocket.readyState,
          binaryType: this.webSocket.binaryType,
          extensions: this.webSocket.extensions
        })
        this.emit(signalingEvents.connectionSuccess, { ws: this.webSocket, tm: this.transactionManager })
        resolve(this.webSocket)
      }
      this.webSocket.onerror = () => {
        logger.error('WebSocket not connected: ', this.webSocket.url)
        /**
           * WebSocket connection failed with signaling server.
           * Returns url of WebSocket
           *
           * @event Signaling#wsConnectionError
           * @type {String}
           */
        this.emit(signalingEvents.connectionError, this.webSocket.url)
        reject(this.webSocket.url)
      }
      this.webSocket.onclose = () => {
        this.webSocket = null
        this.transactionManager = null
        logger.info('Connection closed with Signaling Server.')
        /**
         * WebSocket connection with signaling server was successfully closed.
         *
         * @event Signaling#wsConnectionClose
         */
        this.emit(signalingEvents.connectionClose)
      }
    })
  }

  /**
   * Close WebSocket connection with Millicast server.
   * @example millicastSignaling.close()
   */
  close () {
    logger.info('Closing connection with Signaling Server.')
    this.webSocket?.close()
  }

  /**
   * Establish WebRTC connection with Millicast Server as Subscriber role.
   * @param {String} sdp - The SDP information created by your offer.
   * @param {SignalingSubscribeOptions | Boolean} options - Signaling Subscribe Options or *Deprecated Enable VAD multiplexing for secondary sources.*
   * @param {String} pinnedSourceId - *Deprecated, use options parameter instead* Id of the main source that will be received by the default MediaStream.
   * @param {Array<String>} excludedSourceIds - *Deprecated, use options parameter instead* Do not receive media from the these source ids.
   * @example const response = await millicastSignaling.subscribe(sdp)
   * @return {Promise<String>} Promise object which represents the SDP command response.
   */
  async subscribe (sdp, options, pinnedSourceId = null, excludedSourceIds = null) {
    logger.info('Starting subscription to streamName: ', this.streamName)
    logger.debug('Subcription local description: ', sdp)
    const optionsParsed = getSubscribeOptions(options, pinnedSourceId, excludedSourceIds)

    // Signaling server only recognizes 'AV1' and not 'AV1X'
    sdp = SdpParser.adaptCodecName(sdp, 'AV1X', VideoCodec.AV1)

    const data = { sdp, streamId: this.streamName, pinnedSourceId: optionsParsed.pinnedSourceId, excludedSourceIds: optionsParsed.excludedSourceIds }

    if (optionsParsed.vad) { data.vad = true }
    if (Array.isArray(optionsParsed.events)) { data.events = optionsParsed.events }

    try {
      await this.connect()
      logger.info('Sending view command')
      const result = await this.transactionManager.cmd('view', data)

      // Check if browser supports AV1X
      const AV1X = RTCRtpReceiver.getCapabilities?.('video')?.codecs?.find?.(codec => codec.mimeType === 'video/AV1X')
      // Signaling server returns 'AV1'. If browser supports AV1X, we change it to AV1X
      result.sdp = AV1X ? SdpParser.adaptCodecName(result.sdp, VideoCodec.AV1, 'AV1X') : result.sdp

      logger.info('Command sent, subscriberId: ', result.subscriberId)
      logger.debug('Command result: ', result)
      this.serverId = result.subscriberId
      this.clusterId = result.clusterId
      return result.sdp
    } catch (e) {
      logger.error('Error sending view command, error: ', e)
      throw e
    }
  }

  /**
   * Establish WebRTC connection with Millicast Server as Publisher role.
   * @param {String} sdp - The SDP information created by your offer.
   * @param {SignalingPublishOptions | VideoCodec} options - Signaling Publish Options or *Deprecated Codec for publish stream (h264 default).*
   * @param {Boolean} [record] - *Deprecated, use options parameter instead* Enable stream recording. If record is not provided, use default Token configuration. **Only available in Tokens with recording enabled.**
   * @param {String} [sourceId] - *Deprecated, use options parameter instead* Source unique id. **Only available in Tokens with multisource enabled.***
   * @example const response = await millicastSignaling.publish(sdp, {codec: 'h264'})
   * @return {Promise<String>} Promise object which represents the SDP command response.
   */
  async publish (sdp, options, record = null, sourceId = null) {
    const optionsParsed = getPublishOptions(options, record, sourceId)

    logger.info(`Starting publishing to streamName: ${this.streamName}, codec: ${optionsParsed.codec}`)
    logger.debug('Publishing local description: ', sdp)

    const videoCodecs = Object.values(VideoCodec)
    if (videoCodecs.indexOf(optionsParsed.codec) === -1) {
      logger.error('Invalid codec. Possible values are: ', videoCodecs)
      throw new Error(`Invalid codec. Possible values are: ${videoCodecs}`)
    }

    // Signaling server only recognizes 'AV1' and not 'AV1X'
    if (optionsParsed.codec === VideoCodec.AV1) {
      sdp = SdpParser.adaptCodecName(sdp, 'AV1X', VideoCodec.AV1)
    }

    const data = {
      name: this.streamName,
      sdp,
      codec: optionsParsed.codec,
      sourceId: optionsParsed.sourceId
    }

    if (optionsParsed.record !== null) {
      data.record = optionsParsed.record
    }
    if (Array.isArray(optionsParsed.events)) {
      data.events = optionsParsed.events
    }
    try {
      await this.connect()
      logger.info('Sending publish command')
      const result = await this.transactionManager.cmd('publish', data)

      if (optionsParsed.codec === VideoCodec.AV1) {
        // If browser supports AV1X, we change from AV1 to AV1X
        const AV1X = RTCRtpSender.getCapabilities?.('video')?.codecs?.find?.(codec => codec.mimeType === 'video/AV1X')
        result.sdp = AV1X ? SdpParser.adaptCodecName(result.sdp, VideoCodec.AV1, 'AV1X') : result.sdp
      }

      logger.info('Command sent, publisherId: ', result.publisherId)
      logger.debug('Command result: ', result)
      this.serverId = result.publisherId
      this.clusterId = result.clusterId
      return result.sdp
    } catch (e) {
      logger.error('Error sending publish command, error: ', e)
      throw e
    }
  }

  /**
   * Send command to the server.
   * @param {String} cmd - Command name.
   * @param {Object} [data] - Command parameters.
   * @return {Promise<Object>} Promise object which represents the command response.
   */
  async cmd (cmd, data) {
    logger.info(`Sending cmd: ${cmd}`)

    return this.transactionManager.cmd(cmd, data)
  }
}

const getSubscribeOptions = (options, legacyPinnedSourceId, legacyExcludedSourceIds) => {
  let parsedOptions = (typeof options === 'object') ? options : {}
  if (Object.keys(parsedOptions).length === 0) {
    parsedOptions = {
      vad: options,
      pinnedSourceId: legacyPinnedSourceId,
      excludedSourceIds: legacyExcludedSourceIds
    }
  }
  return parsedOptions
}

const getPublishOptions = (options, legacyRecord, legacySourceId) => {
  let parsedOptions = (typeof options === 'object') ? options : {}
  if (Object.keys(parsedOptions).length === 0) {
    const defaultCodec = VideoCodec.H264
    parsedOptions = {
      codec: options ?? defaultCodec,
      record: legacyRecord,
      sourceId: legacySourceId
    }
  }
  return parsedOptions
}
