const { loadFeature, defineFeature } = require('jest-cucumber')
const feature = loadFeature('../MillicastDirector.feature', { loadRelativePath: true, errors: true })
const axios = require('axios').default
const millicast = require('../../../dist/millicast.cjs')
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
      axios.post.mockResolvedValue({
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
      })
      response = await millicast.MillicastDirector.getPublisher(token, streamName)
    })

    then('returns the connection path', async () => {
      console.log('Conn Path', response)
      expect(response).toBeDefined()
    })
  })
})
