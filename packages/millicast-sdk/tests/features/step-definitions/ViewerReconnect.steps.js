import { loadFeature, defineFeature } from 'jest-cucumber'
import { webRTCEvents } from '../../../src/PeerConnection'
import Signaling, { signalingEvents } from '../../../src/Signaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'

const feature = loadFeature('../ViewerReconnection.feature', { loadRelativePath: true, errors: true })
let View

jest.useFakeTimers()

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
  jest.clearAllTimers()
  jest.spyOn(Signaling.prototype, 'connect').mockImplementation(jest.fn)
  jest.spyOn(Signaling.prototype, 'subscribe').mockResolvedValue('SDP')
  jest.isolateModules(() => {
    View = require('../../../src/View').default
  })
})

defineFeature(feature, test => {
  test('Reconnection when peer has an error', ({ given, when, then }) => {
    let viewer

    given('an instance of Viewer with reconnection enabled', async () => {
      viewer = new View('streamName', mockTokenGenerator, null, true)
      jest.spyOn(viewer, 'reconnect').mockImplementation(jest.fn)
      await viewer.connect()
    })

    when('peer has an error', () => {
      viewer.webRTCPeer.emit(webRTCEvents.connectionStateChange, 'failed')
    })

    then('reconnection is called', async () => {
      expect(viewer.reconnect).toBeCalledTimes(1)
    })
  })

  test('No reconnection when peer has not an error', ({ given, when, then }) => {
    let viewer

    given('an instance of Viewer with reconnection enabled', async () => {
      viewer = new View('streamName', mockTokenGenerator, null, true)
      jest.spyOn(viewer, 'reconnect').mockImplementation(jest.fn)
      await viewer.connect()
    })

    when('peer change status to connected', () => {
      viewer.webRTCPeer.emit(webRTCEvents.connectionStateChange, 'connected')
    })

    then('reconnection is not called', async () => {
      expect(viewer.reconnect).not.toHaveBeenCalled()
    })
  })

  test('Reconnection when signaling has an error', ({ given, when, then }) => {
    let viewer

    given('an instance of Viewer with reconnection enabled', async () => {
      viewer = new View('streamName', mockTokenGenerator, null, true)
      jest.spyOn(viewer, 'reconnect').mockImplementation(jest.fn)
      await viewer.connect()
    })

    when('signaling has an error', () => {
      viewer.signaling.emit(signalingEvents.connectionError, 'webSocketLocation')
    })

    then('reconnection is called', async () => {
      expect(viewer.reconnect).toBeCalledTimes(1)
    })
  })

  test('No reconnect when signaling has an error and reconnection is already being executed', ({ given, when, then }) => {
    let viewer

    given('an instance of Viewer with reconnection enabled', async () => {
      viewer = new View('streamName', mockTokenGenerator, null, true)
      jest.spyOn(viewer, 'reconnect').mockImplementation(() => {
        viewer.firstReconnection = false
        viewer.alreadyDisconnected = true
      })
      await viewer.connect()
    })

    when('reconnect was called and signaling has an error', () => {
      viewer.reconnect()
      expect(viewer.reconnect).toBeCalledTimes(1)
      viewer.signaling.emit(signalingEvents.connectionError, 'webSocketLocation')
    })

    then('reconnection is not called', async () => {
      expect(viewer.reconnect).toBeCalledTimes(1)
    })
  })

  test('Reconnection disabled when peer has an error', ({ given, when, then }) => {
    let viewer

    given('an instance of Viewer with reconnection disabled', async () => {
      viewer = new View('streamName', mockTokenGenerator, null, false)
      jest.spyOn(viewer, 'reconnect').mockImplementation(jest.fn)
      await viewer.connect()
    })

    when('peer has an error', () => {
      viewer.webRTCPeer.emit(webRTCEvents.connectionStateChange, 'failed')
    })

    then('reconnection is not called', async () => {
      expect(viewer.reconnect).not.toHaveBeenCalled()
    })
  })

  test('Reconnection when peer has a disconnection', ({ given, when, then }) => {
    let viewer

    given('an instance of Viewer with reconnection enabled', async () => {
      viewer = new View('streamName', mockTokenGenerator, null, true)
      jest.spyOn(viewer, 'reconnect').mockImplementation(jest.fn)
      await viewer.connect()
    })

    when('peer has a disconnection', () => {
      viewer.webRTCPeer.emit(webRTCEvents.connectionStateChange, 'disconnected')
    })

    then('waits and call reconnection', async () => {
      expect(setTimeout).toHaveBeenCalledTimes(1)
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1500)
      jest.runOnlyPendingTimers()
      expect(viewer.reconnect).toHaveBeenCalled()
    })
  })

  test('Reconnection interval when peer has an error', ({ given, when, then }) => {
    let viewer
    const reconnectHandler = jest.fn()
    const errorMessage = 'Error has ocurred'

    given('an instance of Viewer with reconnection enabled and peer with error', async () => {
      viewer = new View('streamName', mockTokenGenerator, null, true)
      viewer.on('reconnect', reconnectHandler)
      await viewer.connect()
      viewer.webRTCPeer.peer.connectionState = 'failed'
      jest.spyOn(viewer, 'isActive').mockImplementation(() => { return false })
    })

    when('reconnection is called and fails', () => {
      jest.spyOn(viewer, 'connect').mockImplementation(() => { viewer.stopReconnection = false; throw new Error(errorMessage) })
      viewer.reconnect({ error: new Error(errorMessage) })
    })

    then('reconnection is called again in increments of 2 seconds until 32 seconds', async () => {
      let interval = 2000
      for (let i = 1; i <= 5; i++) {
        expect(setTimeout).toHaveBeenCalledTimes(i)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), interval)
        expect(reconnectHandler).toHaveBeenCalledTimes(i)
        expect(reconnectHandler).toHaveBeenLastCalledWith({ timeout: interval, error: new Error(errorMessage) })
        jest.runOnlyPendingTimers()
        interval = interval * 2
      }
      expect(setTimeout).toHaveBeenCalledTimes(6)
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 32000)
      expect(reconnectHandler).toHaveBeenCalledTimes(6)
      expect(reconnectHandler).toHaveBeenLastCalledWith({ timeout: 32000, error: new Error(errorMessage) })
      jest.runOnlyPendingTimers()
      expect(viewer.connect).toBeCalledTimes(7)
    })
  })

  test('Reconnection when peer has recover from error', ({ given, when, then }) => {
    let viewer

    given('an instance of Viewer with reconnection enabled', async () => {
      viewer = new View('streamName', mockTokenGenerator, null, true)
      await viewer.connect()
    })

    when('reconnection is called and peer is currently connected', () => {
      viewer.webRTCPeer.peer.connectionState = 'connected'
      viewer.reconnect()
    })

    then('reconnection is not called again', async () => {
      expect(setTimeout).not.toHaveBeenCalled()
    })
  })

  test('Reconnection and peer has recover from error', ({ given, when, then }) => {
    let viewer

    given('an instance of Viewer with reconnection enabled', async () => {
      viewer = new View('streamName', mockTokenGenerator, null, true)
      await viewer.connect()
    })

    when('reconnection is called and peer is inactive', () => {
      jest.spyOn(viewer, 'isActive').mockImplementation(() => { return false })
      jest.spyOn(viewer, 'connect').mockImplementation(jest.fn)
      viewer.reconnect()
    })

    then('peer reconnects and reconnection is not called again', async () => {
      expect(setTimeout).not.toHaveBeenCalled()
    })
  })
})
