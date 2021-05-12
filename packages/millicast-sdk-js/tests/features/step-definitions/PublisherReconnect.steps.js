import { loadFeature, defineFeature } from 'jest-cucumber'
import PeerConnection, { webRTCEvents } from '../../../src/PeerConnection'
import Signaling, { signalingEvents } from '../../../src/Signaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockBrowser'

const feature = loadFeature('../PublisherReconnection.feature', { loadRelativePath: true, errors: true })
let Publish

jest.useFakeTimers()

const mockTokenGenerator = jest.fn(() => {
  return {
    urls: [
      'ws://localhost:8080'
    ],
    jwt: 'this-is-a-jwt-dummy-token'
  }
})

const mediaStream = new MediaStream([{ kind: 'video' }, { kind: 'audio' }])

beforeEach(() => {
  jest.restoreAllMocks()
  jest.clearAllTimers()
  jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
  jest.spyOn(Signaling.prototype, 'connect').mockImplementation(jest.fn)
  jest.spyOn(Signaling.prototype, 'publish').mockResolvedValue('SDP')
  jest.isolateModules(() => {
    Publish = require('../../../src/Publish').default
  })
})

defineFeature(feature, test => {
  test('Reconnection when peer has an error', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with reconnection enabled', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, true)
      jest.spyOn(publisher, 'reconnect').mockImplementation(jest.fn)
      await publisher.connect({ mediaStream })
    })

    when('peer has an error', () => {
      publisher.webRTCPeer.emit(webRTCEvents.connectionStateChange, 'failed')
    })

    then('reconnection is called', async () => {
      expect(publisher.reconnect).toBeCalledTimes(1)
    })
  })

  test('No reconnection when peer has not an error', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with reconnection enabled', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, true)
      jest.spyOn(publisher, 'reconnect').mockImplementation(jest.fn)
      await publisher.connect({ mediaStream })
    })

    when('peer change status to connected', () => {
      publisher.webRTCPeer.emit(webRTCEvents.connectionStateChange, 'connected')
    })

    then('reconnection is not called', async () => {
      expect(publisher.reconnect).not.toHaveBeenCalled()
    })
  })

  test('Reconnection when signaling has an error', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with reconnection enabled', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, true)
      jest.spyOn(publisher, 'reconnect').mockImplementation(jest.fn)
      await publisher.connect({ mediaStream })
    })

    when('signaling has an error', () => {
      publisher.signaling.emit(signalingEvents.connectionError, 'webSocketLocation')
    })

    then('reconnection is called', async () => {
      expect(publisher.reconnect).toBeCalledTimes(1)
    })
  })

  test('No reconnect when signaling has an error and reconnection is already being executed', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with reconnection enabled', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, true)
      jest.spyOn(publisher, 'reconnect').mockImplementation(() => {
        publisher.firstReconnection = false
        publisher.alreadyDisconnected = true
      })
      await publisher.connect({ mediaStream })
    })

    when('reconnect was called and signaling has an error', () => {
      publisher.reconnect()
      expect(publisher.reconnect).toBeCalledTimes(1)
      publisher.signaling.emit(signalingEvents.connectionError, 'webSocketLocation')
    })

    then('reconnection is not called', async () => {
      expect(publisher.reconnect).toBeCalledTimes(1)
    })
  })

  test('Reconnection disabled when peer has an error', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with reconnection disabled', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, false)
      jest.spyOn(publisher, 'reconnect').mockImplementation(jest.fn)
      await publisher.connect({ mediaStream })
    })

    when('peer has an error', () => {
      publisher.webRTCPeer.emit(webRTCEvents.connectionStateChange, 'failed')
    })

    then('reconnection is not called', async () => {
      expect(publisher.reconnect).not.toHaveBeenCalled()
    })
  })

  test('Reconnection when peer has a disconnection', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with reconnection enabled', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, true)
      jest.spyOn(publisher, 'reconnect').mockImplementation(jest.fn)
      await publisher.connect({ mediaStream })
    })

    when('peer has a disconnection', () => {
      publisher.webRTCPeer.emit(webRTCEvents.connectionStateChange, 'disconnected')
    })

    then('waits and call reconnection', async () => {
      expect(setTimeout).toHaveBeenCalledTimes(1)
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1500)
      jest.runOnlyPendingTimers()
      expect(publisher.reconnect).toHaveBeenCalled()
    })
  })

  test('Reconnection interval when peer has an error', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with reconnection enabled and peer with error', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, true)
      await publisher.connect({ mediaStream })
      publisher.webRTCPeer.peer.connectionState = 'failed'
      jest.spyOn(publisher, 'isActive').mockImplementation(() => { return false })
    })

    when('reconnection is called and fails', () => {
      jest.spyOn(publisher, 'connect').mockImplementation(() => { throw new Error() })
      publisher.reconnect()
    })

    then('reconnection is called again in increments of 2 seconds until 32 seconds', async () => {
      let interval = 1000
      for (let i = 1; i <= 6; i++) {
        expect(setTimeout).toHaveBeenCalledTimes(i)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), interval)
        jest.runOnlyPendingTimers()
        interval = interval * 2
      }
      expect(setTimeout).toHaveBeenCalledTimes(7)
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 32000)
      jest.runOnlyPendingTimers()
    })
  })

  test('Reconnection when peer has recover from error', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with reconnection enabled', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, true)
      await publisher.connect({ mediaStream })
    })

    when('reconnection is called and peer is currently connected', () => {
      publisher.webRTCPeer.peer.connectionState = 'connected'
      publisher.reconnect()
    })

    then('reconnection is not called again', async () => {
      jest.advanceTimersByTime(62000)
      expect(setTimeout).toHaveBeenCalledTimes(1)
    })
  })

  test('Reconnection and peer has recover from error', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with reconnection enabled', async () => {
      publisher = new Publish('streamName', mockTokenGenerator, true)
      await publisher.connect({ mediaStream })
    })

    when('reconnection is called and peer is inactive', () => {
      jest.spyOn(publisher, 'isActive').mockImplementation(() => { return false })
      publisher.reconnect()
    })

    then('peer reconnects and reconnection is not called again', async () => {
      expect(setTimeout).toHaveBeenCalledTimes(1)
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)
      jest.runOnlyPendingTimers()
      jest.spyOn(publisher, 'isActive').mockImplementation(() => { return true })

      jest.advanceTimersByTime(62000)
      expect(setTimeout).toHaveBeenCalledTimes(1)
    })
  })
})
