import Logger from './Logger'
import MillicastEventSubscriber from './utils/MillicastEventSubscriber'

const USER_COUNT_TARGET = 'SubscribeViewerCount'

const logger = Logger.get('MillicastStreamEvents')
const messageType = { REQUEST: 1, RESPONSE: 3 }
let invocationId = 0

export default class MillicastStreamEvents {
  constructor () {
    this.millicastEventSubscriber = null
  }

  static async init () {
    const instance = new MillicastStreamEvents()
    instance.millicastEventSubscriber = new MillicastEventSubscriber()
    await instance.millicastEventSubscriber.initializeHandshake()

    return instance
  }

  onUserCount (accountId, streamName, callback) {
    if (!this.millicastEventSubscriber) {
      logger.error('You need to initialize stream event with MillicastStreamEvents.init()')
      return
    }

    logger.info(`Starting user count. AccountId: ${accountId}, streamName: ${streamName}`)
    const streamId = `${accountId}/${streamName}`
    const userCountRequest = {
      arguments: [[streamId]],
      invocationId: (invocationId++).toString(),
      streamIds: [],
      target: USER_COUNT_TARGET,
      type: 1
    }
    this.millicastEventSubscriber.subscribe(userCountRequest)
    this.millicastEventSubscriber.on('message', (response) => {
      handleStreamCountResponse(streamId, response, callback)
    })
  }

  stop () {
    this.millicastEventSubscriber.close()
  }
}

const handleStreamCountResponse = (streamIdConstraint, response, callback) => {
  switch (response.type) {
    case messageType.REQUEST:
      if (response.target !== USER_COUNT_TARGET) {
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
      if (response.error && response.arguments.streamId === streamIdConstraint) {
        const countData = {
          error: response.error,
          streamId: response.arguments.streamId,
          count: response.arguments?.count
        }
        logger.error('User count error: ', response.error)
        callback(countData, response.error)
      }
      break

    default:
      break
  }
}
