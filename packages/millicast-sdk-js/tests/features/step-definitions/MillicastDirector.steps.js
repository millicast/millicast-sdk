import { loadFeature, defineFeature } from 'jest-cucumber'
import axios from 'axios'
import MillicastDirector from '../../../src/MillicastDirector'
const feature = loadFeature('../MillicastDirector.feature', { loadRelativePath: true, errors: true })

jest.mock('axios')

afterEach(async () => {
  axios.post.mockReset()
})

defineFeature(feature, test => {
  test('Publish with existing stream and valid token', ({ given, when, then }) => {
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
    given('i have a valid token and a existing stream name', async () => {
      token = 'Valid_token'
      streamName = 'Existing_stream_name'
    })

    when('i get the publish connection path', async () => {
      axios.post.mockResolvedValue(mockedResponse)
      response = await MillicastDirector.getPublisher(token, streamName)
    })

    then('returns the connection path', async () => {
      expect(response).toBeDefined()
      expect(response).toEqual(mockedResponse.data.data)
    })
  })

  test('Publish with unexisting stream and valid token', ({ given, when, then }) => {
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
    given('i have a valid token and a unexisting stream name', async () => {
      token = 'Valid_token'
      streamName = 'Unexisting_stream_name'
    })

    when('i get the publish connection path', async () => {
      axios.post.mockRejectedValue(mockedResponse)
      try {
        responseError = await MillicastDirector.getPublisher(token, streamName)
      } catch (error) {
        responseError = error
      }
    })

    then('throw an error saying invalid stream name', async () => {
      expect(responseError).toBeDefined()
      expect(responseError.response.data).toEqual(mockedResponse.response.data)
    })
  })

  test('Publish with existing stream and invalid token', ({ given, when, then }) => {
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
    given('i have a invalid token and a existing stream name', async () => {
      token = 'Invalid_token'
      streamName = 'Existing_stream_name'
    })

    when('i get the publish connection path', async () => {
      axios.post.mockRejectedValue(mockedResponse)
      try {
        responseError = await MillicastDirector.getPublisher(token, streamName)
      } catch (error) {
        responseError = error
      }
    })

    then('throw an error saying invalid token', async () => {
      expect(responseError).toBeDefined()
      expect(responseError.response.data).toEqual(mockedResponse.response.data)
    })
  })

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
    given('i have a existing stream name, accountId and no token', async () => {
      accountId = 'Existing_accountId'
      streamName = 'Existing_stream_name'
    })

    when('i get the subscriber connection path', async () => {
      axios.post.mockResolvedValue(mockedResponse)
      response = await MillicastDirector.getSubscriber(streamName, accountId)
    })

    then('returns the connection path', async () => {
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
    given('i have a existing stream name and valid token', async () => {
      token = 'Valid_token'
      streamName = 'Existing_stream_name'
    })

    when('i get the subscriber connection path', async () => {
      axios.post.mockResolvedValue(mockedResponse)
      response = await MillicastDirector.getSubscriber(streamName, null, token)
    })

    then('returns the connection path', async () => {
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
    given('i have a existing stream name, invalid accountId and no token', async () => {
      accountId = 'Unexisting_accountId'
      streamName = 'Existing_stream_name'
    })

    when('i get the subscriber connection path', async () => {
      axios.post.mockRejectedValue(mockedResponse)
      try {
        responseError = await MillicastDirector.getSubscriber(streamName, accountId)
      } catch (error) {
        responseError = error
      }
    })

    then('throw an error saying stream not found', async () => {
      expect(responseError).toBeDefined()
      expect(responseError.response.data).toEqual(mockedResponse.response.data)
    })
  })
})
