import { loadFeature, defineFeature } from 'jest-cucumber'
import WS from 'jest-websocket-mock'
import { eventsLocation, recordSeparator } from '../../../src/utils/EventSubscriber'

let StreamEvents
beforeEach(() => {
  jest.isolateModules(() => {
    StreamEvents = require('../../../src/StreamEvents').default
  })
})

const feature = loadFeature('../SubscribeOnUserCountEvent.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  let server = null
  const handler = jest.fn()

  beforeEach(async () => {
    server = new WS(eventsLocation)
  })

  afterEach(async () => {
    WS.clean()
    server = null
  })

  test('Creating new StreamEvents', ({ given, when, then }) => {
    let streamEvents

    given('I want to create a new StreamEvents instance', () => {
      server.on('connection', () => server.send(`{}${recordSeparator}`))
    })

    when('I init a new StreamEvents instance', async () => {
      streamEvents = await StreamEvents.init()
    })

    then('the connection handshake is completed', () => {
      expect(streamEvents).toBeDefined()
      expect(streamEvents.eventSubscriber).toBeDefined()
      expect(streamEvents.eventSubscriber.webSocket.readyState).toBe(WebSocket.OPEN)
    })
  })

  test('Error creating new StreamEvents', ({ given, when, then }) => {
    let errorMessage

    given('I want to create a new StreamEvents instance', () => {
      server.on('connection', () => server.send(`{"error":"Handshake was canceled."}${recordSeparator}`))
    })

    when('I init handshake and server responds with error', async () => {
      try {
        await StreamEvents.init()
      } catch (error) {
        errorMessage = error
      }
    })

    then('throws connection timeout error', () => {
      expect(errorMessage.message).toBe('Handshake was canceled.')
    })
  })

  test('Subscribe to onUserCount event', ({ given, when, then }) => {
    let accountId
    let streamName
    let streamEvents

    given('an instanced StreamEvents and existing accountId and streamName', async () => {
      accountId = 'AccountID'
      streamName = 'StreamName'
      server.on('connection', () => server.send(`{}${recordSeparator}`))
      streamEvents = await StreamEvents.init()
    })

    when('I subscribe to onUserCount event', () => {
      streamEvents.onUserCount(accountId, streamName, handler)
      server.send(`{"type":1,"target":"SubscribeViewerCountResponse","arguments":[{"streamId":"${accountId}/${streamName}","count":1}]}${recordSeparator}`)
    })

    then('callback with count result is executed', () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith({ streamId: `${accountId}/${streamName}`, count: 1 })
    })
  })

  test('Subscribe to two onUserCount events', ({ given, when, then }) => {
    const secondHandler = jest.fn()
    let accountId
    let streamNameOne
    let streamNameTwo
    let streamEvents

    given('an instanced StreamEvents and existing accountId and two streamNames', async () => {
      accountId = 'AccountID'
      streamNameOne = 'StreamNameOne'
      streamNameTwo = 'StreamNameTwo'
      server.on('connection', () => server.send(`{}${recordSeparator}`))
      streamEvents = await StreamEvents.init()
    })

    when('I subscribe to onUserCount event for both streamNames', () => {
      streamEvents.onUserCount(accountId, streamNameOne, handler)
      streamEvents.onUserCount(accountId, streamNameTwo, secondHandler)
      server.send(`{"type":1,"target":"SubscribeViewerCountResponse","arguments":[{"streamId":"${accountId}/${streamNameTwo}","count":1}]}${recordSeparator}`)
      server.send(`{"type":1,"target":"SubscribeViewerCountResponse","arguments":[{"streamId":"${accountId}/${streamNameOne}","count":0}]}${recordSeparator}`)
    })

    then('both callbacks with their count results is executed', () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith({ streamId: `${accountId}/${streamNameOne}`, count: 0 })
      expect(secondHandler).toBeCalledTimes(1)
      expect(secondHandler).toBeCalledWith({ streamId: `${accountId}/${streamNameTwo}`, count: 1 })
    })
  })

  test('Receive ping from user count event', ({ given, when, then }) => {
    let accountId
    let streamName
    let streamEvents

    given('I am subscribed to onUserCount with valid accountId and streamName', async () => {
      accountId = 'AccountID'
      streamName = 'StreamName'
      server.on('connection', () => server.send(`{}${recordSeparator}`))
      streamEvents = await StreamEvents.init()
    })

    when('server sends ping data', () => {
      streamEvents.onUserCount(accountId, streamName, handler)
      server.send(`{"type":6}${recordSeparator}`)
    })

    then('callback is not executed', () => {
      expect(handler).not.toHaveBeenCalled()
    })
  })

  test('Receive other target from server', ({ given, when, then }) => {
    const target = 'CustomTargetResponse'
    let accountId
    let streamName

    given('I am subscribed to onUserCount with valid accountId and streamName', async () => {
      accountId = 'AccountID'
      streamName = 'StreamName'
      server.on('connection', () => server.send(`{}${recordSeparator}`))
      const streamEvents = await StreamEvents.init()
      streamEvents.onUserCount(accountId, streamName, handler)
    })

    when('server sends other target', () => {
      server.send(`{"type":1,"target":"${target}","arguments":[{"streamId":"${accountId}/${streamName}"}]}${recordSeparator}`)
    })

    then('callback is not executed', () => {
      expect(handler).not.toHaveBeenCalled()
    })
  })

  test('Receive user count from different streamId', ({ given, when, then }) => {
    let accountId
    let streamName

    given('I am subscribed to onUserCount with valid accountId and streamName', async () => {
      accountId = 'AccountID'
      streamName = 'StreamName'
      server.on('connection', () => server.send(`{}${recordSeparator}`))
      const streamEvents = await StreamEvents.init()
      streamEvents.onUserCount(accountId, streamName, handler)
    })

    when('server sends user count from other streamName', () => {
      server.send(`{"type":1,"target":"SubscribeViewerCountResponse","arguments":[{"streamId":"${accountId}/OtherStreamName","count":1}]}${recordSeparator}`)
    })

    then('callback is not executed', () => {
      expect(handler).not.toHaveBeenCalled()
    })
  })

  test('Subscribe to onUserCountEvent with unexisting accountId and streamName', ({ given, when, then }) => {
    let accountId
    let streamName
    let streamEvents

    given('an instanced StreamEvents and unexisting accountId and streamName', async () => {
      accountId = 'UnexistingAccountID'
      streamName = 'UnexistingStreamName'
      server.on('connection', () => server.send(`{}${recordSeparator}`))
      streamEvents = await StreamEvents.init()
    })

    when('I subscribe to onUserCount event', () => {
      streamEvents.onUserCount(accountId, streamName, handler)
    })

    then('callback is not executed', () => {
      expect(handler).not.toHaveBeenCalled()
    })
  })

  test('Subscribe to onUserCount without init StreamEvents instance', ({ given, when, then }) => {
    let streamEvents
    let errorMessage

    given('a StreamEvents instance without init and existing accountId and streamName', () => {
      streamEvents = new StreamEvents()
    })

    when('I subscribe to onUserCount event', () => {
      try {
        streamEvents.onUserCount('AccountId', 'StreamName', handler)
      } catch (error) {
        errorMessage = error
      }
    })

    then('throw a not initialized error', () => {
      expect(errorMessage.message).toBe('You need to initialize stream event with StreamEvents.init()')
    })
  })

  test('Error getting view count from onUserCount event', ({ given, when, then }) => {
    let accountId
    let streamName

    given('an already subscribed StreamEvents instance', async () => {
      accountId = 'AccountID'
      streamName = 'StreamName'
      server.on('connection', () => server.send(`{}${recordSeparator}`))
      const streamEvents = await StreamEvents.init()
      streamEvents.onUserCount(accountId, streamName, handler)
    })

    when('an error is returned by server', () => {
      server.send(`{"type":3,"invocationId":0,"error":"An unexpected error occurred invoking 'SubscribeViewerCount' on the server."}${recordSeparator}`)
    })

    then('callback with error result is executed', () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith({ error: 'An unexpected error occurred invoking \'SubscribeViewerCount\' on the server.', streamId: `${accountId}/${streamName}` })
    })
  })

  test('Receive user count error from different streamId', ({ given, when, then }) => {
    let accountId
    let streamName

    given('I am subscribed to onUserCount with valid accountId and streamName', async () => {
      accountId = 'AccountID'
      streamName = 'StreamName'
      server.on('connection', () => server.send(`{}${recordSeparator}`))
      const streamEvents = await StreamEvents.init()
      streamEvents.onUserCount(accountId, streamName, handler)
    })

    when('server sends error from other streamName', () => {
      server.send(`{"type":3,"invocationId":123456,"error":"An unexpected error occurred invoking 'SubscribeViewerCount' on the server."}${recordSeparator}`)
    })

    then('callback is not executed', () => {
      expect(handler).not.toHaveBeenCalled()
    })
  })

  test('Close existing server connection', ({ given, when, then }) => {
    let streamEvents

    given('I am connected to server', async () => {
      server.on('connection', () => server.send(`{}${recordSeparator}`))
      streamEvents = await StreamEvents.init()
    })

    when('I want to close connection', () => {
      streamEvents.stop()
    })

    then('the connection closes', async () => {
      await server.closed
      expect(streamEvents.eventSubscriber.webSocket).toBeNull()
    })
  })

  test('Force connection to server', ({ given, when, then }) => {
    let streamEvents
    let currentWebSocket

    given('I am connected to server', async () => {
      server.on('connection', () => server.send(`{}${recordSeparator}`))
      streamEvents = await StreamEvents.init()
      currentWebSocket = streamEvents.eventSubscriber.webSocket
    })

    when('I want to reconnect', async () => {
      await streamEvents.eventSubscriber.initializeHandshake()
    })

    then('reconnection is ignored', () => {
      expect(currentWebSocket).toMatchObject(streamEvents.eventSubscriber.webSocket)
    })
  })
})
