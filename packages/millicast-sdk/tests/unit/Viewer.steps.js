import { loadFeature, defineFeature } from 'jest-cucumber'
import { Viewer } from '../../src/Viewer'
import Signaling from '../../src/Signaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'

const feature = loadFeature('../features/Viewer.feature', { loadRelativePath: true, errors: true })

jest.mock('../../src/Signaling')

jest.mock('../../src/workers/TransformWorker.worker.ts', () =>
  jest.fn(() => ({
    postMessage: jest.fn(),
    terminate: jest.fn(),
  }))
)


jest.mock('../../src/drm/rtc-drm-transform.min.js', () => ({
  rtcDrmConfigure: jest.fn(),
  rtcDrmOnTrack: jest.fn(),
  rtcDrmEnvironments: jest.fn(),
  rtcDrmFeedFrame: jest.fn(),
}))

const mockTokenGenerator = jest.fn(() => {
  return {
    urls: ['ws://localhost:8080'],
    jwt: 'this-is-a-jwt-dummy-token',
  }
})

defineFeature(feature, (test) => {
  beforeEach(() => {
    jest.spyOn(Signaling.prototype, 'subscribe').mockReturnValue('sdp')
  })

  test('Instance viewer without stream name', ({ given, when, then }) => {
    let expectError

    given('nothing', () => {})

    when('I instance a View', async () => {
      expectError = expect(() => new Viewer({}))
    })

    then('throws an error', async () => {
      expectError.toThrow(Error)
      expectError.toThrow('The Stream Name is missing.')
    })
  })

  test('Instance viewer without stream account id', ({ given, when, then }) => {
    let expectError

    given('nothing', () => {})

    when('I instance a View', async () => {
      expectError = expect(() => new Viewer({streamName: 'streamname'}))
    })

    then('throws an error', async () => {
      expectError.toThrow(Error)
      expectError.toThrow('The Stream Account ID is missing.')
    })
  })

  test('Subscribe to stream', ({ given, when, then }) => {
    let viewer

    given('an instance of View', async () => {
      viewer = new Viewer({streamName: 'a', streamAccountId: 'b'})
      jest.spyOn(viewer, "tokenGenerator").mockImplementation(mockTokenGenerator);
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
      viewer = new Viewer({streamName: 'streamName', streamAccountId: 'streamAccountId'})
      const mockErrorTokenGenerator = () => Promise.resolve(null);
      jest.spyOn(viewer, "tokenGenerator").mockImplementation(mockErrorTokenGenerator);

      expectError = expect(async () => await viewer.connect())
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
      viewer = new Viewer({streamName: 'streamName', streamAccountId: 'streamAccountId'})
      jest.spyOn(viewer, "tokenGenerator").mockImplementation(mockTokenGenerator);
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
    const viewer = new Viewer({streamName: 'streamName', streamAccountId: 'streamAccountId'})
    jest.spyOn(viewer, "tokenGenerator").mockImplementation(mockTokenGenerator);
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
    const viewer = new Viewer({streamName: 'streamName', streamAccountId: 'streamAccountId'})
    jest.spyOn(viewer, "tokenGenerator").mockImplementation(mockTokenGenerator);

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
    const viewer = new Viewer({streamName: 'streamName', streamAccountId: 'streamAccountId'})
    jest.spyOn(viewer, "tokenGenerator").mockImplementation(mockTokenGenerator);
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
    const viewer = new Viewer({streamName: 'streamName', streamAccountId: 'streamAccountId'})
    jest.spyOn(viewer, "tokenGenerator").mockImplementation(mockTokenGenerator);
    let result

    given('I am not subscribed to a stream', () => null)

    when('I check if subscription is active', async () => {
      result = viewer.isActive()
    })

    then('returns false', async () => {
      expect(result).toBeFalsy()
    })
  })

  test('Subscribe to stream with invalid options', ({ given, when, then }) => {
    let viewer
    let expectError

    given('an instance of View with invalid options', async () => {
      viewer = new Viewer({streamName: 'streamName', streamAccountId: 'streamAccountId'})
      const errorTokenGenerator = jest.fn(() => {
        throw new Error('Error getting token')
      })
      jest.spyOn(viewer, "tokenGenerator").mockImplementation(errorTokenGenerator);
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
