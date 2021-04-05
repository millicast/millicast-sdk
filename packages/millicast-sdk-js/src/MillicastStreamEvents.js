import Logger from './Logger'
import EventEmitter from 'events'

const logger = Logger.get('MillicastStreamEvents')
const eventsLocation = 'wss://streamevents.millicast.com/ws'
const recordSeparator = '\x1E'
const enums = { REQUEST: 1, RESPONSE: 3 }
let invocationId = 0

/**
 * @typedef {Object} viewerCountChanged
 * @property {String} streamId - Millicast accountId concatenated with streamName as follows: accountId/streamName.
 * @property {Number} count - Viewers count.
 */

/**
 * @typedef {Object} viewerCountError
 * @property {String} streamId - Millicast accountId concatenated with streamName as follows: accountId/streamName.
 * @property {Number} count - Viewers count.
 * @property {String} error - Error message.
 */

/**
 * @class MillicastStreamEvents
 * @classdesc Manages connection via a WebSocket protocol called SingalR Hub Protocol to handle Millicast stream events.
 *
 * For more information about the protocol you can read more here: [SignalR Hub Protocol](https://github.com/dotnet/aspnetcore/blob/master/src/SignalR/docs/specs/HubProtocol.md).
 */
export default class MillicastStreamEvents extends EventEmitter {
  constructor () {
    super()
    this.webSocket = null
    this.receivedHandshakeResponse = false
  }

  /**
   * Initializes the connection with the Millicast event WebSocket and invoke the topicFunction method if the handshake response was received.
   *
   * @param {function} topicFunction - Callback function executed when the handshake was successfully made.
   * This is used for send the event topic throught WebSocket.
   * See an example of use here: [userCount]{@link MillicastStreamEvents#userCount}.
   */
  initializeHandshake (topicFunction) {
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
        this.receivedHandshakeResponse = true
        logger.info('Received handshake response')
        logger.debug('Handshake response: ', event)
        this.handleHandshakeResponse(event.data)
        logger.info('Invoking topic function')
        topicFunction()
      }
    }
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
    this.webSocket.close()
    this.webSocket = null
  }

  /**
   * Initializes and subscribes to the Millicast user count event and emits views count changes.
   *
   * @param {String} accountId - Millicast existing account ID.
   * @param {String} streamName - Millicast existing Stream Name.
   * @example streamCount.userCount(accountId, streamName)
   * @example
   * import MillicastStreamEvents from 'millicast-sdk-js'
   *
   * //Create a new instance
   * const streamCount = new MillicastStreamEvents()
   * const accountId = "Publisher account ID"
   * const streamName = "Stream Name"
   *
   * //Initializes the user count event
   * this.streamCount.userCount(accountId, streamName)
   *
   * //Handle view count change
   * this.streamCount.on('viewerCountChanged', (event) => {
   *   console.log("Viewers: ", event.count)
   * })
   *
   * //Handle view errors
   * this.streamCount.on('viewerCountError', (event) => {
   *   console.error("Error ocurred: ", event.error)
   * })
   */
  userCount (accountId, streamName) {
    logger.info(`Starting user count. AccountId: ${accountId}, streamName: ${streamName}`)
    const streamId = `${accountId}/${streamName}`
    this.initializeHandshake(() => this.subscribeStreamCount(streamId))

    this.webSocket.addEventListener('message', (event) => {
      try {
        const response = this.parseSignalRMessage(event.data)
        logger.debug('New message from Millicast count WebSocket: ', response)
        this.handleStreamCountResponse(response)
      } catch (error) {
        logger.error('There was an error parsing JSON message: ', event.data)
      }
    })
  }

  /**
   * Callback used in [initializeHandshake]{@link MillicastStreamEvents#initializeHandshake} which sends request to subscribe to stream viewer count.
   *
   * @param {String} streamId - Millicast accountId concatenated with streamName as follows: accountId/streamName.
   */
  subscribeStreamCount (streamId) {
    logger.info('Invoking method to watch view count')
    const subscribeRequest = {
      arguments: [
        [streamId]
      ],
      invocationId: (invocationId++).toString(),
      streamIds: [],
      target: 'SubscribeViewerCount',
      type: 1
    }
    this.webSocket.send(JSON.stringify(subscribeRequest) + recordSeparator)
  }

  /**
   * Receives WebSocket parsed message and emits view events depending on response state.
   *
   * @param {Object} response - WebSocket parsed event data.
   */
  handleStreamCountResponse (response) {
    if (response.type === enums.REQUEST) {
      for (const { streamId, count } of response.arguments) {
        if (streamId) {
          const countChange = { streamId, count }
          this.emitStreamCountsChanged(countChange)
        }
      }
    } else if (response.type === enums.RESPONSE && response.error) {
      const errorData = {
        error: response.error,
        streamId: response.arguments?.streamId,
        count: response.arguments?.count
      }
      this.emitStreamCountsError(errorData)
    } else if (response.type === enums.RESPONSE) {
      for (const [streamId, count] of Object.entries(response.result?.streamIdCounts)) {
        const countChange = { streamId, count }
        this.emitStreamCountsChanged(countChange)
      }
    }
  }

  /**
   * Emits countChange data as viewerCountChanged event topic.
   *
   * @param {viewerCountChanged} countChange - Count change data.
   * @fires MillicastStreamEvents#viewerCountChanged
   */
  emitStreamCountsChanged (countChange) {
    logger.info('SubscribeViewerCount viewerCountChanged: ', countChange)
    /**
     * Views count changed.
     *
     * @event MillicastStreamEvents#viewerCountChanged
     * @type {viewerCountChanged}
     */
    this.emit('viewerCountChanged', countChange)
  }

  /**
   * Emits countError data as viewerCountError event topic.
   *
   * @param {viewerCountError} countError - Count error data.
   * @fires MillicastStreamEvents#viewerCountError
   */
  emitStreamCountsError (countError) {
    logger.error('SubscribeViewerCount viewerCountError: ', countError)
    /**
     * Error in event count.
     *
     * @event MillicastStreamEvents#viewerCountError
     * @type {viewerCountError}
     */
    this.emit('viewerCountError', countError)
  }
}
