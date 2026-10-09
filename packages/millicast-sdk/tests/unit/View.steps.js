import { loadFeature, defineFeature } from 'jest-cucumber'
import View from '../../src/View'
import Signaling from '../../src/Signaling'
import TransformWorker from '../../src/workers/TransformWorker.worker.js'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'

const feature = loadFeature('../features/View.feature', { loadRelativePath: true, errors: true })

jest.mock('../../src/Signaling')

jest.mock('../../src/workers/TransformWorker.worker.js', () =>
  jest.fn(() => ({
    postMessage: jest.fn(),
    terminate: jest.fn()
  }))
)

jest.mock('../../src/drm/rtc-drm-transform.js', () => ({
  rtcDrmConfigure: jest.fn(),
  rtcDrmOnTrack: jest.fn(),
  rtcDrmEnvironments: jest.fn(),
  rtcDrmFeedFrame: jest.fn()
}))

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

const createDeferred = () => {
  const deferred = {}
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  return deferred
}

const mockTokenGenerator = jest.fn(() => {
  return {
    urls: [
      'ws://localhost:8080'
    ],
    jwt: 'this-is-a-jwt-dummy-token'
  }
})

defineFeature(feature, test => {
  beforeEach(() => {
    jest.spyOn(Signaling.prototype, 'subscribe').mockReturnValue('sdp')
  })

  test('Instance viewer without tokenGenerator', ({ given, when, then }) => {
    let expectError

    given('no token generator', () => null)

    when('I instance a View', async () => {
      expectError = expect(() => new View(undefined))
    })

    then('throws an error', async () => {
      expectError.toThrow(Error)
      expectError.toThrow('Token generator is required to construct this module.')
    })
  })

  test('Subscribe to stream', ({ given, when, then }) => {
    let viewer

    given('an instance of View', async () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I subscribe to a stream with a connection path', async () => {
      await viewer.connect()
    })

    then('peer connection state is connected', async () => {
      expect(viewer.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })
  })

  test('Connect subscriber without connection path', ({ given, when, then }) => {
    let viewer
    let expectError

    given('I want to subscribe', async () => {})

    when('I instance a View with a token generator without connection path', async () => {
      const mockErrorTokenGenerator = () => Promise.resolve(null)
      viewer = new View(undefined, mockErrorTokenGenerator)

      expectError = expect(viewer.connect())
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Subscriber data required')
    })
  })

  test('Connect subscriber already connected', ({ given, when, then }) => {
    let viewer
    let expectError

    given('an instance of View already connected', async () => {
      viewer = new View(undefined, mockTokenGenerator)
      await viewer.connect()
    })

    when('I connect again to the stream', async () => {
      expectError = expect(viewer.connect())
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Viewer currently subscribed')
    })
  })

  test('Stop subscription', ({ given, when, then }) => {
    const viewer = new View(undefined, mockTokenGenerator)
    let signaling

    given('I am subscribed to a stream', async () => {
      await viewer.connect()
      signaling = viewer.signaling
    })

    when('I stop the subscription', async () => {
      viewer.stop()
    })

    then('peer connection and WebSocket are null', async () => {
      expect(viewer.webRTCPeer.peer).toBeNull()
      expect(signaling.close.mock.calls.length).toBe(1)
      expect(viewer.signaling).toBeNull()
    })
  })

  test('Stop inactive subscription', ({ given, when, then }) => {
    const viewer = new View(undefined, mockTokenGenerator)

    given('I am not connected to a stream', () => null)

    when('I stop the subscription', async () => {
      viewer.stop()
    })

    then('peer connection and WebSocket are null', async () => {
      expect(viewer.webRTCPeer.peer).toBeNull()
      expect(viewer.signaling).toBeNull()
    })
  })

  test('Check status of active subscription', ({ given, when, then }) => {
    const viewer = new View(undefined, mockTokenGenerator)
    let result

    given('I am subscribed to a stream', async () => {
      await viewer.connect()
    })

    when('I check if subscription is active', async () => {
      result = viewer.isActive()
    })

    then('returns true', async () => {
      expect(result).toBeTruthy()
    })
  })

  test('Check status of inactive subscription', ({ given, when, then }) => {
    const viewer = new View(undefined, mockTokenGenerator)
    let result

    given('I am not subscribed to a stream', () => null)

    when('I check if subscription is active', async () => {
      result = viewer.isActive()
    })

    then('returns false', async () => {
      expect(result).toBeFalsy()
    })
  })

  test('Subscribe to stream with invalid token generator', ({ given, when, then }) => {
    let viewer
    let expectError

    given('an instance of View with invalid token generator', async () => {
      const errorTokenGenerator = jest.fn(() => { throw new Error('Error getting token') })
      viewer = new View(undefined, errorTokenGenerator)
    })

    when('I subscribe to a stream', async () => {
      expectError = expect(viewer.connect())
    })

    then('throws token generator error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Error getting token')
    })
  })

  test('Connect subscriber while a connection is in progress', ({ given, when, then }) => {
    let viewer
    let tokenGenerator
    let token
    let firstConnect
    let expectError

    given('an instance of View with a connection in progress', async () => {
      token = createDeferred()
      tokenGenerator = jest.fn(() => token.promise)
      viewer = new View(undefined, tokenGenerator)
      firstConnect = viewer.connect()
    })

    when('I connect again to the stream', async () => {
      expectError = expect(viewer.connect())
    })

    then('throws a connection in progress error and only one token is requested', async () => {
      await expectError.rejects.toThrow('Viewer connection already in progress')
      expect(viewer.isConnecting()).toBeTruthy()
      token.resolve(mockTokenGenerator())
      await firstConnect
      expect(tokenGenerator).toHaveBeenCalledTimes(1)
      expect(viewer.isActive()).toBeTruthy()
    })
  })

  test('Connect subscriber while the peer connection is still connecting', ({ given, when, then }) => {
    let viewer
    let expectError

    given('an instance of View whose peer connection is still connecting', async () => {
      viewer = new View(undefined, mockTokenGenerator)
      await viewer.connect()
      viewer.webRTCPeer.peer.connectionState = 'connecting'
    })

    when('I connect again to the stream', async () => {
      expectError = expect(viewer.connect())
    })

    then('throws a connection in progress error', async () => {
      await expectError.rejects.toThrow('Viewer connection already in progress')
    })
  })

  test('Stop subscription while requesting a token', ({ given, when, then, and }) => {
    let viewer
    let token
    let pendingConnect
    let signalingInstances

    given('an instance of View waiting for a token', async () => {
      token = createDeferred()
      viewer = new View(undefined, jest.fn(() => token.promise))
      signalingInstances = Signaling.mock.instances.length
      pendingConnect = viewer.connect()
    })

    when('I stop the subscription', async () => {
      viewer.stop()
    })

    then('the connection is cancelled without creating a signaling connection', async () => {
      await expect(pendingConnect).rejects.toMatchObject({ name: 'AbortError' })
      expect(viewer.isConnecting()).toBeFalsy()
      token.resolve(mockTokenGenerator())
      await flushPromises()
      expect(Signaling.mock.instances.length).toBe(signalingInstances)
      expect(viewer.signaling).toBeNull()
      expect(viewer.webRTCPeer.peer).toBeNull()
    })

    and('I can connect again', async () => {
      viewer.tokenGenerator = mockTokenGenerator
      await viewer.connect()
      expect(viewer.isActive()).toBeTruthy()
    })
  })

  test('Stop subscription while subscribing', ({ given, when, then, and }) => {
    let viewer
    let pendingConnect
    let signaling

    given('an instance of View waiting for the subscribe response', async () => {
      jest.spyOn(Signaling.prototype, 'subscribe').mockReturnValueOnce(new Promise(() => {}))
      viewer = new View(undefined, mockTokenGenerator)
      pendingConnect = viewer.connect()
      await flushPromises()
      signaling = viewer.signaling
      expect(signaling.subscribe).toHaveBeenCalled()
    })

    when('I stop the subscription', async () => {
      viewer.stop()
    })

    then('the connection is cancelled and the WebSocket is closed', async () => {
      await expect(pendingConnect).rejects.toMatchObject({ name: 'AbortError' })
      expect(signaling.close).toHaveBeenCalled()
      expect(viewer.signaling).toBeNull()
      expect(viewer.webRTCPeer.peer).toBeNull()
    })

    and('I can connect again', async () => {
      await viewer.connect()
      expect(viewer.isActive()).toBeTruthy()
      expect(viewer.signaling).not.toBe(signaling)
    })
  })

  test('Subscribe with metadata fails after the worker is created', ({ given, when, then }) => {
    let viewer
    let pendingConnect

    given('an instance of View whose subscribe request fails', async () => {
      jest.spyOn(Signaling.prototype, 'subscribe').mockRejectedValueOnce(new Error('Subscribe failed'))
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I subscribe to a stream with metadata', async () => {
      pendingConnect = viewer.connect({ metadata: true })
    })

    then('the connection fails and the metadata worker is terminated', async () => {
      await expect(pendingConnect).rejects.toThrow('Subscribe failed')
      expect(TransformWorker).toHaveBeenCalledTimes(1)
      expect(TransformWorker.mock.results[0].value.terminate).toHaveBeenCalled()
      expect(viewer.worker).toBeNull()
    })
  })

  test('Subscribe again with metadata to an active stream', ({ given, when, then }) => {
    let viewer
    let worker
    let pendingConnect

    given('an instance of View already connected with metadata', async () => {
      viewer = new View(undefined, mockTokenGenerator)
      await viewer.connect({ metadata: true })
      worker = viewer.worker
    })

    when('I connect again to the stream with metadata', async () => {
      pendingConnect = viewer.connect({ metadata: true })
    })

    then('the connection fails and the metadata worker is kept', async () => {
      await expect(pendingConnect).rejects.toThrow('Viewer currently subscribed')
      expect(worker.terminate).not.toHaveBeenCalled()
      expect(viewer.worker).toBe(worker)
    })
  })
})
