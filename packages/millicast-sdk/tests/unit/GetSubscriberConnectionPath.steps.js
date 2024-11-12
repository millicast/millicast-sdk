import { loadFeature, defineFeature } from 'jest-cucumber'
import { mockFetchJsonReturnValue, mockFetchRejectValue } from './__mocks__/Fetch'
import Director from '../../src/Director'
const feature = loadFeature('../features/GetSubscriberConnectionPath.feature', {
  loadRelativePath: true,
  errors: true,
})

const dummyToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJtaWxsaWNhc3QiOnt9fQ.IqT-PLLz-X7Wn7BNo-x4pFApAbMT9mmnlupR8eD9q4U'

defineFeature(feature, (test) => {
  beforeEach(() => {
    fetch.mockClear()
    Director.setLiveDomain('')
  })

  test('Subscribe to an existing unrestricted stream, valid accountId and no token', ({
    given,
    when,
    then,
  }) => {
    let accountId
    let streamName
    let response
    const mockedResponse = {
      data: {
        wsUrl: 'wss://live-west.millicast.com/ws/v2/sub/12345',
        urls: ['wss://live-west.millicast.com/ws/v2/sub/12345'],
        jwt: dummyToken,
        streamAccountId: 'Existing_accountId',
      },
    }
    given('I have an existing stream name, accountId and no token', async () => {
      accountId = 'Existing_accountId'
      streamName = 'Existing_stream_name'
    })

    when('I request a connection path to Director API', async () => {
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse))
      const options = { streamName, streamAccountId: accountId }
      response = await Director.getSubscriber(options)
    })

    then('I get the subscriber connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(expect.objectContaining(mockedResponse.data))
    })
  })

  test('Subscribe to an existing restricted stream and valid token', ({ given, when, then }) => {
    let token
    let streamName
    let response
    const mockedResponse = {
      data: {
        wsUrl: 'wss://live-west.millicast.com/ws/v2/sub/12345',
        urls: ['wss://live-west.millicast.com/ws/v2/sub/12345'],
        jwt: dummyToken,
        streamAccountId: 'Existing_accountId',
      },
    }
    given('I have an existing stream name and valid token', async () => {
      token = 'Valid_token'
      streamName = 'Existing_stream_name'
    })

    when('I request a connection path to Director API', async () => {
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse))
      const options = { streamName, streamAccountId: null, subscriberToken: token }
      response = await Director.getSubscriber(options)
    })

    then('I get the subscriber connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(expect.objectContaining(mockedResponse.data))
    })
  })

  test('Subscribe to an existing unrestricted stream, invalid accountId and no token', ({
    given,
    when,
    then,
  }) => {
    let accountId
    let streamName
    let responseError
    const mockedResponse = {
      response: {
        data: {
          status: 'fail',
          data: {
            streamId: 'tnJhvKkk/klr0vxjk',
            message: 'stream not found',
          },
        },
      },
    }
    given('I have an existing stream name, invalid accountId and no token', async () => {
      accountId = 'Unexisting_accountId'
      streamName = 'Existing_stream_name'
    })

    when('I request a connection path to Director API', async () => {
      mockFetchRejectValue(mockedResponse)
      try {
        const options = { streamName, streamAccountId: accountId }
        responseError = await Director.getSubscriber(options)
      } catch (error) {
        responseError = error
      }
    })

    then('throws an error with "stream not found" message', async () => {
      expect(responseError).toBeDefined()
      expect(responseError.response.data).toEqual(mockedResponse.response.data)
    })
  })

  test('Subscribe to an existing stream using other API Endpoint', ({ given, when, then }) => {
    let accountId
    let streamName
    let response
    const mockedResponse = {
      data: {
        wsUrl: 'wss://live-west.millicast.com/ws/v2/sub/12345',
        urls: ['wss://live-west.millicast.com/ws/v2/sub/12345'],
        jwt: dummyToken,
        streamAccountId: 'Existing_accountId',
      },
    }
    given('I have an existing stream name, accountId and no token', async () => {
      accountId = 'Existing_accountId'
      streamName = 'Existing_stream_name'
      Director.setEndpoint('https://director-dev.millicast.com')
    })

    when('I request a connection path to Director API', async () => {
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse))
      const options = { streamName, streamAccountId: accountId }
      response = await Director.getSubscriber(options)
    })

    then('I get the subscriber connection path', async () => {
      expect(fetch).toBeCalledWith(
        expect.stringContaining('https://director-dev.millicast.com'),
        expect.any(Object)
      )
      expect(response).toBeDefined()
      expect(response).toEqual(expect.objectContaining(mockedResponse.data))
    })
  })

  test('Subscribe to an existing unrestricted stream, valid accountId, no token and options as object', ({
    given,
    when,
    then,
  }) => {
    let accountId
    let streamName
    let response
    const mockedResponse = {
      data: {
        wsUrl: 'wss://live-west.millicast.com/ws/v2/sub/12345',
        urls: ['wss://live-west.millicast.com/ws/v2/sub/12345'],
        jwt: dummyToken,
        streamAccountId: 'Existing_accountId',
      },
    }
    given('I have an existing stream name, accountId and no token', async () => {
      accountId = 'Existing_accountId'
      streamName = 'Existing_stream_name'
    })

    when('I request a connection path to Director API using options object', async () => {
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse))
      const options = { streamName, streamAccountId: accountId }
      response = await Director.getSubscriber(options)
    })

    then('I get the subscriber connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(expect.objectContaining(mockedResponse.data))
    })
  })

  test('Subscribe to an existing stream, valid accountId, no token and custom live websocket domain', ({
    given,
    when,
    then,
  }) => {
    let accountId
    let streamName
    let response
    const mockedResponse = {
      data: {
        wsUrl: 'wss://live-west.millicast.com/ws/v2/sub/12345',
        urls: ['wss://test.com/ws/v2/sub/12345'],
        jwt: dummyToken,
        streamAccountId: 'Existing_accountId',
      },
    }
    given('I have an existing stream name, accountId and no token', async () => {
      accountId = 'Existing_accountId'
      streamName = 'Existing_stream_name'
    })

    when('I set a custom live websocket domain and I request a connection path to Director API', async () => {
      Director.setLiveDomain('test.com')
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse))
      const options = { streamName, streamAccountId: accountId }
      response = await Director.getSubscriber(options)
    })

    then('I get the subscriber connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(expect.objectContaining(mockedResponse.data))
    })
  })
})
