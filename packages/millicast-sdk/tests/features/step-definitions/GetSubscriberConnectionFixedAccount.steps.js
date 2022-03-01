import { loadFeature, defineFeature } from 'jest-cucumber'
import mockFetchJsonReturnValue from './__mocks__/Fetch'
import Director from '../../../src/Director'
const feature = loadFeature('../GetSubscriberConnectionFixedAccount.feature', { loadRelativePath: true, errors: true })

const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJtaWxsaWNhc3QiOnt9fQ.IqT-PLLz-X7Wn7BNo-x4pFApAbMT9mmnlupR8eD9q4U'

jest.mock('../../../src/config', () => {
  return {
    __esModule: true,
    default: {
      MILLICAST_DIRECTOR_ENDPOINT: 'https://director.millicast.com',
      MILLICAST_TURN_SERVER_LOCATION: 'https://turn.millicast.com/webrtc/_turn',
      MILLICAST_EVENTS_LOCATION: 'wss://streamevents.millicast.com/ws',
      MILLICAST_FIXED_ACCOUNT_ID: 'static_accountId'
    }
  }
})

defineFeature(feature, test => {
  beforeEach(() => {
    fetch.mockClear()
    Director.setLiveDomain('')
  })

  afterEach(() => {
    jest.resetModules()
  })

  test('Subscribe to an existing stream, static accountId and no token', ({ given, when, then }) => {
    let streamName
    let response
    const mockedResponse = {
      data: {
        wsUrl: 'wss://live-west.millicast.com/ws/v2/sub/12345',
        urls: [
          'wss://test.com/ws/v2/sub/12345'
        ],
        jwt: dummyToken,
        streamAccountId: 'static_accountId'
      }
    }

    given('I have an existing stream name, no token and a static account ID configured', async () => {
      streamName = 'Existing_stream_name'
    })

    when('I set a custom live websocket domain and I request a connection path to Director API', async () => {
      Director.setLiveDomain('test.com')
      mockFetchJsonReturnValue(Promise.resolve(mockedResponse))
      response = await Director.getSubscriber(streamName)
    })

    then('I get the subscriber connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(expect.objectContaining(mockedResponse.data))
    })
  })
})
