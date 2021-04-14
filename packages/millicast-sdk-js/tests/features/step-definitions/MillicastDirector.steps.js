import { loadFeature, defineFeature } from 'jest-cucumber'
import axios from 'axios'
import MillicastDirector from '../../../src/MillicastDirector'
const feature = loadFeature('../MillicastDirector.feature', { loadRelativePath: true, errors: true })

jest.mock('axios')

defineFeature(feature, test => {
  test('Publish with existing stream and valid token', ({ given, when, then }) => {
    let token
    let streamName
    let response
    given('i have a valid token and a existing stream name', async () => {
      token = 'Valid_token'
      streamName = 'Existing_stream_name'
    })

    when('i get the publish connection path', async () => {
      const axiosResponse = {
        data: {
          status: 'success',
          data: {
            subscribeRequiresAuth: false,
            wsUrl: 'wss://live-west.millicast.com/ws/v2/pub/12345',
            urls: [
              'wss://live-west.millicast.com/ws/v2/pub/12345'
            ],
            jwt: '123jwt',
            streamAccountId: 'Existing_stream_name'
          }
        }
      }

      axios.post.mockResolvedValue(axiosResponse)
      response = await MillicastDirector.getPublisher(token, streamName)
    })

    then('returns the connection path', async () => {
      expect(response).toBeDefined()
    })
  })
})
