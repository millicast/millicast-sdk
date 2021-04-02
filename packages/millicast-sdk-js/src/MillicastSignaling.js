import Logger from './Logger'
import EventEmitter from 'events'
import TransactionManager from 'transaction-manager'

const logger = Logger.get('MillicastSignaling')

/**
 * @class MillicastSignaling
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
    this.webSocket = null
    this.transactionManager = null
    this.streamName = options.streamName
    this.wsUrl = options.url
  }

  /**
   * Starts a WebSocket connection with signaling server.
   * @param {String} url - WebSocket URL to signal Millicast server and establish a WebRTC connection.
   * @example const response = await millicastSignaling.connect(url)
   * @returns {Promise<WebSocket>} Promise object which represents the [WebSocket object]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API} of the establshed connection.
   */
  async connect (url) {
    logger.info('Connecting to Millicast')
    if (this.transactionManager && this.webSocket?.readyState === WebSocket.OPEN) {
      logger.info('Connection successful')
      logger.debug('WebSocket value: ', this.webSocket)
      this.emit('connection.success', { ws: this.webSocket, tm: this.transactionManager })
      return this.webSocket
    }

    return new Promise((resolve, reject) => {
      this.webSocket = new WebSocket(url)
      this.transactionManager = new TransactionManager(this.webSocket)
      this.webSocket.onopen = () => {
        logger.info('WebSocket opened')
        if (this.webSocket.readyState !== WebSocket.OPEN) {
          const error = { state: this.webSocket.readyState }
          logger.error('WebSocket not connected: ', error)
          this.emit('connection.error', error)
          reject(error)
        }
        this.transactionManager.on('event', (evt) => {
          this.emit('event', evt)
        })
        logger.info('Connection successful')
        logger.debug('WebSocket value: ', this.webSocket)
        this.emit('connection.success', {})
        resolve(this.webSocket)
      }
      this.webSocket.onclose = () => {
        this.webSocket = null
        this.transactionManager = null
        logger.info('WebSocket closed')
        logger.debug('WebSocket value: ', this.webSocket)
        this.emit('connection.close', {})
      }
    })
  }

  /**
   * Close WebSocket connection with Millicast server.
   * @example millicastSignaling.close()
   */
  close () {
    logger.info('Closing WebSocket')
    if (this.webSocket) {
      this.webSocket.close()
    }
  }

  /**
   * Establish WebRTC connection with Millicast Server as Subscriber role.
   * @param {String} sdp - The SDP information created by your offer.
   * @example const response = await millicastSignaling.subscribe(sdp)
   * @return {Promise<String>} Promise object which represents the SDP command response.
   */
  async subscribe (sdp) {
    logger.info('Subscribing, streamName value: ', this.streamName)
    logger.debug('SDP: ', sdp)

    const data = { sdp, streamId: this.streamName }

    try {
      if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
        await this.connect(this.wsUrl)
      }
      logger.info('Sending view command')
      const result = await this.transactionManager.cmd('view', data)
      logger.info('Command sent')
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
   * @example const response = await millicastSignaling.publish(sdp)
   * @return {Promise<String>} Promise object which represents the SDP command response.
   */
  async publish (sdp) {
    logger.info('Publishing, streamName value: ', this.streamName)
    logger.debug('SDP: ', sdp)

    const data = {
      name: this.streamName,
      sdp,
      codec: 'h264'
    }

    try {
      if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
        await this.connect(this.wsUrl)
      }
      logger.info('Sending publish command')
      const result = await this.transactionManager.cmd('publish', data)
      logger.info('Command sent')
      logger.debug('Command result: ', result)
      return result.sdp
    } catch (e) {
      logger.error('Error sending publish command, error: ', e)
      throw e
    }
  }
}
