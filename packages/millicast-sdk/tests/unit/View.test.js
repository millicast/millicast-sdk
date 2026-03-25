import View from '../../src/View'
import Signaling from '../../src/Signaling'
import './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockBrowser'

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
  rtcDrmEnvironments: { Production: 'production' },
  rtcDrmFeedFrame: jest.fn()
}))

const mockTokenGenerator = jest.fn(() => {
  return {
    urls: ['ws://localhost:8080'],
    jwt: 'this-is-a-jwt-dummy-token'
  }
})

describe('View', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Signaling.prototype, 'subscribe').mockReturnValue('sdp')
  })

  describe('constructor', () => {
    test('should throw error when tokenGenerator is not provided', () => {
      expect(() => new View()).toThrow('Token generator is required to construct this module.')
    })

    test('should create instance with valid tokenGenerator', () => {
      const viewer = new View(undefined, mockTokenGenerator)
      expect(viewer).toBeInstanceOf(View)
    })

    test('should accept streamName in constructor (deprecated)', () => {
      const viewer = new View('test-stream', mockTokenGenerator)
      // streamName is deprecated and not stored directly on View
      expect(viewer).toBeInstanceOf(View)
    })
  })

  describe('DRM configuration', () => {
    let viewer

    beforeEach(() => {
      viewer = new View('test-stream', mockTokenGenerator)
    })

    test('isDRMOn should return false when no DRM configured', () => {
      expect(viewer.isDRMOn).toBe(false)
    })

    test('configureDRM should throw error when options not provided', () => {
      expect(() => viewer.configureDRM()).toThrow('Required DRM options is not provided')
      expect(() => viewer.configureDRM(null)).toThrow('Required DRM options is not provided')
    })

    test('configureDRM should initialize drmOptionsMap', () => {
      const mockVideoElement = {
        id: 'video1',
        addEventListener: jest.fn()
      }

      const drmOptions = {
        videoElement: mockVideoElement,
        audioElement: null,
        videoMid: '0',
        videoEncryptionParams: {
          keyId: '00000000000000000000000000000001',
          iv: '00000000000000000000000000000002'
        }
      }

      viewer.configureDRM(drmOptions)
      expect(viewer.drmOptionsMap).toBeDefined()
      expect(viewer.drmOptionsMap.size).toBe(1)
    })

    test('configureDRM should add audioMid when provided', () => {
      const mockVideoElement = {
        id: 'video1',
        addEventListener: jest.fn()
      }

      const drmOptions = {
        videoElement: mockVideoElement,
        audioElement: null,
        videoMid: '0',
        audioMid: '1',
        videoEncryptionParams: {
          keyId: '00000000000000000000000000000001',
          iv: '00000000000000000000000000000002'
        }
      }

      viewer.configureDRM(drmOptions)
      expect(viewer.drmOptionsMap.size).toBe(2)
      expect(viewer.drmOptionsMap.has('0')).toBe(true)
      expect(viewer.drmOptionsMap.has('1')).toBe(true)
    })

    test('removeDRMConfiguration should remove mediaId from map', () => {
      const mockVideoElement = {
        id: 'video1',
        addEventListener: jest.fn()
      }

      viewer.configureDRM({
        videoElement: mockVideoElement,
        audioElement: null,
        videoMid: '0',
        videoEncryptionParams: {
          keyId: '00000000000000000000000000000001',
          iv: '00000000000000000000000000000002'
        }
      })

      expect(viewer.drmOptionsMap.has('0')).toBe(true)
      viewer.removeDRMConfiguration('0')
      expect(viewer.drmOptionsMap.has('0')).toBe(false)
    })

    test('removeDRMConfiguration should handle non-existent mediaId gracefully', () => {
      viewer.drmOptionsMap = new Map()
      expect(() => viewer.removeDRMConfiguration('nonexistent')).not.toThrow()
    })

    test('getDRMConfiguration should return null when no config exists', () => {
      expect(viewer.getDRMConfiguration('0')).toBeNull()
    })

    test('getDRMConfiguration should return config when exists', () => {
      const mockVideoElement = {
        id: 'video1',
        addEventListener: jest.fn()
      }

      viewer.configureDRM({
        videoElement: mockVideoElement,
        audioElement: null,
        videoMid: '0',
        videoEncryptionParams: {
          keyId: '00000000000000000000000000000001',
          iv: '00000000000000000000000000000002'
        }
      })

      const config = viewer.getDRMConfiguration('0')
      expect(config).toBeDefined()
      expect(config.videoElement).toBe(mockVideoElement)
    })
  })

  describe('exchangeDRMConfiguration', () => {
    let viewer

    beforeEach(() => {
      viewer = new View('test-stream', mockTokenGenerator)
    })

    test('should throw error when target DRM config not found', () => {
      viewer.drmOptionsMap = new Map()
      expect(() => viewer.exchangeDRMConfiguration('0', '1')).toThrow('No DRM configuration found for 0')
    })

    test('should throw error when source DRM config not found', () => {
      const mockVideoElement = { id: 'video1', addEventListener: jest.fn() }
      viewer.configureDRM({
        videoElement: mockVideoElement,
        audioElement: null,
        videoMid: '0',
        videoEncryptionParams: {
          keyId: '00000000000000000000000000000001',
          iv: '00000000000000000000000000000002'
        }
      })

      expect(() => viewer.exchangeDRMConfiguration('0', '1')).toThrow('No DRM configuration found for 1')
    })
  })

  describe('select method', () => {
    let viewer

    beforeEach(() => {
      viewer = new View('test-stream', mockTokenGenerator)
      viewer.signaling = {
        cmd: jest.fn().mockResolvedValue({}),
        close: jest.fn()
      }
    })

    test('select should call signaling cmd with layer info', async () => {
      const layer = { encodingId: '0', spatialLayerId: 0, temporalLayerId: 0 }
      await viewer.select(layer)

      expect(viewer.signaling.cmd).toHaveBeenCalledWith('select', expect.objectContaining({
        layer
      }))
    })
  })

  describe('stop', () => {
    let viewer

    beforeEach(() => {
      viewer = new View('test-stream', mockTokenGenerator)
    })

    test('stop should close signaling and peer connection', () => {
      const mockClose = jest.fn()
      const mockCloseRTCPeer = jest.fn()

      viewer.signaling = { close: mockClose }
      viewer.webRTCPeer = { closeRTCPeer: mockCloseRTCPeer }

      viewer.stop()

      expect(mockClose).toHaveBeenCalled()
      expect(mockCloseRTCPeer).toHaveBeenCalled()
    })

    test('stop should handle missing signaling gracefully', () => {
      viewer.signaling = null
      viewer.webRTCPeer = { closeRTCPeer: jest.fn() }

      expect(() => viewer.stop()).not.toThrow()
    })
  })
})
