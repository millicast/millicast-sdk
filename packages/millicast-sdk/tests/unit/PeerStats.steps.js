import PeerConnectionStats, { peerConnectionStatsEvents } from '../../src/PeerConnectionStats'

jest.mock('events')

describe('PeerConnectionStats', () => {
  let mockPeer, mockStatsInput, mockStatsOutput, statsInstance

  beforeEach(() => {
    mockPeer = {}
    mockStatsInput = {
      input: {
        audio: [],
        video: []
      },
      output: {
        audio: [],
        video: []
      }
    }
    mockStatsOutput = {
      audio: {
        inbounds: [],
        outbounds: []
      },
      video: {
        inbounds: [],
        outbounds: []
      }
    }
    statsInstance = new PeerConnectionStats(mockPeer)
  })

  test('initializes stats collection when autoInitStats is true (default)', () => {
    expect(statsInstance.collection).not.toBeNull()
  })

  test('does not initialize stats collection when autoInitStats is false', () => {
    statsInstance = new PeerConnectionStats(mockPeer, { autoInitStats: false })
    expect(statsInstance.collection).toBeNull()
  })

  test('stop - stops stats collection', () => {
    const mockCollection = { stop: jest.fn() }
    statsInstance.collection = mockCollection
    statsInstance.stop()
    expect(mockCollection.stop).toHaveBeenCalledTimes(1)
  })

  test('emits stats event when stats are received', () => {
    const emitSpy = jest.spyOn(statsInstance, 'emit')

    // Simulate the collection receiving stats
    statsInstance.collection.emit('stats', mockStatsInput)

    expect(emitSpy).toHaveBeenCalledTimes(1)
    expect(emitSpy).toHaveBeenCalledWith(
      peerConnectionStatsEvents.stats,
      mockStatsOutput
    )
  })
})
