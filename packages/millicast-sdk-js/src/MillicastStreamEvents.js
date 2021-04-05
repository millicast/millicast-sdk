import Logger from './Logger'
import EventEmitter from 'events'

const logger = Logger.get('MillicastStreamEvents')
const eventsLocation = 'wss://streamevents.millicast.com/ws'
const recordSeparator = '\x1E'
const enums = { REQUEST: 1, RESPONSE: 3 }
let invocationId = 0

export default class MillicastStreamEvents extends EventEmitter {
  constructor () {
    super()
    this.webSocket = null
    this.receivedHandshakeResponse = false
  }

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

  handleHandshakeResponse (message) {
    const handshakeResponse = this.parseSignalRMessage(message)
    if (handshakeResponse.error) {
      logger.error('There was an error in WebSocket handshake: ', handshakeResponse.error)
      throw new Error(handshakeResponse.error)
    }
  }

  parseSignalRMessage (message) {
    message = message.endsWith(recordSeparator) ? message.slice(0, -1) : message
    return JSON.parse(message)
  }

  close () {
    logger.info('Closing WebSocket')
    this.webSocket.close()
    this.webSocket = null
  }

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

  handleStreamCountResponse (response) {
    if (response.type === enums.REQUEST) {
      for (const { streamId, count } of response.arguments) {
        if (streamId) {
          const countChange = { streamId, count }
          this.emitStreamCounts(countChange)
        }
      }
    } else if (response.type === enums.RESPONSE && response.error) {
      const errorData = {
        error: response.error,
        streamId: response.arguments?.streamId,
        count: response.arguments?.count
      }
      logger.error('SubscribeViewerCount viewerCountError: ', errorData)
      this.emit('viewerCountError', errorData)
    } else if (response.type === enums.RESPONSE) {
      for (const [streamId, count] of Object.entries(response.result?.streamIdCounts)) {
        const countChange = { streamId, count }
        this.emitStreamCounts(countChange)
      }
    }
  }

  emitStreamCounts (countChange) {
    logger.info('SubscribeViewerCount viewerCountChanged: ', countChange)
    this.emit('viewerCountChanged', countChange)
  }
}
