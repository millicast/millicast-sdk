import Logger from '../Logger'
import EventEmitter from 'events'

const logger = Logger.get('MillicastEventSubscriber')
const eventsLocation = 'wss://streamevents.millicast.com/ws'
const recordSeparator = '\x1E'
/**
 * @class MillicastEventSubscriber
 * @extends EventEmitter
 * @classdesc Manages connection via a WebSocket protocol called SingalR Hub Protocol to handle Millicast stream events.
 *
 * For more information about the protocol you can read more here: [SignalR Hub Protocol](https://github.com/dotnet/aspnetcore/blob/master/src/SignalR/docs/specs/HubProtocol.md).
 */
export default class MillicastEventSubscriber extends EventEmitter {
  constructor () {
    super()
    this.webSocket = null
    this.receivedHandshakeResponse = false
  }

  subscribe (topicRequest) {
    logger.info('Subscribing incoming topic')
    logger.debug('TopicRequest value: ', topicRequest)
    topicRequest = JSON.stringify(topicRequest) + recordSeparator
    this.webSocket.onmessage = (event) => {
      logger.debug('New message from WebSocket: ', event)
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
   * Initializes the connection with the Millicast event WebSocket and invoke the topicFunction method if the handshake response was received.
   *
   * @param {function} topicFunction - Callback function executed when the handshake was successfully made.
   * This is used for send the event topic throught WebSocket.
   * See an example of use here: [userCount]{@link MillicastStreamEvents#userCount}.
   */
  initializeHandshake () {
    return new Promise((resolve, reject) => {
      logger.info('Starting handshake')
      this.webSocket = new WebSocket(eventsLocation)
      this.webSocket.onopen = () => {
        logger.info('WebSocket opened, beginning handshake')
        const handshakeRequest = {
          protocol: 'json',
          version: 1
        }
        this.webSocket.send(JSON.stringify(handshakeRequest) + recordSeparator)
      }

      this.webSocket.onmessage = (event) => {
        if (!this.receivedHandshakeResponse) {
          logger.info('Handshake message response from WebSocket: ', event)
          this.receivedHandshakeResponse = true
          try {
            this.handleHandshakeResponse(event.data)
            resolve()
          } catch (error) {
            reject(error)
          }
        }
      }
    })
  }

  /**
   * Receives the event data response from the WebSocket and throw error if the response has an error.
   *
   * @param {String} message - WebSocket event data response from the handshake initialization.
   */
  handleHandshakeResponse (message) {
    const handshakeResponse = this.parseSignalRMessage(message)
    if (handshakeResponse.error) {
      logger.error('There was an error in WebSocket handshake: ', handshakeResponse.error)
      throw new Error(handshakeResponse.error)
    }
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
   * @example streamCount.close()
   */
  close () {
    logger.info('Closing WebSocket')
    this.webSocket?.close()
    this.webSocket = null
  }
}
