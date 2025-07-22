import { loadFeature, defineFeature } from 'jest-cucumber'
import { mockFetchJsonReturnValue, mockFetchRejectValue } from './__mocks__/Fetch'
import { Viewer } from '../../src/Viewer'
import * as Urls from '../../src/urls'
const feature = loadFeature('../features/GetSubscriberConnectionPath.feature', {
  loadRelativePath: true,
  errors: true,
})

const dummyToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJtaWxsaWNhc3QiOnt9fQ.IqT-PLLz-X7Wn7BNo-x4pFApAbMT9mmnlupR8eD9q4U'

defineFeature(feature, (test) => {
  beforeEach(() => {
    fetch.mockClear()
    Urls.setLiveDomain('');
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
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse));

      const options = { streamName, streamAccountId: accountId };
      const viewer = new Viewer(options);
      response = await viewer.getConnectionData(options);
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
        const options = { streamName, streamAccountId: accountId };
        const viewer = new Viewer(options);
        responseError = await viewer.getConnectionData(options);
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
      accountId = 'Existing_accountId';
      streamName = 'Existing_stream_name';
      Urls.setEndpoint('https://director-dev.millicast.com');
    })

    when('I request a connection path to Director API', async () => {
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse));
      const options = { streamName, streamAccountId: accountId };
      const viewer = new Viewer(options);
      response = await viewer.getConnectionData(options);
    })

    then('I get the subscriber connection path', async () => {
      expect(fetch).toHaveBeenCalledWith(
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
      const options = { streamName, streamAccountId: accountId };
      const viewer = new Viewer(options);
      response = await viewer.getConnectionData(options);
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
      Urls.setLiveDomain('dolby.com');
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse));
      const options = { streamName, streamAccountId: accountId };
      const viewer = new Viewer(options);
      response = await viewer.getConnectionData(options);
    })

    then('I get the subscriber connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(expect.objectContaining(mockedResponse.data))
    })
  })
})
