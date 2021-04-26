import { loadFeature, defineFeature } from 'jest-cucumber'
import WS from 'jest-websocket-mock'
import MillicastSignaling from '../../../src/MillicastSignaling'
const feature = loadFeature('../ManageSignaling.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  const publishWebSocketLocation = 'ws://localhost:8080'
  const streamName = 'My Stream Name'
  let server = null
  let millicastSignaling = null
  const handler = jest.fn()

  beforeEach(async () => {
    server = new WS(publishWebSocketLocation, { jsonProtocol: true })
    millicastSignaling = new MillicastSignaling({
      streamName: streamName,
      url: publishWebSocketLocation
    })
  })

  afterEach(async () => {
    WS.clean()
    server = null
    millicastSignaling = null
  })

  test('Connect to existing server with no errors', ({ given, when, then }) => {
    given('I have no previous connection to server', () => null)

    when('I want to connect to server', async () => {
      millicastSignaling.on('wsConnectionSuccess', handler)
      await millicastSignaling.connect()
    })

    then('returns the WebSocket connection and fires a connectionSuccess event', async () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith({ ws: expect.any(WebSocket), tm: expect.any(Object) })
    })
  })

  test('Connect again to existing server with no errors', ({ given, when, then }) => {
    given('I have a previous connection to server', async () => {
      millicastSignaling.on('wsConnectionSuccess', handler)
      await millicastSignaling.connect()
    })

    when('I want to connect to server', async () => {
      await millicastSignaling.connect()
    })

    then('returns the WebSocket connection and fires a connectionSuccess event', () => {
      expect(handler).toBeCalledTimes(2)
      expect(handler).toBeCalledWith({ ws: expect.any(WebSocket), tm: expect.any(Object) })
    })
  })

  test('Connect to existing server with network errors', ({ given, when, then }) => {
    given('I have no previous connection to server', () => null)

    when('I want to connect to no responding server', async () => {
      server.on('connection', () => server.error())
      const millicastSignaling = new MillicastSignaling({
        streamName: streamName,
        url: publishWebSocketLocation
      })
      millicastSignaling.on('wsConnectionError', handler)
      await millicastSignaling.connect()
    })

    then('fires a connectionError event', () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith(expect.stringMatching(publishWebSocketLocation))
    })
  })

  test('Receive broadcast events from server', ({ given, when, then }) => {
    given('I am connected to server', async () => {
      millicastSignaling.on('broadcastEvent', handler)
      await millicastSignaling.connect()
    })

    when('the server send a broadcast event', () => {
      server.send({ type: 'event', name: 'active', data: { streamId: 'streamId' } })
    })

    then('fires a broadcastEvent event', () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith({ name: 'active', data: { streamId: 'streamId' }, namespace: undefined })
    })
  })

  test('Close existing server connection', ({ given, when, then }) => {
    given('I am connected to server', async () => {
      await millicastSignaling.connect()
    })

    when('I want to close connection', async () => {
      millicastSignaling.on('wsConnectionClose', handler)
      millicastSignaling.close()
    })

    then('the connection closes', async () => {
      await server.closed
      expect(handler).toBeCalledTimes(1)
      expect(millicastSignaling.webSocket).toBe(null)
    })
  })

  test('Close unexisting server connection', ({ given, when, then }) => {
    given('I am not connected to server', () => null)

    when('I want to close connection', () => {
      millicastSignaling.close()
    })

    then('websocket is not intitialized', () => {
      expect(millicastSignaling.webSocket).toBe(null)
    })
  })
})
