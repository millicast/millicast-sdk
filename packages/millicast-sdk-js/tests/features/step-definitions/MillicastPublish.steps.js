import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastPublish from '../../../src/MillicastPublish'
import MillicastWebRTC from '../../../src/MillicastWebRTC'
import MillicastSignaling from '../../../src/MillicastSignaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'

const feature = loadFeature('../MillicastPublish.feature', { loadRelativePath: true, errors: true })

jest.mock('../../../src/MillicastSignaling')

const publisherData = {
  urls: [
    'ws://localhost:8080'
  ],
  jwt: 'this-is-a-jwt-dummy-token'
}

const mediaStream = new MediaStream([{ kind: 'video' }, { kind: 'audio' }])

beforeEach(() => {
  jest.restoreAllMocks()
  jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
})

defineFeature(feature, test => {
  test('Instance publisher without streamName', ({ given, when, then }) => {
    let expectError

    given('no stream name', () => null)

    when('I instance a MillicastPublish', async () => {
      expectError = expect(() => new MillicastPublish())
    })

    then('throws an error', async () => {
      expectError.toThrow(Error)
      expectError.toThrow('Stream Name is required to construct a publisher.')
    })
  })

  test('Broadcast without connection path', ({ given, when, then }) => {
    let publisher
    let expectError

    given('an instance of MillicastPublish', async () => {
      publisher = new MillicastPublish('streamName')
    })

    when('I broadcast a stream without a connection path', async () => {
      expectError = expect(() => publisher.broadcast({ mediaStream }))
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Publisher data required')
    })
  })

  test('Broadcast without mediaStream', ({ given, when, then }) => {
    let publisher
    let expectError

    given('an instance of MillicastPublish', async () => {
      publisher = new MillicastPublish('streamName')
    })

    when('I broadcast a stream without a mediaStream', async () => {
      expectError = expect(() => publisher.broadcast({ publisherData }))
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('MediaStream required')
    })
  })

  test('Broadcast to active publisher', ({ given, when, then }) => {
    let publisher
    let expectError

    given('an instance of MillicastPublish already connected', async () => {
      jest.spyOn(MillicastSignaling.prototype, 'publish').mockReturnValue('sdp')
      publisher = new MillicastPublish('streamName')
      await publisher.broadcast({ publisherData, mediaStream })
    })

    when('I broadcast again to the stream', async () => {
      expectError = expect(() => publisher.broadcast({ publisherData, mediaStream }))
    })

    then('throws an error', async () => {
      expectError.rejects.toThrow(Error)
      expectError.rejects.toThrow('Broadcast currently working')
    })
  })

  // test('Sginaling returns null sdp', ({ given, when, then }) => {
  //   let publisher
  //   let expectError

  //   given('an instance of MillicastViewer', async () => {
  //     jest.spyOn(MillicastSignaling.prototype, 'subscribe').mockReturnValue(null)
  //     publisher = new MillicastView('streamName')
  //   })

  //   when('I connect to the stream', async () => {
  //     expectError = expect(() => publisher.connect({ publisherData }))
  //   })

  //   then('throws an error', async () => {
  //     expectError.rejects.toThrow(Error)
  //     expectError.rejects.toThrow('Failed to connect to publisher: ')
  //   })
  // })

  test('Stop publish', ({ given, when, then }) => {
    const publisher = new MillicastPublish('streamName')
    let signaling

    given('I am publishing a stream', async () => {
      jest.spyOn(MillicastSignaling.prototype, 'publish').mockReturnValue('sdp')
      await publisher.broadcast({ publisherData, mediaStream })
      signaling = publisher.millicastSignaling
    })

    when('I stop the publish', async () => {
      publisher.stop()
    })

    then('peer connection and WebSocket are null', async () => {
      expect(publisher.webRTCPeer.peer).toBeNull()
      expect(signaling.close.mock.calls.length).toBe(1)
      expect(publisher.millicastSignaling).toBeNull()
    })
  })

  test('Stop inactive publish', ({ given, when, then }) => {
    const publisher = new MillicastPublish('streamName')

    given('I am not publishing a stream', () => null)

    when('I stop the publish', async () => {
      publisher.stop()
    })

    then('peer connection and WebSocket are null', async () => {
      expect(publisher.webRTCPeer.peer).toBeNull()
      expect(publisher.millicastSignaling).toBeNull()
    })
  })

  test('Check status of active publish', ({ given, when, then }) => {
    const publisher = new MillicastPublish('streamName')
    let result

    given('I am publishing a stream', async () => {
      jest.spyOn(MillicastSignaling.prototype, 'publish').mockReturnValue('sdp')
      await publisher.broadcast({ publisherData, mediaStream })
    })

    when('I check if publish is active', async () => {
      result = publisher.isActive()
    })

    then('returns true', async () => {
      expect(result).toBeTruthy()
    })
  })

  test('Check status of inactive publish', ({ given, when, then }) => {
    const publisher = new MillicastPublish('streamName')
    let result

    given('I am not publishing a stream', () => null)

    when('I check if publish is active', async () => {
      result = publisher.isActive()
    })

    then('returns false', async () => {
      expect(result).toBeFalsy()
    })
  })
})
