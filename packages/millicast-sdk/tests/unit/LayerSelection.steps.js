import { loadFeature, defineFeature } from 'jest-cucumber'
import View from '../../src/View'
import Signaling from '../../src/Signaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'

const feature = loadFeature('../features/LayerSelection.feature', { loadRelativePath: true, errors: true })

jest.mock('../../src/Signaling')

jest.mock('../../src/workers/TransformWorker.worker.ts', () =>
  jest.fn(() => ({
    postMessage: jest.fn(),
    terminate: jest.fn()
  }))
)

jest.mock('../../src/drm/rtc-drm-transform.min.js', () => ({
  rtcDrmConfigure: jest.fn(),
  rtcDrmOnTrack: jest.fn(),
  rtcDrmEnvironments: jest.fn(),
  rtcDrmFeedFrame: jest.fn()
}))

const mockTokenGenerator = jest.fn(() => {
  return {
    urls: ['ws://localhost:8080'],
    jwt: 'this-is-a-jwt-dummy-token'
  }
})

defineFeature(feature, (test) => {
  let subscribeSpy
  let lastSubscribeOptions

  beforeEach(() => {
    subscribeSpy = jest.spyOn(Signaling.prototype, 'subscribe').mockImplementation((sdp, options) => {
      lastSubscribeOptions = options
      return 'sdp'
    })
    lastSubscribeOptions = null
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Connect with specific layer selection', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with layer encodingId h and spatialLayerId 1 and temporalLayerId 2', async () => {
      await viewer.connect({
        layer: {
          encodingId: 'h',
          spatialLayerId: 1,
          temporalLayerId: 2
        }
      })
    })

    then('the signaling subscribe is called with the layer configuration', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.layer).toBeDefined()
      expect(lastSubscribeOptions.layer.encodingId).toBe('h')
      expect(lastSubscribeOptions.layer.spatialLayerId).toBe(1)
      expect(lastSubscribeOptions.layer.temporalLayerId).toBe(2)
    })
  })

  test('Connect with max layer constraints', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with layer maxSpatialLayerId 2 and maxTemporalLayerId 3', async () => {
      await viewer.connect({
        layer: {
          encodingId: 'h',
          spatialLayerId: 0,
          temporalLayerId: 0,
          maxSpatialLayerId: 2,
          maxTemporalLayerId: 3
        }
      })
    })

    then('the signaling subscribe is called with max layer constraints', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.layer).toBeDefined()
      expect(lastSubscribeOptions.layer.maxSpatialLayerId).toBe(2)
      expect(lastSubscribeOptions.layer.maxTemporalLayerId).toBe(3)
    })
  })

  test('Connect with pinnedSourceId', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with pinnedSourceId set to source-123', async () => {
      await viewer.connect({
        pinnedSourceId: 'source-123'
      })
    })

    then('the signaling subscribe is called with pinnedSourceId source-123', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.pinnedSourceId).toBe('source-123')
    })
  })

  test('Connect with excludedSourceIds', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with excludedSourceIds containing source-a and source-b', async () => {
      await viewer.connect({
        excludedSourceIds: ['source-a', 'source-b']
      })
    })

    then('the signaling subscribe is called with excludedSourceIds array', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.excludedSourceIds).toBeDefined()
      expect(lastSubscribeOptions.excludedSourceIds).toContain('source-a')
      expect(lastSubscribeOptions.excludedSourceIds).toContain('source-b')
    })
  })

  test('Connect with forcePlayoutDelay', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with forcePlayoutDelay min 50 and max 200', async () => {
      await viewer.connect({
        forcePlayoutDelay: { min: 50, max: 200 }
      })
    })

    then('the signaling subscribe is called with forcePlayoutDelay configuration', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.forcePlayoutDelay).toBeDefined()
      expect(lastSubscribeOptions.forcePlayoutDelay.min).toBe(50)
      expect(lastSubscribeOptions.forcePlayoutDelay.max).toBe(200)
    })
  })

  test('Connect with disableVideo', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with disableVideo set to true', async () => {
      await viewer.connect({
        disableVideo: true
      })
    })

    then('the signaling subscribe is called with disableVideo true', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.disableVideo).toBe(true)
    })
  })

  test('Connect with disableAudio', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with disableAudio set to true', async () => {
      await viewer.connect({
        disableAudio: true
      })
    })

    then('the signaling subscribe is called with disableAudio true', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.disableAudio).toBe(true)
    })
  })

  test('Connect with both video and audio disabled throws error', ({ given, when, then }) => {
    let viewer
    let error

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with both disableVideo and disableAudio set to true', async () => {
      try {
        await viewer.connect({
          disableVideo: true,
          disableAudio: true
        })
      } catch (e) {
        error = e
      }
    })

    then('throws an error about video and audio disabled', () => {
      expect(error).toBeDefined()
      expect(error.message).toContain('video and audio are disabled')
    })
  })
})
