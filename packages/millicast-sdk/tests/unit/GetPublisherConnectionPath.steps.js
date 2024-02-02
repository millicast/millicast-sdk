import { loadFeature, defineFeature } from 'jest-cucumber'
import { mockFetchJsonReturnValue, mockFetchRejectValue } from './__mocks__/Fetch'
import Director from '../../src/Director'
const feature = loadFeature('../features/GetPublisherConnectionPath.feature', { loadRelativePath: true, errors: true })

const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJtaWxsaWNhc3QiOnt9fQ.IqT-PLLz-X7Wn7BNo-x4pFApAbMT9mmnlupR8eD9q4U'

defineFeature(feature, test => {
  beforeEach(() => {
    Director.setLiveDomain('')
  })

  test('Publish with an existing stream name and valid token', ({ given, when, then }) => {
    let token
    let streamName
    let response
    const mockedResponse = {
      data: {
        subscribeRequiresAuth: false,
        wsUrl: 'wss://live-west.millicast.com/ws/v2/pub/12345',
        urls: [
          'wss://live-west.millicast.com/ws/v2/pub/12345'
        ],
        jwt: dummyToken,
        streamAccountId: 'Existing_accountId'
      }
    }
    given('I have a valid token and an existing stream name', async () => {
      token = 'Valid_token'
      streamName = 'Existing_stream_name'
    })

    when('I request a connection path to Director API', async () => {
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse))
      response = await Director.getPublisher(token, streamName)
    })

    then('I get the publish connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(expect.objectContaining(mockedResponse.data))
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
      mockFetchRejectValue(mockedResponse)
      try {
        responseError = await Director.getPublisher(token, streamName)
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
      mockFetchRejectValue(mockedResponse)
      try {
        responseError = await Director.getPublisher(token, streamName)
      } catch (error) {
        responseError = error
      }
    })

    then('throws an error with "invalid token" message', async () => {
      expect(responseError).toBeDefined()
      expect(responseError.response.data).toEqual(expect.objectContaining(mockedResponse.response.data))
    })
  })

  test('Publish with an existing stream name and valid token using other API Endpoint', ({ given, when, then }) => {
    let token
    let streamName
    let response
    const mockedResponse = {
      data: {
        subscribeRequiresAuth: false,
        wsUrl: 'wss://live-west.millicast.com/ws/v2/pub/12345',
        urls: [
          'wss://live-west.millicast.com/ws/v2/pub/12345'
        ],
        jwt: dummyToken,
        streamAccountId: 'Existing_accountId'
      }
    }
    given('I have a valid token and an existing stream name', async () => {
      token = 'Valid_token'
      streamName = 'Existing_stream_name'
      Director.setEndpoint('https://director-dev.millicast.com')
    })

    when('I request a connection path to Director API', async () => {
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse))
      response = await Director.getPublisher(token, streamName)
    })

    then('I get the publish connection path', async () => {
      expect(fetch).toBeCalledWith(
        expect.stringContaining('https://director-dev.millicast.com'),
        expect.any(Object)
      )
      expect(response).toBeDefined()
      expect(response).toEqual(expect.objectContaining(mockedResponse.data))
    })
  })

  test('Publish with an existing stream name, valid token and options as object', ({ given, when, then }) => {
    let token
    let streamName
    let response
    const mockedResponse = {
      data: {
        subscribeRequiresAuth: false,
        wsUrl: 'wss://live-west.millicast.com/ws/v2/pub/12345',
        urls: [
          'wss://live-west.millicast.com/ws/v2/pub/12345'
        ],
        jwt: dummyToken,
        streamAccountId: 'Existing_accountId'
      }
    }
    given('I have a valid token and an existing stream name', async () => {
      token = 'Valid_token'
      streamName = 'Existing_stream_name'
    })

    when('I request a connection path to Director API using options object', async () => {
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse))
      response = await Director.getPublisher({ token, streamName })
    })

    then('I get the publish connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(expect.objectContaining(mockedResponse.data))
    })
  })

  test('Publish to an existing stream name, valid token and custom live websocket domain', ({ given, when, then }) => {
    let token
    let streamName
    let response
    const mockedResponse = {
      data: {
        subscribeRequiresAuth: false,
        wsUrl: 'wss://live-west.millicast.com/ws/v2/pub/12345',
        urls: [
          'wss://test.com/ws/v2/pub/12345'
        ],
        jwt: dummyToken,
        streamAccountId: 'Existing_accountId'
      }
    }
    given('I have a valid token and an existing stream name', async () => {
      token = 'Valid_token'
      streamName = 'Existing_stream_name'
    })

    when('I set a custom live websocket domain and I request a connection path to Director API', async () => {
      Director.setLiveDomain('test.com')
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse))
      response = await Director.getPublisher(token, streamName)
    })

    then('I get the publish connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(expect.objectContaining(mockedResponse.data))
    })
  })
})
