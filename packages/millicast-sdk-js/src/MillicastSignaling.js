import Logger from './Logger'
import EventEmitter from 'events'
import TransactionManager from 'transaction-manager'

const logger = Logger.get('MillicastSignaling')

/**
 * @class MillicastSignaling
 * @classdesc Starts WebSocket connection and manages the messages between peers.
 * @example const millicastSignaling = new MillicastSignaling();
 * @constructor
 */

export default class MillicastSignaling extends EventEmitter {
  constructor (options) {
    super()
    this.webSocket = null
    this.transactionManager = null
    this.streamName = null
    this.wsUrl = options?.url ?? 'ws://localhost:8080/'
  }

  /**
   * Starts a WebSocket connection.
   * @param {String} url - WebSocket URL from Millicast API (/director/publisher or /director/subscriber).
   * @example const response = await millicastSignaling.connect(url);
   * @returns {Promise<WebSocket>} Promise object which represents the [WebSocket object]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API}.
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
   * Destroys the WebSocket connection.
   * @example millicastSignaling.close();
   */
  close () {
    logger.info('Closing WebSocket')
    if (this.webSocket) {
      this.webSocket.close()
    }
  }

  /**
   * Initiates signaling as viewer role.
   * @param {String} sdp - Local SDP.
   * @param {String} streamId  - Millicast stream name you want to subscribe.
   * @example const response = await millicastSignaling.subscribe(sdp, streamId);
   * @return {Promise<String>} Promise object which represents the SDP command response.
   */
  async subscribe (sdp, streamId) {
    logger.info('Subscribing, streamId value: ', streamId)
    logger.debug('SDP: ', sdp)

    const data = { sdp, streamId }

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
   * Initiates signaling as publisher role.
   * @param {String} sdp - Local SDP.
   * @example const response = await millicastSignaling.publish(sdp);
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
