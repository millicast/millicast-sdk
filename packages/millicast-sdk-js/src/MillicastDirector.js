import Logger from './Logger'
import MillicastUtils from './MillicastUtils.js'
const logger = Logger.get('MillicastDirector')

export default class MillicastDirector {
  static async getPublisher (token, streamName) {
    logger.info('Getting publisher')
    const payload = { streamName }
    let response
    try {
      response = await MillicastUtils.request(
        'https://director.millicast.com/api/director/publish',
        'POST',
        token,
        payload
      )
      logger.info('Publisher geted')
      logger.debug('Get publisher response: ', response.data)
      return response.data
    } catch (e) {
      logger.error('Error getting publisher: ', e)
      throw e
    }
  }

  static async getSubscriber (
    streamAccountId,
    streamName,
    unauthorizedSubscribe = true
  ) {
    logger.info('Getting subscriber')
    const payload = { streamAccountId, streamName, unauthorizedSubscribe }
    const token = null
    let response
    try {
      response = await MillicastUtils.request(
        'https://director.millicast.com/api/director/subscribe',
        'POST',
        token,
        payload
      )
      logger.info('Subscriber geted')
      logger.debug('Get subscriber response: ', response.data)
      return response.data
    } catch (e) {
      logger.error('Error getting subscriber: ', e)
      throw e
    }
  }
}
