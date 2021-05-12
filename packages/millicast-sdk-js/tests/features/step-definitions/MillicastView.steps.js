import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastView from '../../../src/MillicastView'
import MillicastWebRTC from '../../../src/MillicastWebRTC'
import MillicastSignaling from '../../../src/MillicastSignaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'

const feature = loadFeature('../MillicastView.feature', { loadRelativePath: true, errors: true })

jest.mock('../../../src/MillicastSignaling')

const mockTokenGenerator = jest.fn(() => {
  return {
    urls: [
      'ws://localhost:8080'
    ],
    jwt: 'this-is-a-jwt-dummy-token'
  }
})

beforeEach(() => {
  jest.restoreAllMocks()
  jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
})

defineFeature(feature, test => {
  test('Instance viewer without streamName', ({ given, when, then }) => {
    let expectError

    given('no stream name', () => null)

    when('I instance a MillicastViewer', async () => {
      expectError = expect(() => new MillicastView())
    })

    then('throws an error', async () => {
      expectError.toThrow(Error)
      expectError.toThrow('Stream Name is required to construct this module.')
    })
  })

  test('Instance viewer without tokenGenerator', ({ given, when, then }) => {
    let expectError

    given('no token generator', () => null)

    when('I instance a MillicastViewer', async () => {
      expectError = expect(() => new MillicastView('streamName'))
    })

    then('throws an error', async () => {
      expectError.toThrow(Error)
      expectError.toThrow('Token generator is required to construct this module.')
    })
  })

  test('Subscribe to stream', ({ given, when, then }) => {
    let viewer

    given('an instance of MillicastViewer', async () => {
      viewer = new MillicastView('streamName', mockTokenGenerator)
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

    when('I instance a MillicastViewer with a token generator without connection path', async () => {
      const mockErrorTokenGenerator = () => Promise.resolve(null)
      viewer = new MillicastView('streamName', mockErrorTokenGenerator)

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

    given('an instance of MillicastViewer already connected', async () => {
      jest.spyOn(MillicastSignaling.prototype, 'subscribe').mockReturnValue('sdp')
      viewer = new MillicastView('streamName', mockTokenGenerator)
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
    const viewer = new MillicastView('streamName', mockTokenGenerator)
    let signaling

    given('I am subscribed to a stream', async () => {
      jest.spyOn(MillicastSignaling.prototype, 'subscribe').mockReturnValue('sdp')
      await viewer.connect()
      signaling = viewer.millicastSignaling
    })

    when('I stop the subscription', async () => {
      viewer.stop()
    })

    then('peer connection and WebSocket are null', async () => {
      expect(viewer.webRTCPeer.peer).toBeNull()
      expect(signaling.close.mock.calls.length).toBe(1)
      expect(viewer.millicastSignaling).toBeNull()
    })
  })

  test('Stop inactive subscription', ({ given, when, then }) => {
    const viewer = new MillicastView('streamName', mockTokenGenerator)

    given('I am not connected to a stream', () => null)

    when('I stop the subscription', async () => {
      viewer.stop()
    })

    then('peer connection and WebSocket are null', async () => {
      expect(viewer.webRTCPeer.peer).toBeNull()
      expect(viewer.millicastSignaling).toBeNull()
    })
  })

  test('Check status of active subscription', ({ given, when, then }) => {
    const viewer = new MillicastView('streamName', mockTokenGenerator)
    let result

    given('I am subscribed to a stream', async () => {
      jest.spyOn(MillicastSignaling.prototype, 'subscribe').mockReturnValue('sdp')
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
    const viewer = new MillicastView('streamName', mockTokenGenerator)
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

    given('an instance of MillicastViewer with invalid token generator', async () => {
      const errorTokenGenerator = jest.fn(() => { throw new Error('Error getting token') })
      viewer = new MillicastView('streamName', errorTokenGenerator)
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
