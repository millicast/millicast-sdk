import Logger from './Logger'
import MillicastEventSubscriber from './utils/MillicastEventSubscriber'

const logger = Logger.get('MillicastStreamEvents')
const enums = { REQUEST: 1, RESPONSE: 3 }
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
      target: 'SubscribeViewerCount',
      type: 1
    }
    this.millicastEventSubscriber.subscribe(userCountRequest)
    this.millicastEventSubscriber.on('message', (response) => {
      handleStreamCountResponse(streamId, response, callback)
    })
  }

  close () {
    this.millicastEventSubscriber.close()
  }
}

const handleStreamCountResponse = (streamIdConstraint, response, callback) => {
  if (response.type === enums.REQUEST) {
    for (const { streamId, count } of response.arguments) {
      if (streamId && streamId === streamIdConstraint) {
        const countChange = { streamId, count }
        callback(countChange)
      }
    }
  } else if (response.type === enums.RESPONSE && response.error && response.arguments.streamId === streamIdConstraint) {
    const countData = {
      error: response.error,
      streamId: response.arguments.streamId,
      count: response.arguments?.count
    }
    callback(countData, response.error)
  } else if (response.type === enums.RESPONSE) {
    for (const [streamId, count] of Object.entries(response.result?.streamIdCounts)) {
      if (streamId === streamIdConstraint) {
        const countChange = { streamId, count }
        callback(countChange)
      }
    }
  }
}
