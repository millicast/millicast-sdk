import { loadFeature, defineFeature } from 'jest-cucumber'
import Publish from '../../../src/Publish'
import PeerConnection from '../../../src/PeerConnection'
import Signaling from '../../../src/Signaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockBrowser'

const feature = loadFeature('../Publish.feature', { loadRelativePath: true, errors: true })

jest.mock('../../../src/Signaling')

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
  jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
})

defineFeature(feature, test => {
  test('Instance publisher without streamName', ({ given, when, then }) => {
    let expectError

    given('no stream name', () => null)

    when('I instance a Publish', async () => {
      expectError = expect(() => new Publish())
    })

    then('throws an error', async () => {
      expectError.toThrow(Error)
      expectError.toThrow('Stream Name is required to construct this module.')
    })
  })

  test('Instance publisher without tokenGenerator', ({ given, when, then }) => {
    let expectError

    given('no token generator', () => null)

    when('I instance a Publish', async () => {
      expectError = expect(() => new Publish('streamName'))
    })

    then('throws an error', async () => {
      expectError.toThrow(Error)
      expectError.toThrow('Token generator is required to construct this module.')
    })
  })

  test('Broadcast stream', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with connection path', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
    })

    when('I broadcast a stream with media stream', async () => {
      await publisher.connect({ mediaStream })
    })

    then('peer connection state is connected', async () => {
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })
  })

  test('Broadcast stream default options', ({ given, when, then }) => {
    let publisher
    let expectError

    given('an instance of Publish', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
    })

    when('I broadcast a stream without options', async () => {
      expectError = expect(() => publisher.connect())
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('MediaStream required')
    })
  })

  test('Broadcast without connection path', ({ given, when, then }) => {
    let publisher
    let expectError

    given('I want to broadcast', async () => {})

    when('I instance a Publish with token generator without connection path', async () => {
      const mockErrorTokenGenerator = () => Promise.resolve(null)
      publisher = new Publish('streamName', mockErrorTokenGenerator)
      expectError = expect(() => publisher.connect({ mediaStream }))
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Publisher data required')
    })
  })

  test('Broadcast without mediaStream', ({ given, when, then }) => {
    let publisher
    let expectError

    given('an instance of Publish', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
    })

    when('I broadcast a stream without a mediaStream', async () => {
      expectError = expect(() => publisher.connect())
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('MediaStream required')
    })
  })

  test('Broadcast to active publisher', ({ given, when, then }) => {
    let publisher
    let expectError

    given('an instance of Publish already connected', async () => {
      jest.spyOn(Signaling.prototype, 'publish').mockReturnValue('sdp')
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
    })

    when('I broadcast again to the stream', async () => {
      expectError = expect(() => publisher.connect({ mediaStream }))
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Broadcast currently working')
    })
  })

  test('Broadcast stream with bandwidth restriction', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish', async () => {
      jest.spyOn(PeerConnection.prototype, 'updateBandwidthRestriction').mockImplementation(jest.fn)
      publisher = new Publish('streamName', mockTokenGenerator)
    })

    when('I broadcast a stream with bandwidth restriction', async () => {
      await publisher.connect({
        mediaStream,
        bandwidth: 1000
      })
    })

    then('peer connection state is connected', async () => {
      expect(publisher.webRTCPeer.updateBandwidthRestriction).toBeCalledTimes(1)
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })
  })

  test('Stop publish', ({ given, when, then }) => {
    const publisher = new Publish('streamName', mockTokenGenerator)
    let signaling

    given('I am publishing a stream', async () => {
      jest.spyOn(Signaling.prototype, 'publish').mockReturnValue('sdp')
      await publisher.connect({ mediaStream })
      signaling = publisher.signaling
    })

    when('I stop the publish', async () => {
      publisher.stop()
    })

    then('peer connection and WebSocket are null', async () => {
      expect(publisher.webRTCPeer.peer).toBeNull()
      expect(signaling.close.mock.calls.length).toBe(1)
      expect(publisher.signaling).toBeNull()
    })
  })

  test('Stop inactive publish', ({ given, when, then }) => {
    const publisher = new Publish('streamName', mockTokenGenerator)

    given('I am not publishing a stream', () => null)

    when('I stop the publish', async () => {
      publisher.stop()
    })

    then('peer connection and WebSocket are null', async () => {
      expect(publisher.webRTCPeer.peer).toBeNull()
      expect(publisher.signaling).toBeNull()
    })
  })

  test('Check status of active publish', ({ given, when, then }) => {
    const publisher = new Publish('streamName', mockTokenGenerator)
    let result

    given('I am publishing a stream', async () => {
      jest.spyOn(Signaling.prototype, 'publish').mockReturnValue('sdp')
      await publisher.connect({ mediaStream })
    })

    when('I check if publish is active', async () => {
      result = publisher.isActive()
    })

    then('returns true', async () => {
      expect(result).toBeTruthy()
    })
  })

  test('Check status of inactive publish', ({ given, when, then }) => {
    const publisher = new Publish('streamName', mockTokenGenerator)
    let result

    given('I am not publishing a stream', () => null)

    when('I check if publish is active', async () => {
      result = publisher.isActive()
    })

    then('returns false', async () => {
      expect(result).toBeFalsy()
    })
  })

  test('Broadcast to stream with invalid token generator', ({ given, when, then }) => {
    let publisher
    let expectError

    given('an instance of Publish with invalid token generator', async () => {
      const errorTokenGenerator = jest.fn(() => { throw new Error('Error getting token') })
      publisher = new Publish('streamName', errorTokenGenerator)
    })

    when('I broadcast a stream', async () => {
      expectError = expect(() => publisher.connect({ mediaStream }))
    })

    then('throws token generator error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Error getting token')
    })
  })
})
