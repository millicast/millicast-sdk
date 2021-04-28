import EventEmitter from 'events'
import TransactionManager from 'transaction-manager'
import MillicastLogger from './MillicastLogger'

const logger = MillicastLogger.get('MillicastSignaling')

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
 */
export const MillicastVideoCodecs = {
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
 */
export const MillicastAudioCodecs = {
  OPUS: 'opus'
}

/**
 * @class MillicastSignaling
 * @extends EventEmitter
 * @classdesc Starts WebSocket connection and manages the messages between peers.
 * @example const millicastSignaling = new MillicastSignaling(options)
 * @constructor
 * @param {Object} options - General signaling options.
 * @param {String} options.streamName - Millicast stream name to get subscribed.
 * @param {String} options.url - WebSocket URL to signal Millicast server and establish a WebRTC connection.
 */

export default class MillicastSignaling extends EventEmitter {
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
  }

  /**
   * Starts a WebSocket connection with signaling server.
   * @example const response = await millicastSignaling.connect()
   * @returns {Promise<WebSocket>} Promise object which represents the [WebSocket object]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API} of the establshed connection.
   * @fires MillicastSignaling#wsConnectionSuccess
   * @fires MillicastSignaling#wsConnectionError
   * @fires MillicastSignaling#wsConnectionClose
   * @fires MillicastSignaling#broadcastEvent
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
       * @event MillicastSignaling#wsConnectionSuccess
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
           * Stopped - Fires when the live stream has been disconnected and is no longer available.
           *
           * More information here: {@link https://dash.millicast.com/docs.html?pg=how-to-broadcast-in-js#broadcast-events-sect}
           *
           * @event MillicastSignaling#broadcastEvent
           * @type {Object}
           * @property {String} type - In this case the type of this message is "event".
           * @property {("active" | "inactive" | "stopped")} name - Event name.
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
           * @event MillicastSignaling#wsConnectionError
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
         * @event MillicastSignaling#wsConnectionClose
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
   * @example const response = await millicastSignaling.subscribe(sdp)
   * @return {Promise<String>} Promise object which represents the SDP command response.
   */
  async subscribe (sdp) {
    logger.info('Starting subscription to streamName: ', this.streamName)
    logger.debug('Subcription local description: ', sdp)

    const data = { sdp, streamId: this.streamName }

    try {
      await this.connect()
      logger.info('Sending view command')
      const result = await this.transactionManager.cmd('view', data)
      logger.info('Command sent, subscriberId: ', result.subscriberId)
      logger.debug('Command result: ', result)
      return result.sdp
    } catch (e) {
      logger.error('Error sending view command, error: ', e)
      throw e
    }
  }

  /**
   * Establish WebRTC connection with Millicast Server as Publisher role.
   * @param {String} sdp - The SDP information created by your offer.
   * @param {MillicastVideoCodecs} codec - Codec for publish stream.
   * @example const response = await millicastSignaling.publish(sdp, 'h264')
   * @return {Promise<String>} Promise object which represents the SDP command response.
   */
  async publish (sdp, codec) {
    logger.info(`Starting publishing to streamName: ${this.streamName}, codec: ${codec}`)
    logger.debug('Publishing local description: ', sdp)

    const videoCodecs = Object.values(MillicastVideoCodecs)
    if (videoCodecs.indexOf(codec) === -1) {
      logger.error('Invalid codec. Possible values are: ', videoCodecs)
      throw new Error(`Invalid codec. Possible values are: ${videoCodecs}`)
    }

    const data = {
      name: this.streamName,
      sdp,
      codec
    }

    try {
      await this.connect()
      logger.info('Sending publish command')
      const result = await this.transactionManager.cmd('publish', data)
      logger.info('Command sent, publisherId: ', result.publisherId)
      logger.debug('Command result: ', result)
      return result.sdp
    } catch (e) {
      logger.error('Error sending publish command, error: ', e)
      throw e
    }
  }
}
