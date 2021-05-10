import { loadFeature, defineFeature } from 'jest-cucumber'
import axios from 'axios'
import MillicastDirector from '../../../src/MillicastDirector'
const feature = loadFeature('../GetPublisherConnectionPath.feature', { loadRelativePath: true, errors: true })

jest.mock('axios')

defineFeature(feature, test => {
  test('Publish with an existing stream name and valid token', ({ given, when, then }) => {
    let token
    let streamName
    let response
    const mockedResponse = {
      data: {
        status: 'success',
        data: {
          subscribeRequiresAuth: false,
          wsUrl: 'wss://live-west.millicast.com/ws/v2/pub/12345',
          urls: [
            'wss://live-west.millicast.com/ws/v2/pub/12345'
          ],
          jwt: '123jwt',
          streamAccountId: 'Existing_accountId'
        }
      }
    }
    given('I have a valid token and an existing stream name', async () => {
      token = 'Valid_token'
      streamName = 'Existing_stream_name'
    })

    when('I request a connection path to Director API', async () => {
      axios.post.mockResolvedValue(mockedResponse)
      response = await MillicastDirector.getPublisher(token, streamName)
    })

    then('I get the publish connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(mockedResponse.data.data)
    })
  })

  test('Publish with an unexisting stream name and valid token', ({ given, when, then }) => {
    let token
    let streamName
    let responseError
    const mockedResponse = {
      response: {
        data: {
          status: 'fail',
          data: {
            message: 'StreamName is not valid for token'
          }
        }
      }
    }
    given('I have a valid token and an unexisting stream name', async () => {
      token = 'Valid_token'
      streamName = 'Unexisting_stream_name'
    })

    when('I request a connection path to Director API', async () => {
      axios.post.mockRejectedValue(mockedResponse)
      try {
        responseError = await MillicastDirector.getPublisher(token, streamName)
      } catch (error) {
        responseError = error
      }
    })

    then('throws an error with "invalid stream name" message', async () => {
      expect(responseError).toBeDefined()
      expect(responseError.response.data).toEqual(mockedResponse.response.data)
    })
  })

  test('Publish with an existing stream name and invalid token', ({ given, when, then }) => {
    let token
    let streamName
    let responseError
    const mockedResponse = {
      response: {
        data: {
          status: 'fail',
          data: {
            message: 'Unauthorized: Invalid token'
          }
        }
      }
    }
    given('I have an invalid token and an existing stream name', async () => {
      token = 'Invalid_token'
      streamName = 'Existing_stream_name'
    })

    when('I request a connection path to Director API', async () => {
      axios.post.mockRejectedValue(mockedResponse)
      try {
        responseError = await MillicastDirector.getPublisher(token, streamName)
      } catch (error) {
        responseError = error
      }
    })

    then('throws an error with "invalid token" message', async () => {
      expect(responseError).toBeDefined()
      expect(responseError.response.data).toEqual(mockedResponse.response.data)
    })
  })

  test('Publish with an existing stream name and valid token using other API Endpoint', ({ given, when, then }) => {
    let token
    let streamName
    let response
    const mockedResponse = {
      data: {
        status: 'success',
        data: {
          subscribeRequiresAuth: false,
          wsUrl: 'wss://live-west.millicast.com/ws/v2/pub/12345',
          urls: [
            'wss://live-west.millicast.com/ws/v2/pub/12345'
          ],
          jwt: '123jwt',
          streamAccountId: 'Existing_accountId'
        }
      }
    }
    given('I have a valid token and an existing stream name', async () => {
      token = 'Valid_token'
      streamName = 'Existing_stream_name'
      MillicastDirector.setEndpoint('https://director-dev.millicast.com')
    })

    when('I request a connection path to Director API', async () => {
      axios.post.mockResolvedValue(mockedResponse)
      response = await MillicastDirector.getPublisher(token, streamName)
    })

    then('I get the publish connection path', async () => {
      expect(axios.post).toBeCalledWith(
        expect.stringContaining('https://director-dev.millicast.com'),
        expect.any(Object),
        expect.any(Object)
      )
      expect(response).toBeDefined()
      expect(response).toEqual(mockedResponse.data.data)
    })
  })
})
