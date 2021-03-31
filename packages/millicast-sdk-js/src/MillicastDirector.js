import axios from 'axios'
import Logger from './Logger'

const logger = Logger.get('MillicastDirector')
const publisherLocation = 'https://director.millicast.com/api/director/publish'
const subscriberLocation = 'https://director.millicast.com/api/director/subscribe'

export default class MillicastDirector {
  static async getPublisher (token, streamName) {
    logger.info('Getting publisher connection data for stream name: ', streamName)
    const payload = { streamName }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    try {
      const { data } = await axios.post(publisherLocation, payload, config)
      logger.debug('Getting publisher response: ', data)
      return data.data
    } catch (e) {
      logger.error('Error while getting publisher connection data: ', e.response.data)
      throw e
    }
  }

  static async getSubscriber (streamAccountId, streamName, unauthorizedSubscribe = true) {
    logger.info(`Getting subscriber connection data for stream name: ${streamName} and account id: ${streamAccountId}`)
    const payload = { streamAccountId, streamName, unauthorizedSubscribe }
    try {
      const { data } = await axios.post(subscriberLocation, payload)
      logger.debug('Getting subscriber response: ', data)
      return data.data
    } catch (e) {
      logger.error('Error while getting subscriber connection data: ', e.response.data)
      throw e
    }
  }
}
