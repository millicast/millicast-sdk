import { loadFeature, defineFeature } from 'jest-cucumber'
import View from '../../src/View'
import Signaling from '../../src/Signaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'

const feature = loadFeature('../features/AbrConfiguration.feature', { loadRelativePath: true, errors: true })

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

  test('Connect with quality ABR strategy', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with abrConfiguration strategy set to quality', async () => {
      await viewer.connect({
        abrConfiguration: {
          strategy: 'quality'
        }
      })
    })

    then('the signaling subscribe is called with abr strategy quality', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.abrConfiguration).toBeDefined()
      expect(lastSubscribeOptions.abrConfiguration.strategy).toBe('quality')
    })
  })

  test('Connect with bandwidth ABR strategy', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with abrConfiguration strategy set to bandwidth', async () => {
      await viewer.connect({
        abrConfiguration: {
          strategy: 'bandwidth'
        }
      })
    })

    then('the signaling subscribe is called with abr strategy bandwidth', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.abrConfiguration).toBeDefined()
      expect(lastSubscribeOptions.abrConfiguration.strategy).toBe('bandwidth')
    })
  })

  test('Connect with performance ABR strategy', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with abrConfiguration strategy set to performance', async () => {
      await viewer.connect({
        abrConfiguration: {
          strategy: 'performance'
        }
      })
    })

    then('the signaling subscribe is called with abr strategy performance', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.abrConfiguration).toBeDefined()
      expect(lastSubscribeOptions.abrConfiguration.strategy).toBe('performance')
    })
  })

  test('Connect with ABR strategy and initial bitrate', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with abrConfiguration strategy quality and bitrate 2000000', async () => {
      await viewer.connect({
        abrConfiguration: {
          strategy: 'quality',
          metadata: {
            bitrate: 2000000
          }
        }
      })
    })

    then('the signaling subscribe is called with abr strategy quality and metadata bitrate 2000000', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.abrConfiguration).toBeDefined()
      expect(lastSubscribeOptions.abrConfiguration.strategy).toBe('quality')
      expect(lastSubscribeOptions.abrConfiguration.metadata).toBeDefined()
      expect(lastSubscribeOptions.abrConfiguration.metadata.bitrate).toBe(2000000)
    })
  })

  test('Connect with ABR strategy and zero bitrate', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with abrConfiguration strategy bandwidth and bitrate 0', async () => {
      await viewer.connect({
        abrConfiguration: {
          strategy: 'bandwidth',
          metadata: {
            bitrate: 0
          }
        }
      })
    })

    then('the signaling subscribe is called with abr strategy bandwidth and metadata bitrate 0', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.abrConfiguration).toBeDefined()
      expect(lastSubscribeOptions.abrConfiguration.strategy).toBe('bandwidth')
      expect(lastSubscribeOptions.abrConfiguration.metadata).toBeDefined()
      expect(lastSubscribeOptions.abrConfiguration.metadata.bitrate).toBe(0)
    })
  })

  test('Connect with invalid negative bitrate', ({ given, when, then }) => {
    let viewer
    let error

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with abrConfiguration with negative bitrate -1000', async () => {
      try {
        await viewer.connect({
          abrConfiguration: {
            strategy: 'quality',
            metadata: {
              bitrate: -1000
            }
          }
        })
      } catch (e) {
        error = e
      }
    })

    then('throws an error with message containing Invalid bitrate', () => {
      expect(error).toBeDefined()
      expect(error.message).toContain('Invalid bitrate')
      expect(error.message).toContain('-1000')
    })
  })

  test('Connect without ABR configuration', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect without abrConfiguration', async () => {
      await viewer.connect()
    })

    then('the signaling subscribe is called without abr configuration', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.abrConfiguration).toBeUndefined()
    })
  })

  test('Connect with forceSmooth enabled', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with forceSmooth enabled', async () => {
      await viewer.connect({
        forceSmooth: true
      })
    })

    then('the signaling subscribe is called with forceSmooth in abr', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.forceSmooth).toBe(true)
    })
  })

  test('Connect with ABR strategy and forceSmooth combined', ({ given, when, then }) => {
    let viewer

    given('an instance of View with token generator', () => {
      viewer = new View(undefined, mockTokenGenerator)
    })

    when('I connect with abrConfiguration strategy quality and forceSmooth enabled', async () => {
      await viewer.connect({
        abrConfiguration: {
          strategy: 'quality'
        },
        forceSmooth: true
      })
    })

    then('the signaling subscribe is called with abr strategy quality and forceSmooth', () => {
      expect(subscribeSpy).toHaveBeenCalled()
      expect(lastSubscribeOptions.abrConfiguration).toBeDefined()
      expect(lastSubscribeOptions.abrConfiguration.strategy).toBe('quality')
      expect(lastSubscribeOptions.forceSmooth).toBe(true)
    })
  })
})
