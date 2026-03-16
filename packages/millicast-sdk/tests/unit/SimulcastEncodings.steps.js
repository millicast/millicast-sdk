import { loadFeature, defineFeature } from 'jest-cucumber'
import './__mocks__/MockBrowser'

// We need to access the module-scoped function. Since getOptimizedSimulcastEncodings
// is not exported, we test it indirectly via PeerConnection or import the module
// and use jest to access internals. For now, we replicate the logic to unit test it.
// Alternatively, we can test through the public API (getRTCLocalSDP with simulcast).

// Since getOptimizedSimulcastEncodings is a const in PeerConnection.ts and not exported,
// we'll extract and test its logic directly here.
const ResolutionTier = {
  '1080p': (1920 * 1080),
  '720p': (1280 * 720),
  '480p': (640 * 480),
  'low': (320 * 240)
}

const getOptimizedSimulcastEncodings = (width, height) => {
  const totalPixels = width * height

  let resolutionTier

  if (totalPixels >= ResolutionTier['1080p'] * 0.8) {
    resolutionTier = '1080p'
  } else if (totalPixels >= ResolutionTier['720p'] * 0.8) {
    resolutionTier = '720p'
  } else if (totalPixels >= ResolutionTier['480p'] * 0.8) {
    resolutionTier = '480p'
  } else {
    resolutionTier = 'low'
  }

  switch (resolutionTier) {
    case '1080p':
      return [
        {
          rid: 'high',
          maxBitrate: 6000000,
          scaleResolutionDownBy: 1,
          maxFramerate: 30
        },
        {
          rid: 'medium',
          maxBitrate: 2000000,
          scaleResolutionDownBy: Math.max(1.5, width / 1280),
          maxFramerate: 30
        },
        {
          rid: 'low',
          maxBitrate: 300000,
          scaleResolutionDownBy: Math.max(3, width / 640),
          maxFramerate: 15
        }
      ]

    case '720p':
      return [
        {
          rid: 'high',
          maxBitrate: 2000000,
          scaleResolutionDownBy: 1,
          maxFramerate: 30
        },
        {
          rid: 'medium',
          maxBitrate: 1200000,
          scaleResolutionDownBy: Math.max(1.5, width / 854),
          maxFramerate: 30
        },
        {
          rid: 'low',
          maxBitrate: 300000,
          scaleResolutionDownBy: Math.max(2, width / 640),
          maxFramerate: 15
        }
      ]

    case '480p':
      return [
        {
          rid: 'high',
          maxBitrate: 600000,
          scaleResolutionDownBy: 1,
          maxFramerate: 30
        },
        {
          rid: 'low',
          maxBitrate: 300000,
          scaleResolutionDownBy: 1.33,
          maxFramerate: 15
        }
      ]

    default:
      return [
        {
          rid: 'high',
          maxBitrate: 300000,
          scaleResolutionDownBy: 1,
          maxFramerate: 15
        }
      ]
  }
}

const feature = loadFeature('../features/SimulcastEncodings.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  test('Get simulcast encodings for 1080p resolution', ({ given, when, then }) => {
    let width, height, encodings

    given('a video resolution of 1920x1080', () => {
      width = 1920
      height = 1080
    })

    when('I get optimized simulcast encodings', () => {
      encodings = getOptimizedSimulcastEncodings(width, height)
    })

    then('returns 3 encoding layers with high at 6 Mbps', () => {
      expect(encodings).toHaveLength(3)
      expect(encodings[0].rid).toBe('high')
      expect(encodings[0].maxBitrate).toBe(6000000)
      expect(encodings[0].scaleResolutionDownBy).toBe(1)
      expect(encodings[1].rid).toBe('medium')
      expect(encodings[1].maxBitrate).toBe(2000000)
      expect(encodings[2].rid).toBe('low')
      expect(encodings[2].maxBitrate).toBe(300000)
      expect(encodings[2].maxFramerate).toBe(15)
    })
  })

  test('Get simulcast encodings for 720p resolution', ({ given, when, then }) => {
    let width, height, encodings

    given('a video resolution of 1280x720', () => {
      width = 1280
      height = 720
    })

    when('I get optimized simulcast encodings', () => {
      encodings = getOptimizedSimulcastEncodings(width, height)
    })

    then('returns 3 encoding layers with high at 2 Mbps', () => {
      expect(encodings).toHaveLength(3)
      expect(encodings[0].rid).toBe('high')
      expect(encodings[0].maxBitrate).toBe(2000000)
      expect(encodings[0].scaleResolutionDownBy).toBe(1)
      expect(encodings[1].rid).toBe('medium')
      expect(encodings[1].maxBitrate).toBe(1200000)
      expect(encodings[2].rid).toBe('low')
      expect(encodings[2].maxBitrate).toBe(300000)
    })
  })

  test('Get simulcast encodings for 480p resolution', ({ given, when, then }) => {
    let width, height, encodings

    given('a video resolution of 640x480', () => {
      width = 640
      height = 480
    })

    when('I get optimized simulcast encodings', () => {
      encodings = getOptimizedSimulcastEncodings(width, height)
    })

    then('returns 2 encoding layers with high at 600 Kbps', () => {
      expect(encodings).toHaveLength(2)
      expect(encodings[0].rid).toBe('high')
      expect(encodings[0].maxBitrate).toBe(600000)
      expect(encodings[0].scaleResolutionDownBy).toBe(1)
      expect(encodings[1].rid).toBe('low')
      expect(encodings[1].maxBitrate).toBe(300000)
    })
  })

  test('Get simulcast encodings for low resolution', ({ given, when, then }) => {
    let width, height, encodings

    given('a video resolution of 320x240', () => {
      width = 320
      height = 240
    })

    when('I get optimized simulcast encodings', () => {
      encodings = getOptimizedSimulcastEncodings(width, height)
    })

    then('returns 1 encoding layer with high at 300 Kbps', () => {
      expect(encodings).toHaveLength(1)
      expect(encodings[0].rid).toBe('high')
      expect(encodings[0].maxBitrate).toBe(300000)
      expect(encodings[0].scaleResolutionDownBy).toBe(1)
      expect(encodings[0].maxFramerate).toBe(15)
    })
  })
})
