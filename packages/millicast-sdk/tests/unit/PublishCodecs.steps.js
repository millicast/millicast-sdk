import { loadFeature, defineFeature } from 'jest-cucumber'
import Publish from '../../src/Publish'
import Signaling from '../../src/Signaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockBrowser'
import './__mocks__/jwt-decode'

const feature = loadFeature('../features/PublishCodecs.feature', { loadRelativePath: true, errors: true })

jest.mock('../../src/Signaling')

jest.mock('../../src/workers/TransformWorker.worker.ts', () =>
  jest.fn(() => ({
    postMessage: jest.fn(),
    terminate: jest.fn()
  }))
)

const mockTokenGenerator = jest.fn(() => {
  return {
    urls: ['ws://localhost:8080'],
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJtaWxsaWNhc3QiOnt9fQ.IqT-PLLz-X7Wn7BNo-x4pFApAbMT9mmnlupR8eD9q4U'
  }
})

const mockTokenGeneratorWithRecording = jest.fn(() => {
  return {
    urls: ['ws://localhost:8080'],
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJtaWxsaWNhc3QiOnsicmVjb3JkIjp0cnVlfX0.dummy'
  }
})

defineFeature(feature, (test) => {
  let publishSpy
  let lastPublishOptions

  beforeEach(() => {
    publishSpy = jest.spyOn(Signaling.prototype, 'publish').mockImplementation((sdp, options) => {
      lastPublishOptions = options
      return { sdp: 'response-sdp' }
    })
    lastPublishOptions = null
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Publish with H264 codec', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with token generator', () => {
      publisher = new Publish(undefined, mockTokenGenerator)
    })

    when('I broadcast with codec h264', async () => {
      await publisher.connect({
        mediaStream: new MediaStream(),
        codec: 'h264'
      })
    })

    then('the signaling publish is called with codec h264', () => {
      expect(publishSpy).toHaveBeenCalled()
      expect(lastPublishOptions.codec).toBe('h264')
    })
  })

  test('Publish with VP8 codec', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with token generator', () => {
      publisher = new Publish(undefined, mockTokenGenerator)
    })

    when('I broadcast with codec vp8', async () => {
      await publisher.connect({
        mediaStream: new MediaStream(),
        codec: 'vp8'
      })
    })

    then('the signaling publish is called with codec vp8', () => {
      expect(publishSpy).toHaveBeenCalled()
      expect(lastPublishOptions.codec).toBe('vp8')
    })
  })

  test('Publish with VP9 codec', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with token generator', () => {
      publisher = new Publish(undefined, mockTokenGenerator)
    })

    when('I broadcast with codec vp9', async () => {
      await publisher.connect({
        mediaStream: new MediaStream(),
        codec: 'vp9'
      })
    })

    then('the signaling publish is called with codec vp9', () => {
      expect(publishSpy).toHaveBeenCalled()
      expect(lastPublishOptions.codec).toBe('vp9')
    })
  })

  test('Publish with AV1 codec', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with token generator', () => {
      publisher = new Publish(undefined, mockTokenGenerator)
    })

    when('I broadcast with codec av1', async () => {
      await publisher.connect({
        mediaStream: new MediaStream(),
        codec: 'av1'
      })
    })

    then('the signaling publish is called with codec av1', () => {
      expect(publishSpy).toHaveBeenCalled()
      expect(lastPublishOptions.codec).toBe('av1')
    })
  })

  test('Publish with simulcast enabled for H264', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with token generator', () => {
      publisher = new Publish(undefined, mockTokenGenerator)
    })

    when('I broadcast with codec h264 and simulcast enabled', async () => {
      await publisher.connect({
        mediaStream: new MediaStream(),
        codec: 'h264',
        simulcast: true
      })
    })

    then('the signaling publish is called with codec h264 and simulcast', () => {
      expect(publishSpy).toHaveBeenCalled()
      expect(lastPublishOptions.codec).toBe('h264')
    })
  })

  test('Publish with simulcast enabled for VP8', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with token generator', () => {
      publisher = new Publish(undefined, mockTokenGenerator)
    })

    when('I broadcast with codec vp8 and simulcast enabled', async () => {
      await publisher.connect({
        mediaStream: new MediaStream(),
        codec: 'vp8',
        simulcast: true
      })
    })

    then('the signaling publish is called with codec vp8 and simulcast', () => {
      expect(publishSpy).toHaveBeenCalled()
      expect(lastPublishOptions.codec).toBe('vp8')
    })
  })

  test('Publish with scalabilityMode', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with token generator', () => {
      publisher = new Publish(undefined, mockTokenGenerator)
    })

    when('I broadcast with codec h264 and scalabilityMode L3T3', async () => {
      await publisher.connect({
        mediaStream: new MediaStream(),
        codec: 'h264',
        scalabilityMode: 'L3T3'
      })
    })

    then('the signaling publish is called with scalabilityMode L3T3', () => {
      expect(publishSpy).toHaveBeenCalled()
      expect(lastPublishOptions.codec).toBe('h264')
    })
  })

  test('Publish with bandwidth restriction', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with token generator', () => {
      publisher = new Publish(undefined, mockTokenGenerator)
    })

    when('I broadcast with bandwidth set to 2000', async () => {
      await publisher.connect({
        mediaStream: new MediaStream(),
        codec: 'h264',
        bandwidth: 2000
      })
    })

    then('the signaling publish is called with bandwidth 2000', () => {
      expect(publishSpy).toHaveBeenCalled()
    })
  })

  test('Publish with priority option', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with token generator', () => {
      publisher = new Publish(undefined, mockTokenGenerator)
    })

    when('I broadcast with priority set to 10', async () => {
      await publisher.connect({
        mediaStream: new MediaStream(),
        codec: 'h264',
        priority: 10
      })
    })

    then('the signaling publish is called with priority 10', () => {
      expect(publishSpy).toHaveBeenCalled()
      expect(lastPublishOptions.priority).toBe(10)
    })
  })

  test('Publish with record option enabled', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with token generator that supports recording', () => {
      publisher = new Publish(undefined, mockTokenGeneratorWithRecording)
    })

    when('I broadcast with record set to true', async () => {
      await publisher.connect({
        mediaStream: new MediaStream(),
        codec: 'h264',
        record: true
      })
    })

    then('the signaling publish is called with record true', () => {
      expect(publishSpy).toHaveBeenCalled()
      expect(lastPublishOptions.record).toBe(true)
    })
  })

  test('Publish with sourceId for multisource', ({ given, when, then }) => {
    let publisher

    given('an instance of Publish with token generator', () => {
      publisher = new Publish(undefined, mockTokenGenerator)
    })

    when('I broadcast with sourceId set to camera-1', async () => {
      await publisher.connect({
        mediaStream: new MediaStream(),
        codec: 'h264',
        sourceId: 'camera-1'
      })
    })

    then('the signaling publish is called with sourceId camera-1', () => {
      expect(publishSpy).toHaveBeenCalled()
      expect(lastPublishOptions.sourceId).toBe('camera-1')
    })
  })
})
