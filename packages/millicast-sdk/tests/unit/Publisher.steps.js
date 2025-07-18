import { loadFeature, defineFeature } from 'jest-cucumber'
import { Publisher } from '../../src/Publisher'
import PeerConnection from '../../src/PeerConnection'
import { Signaling } from '../../src/Signaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockBrowser'

const feature = loadFeature('../features/Publisher.feature', { loadRelativePath: true, errors: true })

jest.mock('../../src/Signaling')

jest.mock('../../src/workers/TransformWorker.worker.ts', () =>
  jest.fn(() => ({
    postMessage: jest.fn(),
    terminate: jest.fn(),
  }))
)

const mockTokenGenerator = jest.fn(() => {
  return {
    urls: ['ws://localhost:8080'],
    jwt:
      process.env.JWT_TEST_TOKEN ??
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJtaWxsaWNhc3QiOnt9fQ.IqT-PLLz-X7Wn7BNo-x4pFApAbMT9mmnlupR8eD9q4U',
  }
})

const mediaStream = new MediaStream([{ kind: 'video' }, { kind: 'audio' }])

defineFeature(feature, (test) => {

  test('Instance publisher without stream name', ({ given, when, then }) => {
    let expectError

    given('nothing', () => {})

    when('I instance a Publisher', async () => {
      expectError = expect(() => new Publisher({}))
    })

    then('throws an error', async () => {
      expectError.toThrow(Error)
      expectError.toThrow('The Stream Name is missing.')
    })
  })

  test('Instance publisher without publish token', ({ given, when, then }) => {
    let expectError

    given('nothing', () => {})

    when('I instance a Publisher', async () => {
      expectError = expect(() => new Publisher({streamName: 'a'}))
    })

    then('throws an error', async () => {
      expectError.toThrow(Error)
      expectError.toThrow('The Publish Token is missing.')
    })
  })

  test('Broadcast stream', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with connection path', async () => {
      publisher = new Publisher({streamName: 'a', publishToken: 'b'})
      jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);
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
      publisher = new Publisher({streamName: 'a', publishToken: 'b'})
      jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);
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
      publisher = new Publisher({streamName: 'a', publishToken: 'b'})
      const mockErrorTokenGenerator = () => Promise.resolve(null);
      jest.spyOn(publisher, "getConnectionData").mockImplementation(mockErrorTokenGenerator);
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
      publisher = new Publisher({streamName: 'a', publishToken: 'b'})
      jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);
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
      publisher = new Publisher({streamName: 'a', publishToken: 'b'})
      jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);
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
      publisher = new Publisher({streamName: 'a', publishToken: 'b'})
      jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);
    })

    when('I broadcast a stream with bandwidth restriction', async () => {
      await publisher.connect({
        mediaStream,
        bandwidth: 1000,
      })
    })

    then('peer connection state is connected', async () => {
      expect(publisher.webRTCPeer.updateBandwidthRestriction).toHaveBeenCalledTimes(1)
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })
  })

  test('Stop publish', ({ given, when, then }) => {
    const publisher = new Publisher({streamName: 'a', publishToken: 'b'})
    jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);
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
    const publisher = new Publisher({streamName: 'a', publishToken: 'b'})
    jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);

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
    const publisher = new Publisher({streamName: 'a', publishToken: 'b'})
    jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);
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
    const publisher = new Publisher({streamName: 'a', publishToken: 'b'})
    jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);
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
      publisher = new Publisher({streamName: 'a', publishToken: 'b'})
      const errorTokenGenerator = jest.fn(() => {
        throw new Error('Error getting token')
      })
      jest.spyOn(publisher, "getConnectionData").mockImplementation(errorTokenGenerator);
    })

    when('I broadcast a stream', async () => {
      expectError = expect(() => publisher.connect({ mediaStream }))
    })

    then('throws token generator error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Error getting token')
    })
  })

  test('Broadcast to stream with record option but no record available from token', ({
    given,
    when,
    then,
  }) => {
    let publisher
    let expectError

    given('an instance of Publish with valid token generator with no recording available', async () => {
      publisher = new Publisher({streamName: 'a', publishToken: 'b'})
      jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);
    })

    when('I broadcast a stream', async () => {
      expectError = expect(() => publisher.connect({ mediaStream, record: true }))
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Record option detected but recording is not available')
    })
  })

  test('Broadcast with invalid codec', ({ given, when, then }) => {
    let publisher
    let expectedError

    given('an instance of Publish', async () => {
      publisher = new Publisher({streamName: 'a', publishToken: 'b'})
      jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);
      jest.spyOn(PeerConnection, 'getCapabilities').mockReturnValue({
        codecs: [
          { codec: 'vp8', mimeType: 'video/VP8' },
          { codec: 'vp9', mimeType: 'video/VP9' },
          { codec: 'h264', mimeType: 'video/H264' },
        ],
        headerExtensions: [],
      })
    })

    when('I broadcast with unsupported codec', async () => {
      expectedError = expect(() => publisher.connect({ mediaStream, record: true, codec: 'h265' }))
    })

    then('throws an error', async () => {
      expectedError.rejects.toThrow(Error)
    })
  })

  test('Broadcast with non-default codec', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish', async () => {
      publisher = new Publisher({streamName: 'a', publishToken: 'b'})
      jest.spyOn(publisher, "getConnectionData").mockImplementation(mockTokenGenerator);
      jest.spyOn(PeerConnection, 'getCapabilities').mockReturnValue({
        codecs: [
          { codec: 'vp8', mimeType: 'video/VP8' },
          { codec: 'vp9', mimeType: 'video/VP9' },
          { codec: 'h264', mimeType: 'video/H264' },
          { codec: 'h265', mimeType: 'video/H265' },
        ],
        headerExtensions: [],
      })
    })

    when('I broadcast a stream with H265 codec', async () => {
      await publisher.connect({ mediaStream, codec: 'h265' })
    })

    then('peer connection state is connected', async () => {
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })
  })
})
