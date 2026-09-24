import { loadFeature, defineFeature } from 'jest-cucumber'
import Publish from '../../src/Publish'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockBrowser'

const feature = loadFeature('../features/MaintainResolution.feature', { loadRelativePath: true, errors: true })

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
    jwt: process.env.JWT_TEST_TOKEN ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJtaWxsaWNhc3QiOnt9fQ.IqT-PLLz-X7Wn7BNo-x4pFApAbMT9mmnlupR8eD9q4U'
  }
})

const videoSenderOf = (publisher) =>
  publisher.getRTCPeerConnection().getSenders().find(sender => sender.track?.kind === 'video')

defineFeature(feature, test => {
  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Broadcast with maintainResolution enabled', ({ given, when, then, and }) => {
    let publisher
    let mediaStream

    given('an instance of Publish with connection path', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      mediaStream = new MediaStream([{ kind: 'video' }, { kind: 'audio' }])
    })

    when('I broadcast a stream with maintainResolution enabled', async () => {
      await publisher.connect({ mediaStream, maintainResolution: true })
    })

    then('the video track is hinted for detail', async () => {
      expect(mediaStream.getVideoTracks()[0].contentHint).toEqual('detail')
    })

    and('the video sender prefers to maintain resolution', async () => {
      expect(videoSenderOf(publisher).getParameters().degradationPreference)
        .toEqual('maintain-resolution')
    })
  })

  test('Broadcast without maintainResolution', ({ given, when, then, and }) => {
    let publisher
    let mediaStream

    given('an instance of Publish with connection path', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      mediaStream = new MediaStream([{ kind: 'video' }, { kind: 'audio' }])
    })

    when('I broadcast a stream with media stream', async () => {
      await publisher.connect({ mediaStream })
    })

    then('the video track has no content hint', async () => {
      expect(mediaStream.getVideoTracks()[0].contentHint).toBeUndefined()
    })

    and('the video sender has no degradation preference', async () => {
      expect(videoSenderOf(publisher).getParameters().degradationPreference).toBeUndefined()
    })
  })

  test('Broadcast with maintainResolution enabled and an unsupported browser', ({ given, when, then, and }) => {
    let publisher
    let mediaStream

    given('an instance of Publish with connection path', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      mediaStream = new MediaStream([{ kind: 'video' }, { kind: 'audio' }])
    })

    // Browsers may accept setParameters() and drop degradationPreference, or reject the call
    // outright. Neither may take the broadcast down: the option degrades to contentHint alone.
    and('a browser that ignores the degradation preference', async () => {
      jest.spyOn(global.RTCPeerConnection.prototype, 'addTransceiver')
        .mockImplementation(function (track) {
          this.senders.push({
            track,
            getParameters: () => ({}),
            setParameters: () => Promise.reject(new Error('Not supported')),
            replaceTrack: () => {}
          })
        })
    })

    when('I broadcast a stream with maintainResolution enabled', async () => {
      await publisher.connect({ mediaStream, maintainResolution: true })
    })

    then('the broadcast is still connected', async () => {
      expect(publisher.isActive()).toBeTruthy()
    })

    and('the video track is hinted for detail', async () => {
      expect(mediaStream.getVideoTracks()[0].contentHint).toEqual('detail')
    })
  })
})
