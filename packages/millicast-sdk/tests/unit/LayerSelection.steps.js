import { loadFeature, defineFeature } from 'jest-cucumber'
import View from '../../src/View'
import Signaling from '../../src/Signaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'

const feature = loadFeature('../features/LayerSelection.feature', { loadRelativePath: true, errors: true })

jest.setTimeout(30000)

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

  beforeEach(() => {
    subscribeSpy = jest.spyOn(Signaling.prototype, 'subscribe').mockReturnValue('sdp')
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
      const callArgs = subscribeSpy.mock.calls[0]
      const options = callArgs[1]
      expect(options.layer).toBeDefined()
      expect(options.layer.encodingId).toBe('h')
      expect(options.layer.spatialLayerId).toBe(1)
      expect(options.layer.temporalLayerId).toBe(2)
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
      const options = subscribeSpy.mock.calls[0][1]
      expect(options.layer).toBeDefined()
      expect(options.layer.maxSpatialLayerId).toBe(2)
      expect(options.layer.maxTemporalLayerId).toBe(3)
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
      const options = subscribeSpy.mock.calls[0][1]
      expect(options.pinnedSourceId).toBe('source-123')
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
      const options = subscribeSpy.mock.calls[0][1]
      expect(options.excludedSourceIds).toBeDefined()
      expect(options.excludedSourceIds).toContain('source-a')
      expect(options.excludedSourceIds).toContain('source-b')
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
      const options = subscribeSpy.mock.calls[0][1]
      expect(options.forcePlayoutDelay).toBeDefined()
      expect(options.forcePlayoutDelay.min).toBe(50)
      expect(options.forcePlayoutDelay.max).toBe(200)
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
      const options = subscribeSpy.mock.calls[0][1]
      expect(options.disableVideo).toBe(true)
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
      const options = subscribeSpy.mock.calls[0][1]
      expect(options.disableAudio).toBe(true)
    })
  })

})
