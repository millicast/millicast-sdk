import Logger from '../Logger'
import EventEmitter from 'events'

const logger = Logger.get('EventSubscriber')
export const eventsLocation = 'wss://streamevents.millicast.com/ws'
export const recordSeparator = '\x1E'

export default class EventSubscriber extends EventEmitter {
  constructor () {
    super()
    this.webSocket = null
  }

  /**
   * Subscribe to Millicast Stream Event
   *
   * @param {Object} topicRequest - Object that represents the event topic you want to subscribe.
   */
  subscribe (topicRequest) {
    logger.info('Subscribing to event topic')
    logger.debug('Topic request value: ', topicRequest)
    topicRequest = JSON.stringify(topicRequest) + recordSeparator
    this.webSocket.onmessage = (event) => {
      const responses = event.data?.split(recordSeparator)
      for (const response of responses) {
        if (response) {
          const responseParsed = this.parseSignalRMessage(response)
          this.emit('message', responseParsed)
        }
      }
    }
    this.webSocket.send(topicRequest)
  }

  /**
   * Initializes the connection with the Millicast event WebSocket.
   *
   * @returns {Promise<void>} Promise which represents the handshake finalization.
   */
  async initializeHandshake () {
    if (this.webSocket?.readyState !== WebSocket.CONNECTING && this.webSocket?.readyState !== WebSocket.OPEN) {
      return new Promise((resolve, reject) => {
        logger.info('Starting events WebSocket handshake.')
        this.webSocket = new WebSocket(eventsLocation)
        this.webSocket.onopen = () => {
          logger.info('Connection established with events WebSocket.')
          const handshakeRequest = {
            protocol: 'json',
            version: 1
          }
          this.webSocket.send(JSON.stringify(handshakeRequest) + recordSeparator)
        }

        this.webSocket.onmessage = (event) => {
          try {
            const parsedResponse = this.handleHandshakeResponse(event.data)
            logger.info('Successful handshake with events WebSocket. Waiting for subscriptions...')
            logger.debug('WebSocket handshake message: ', parsedResponse)
            resolve()
          } catch (error) {
            this.close()
            reject(error)
          }
        }
      })
    }
  }

  /**
   * Receives the event data response from the WebSocket and throw error if the response has an error.
   *
   * @param {String} message - WebSocket event data response from the handshake initialization.
   * @returns {Object} Returns incoming message into an Object.
   */
  handleHandshakeResponse (message) {
    const handshakeResponse = this.parseSignalRMessage(message)
    if (handshakeResponse.error) {
      logger.error('There was an error with events WebSocket handshake: ', handshakeResponse.error)
      throw new Error(handshakeResponse.error)
    }
    return handshakeResponse
  }

  /**
   * Parses incoming WebSocket event messages.
   *
   * @param {String} message - WebSocket event data.
   * @returns {Object} Returns incoming message into an Object.
   */
  parseSignalRMessage (message) {
    message = message.endsWith(recordSeparator) ? message.slice(0, -1) : message
    return JSON.parse(message)
  }

  /**
   * Close WebSocket connection with Millicast stream events server.
   */
  close () {
    this.webSocket?.close()
    this.webSocket.onclose = () => {
      logger.info('Events WebSocket closed')
      this.webSocket = null
    }
  }
}
