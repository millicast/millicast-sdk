import Logger from './Logger'
import EventSubscriber from './utils/EventSubscriber'

const USER_COUNT_TARGET = 'SubscribeViewerCount'
const USER_COUNT_TARGET_RESPONSE = 'SubscribeViewerCountResponse'

const logger = Logger.get('StreamEvents')
const messageType = { REQUEST: 1, RESPONSE: 3 }
let invocationId = 0

const errorMsg = 'You need to initialize stream event with StreamEvents.init()'

/**
 * Callback invoke when new user count is received.
 *
 * @callback onUserCountCallback
 * @param {Object} data
 * @param {String} data.streamId - Stream identifier with the following format `accountId/streamName`.
 * @param {Number} data.count    - Current amount of viewers of the stream.
 * @param {String} [data.error]  - Error message.
 */

/**
 * @class StreamEvents
 * @classdesc Lets you to subscribe to stream events like receive the amount of viewers of a stream.
 *
 * This events are handled via a WebSocket with Millicast server.
 * @hideconstructor
 */
export default class StreamEvents {
  constructor () {
    this.eventSubscriber = null
  }

  /**
   * Initializes the connection with Millicast Stream Event.
   * @returns {Promise<StreamEvents>} Promise object which represents the StreamEvents instance
   * once the connection with the Millicast stream events is done.
   * @example const streamEvents = await StreamEvents.init()
   */
  static async init () {
    const instance = new StreamEvents()
    instance.eventSubscriber = new EventSubscriber()
    await instance.eventSubscriber.initializeHandshake()

    return instance
  }

  /**
   * Subscribes to User Count event and invokes the callback once a new message is available.
   * @param {String} accountId - Millicast Account Id.
   * @param {String} streamName - Millicast Stream Name.
   * @param {onUserCountCallback} callback - Callback function executed when a new message is available.
   * @example
   * import StreamEvents from '@millicast/sdk'
   *
   * //Create a new instance
   * const streamEvents = await StreamEvents.init()
   * const accountId = "Publisher account ID"
   * const streamName = "Stream Name"
   *
   * //Initializes the user count event
   * streamEvents.onUserCount(accountId, streamName, (data) => {
   *  if (data.error) {
   *    console.error("Handle error: ", error)
   *  }
   *  else {
   *    console.log("Viewers: ", data.count)
   *  }
   * })
   */
  onUserCount (accountId, streamName, callback) {
    if (!this.eventSubscriber) {
      logger.error(errorMsg)
      throw new Error(errorMsg)
    }

    logger.info(`Starting user count. AccountId: ${accountId}, streamName: ${streamName}`)
    const streamId = `${accountId}/${streamName}`
    const requestInvocationId = invocationId++
    const userCountRequest = {
      arguments: [[streamId]],
      invocationId: requestInvocationId.toString(),
      streamIds: [],
      target: USER_COUNT_TARGET,
      type: 1
    }
    this.eventSubscriber.subscribe(userCountRequest)
    this.eventSubscriber.on('message', (response) => {
      handleStreamCountResponse(streamId, requestInvocationId, response, callback)
    })
  }

  /**
   * Stop listening to stream events connected.
   * @example streamEvents.stop()
   */
  stop () {
    this.eventSubscriber.close()
  }
}

const handleStreamCountResponse = (streamIdConstraint, invocationIdConstraint, response, callback) => {
  switch (response.type) {
    case messageType.REQUEST:
      if (response.target === USER_COUNT_TARGET_RESPONSE) {
        for (const { streamId, count } of response.arguments) {
          if (streamId === streamIdConstraint) {
            const countChange = { streamId, count }
            logger.debug('User count changed: ', countChange)
            callback(countChange)
          }
        }
      }
      break

    case messageType.RESPONSE:
      if (response.error && response.invocationId === invocationIdConstraint) {
        const countData = {
          error: response.error,
          streamId: streamIdConstraint
        }
        logger.error('User count error: ', response.error)
        callback(countData)
      }
      break

    default:
      break
  }
}
