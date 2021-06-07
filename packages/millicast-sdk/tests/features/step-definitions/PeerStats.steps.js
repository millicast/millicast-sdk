import { loadFeature, defineFeature } from 'jest-cucumber'
import Publish from '../../../src/Publish'
import PeerConnection from '../../../src/PeerConnection'
import PeerConnectionStats, { peerConnectionStatsEvents } from '../../../src/PeerConnectionStats'
import '../../../src/Signaling'
import MockRTCPeerConnection, { rawStats } from './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
import './__mocks__/MockBrowser'

const feature = loadFeature('../PeerStats.feature', { loadRelativePath: true, errors: true })

jest.useFakeTimers()
jest.mock('../../../src/Signaling')

const mockTokenGenerator = jest.fn(() => {
  return {
    urls: [
      'ws://localhost:8080'
    ],
    jwt: 'this-is-a-jwt-dummy-token'
  }
})

const mediaStream = new MediaStream([{ kind: 'video' }, { kind: 'audio' }])
const handler = jest.fn()

beforeEach(() => {
  jest.restoreAllMocks()
  jest.clearAllTimers()
  jest.spyOn(PeerConnection.prototype, 'getRTCIceServers').mockReturnValue([])
  jest.spyOn(MockRTCPeerConnection.prototype, 'peerStatsValue').mockReturnValue(rawStats)
})

defineFeature(feature, test => {
  test('Get stats', ({ given, when, then }) => {
    let publisher

    given('I am connected with the peer', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })

    when('I want to get the peer stats', () => {
      publisher.webRTCPeer.on(peerConnectionStatsEvents.stats, handler)
      publisher.webRTCPeer.initStats()
      expect(handler).not.toBeCalled()
    })

    then('each second returns the peer stats parsed', async () => {
      for (let i = 1; i <= 10; i++) {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
        expect(handler).toBeCalledTimes(i)
      }
    })
  })

  test('Get stats without codec information', ({ given, when, then }) => {
    let publisher

    given('I am connected with the peer', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })

    when('I want to get the peer stats and peer does not have codec information', () => {
      jest.spyOn(MockRTCPeerConnection.prototype, 'peerStatsGetReport').mockReturnValue({
        candidateType: 'relay'
      })
      publisher.webRTCPeer.on(peerConnectionStatsEvents.stats, handler)
      publisher.webRTCPeer.initStats()
      expect(handler).not.toBeCalled()
    })

    then('each second returns the peer stats parsed', async () => {
      for (let i = 1; i <= 10; i++) {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
        expect(handler).toBeCalledTimes(i)
      }
    })
  })

  test('Get stats without codec report', ({ given, when, then }) => {
    let publisher

    given('I am connected with the peer', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })

    when('I want to get the peer stats and peer have codec id related and report does not have the report', () => {
      jest.spyOn(MockRTCPeerConnection.prototype, 'peerStatsGetReport').mockImplementation((reportId) => {
        if (reportId.toString().toLowerCase().includes('codec')) {
          return undefined
        } else {
          return {
            candidateType: 'relay'
          }
        }
      })
      publisher.webRTCPeer.on(peerConnectionStatsEvents.stats, handler)
      publisher.webRTCPeer.initStats()
      expect(handler).not.toBeCalled()
    })

    then('each second returns the peer stats parsed', async () => {
      for (let i = 1; i <= 10; i++) {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
        expect(handler).toBeCalledTimes(i)
      }
    })
  })

  test('Stop get stats', ({ given, when, then }) => {
    let publisher

    given('I am getting stats', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')

      publisher.webRTCPeer.on(peerConnectionStatsEvents.stats, handler)
      publisher.webRTCPeer.initStats()
      jest.advanceTimersByTime(1000)
      await Promise.resolve()
      expect(handler).toBeCalledTimes(1)
    })

    when('I want to stop get stats', () => {
      publisher.webRTCPeer.stopStats()
    })

    then('no new peer stats is received', async () => {
      jest.advanceTimersByTime(8000)
      await Promise.resolve()
      expect(handler).toBeCalledTimes(1)
    })
  })

  test('Get stats when it is already initiated', ({ given, when, then }) => {
    let publisher

    given('I am getting stats', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')

      jest.spyOn(PeerConnectionStats.prototype, 'init').mockImplementation(jest.fn)
      publisher.webRTCPeer.initStats()
      expect(publisher.webRTCPeer.peerConnectionStats.init).toBeCalledTimes(1)
    })

    when('I want to get stats', () => {
      publisher.webRTCPeer.initStats()
    })

    then('the get stats is not initialized again', () => {
      expect(publisher.webRTCPeer.peerConnectionStats.init).toBeCalledTimes(1)
    })
  })

  test('Get stats with no existing peer', ({ given, when, then }) => {
    let publisher

    given('I do not have peer connected', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
    })

    when('I want to get stats', () => {
      publisher.webRTCPeer.initStats()
    })

    then('the get stats is not initialized', () => {
      expect(publisher.webRTCPeer.peerConnectionStats).toBeNull()
    })
  })

  test('Calculate inbound bitrate with no existing previous stats', ({ given, when, then }) => {
    let publisher

    given('I have new inbound raw stats and no existing previous stats', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
      publisher.webRTCPeer.initStats()
      publisher.webRTCPeer.peerConnectionStats.stats = null
      jest.spyOn(MockRTCPeerConnection.prototype, 'peerStatsValue').mockReturnValue([
        {
          id: 'inbound1',
          type: 'inbound-rtp',
          mediaType: 'video',
          codecId: 'Codec1',
          bytesReceived: 2000,
          framesPerSecond: 30
        }
      ])
    })

    when('I want to parse the stats', async () => {
      const stats = await publisher.webRTCPeer.peer.getStats()
      publisher.webRTCPeer.peerConnectionStats.parseStats(stats)
    })

    then('returns the parsed stats with 0 bitrate', () => {
      expect(publisher.webRTCPeer.peerConnectionStats.stats.video.inbounds[0].bitrate).toBe(0)
    })
  })

  test('Calculate inbound bitrate with previous stats and existing related report', ({ given, when, then }) => {
    let publisher

    given('I have new inbound raw stats with 12000 bytes received and existing previous stats and related report with 10000 bytes received', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
      publisher.webRTCPeer.initStats()
      publisher.webRTCPeer.peerConnectionStats.stats = {
        video: {
          inbounds: [
            {
              id: 'inbound1',
              totalBytesReceived: 10000,
              totalPacketsLost: 0
            }
          ]
        }
      }
      jest.spyOn(MockRTCPeerConnection.prototype, 'peerStatsValue').mockReturnValue([
        {
          id: 'inbound1',
          type: 'inbound-rtp',
          mediaType: 'video',
          codecId: 'Codec1',
          bytesReceived: 12000,
          framesPerSecond: 30,
          packetsLost: 0
        }
      ])
    })

    when('I want to parse the stats', async () => {
      const stats = await publisher.webRTCPeer.peer.getStats()
      publisher.webRTCPeer.peerConnectionStats.parseStats(stats)
    })

    then('returns the parsed stats with 16000 bitrate', () => {
      expect(publisher.webRTCPeer.peerConnectionStats.stats.video.inbounds[0].bitrate).toBe(16000)
    })
  })

  test('Calculate inbound bitrate with previous stats and unexisting related report', ({ given, when, then }) => {
    let publisher

    given('I have new inbound raw stats with 12000 bytes received and existing previous stats with unexisting related report', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
      publisher.webRTCPeer.initStats()
      publisher.webRTCPeer.peerConnectionStats.stats = {
        video: {
          inbounds: [
            {
              id: 'inbound2',
              totalBytesReceived: 10000,
              totalPacketsLost: 0
            }
          ]
        }
      }
      jest.spyOn(MockRTCPeerConnection.prototype, 'peerStatsValue').mockReturnValue([
        {
          id: 'inbound1',
          type: 'inbound-rtp',
          mediaType: 'video',
          codecId: 'Codec1',
          bytesReceived: 12000,
          framesPerSecond: 30,
          packetsLost: 0
        }
      ])
    })

    when('I want to parse the stats', async () => {
      const stats = await publisher.webRTCPeer.peer.getStats()
      publisher.webRTCPeer.peerConnectionStats.parseStats(stats)
    })

    then('returns the parsed stats with 0 bitrate', () => {
      expect(publisher.webRTCPeer.peerConnectionStats.stats.video.inbounds[0].bitrate).toBe(0)
    })
  })

  test('Calculate outbound bitrate with no existing previous stats', ({ given, when, then }) => {
    let publisher

    given('I have new outbound raw stats and no existing previous stats', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
      publisher.webRTCPeer.initStats()
      publisher.webRTCPeer.peerConnectionStats.stats = null
      jest.spyOn(MockRTCPeerConnection.prototype, 'peerStatsValue').mockReturnValue([
        {
          id: 'outbound1',
          type: 'outbound-rtp',
          mediaType: 'video',
          codecId: 'Codec1',
          bytesSent: 2000,
          framesPerSecond: 30
        }
      ])
    })

    when('I want to parse the stats', async () => {
      const stats = await publisher.webRTCPeer.peer.getStats()
      publisher.webRTCPeer.peerConnectionStats.parseStats(stats)
    })

    then('returns the parsed stats with 0 bitrate', () => {
      expect(publisher.webRTCPeer.peerConnectionStats.stats.video.outbounds[0].bitrate).toBe(0)
    })
  })

  test('Calculate outbound bitrate with previous stats and existing related report', ({ given, when, then }) => {
    let publisher

    given('I have new outbound raw stats with 12000 bytes sent and existing previous stats and related report with 10000 bytes sent', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
      publisher.webRTCPeer.initStats()
      publisher.webRTCPeer.peerConnectionStats.stats = {
        video: {
          outbounds: [
            {
              id: 'outbound1',
              totalBytesSent: 10000
            }
          ]
        }
      }
      jest.spyOn(MockRTCPeerConnection.prototype, 'peerStatsValue').mockReturnValue([
        {
          id: 'outbound1',
          type: 'outbound-rtp',
          mediaType: 'video',
          codecId: 'Codec1',
          bytesSent: 12000,
          framesPerSecond: 30
        }
      ])
    })

    when('I want to parse the stats', async () => {
      const stats = await publisher.webRTCPeer.peer.getStats()
      publisher.webRTCPeer.peerConnectionStats.parseStats(stats)
    })

    then('returns the parsed stats with 16000 bitrate', () => {
      expect(publisher.webRTCPeer.peerConnectionStats.stats.video.outbounds[0].bitrate).toBe(16000)
    })
  })

  test('Calculate outbound bitrate with previous stats and unexisting related report', ({ given, when, then }) => {
    let publisher

    given('I have new outbound raw stats with 12000 bytes sent and existing previous stats with unexisting related report', async () => {
      publisher = new Publish('streamName', mockTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
      publisher.webRTCPeer.initStats()
      publisher.webRTCPeer.peerConnectionStats.stats = {
        video: {
          outbounds: [
            {
              id: 'outbound2',
              totalBytesSent: 10000
            }
          ]
        }
      }
      jest.spyOn(MockRTCPeerConnection.prototype, 'peerStatsValue').mockReturnValue([
        {
          id: 'outbound1',
          type: 'outbound-rtp',
          mediaType: 'video',
          codecId: 'Codec1',
          bytesSent: 12000,
          framesPerSecond: 30
        }
      ])
    })

    when('I want to parse the stats', async () => {
      const stats = await publisher.webRTCPeer.peer.getStats()
      publisher.webRTCPeer.peerConnectionStats.parseStats(stats)
    })

    then('returns the parsed stats with 0 bitrate', () => {
      expect(publisher.webRTCPeer.peerConnectionStats.stats.video.outbounds[0].bitrate).toBe(0)
    })
  })
})
