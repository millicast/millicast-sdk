import { loadFeature, defineFeature } from 'jest-cucumber'
import WS from 'jest-websocket-mock'
import { Signaling } from '../../src/Signaling'
import './__mocks__/MockBrowser'
import { WebSocket } from 'mock-socket'
const feature = loadFeature('../features/ManageSignaling.feature', { loadRelativePath: true, errors: true })

global.WebSocket = WebSocket

defineFeature(feature, (test) => {
  const publishWebSocketLocation = 'ws://localhost:8080'
  const streamName = 'My Stream Name'
  let server = null
  let signaling = null
  const handler = jest.fn()

  beforeEach(async () => {
    server = new WS(publishWebSocketLocation, { jsonProtocol: true })
    signaling = new Signaling({
      streamName,
      url: publishWebSocketLocation,
    })
  })

  afterEach(async () => {
    WS.clean()
    server = null
    signaling = null
  })

  test('Connect to existing server with no errors', ({ given, when, then }) => {
    given('I have no previous connection to server', () => null)

    when('I want to connect to server', async () => {
      signaling.on('wsConnectionSuccess', handler)
      await signaling.connect()
    })

    then('returns the WebSocket connection and fires a connectionSuccess event', async () => {
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ ws: expect.any(WebSocket), tm: expect.any(Object) })
    })
  })

  test('Connect again to existing server with no errors', ({ given, when, then }) => {
    given('I have a previous connection to server', async () => {
      signaling.on('wsConnectionSuccess', handler)
      await signaling.connect()
    })

    when('I want to connect to server', async () => {
      await signaling.connect()
    })

    then('returns the WebSocket connection and fires a connectionSuccess event', () => {
      expect(handler).toHaveBeenCalledTimes(2)
      expect(handler).toHaveBeenCalledWith({ ws: expect.any(WebSocket), tm: expect.any(Object) })
    })
  })

  test('Connect to existing server with network errors', ({ given, when, then }) => {
    given('I have no previous connection to server', () => null)

    when('I want to connect to no responding server', async () => {
      server.on('connection', () => server.error())
      const signaling = new Signaling({
        streamName,
        url: publishWebSocketLocation,
      })
      signaling.on('wsConnectionError', handler)
      await signaling.connect()
    })

    then('fires a connectionError event', () => {
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(expect.stringMatching(publishWebSocketLocation))
    })
  })

  const testEvent = (eventName, eventData, given, when, then) => {
    given('I am connected to server', async () => {
      signaling.on(eventName, handler);
      await signaling.connect();
    });

    when(`the server send an ${eventName} event`, () => {
      server.send({ type: 'event', name: eventName, data: eventData });
    });

    then(`fires an ${eventName} event`, () => () => {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ ...eventData, namespace: undefined });
    });
  };

  test('Receive active event from server', ({ given, when, then }) => {
    testEvent('active', { streamId: 'streamId' }, given, when, then);
  });

  test('Receive inactive event from server', ({ given, when, then }) => {
    testEvent('inactive', { streamId: 'streamId', sourceId: 'sourceId' }, given, when, then);
  });

  test('Receive viewercount event from server', ({ given, when, then }) => {
    given('I am connected to server', async () => {
      signaling.on('viewercount', handler)
      await signaling.connect()
    });

    when('the server send an viewercount event', () => {
      server.send({ type: 'event', name: 'viewercount', data: {viewercount: 123} });
    });

    then('fires an viewercount event', () => () => {
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(123)
    });
  });

  test('Receive migrate event from server', ({ given, when, then }) => {
    testEvent('migrate', {}, given, when, then);
  });

  test('Receive updated event from server', ({ given, when, then }) => {
    testEvent('updated', {}, given, when, then);
  });

  test('Receive stopped event from server', ({ given, when, then }) => {
    testEvent('stopped', {}, given, when, then);
  });

  test('Receive vad event from server', ({ given, when, then }) => {
    testEvent('vad', {}, given, when, then);
  });

  test('Receive layers event from server', ({ given, when, then }) => {
    testEvent('layers', { medias: {} }, given, when, then);
  });

  test('Close existing server connection', ({ given, when, then }) => {
    given('I am connected to server', async () => {
      await signaling.connect()
    })

    when('I want to close connection', async () => {
      signaling.on('wsConnectionClose', handler)
      signaling.close()
    })

    then('the connection closes', async () => {
      await server.closed
      expect(handler).toHaveBeenCalledTimes(1)
      expect(signaling.webSocket).toBe(null)
    })
  })

  test('Close unexisting server connection', ({ given, when, then }) => {
    given('I am not connected to server', () => null)

    when('I want to close connection', () => {
      signaling.close()
    })

    then('websocket is not intitialized', () => {
      expect(signaling.webSocket).toBe(null)
    })
  })
})
