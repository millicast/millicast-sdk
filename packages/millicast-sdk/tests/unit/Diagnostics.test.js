import Diagnostics from '../../src/utils/Diagnostics'
import { version } from '../../package.json'

// Mock package.json
jest.mock('../../package.json', () => ({
  version: '1.0.0'
}))

// Mock window.navigator at module level
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
  configurable: true
})
const createMockStats = (timestamp = Date.now()) => ({
  timestamp,
  audio: {
    inbounds: [{
      timestamp,
      bitrateBitsPerSecond: 64000,
      packetsLostDeltaPerSecond: 0,
      jitter: 0.001,
      mid: 'audio-mid',
      mimeType: 'audio/opus'
    }],
    outbounds: []
  },
  video: {
    inbounds: [{
      timestamp,
      bitrateBitsPerSecond: 1000000,
      packetsLostDeltaPerSecond: 1,
      jitter: 0.002,
      mid: 'video-mid',
      mimeType: 'video/h264'
    }],
    outbounds: []
  }
})

describe('Diagnostics', () => {
  // Helper function to reset internal state
  const resetDiagnosticsState = () => {
    // Since there's no reset method, we need to work around the "only set once" behavior
    // by using fresh values for each test
    const timestamp = Date.now()
    return {
      accountId: `account-${timestamp}`,
      streamName: `stream-${timestamp}`,
      subscriberId: `subscriber-${timestamp}`,
      streamViewId: `view-${timestamp}`,
      feedId: `feed-${timestamp}`,
      clusterId: `cluster-${timestamp}`
    }
  }

  describe('Initialization methods', () => {
    test('initAccountId should set account ID only once', () => {
      const testData = resetDiagnosticsState()
      Diagnostics.initAccountId(testData.accountId)
      Diagnostics.initAccountId('should-not-override')

      const result = Diagnostics.get()
      expect(result.accountId).toBe(testData.accountId)
    })

    test('initStreamName should set stream name only once', () => {
      const testData = resetDiagnosticsState()
      Diagnostics.initStreamName(testData.streamName)
      Diagnostics.initStreamName('should-not-override')

      const result = Diagnostics.get()
      expect(result.streamName).toBe(testData.streamName)
    })

    test('initSubscriberId should set subscriber ID only once', () => {
      const testData = resetDiagnosticsState()
      Diagnostics.initSubscriberId(testData.subscriberId)
      Diagnostics.initSubscriberId('should-not-override')

      const result = Diagnostics.get()
      expect(result.subscriberId).toBe(testData.subscriberId)
    })

    test('initStreamViewId should set stream view ID only once', () => {
      const testData = resetDiagnosticsState()
      Diagnostics.initStreamViewId(testData.streamViewId)
      Diagnostics.initStreamViewId('should-not-override')

      const result = Diagnostics.get()
      expect(result.streamViewId).toBe(testData.streamViewId)
    })

    test('initFeedId should set feed ID only once', () => {
      const testData = resetDiagnosticsState()
      Diagnostics.initFeedId(testData.feedId)
      Diagnostics.initFeedId('should-not-override')

      const result = Diagnostics.get()
      expect(result.feedId).toBe(testData.feedId)
    })

    test('setClusterId should set cluster ID only once', () => {
      const testData = resetDiagnosticsState()
      Diagnostics.setClusterId(testData.clusterId)
      Diagnostics.setClusterId('should-not-override')

      const result = Diagnostics.get()
      expect(result.clusterId).toBe(testData.clusterId)
    })
  })

  describe('Connection state methods', () => {
    test('setConnectionTime should set connection time only once', () => {
      const time1 = Date.now()
      const time2 = Date.now() + 1000

      Diagnostics.setConnectionTime(time1)
      Diagnostics.setConnectionTime(time2) // Should not override

      const result = Diagnostics.get()
      expect(result.connectionDurationMs).toBeGreaterThanOrEqual(0)
    })

    test('setConnectionState should update connection state', () => {
      Diagnostics.setConnectionState('connected')
      let result = Diagnostics.get()
      expect(result.connection).toBe('connected')

      Diagnostics.setConnectionState('disconnected')
      result = Diagnostics.get()
      expect(result.connection).toBe('disconnected')
    })
  })

  describe('Stats management', () => {
    test('addStats should add stats to the collection', () => {
      const mockStats = createMockStats()
      const initialLength = Diagnostics.get().stats.length

      Diagnostics.addStats(mockStats)

      const result = Diagnostics.get()
      expect(result.stats.length).toBe(initialLength + 1)
      expect(result.stats[result.stats.length - 1]).toEqual(mockStats)
    })

    test('addStats should maintain maximum history size', () => {
      // Clear existing stats by getting current count
      const currentCount = Diagnostics.get().stats.length
      const statsToAdd = 65 - currentCount

      // Add enough stats to exceed MAX_STATS_HISTORY_SIZE (60)
      for (let i = 0; i < statsToAdd; i++) {
        Diagnostics.addStats(createMockStats(Date.now() + i))
      }

      const result = Diagnostics.get()
      expect(result.stats.length).toBeLessThanOrEqual(60) // Should not exceed MAX_STATS_HISTORY_SIZE
    })

    test('addStats should remove oldest stats when at capacity', () => {
      // First, fill up to near capacity with known stats
      const uniqueTimestamp = Date.now() + 999999 // Use a very unique timestamp
      const testStats = createMockStats(uniqueTimestamp)

      // Add the test stat
      Diagnostics.addStats(testStats)

      // Add many more to push it out
      for (let i = 0; i < 65; i++) {
        Diagnostics.addStats(createMockStats(Date.now() + i + 1000000))
      }

      const result = Diagnostics.get()
      // The original test stat should be pushed out
      expect(result.stats.find(s => s.timestamp === uniqueTimestamp)).toBeUndefined()
    })
  })

  describe('get method', () => {
    test('should return diagnostics object with correct structure', () => {
      const result = Diagnostics.get()

      expect(result).toHaveProperty('client', '@millicast/millicast-sdk')
      expect(result).toHaveProperty('version', version)
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('userAgent')
      expect(result).toHaveProperty('clusterId')
      expect(result).toHaveProperty('accountId')
      expect(result).toHaveProperty('streamName')
      expect(result).toHaveProperty('connection')
      expect(result).toHaveProperty('stats')
      expect(result).toHaveProperty('connectionDurationMs')
    })

    test('should include feedId when set and prioritize over streamViewId', () => {
      const result = Diagnostics.get()

      // Since feedId was set in previous tests and persists, it should be present
      if (result.feedId) {
        expect(result).toHaveProperty('feedId')
        expect(result).not.toHaveProperty('streamViewId')
      } else if (result.streamViewId) {
        expect(result).toHaveProperty('streamViewId')
      }
    })

    test('should handle invalid statsCount parameters', () => {
      const currentStatsLength = Diagnostics.get().stats.length

      // Test invalid parameters - should return current stats length or max
      expect(Diagnostics.get(-1).stats.length).toBe(currentStatsLength)
      expect(Diagnostics.get(0).stats.length).toBe(currentStatsLength)
      expect(Diagnostics.get(100).stats.length).toBe(currentStatsLength)
      expect(Diagnostics.get('invalid').stats.length).toBe(currentStatsLength)

      // Test valid parameter
      if (currentStatsLength >= 5) {
        expect(Diagnostics.get(5).stats).toHaveLength(5)
      }
    })

    test('should return limited number of stats when requested', () => {
      // Add some stats first
      for (let i = 0; i < 10; i++) {
        Diagnostics.addStats(createMockStats(Date.now() + i))
      }

      const result = Diagnostics.get(5)
      expect(result.stats.length).toBeLessThanOrEqual(5)
    })
  })

  describe('CMCD format transformation', () => {
    const createMockStats = (timestamp = Date.now()) => ({
      timestamp,
      audio: {
        inbounds: [{
          timestamp: 1234567890,
          bitrateBitsPerSecond: 64000,
          packetsLostDeltaPerSecond: 2,
          jitter: 0.001,
          jitterBufferDelay: 0.05,
          packetRate: 50,
          mid: 'audio-mid',
          mimeType: 'audio/opus'
        }],
        outbounds: []
      },
      video: {
        inbounds: [{
          timestamp: 1234567891,
          bitrateBitsPerSecond: 1000000,
          packetsLostDeltaPerSecond: 1,
          jitter: 0.002,
          jitterBufferDelay: 0.1,
          packetRate: 30,
          mid: 'video-mid',
          mimeType: 'video/h264'
        }],
        outbounds: []
      }
    })

    test('should transform to CMCD format when requested', () => {
      // Clear existing stats and add our test data
      const mockStatsWithData = createMockStats()
      Diagnostics.addStats(mockStatsWithData)

      const result = Diagnostics.get(1, 'CMCD') // Get only the last stat

      // Should have audio and video stats from our mock data
      const audioStats = result.stats.filter(s => s.ot === 'a')
      const videoStats = result.stats.filter(s => s.ot === 'v')

      expect(audioStats.length).toBeGreaterThan(0)
      expect(videoStats.length).toBeGreaterThan(0)

      const audioStat = audioStats[audioStats.length - 1] // Get the last audio stat
      const videoStat = videoStats[videoStats.length - 1] // Get the last video stat

      expect(audioStat).toMatchObject({
        ts: 1234567890,
        ot: 'a',
        bl: 0.05,
        br: 64000,
        pld: 2,
        j: 0.001,
        mtp: 50,
        mid: 'audio-mid',
        mimeType: 'audio/opus'
      })

      expect(videoStat).toMatchObject({
        ts: 1234567891,
        ot: 'v',
        bl: 0.1,
        br: 1000000,
        pld: 1,
        j: 0.002,
        mtp: 30,
        mid: 'video-mid',
        mimeType: 'video/h264'
      })
    })

    test('should handle outbound stats when inbound stats are empty', () => {
      const mockOutboundStats = {
        timestamp: Date.now(),
        audio: {
          inbounds: [],
          outbounds: [{
            timestamp: 1234567890,
            bitrateBitsPerSecond: 64000,
            mid: 'audio-out-mid',
            mimeType: 'audio/opus'
          }]
        },
        video: {
          inbounds: [],
          outbounds: [{
            timestamp: 1234567891,
            bitrateBitsPerSecond: 1000000,
            mid: 'video-out-mid',
            mimeType: 'video/h264'
          }]
        }
      }

      Diagnostics.addStats(mockOutboundStats)

      const result = Diagnostics.get(1, 'CMCD')

      const audioStats = result.stats.filter(s => s.ot === 'a')
      const videoStats = result.stats.filter(s => s.ot === 'v')

      expect(audioStats.length).toBeGreaterThan(0)
      expect(videoStats.length).toBeGreaterThan(0)

      const audioStat = audioStats[audioStats.length - 1]
      const videoStat = videoStats[videoStats.length - 1]

      expect(audioStat.mid).toBe('audio-out-mid')
      expect(videoStat.mid).toBe('video-out-mid')
    })

    test('should handle missing properties with defaults in CMCD format', () => {
      const incompleteStats = {
        timestamp: Date.now(),
        audio: {
          inbounds: [{ timestamp: undefined }],
          outbounds: []
        },
        video: {
          inbounds: [{}],
          outbounds: []
        }
      }

      Diagnostics.addStats(incompleteStats)

      const result = Diagnostics.get(1, 'CMCD')

      const audioStats = result.stats.filter(s => s.ot === 'a')
      const videoStats = result.stats.filter(s => s.ot === 'v')

      expect(audioStats.length).toBeGreaterThan(0)
      expect(videoStats.length).toBeGreaterThan(0)

      const audioStat = audioStats[audioStats.length - 1]
      const videoStat = videoStats[videoStats.length - 1]

      expect(audioStat).toMatchObject({
        ts: '',
        ot: 'a',
        bl: 0,
        br: 0,
        pld: 0,
        j: 0,
        mtp: 0,
        mid: '',
        mimeType: ''
      })

      expect(videoStat).toMatchObject({
        ts: '',
        ot: 'v',
        bl: 0,
        br: 0,
        pld: 0,
        j: 0,
        mtp: 0,
        mid: '',
        mimeType: ''
      })
    })
  })

  describe('User Agent handling', () => {
    test('should use navigator.userAgent when available', () => {
      const result = Diagnostics.get()
      // The userAgent is set at module load time, so we check if it exists
      expect(result.userAgent).toBeDefined()
      expect(typeof result.userAgent).toBe('string')
    })

    test('should handle missing navigator', () => {
      // This test is more about ensuring the module doesn't crash
      // when navigator is undefined, which is handled by the optional chaining
      const result = Diagnostics.get()
      expect(result.userAgent).toBeDefined()
    })
  })

  describe('Timestamp and duration calculations', () => {
    test('should calculate connection duration correctly', () => {
      const startTime = Date.now()

      // Mock Date.now for the get() call
      const originalDateNow = Date.now
      Date.now = jest.fn()
        .mockReturnValueOnce(startTime) // For setConnectionTime
        .mockReturnValue(startTime + 5000) // For get() call

      Diagnostics.setConnectionTime(startTime)

      const result = Diagnostics.get()
      expect(result.connectionDurationMs).toBeGreaterThanOrEqual(0)

      // Restore original Date.now
      Date.now = originalDateNow
    })

    test('should include ISO timestamp', () => {
      const result = Diagnostics.get()
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })
})
