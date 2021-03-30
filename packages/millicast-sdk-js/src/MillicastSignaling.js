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
    this.ws = null
    this.tm = null
    this.streamName = null
    this.wsUrl = options && options.url ? options.url : 'ws://localhost:8080/'
  }

  /**
   * Starts a WebSocket connection.
   * @param {String} url - WebSocket URL from Millicast API (/director/publisher or /director/subscriber).
   * @example const response = await millicastSignaling.connect(url);
   * @returns {Promise<WebSocket>} Promise object which represents the [WebSocket object]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API}.
   */

  async connect (url) {
    logger.info('Connecting to Millicast')
    if (this.tm && this.ws?.readyState === WebSocket.OPEN) {
      logger.info('Connection successful')
      logger.debug('WebSocket value: ', this.ws)
      this.emit('connection.success', { ws: this.ws, tm: this.tm })
      return Promise.resolve(this.ws)
    }

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url)
      this.tm = new TransactionManager(this.ws)
      this.ws.onopen = () => {
        logger.info('WebSocket opened')
        if (this.ws.readyState !== WebSocket.OPEN) {
          const error = { state: this.ws.readyState }
          logger.error('WebSocket not connected: ', error)
          this.emit('connection.error', error)
          return reject(error)
        }
        this.tm.on('event', (evt) => {
          this.emit('event', evt)
        })
        logger.info('Connection successful')
        logger.debug('WebSocket value: ', this.ws)
        this.emit('connection.success', {})
        resolve(this.ws)
      }
      this.ws.onclose = () => {
        this.ws = null
        this.tm = null
        logger.info('WebSocket closed')
        logger.debug('WebSocket value: ', this.ws)
        this.emit('connection.close', {})
      }
    })
  }

  /**
   * Destroys the WebSocket connection.
   * @example millicastSignaling.close();
   */
  async close () {
    logger.info('Closing WebSocket')
    if (this.ws) this.ws.close()
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

    const data = {
      sdp,
      streamId
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect(this.wsUrl)
    }

    try {
      logger.info('Sending view command')
      const result = await this.tm.cmd('view', data)
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

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect(this.wsUrl)
    }

    try {
      logger.info('Sending publish command')
      const result = await this.tm.cmd('publish', data)
      logger.info('Command sent')
      logger.debug('Command result: ', result)
      return result.sdp
    } catch (e) {
      logger.error('Error sending publish command, error: ', e)
      throw e
    }
  }
}
