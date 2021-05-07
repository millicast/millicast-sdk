import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastView from '../../../src/MillicastView'
import MillicastWebRTC from '../../../src/MillicastWebRTC'
import MillicastSignaling from '../../../src/MillicastSignaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'

const feature = loadFeature('../MillicastView.feature', { loadRelativePath: true, errors: true })

jest.mock('../../../src/MillicastSignaling')

const subscriberData = {
  urls: [
    'ws://localhost:8080'
  ],
  jwt: 'this-is-a-jwt-dummy-token'
}

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
      expectError.toThrow('Stream Name is required to construct a viewer.')
    })
  })

  test('Subscribe to stream', ({ given, when, then }) => {
    let viewer

    given('an instance of MillicastViewer', async () => {
      viewer = new MillicastView('streamName')
    })

    when('I subscribe to a stream with a connection path', async () => {
      await viewer.connect({ subscriberData })
    })

    then('peer connection state is connected', async () => {
      expect(viewer.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })
  })

  test('Connect subscriber without connection path', ({ given, when, then }) => {
    let viewer
    let expectError

    given('an instance of MillicastViewer', async () => {
      viewer = new MillicastView('streamName')
    })

    when('I connect to stream without a connection path', async () => {
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
      viewer = new MillicastView('streamName')
      await viewer.connect({ subscriberData })
    })

    when('I connect again to the stream', async () => {
      expectError = expect(() => viewer.connect({ subscriberData }))
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Viewer currently subscribed')
    })
  })

  test('Stop subscription', ({ given, when, then }) => {
    const viewer = new MillicastView('streamName')
    let signaling

    given('I am subscribed to a stream', async () => {
      jest.spyOn(MillicastSignaling.prototype, 'subscribe').mockReturnValue('sdp')
      await viewer.connect({ subscriberData })
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
    const viewer = new MillicastView('streamName')

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
    const viewer = new MillicastView('streamName')
    let result

    given('I am subscribed to a stream', async () => {
      jest.spyOn(MillicastSignaling.prototype, 'subscribe').mockReturnValue('sdp')
      await viewer.connect({ subscriberData })
    })

    when('I check if subscription is active', async () => {
      result = viewer.isActive()
    })

    then('returns true', async () => {
      expect(result).toBeTruthy()
    })
  })

  test('Check status of inactive subscription', ({ given, when, then }) => {
    const viewer = new MillicastView('streamName')
    let result

    given('I am not subscribed to a stream', () => null)

    when('I check if subscription is active', async () => {
      result = viewer.isActive()
    })

    then('returns false', async () => {
      expect(result).toBeFalsy()
    })
  })
})
