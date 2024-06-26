import { loadFeature, defineFeature } from 'jest-cucumber'
import View from '../../src/View'
import Signaling from '../../src/Signaling'
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
      expectError = expect(() => new View('streamName'))
    })

    then('throws an error', async () => {
      expectError.toThrow(Error)
      expectError.toThrow('Token generator is required to construct this module.')
    })
  })

  test('Subscribe to stream', ({ given, when, then }) => {
    let viewer

    given('an instance of View', async () => {
      viewer = new View('streamName', mockTokenGenerator)
    })

    when('I subscribe to a stream with a connection path', async () => {
      await viewer.connect()
    })

    then('peer connection state is connected', async () => {
      expect(viewer.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })
  })

  test('Subscribe to stream with media element', ({ given, when, then }) => {
    let viewer
    const videoElement = { srcObject: null }

    given('an instance of View with media element', async () => {
      viewer = new View('streamName', mockTokenGenerator, videoElement)
    })

    when('I subscribe to a stream with a connection path', async () => {
      await viewer.connect()
      viewer.webRTCPeer.peer.emitMockEvent('ontrack', { streams: ['new stream incoming'] })
    })

    then('peer connection state is connected', async () => {
      expect(viewer.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
      expect(videoElement.srcObject).not.toBeNull()
    })
  })

  test('Connect subscriber without connection path', ({ given, when, then }) => {
    let viewer
    let expectError

    given('I want to subscribe', async () => {})

    when('I instance a View with a token generator without connection path', async () => {
      const mockErrorTokenGenerator = () => Promise.resolve(null)
      viewer = new View('streamName', mockErrorTokenGenerator)

      expectError = expect(() => viewer.connect())
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
      viewer = new View('streamName', mockTokenGenerator)
      await viewer.connect()
    })

    when('I connect again to the stream', async () => {
      expectError = expect(() => viewer.connect())
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Viewer currently subscribed')
    })
  })

  test('Stop subscription', ({ given, when, then }) => {
    const viewer = new View('streamName', mockTokenGenerator)
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
    const viewer = new View('streamName', mockTokenGenerator)

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
    const viewer = new View('streamName', mockTokenGenerator)
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
    const viewer = new View('streamName', mockTokenGenerator)
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
      viewer = new View('streamName', errorTokenGenerator)
    })

    when('I subscribe to a stream', async () => {
      expectError = expect(() => viewer.connect())
    })

    then('throws token generator error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Error getting token')
    })
  })
})
