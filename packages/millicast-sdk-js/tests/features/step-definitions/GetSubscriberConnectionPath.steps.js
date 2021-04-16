import { loadFeature, defineFeature } from 'jest-cucumber'
import axios from 'axios'
import MillicastDirector from '../../../src/MillicastDirector'
const feature = loadFeature('../GetSubscriberConnectionPath.feature', { loadRelativePath: true, errors: true })

jest.mock('axios')

defineFeature(feature, test => {
  test('Subscribe to an existing unrestricted stream, valid accountId and no token', ({ given, when, then }) => {
    let accountId
    let streamName
    let response
    const mockedResponse = {
      data: {
        status: 'success',
        data: {
          wsUrl: 'wss://live-west.millicast.com/ws/v2/sub/12345',
          urls: [
            'wss://live-west.millicast.com/ws/v2/sub/12345'
          ],
          jwt: '123jwt',
          streamAccountId: 'Existing_accountId'
        }
      }
    }
    given('I have an existing stream name, accountId and no token', async () => {
      accountId = 'Existing_accountId'
      streamName = 'Existing_stream_name'
    })

    when('I request a connection path to Director API', async () => {
      axios.post.mockResolvedValue(mockedResponse)
      response = await MillicastDirector.getSubscriber(streamName, accountId)
    })

    then('I get the subscriber connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(mockedResponse.data.data)
    })
  })

  test('Subscribe to an existing restricted stream and valid token', ({ given, when, then }) => {
    let token
    let streamName
    let response
    const mockedResponse = {
      data: {
        status: 'success',
        data: {
          wsUrl: 'wss://live-west.millicast.com/ws/v2/sub/12345',
          urls: [
            'wss://live-west.millicast.com/ws/v2/sub/12345'
          ],
          jwt: '123jwt',
          streamAccountId: 'Existing_accountId'
        }
      }
    }
    given('I have an existing stream name and valid token', async () => {
      token = 'Valid_token'
      streamName = 'Existing_stream_name'
    })

    when('I request a connection path to Director API', async () => {
      axios.post.mockResolvedValue(mockedResponse)
      response = await MillicastDirector.getSubscriber(streamName, null, token)
    })

    then('I get the subscriber connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(mockedResponse.data.data)
    })
  })

  test('Subscribe to an existing unrestricted stream, invalid accountId and no token', ({ given, when, then }) => {
    let accountId
    let streamName
    let responseError
    const mockedResponse = {
      response: {
        data: {
          status: 'fail',
          data: {
            streamId: 'tnJhvKkk/klr0vxjk',
            message: 'stream not found'
          }
        }
      }
    }
    given('I have an existing stream name, invalid accountId and no token', async () => {
      accountId = 'Unexisting_accountId'
      streamName = 'Existing_stream_name'
    })

    when('I request a connection path to Director API', async () => {
      axios.post.mockRejectedValue(mockedResponse)
      try {
        responseError = await MillicastDirector.getSubscriber(streamName, accountId)
      } catch (error) {
        responseError = error
      }
    })

    then('throws an error with "stream not found" message', async () => {
      expect(responseError).toBeDefined()
      expect(responseError.response.data).toEqual(mockedResponse.response.data)
    })
  })
})
