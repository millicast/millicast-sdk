import { loadFeature, defineFeature } from 'jest-cucumber'
import { signalingEvents } from '../../src/Signaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockBrowser'

const feature = loadFeature('../features/ReconnectionEdgeCases.feature', { loadRelativePath: true, errors: true })

jest.setTimeout(30000)
jest.useFakeTimers()

let Publish
let View

const mockTokenGenerator = jest.fn(() => {
  return {
    urls: ['ws://localhost:8080'],
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJtaWxsaWNhc3QiOnt9fQ.IqT-PLLz-X7Wn7BNo-x4pFApAbMT9mmnlupR8eD9q4U'
  }
})

const mediaStream = new MediaStream([{ kind: 'video' }, { kind: 'audio' }])

jest.mock('../../src/Signaling', () => {
  const originalSignaling = jest.requireActual('../../src/Signaling')

  return {
    __esModule: true,
    ...originalSignaling,
    default: class MockSignaling extends originalSignaling.default {
      async connect () { return Promise.resolve() }
      async publish () { return Promise.resolve('SDP') }
      async subscribe () { return Promise.resolve('SDP') }
    }
  }
})

jest.mock('../../src/workers/TransformWorker.worker.ts', () =>
  jest.fn(() => ({
    postMessage: jest.fn(),
    terminate: jest.fn()
  }))
)

jest.mock('../../src/drm/rtc-drm-transform.min.js', () => ({
  default: jest.fn()
}))

beforeEach(() => {
  jest.restoreAllMocks()
  jest.clearAllTimers()
  mockTokenGenerator.mockClear()
  jest.isolateModules(() => {
    Publish = require('../../src/Publish').default
    View = require('../../src/View').default
  })
})

defineFeature(feature, test => {
  test('Publisher reconnection with token refresh', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with reconnection enabled', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, true)
      jest.spyOn(publisher, 'reconnect').mockImplementation(jest.fn)
      await publisher.connect({ mediaStream })
    })

    when('the connection fails due to signaling error', () => {
      publisher.signaling.emit(signalingEvents.connectionError)
      jest.advanceTimersByTime(2000)
    })

    then('reconnect should be triggered', () => {
      expect(publisher.reconnect).toHaveBeenCalled()
    })
  })

  test('Publisher reconnection triggered by signaling error', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with reconnection enabled', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, true)
      jest.spyOn(publisher, 'reconnect').mockImplementation(jest.fn)
      await publisher.connect({ mediaStream })
    })

    when('signaling emits connection error', () => {
      publisher.signaling.emit(signalingEvents.connectionError)
      jest.advanceTimersByTime(2000)
    })

    then('reconnect should be called', () => {
      expect(publisher.reconnect).toHaveBeenCalled()
    })
  })

  test('Publisher reconnection during stop', ({ given, when, then }) => {
    let publisher
    let reconnectSpy

    given('an instance of Publish that is reconnecting', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, true)
      await publisher.connect({ mediaStream })
      reconnectSpy = jest.spyOn(publisher, 'reconnect')
      publisher.signaling.emit(signalingEvents.connectionError)
    })

    when('stop is called during reconnection', async () => {
      await publisher.stop()
    })

    then('reconnection should be cancelled', () => {
      // After stop, no more reconnection attempts should be made
      jest.advanceTimersByTime(10000)
      const callsAfterStop = reconnectSpy.mock.calls.length
      jest.advanceTimersByTime(10000)
      expect(reconnectSpy.mock.calls.length).toBe(callsAfterStop)
    })
  })

  test('Viewer reconnection during stop', ({ given, when, then }) => {
    let viewer
    let reconnectSpy

    given('an instance of View that is reconnecting', async () => {
      viewer = new View('streamName', mockTokenGenerator, null, true)
      await viewer.connect()
      reconnectSpy = jest.spyOn(viewer, 'reconnect')
      viewer.signaling.emit(signalingEvents.connectionError)
    })

    when('stop is called during reconnection', async () => {
      await viewer.stop()
    })

    then('reconnection should be cancelled', () => {
      jest.advanceTimersByTime(10000)
      const callsAfterStop = reconnectSpy.mock.calls.length
      jest.advanceTimersByTime(10000)
      expect(reconnectSpy.mock.calls.length).toBe(callsAfterStop)
    })
  })
})
