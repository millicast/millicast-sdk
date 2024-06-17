import { loadFeature, defineFeature } from 'jest-cucumber'
import 'jsdom-worker'
import Logger from '../../src/Logger'
import Signaling from '../../src/Signaling'
import View from '../../src/View'
import MockRTCPeerConnection, { rawStats } from './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
import { changeBrowserMock } from './__mocks__/MockBrowser'
import Publish from '../../src/Publish'
import Diagnostics from '../../src/utils/Diagnostics'
import { version } from '../../package.json'

const feature = loadFeature('../features/LoggerDiagnose.feature', { loadRelativePath: true, errors: true })

jest.mock('../../src/Signaling')

const expectedObject = {
  accountId: expect.any(String),
  streamName: expect.any(String),
  subscriberId: expect.any(String),
  connection: expect.any(String),
  version,
  timestamp: expect.any(String),
  userAgent: expect.any(String),
  stats: expect.any(Array)
}

const mockViewTokenGenerator = jest.fn(() => {
  return {
    urls: [
      'ws://localhost:8080'
    ],
    jwt: 'this-is-a-jwt-dummy-token'
  }
})

const mockPublishTokenGenerator = jest.fn(() => {
  return {
    urls: [
      'ws://localhost:8080'
    ],
    jwt: process.env.JWT_TEST_TOKEN ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJtaWxsaWNhc3QiOnt9fQ.IqT-PLLz-X7Wn7BNo-x4pFApAbMT9mmnlupR8eD9q4U'
  }
})

defineFeature(feature, test => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.spyOn(MockRTCPeerConnection.prototype, 'peerStatsValue').mockReturnValue(rawStats)
    jest.spyOn(Signaling.prototype, 'subscribe').mockReturnValue('sdp')
  })

  test('Get information with failed connection', ({ given, when, then }) => {
    let viewer
    let expectedError
    let diagnose

    given('connection has failed', async () => {
      const mockErrorTokenGenerator = () => Promise.resolve(null)
      viewer = new View('streamName', mockErrorTokenGenerator)

      expectedError = expect(() => viewer.connect())
      expectedError.rejects.toThrow(Error)
    })

    when('I call Logger diagnose function', async () => {
      diagnose = await Logger.diagnose()
    })

    then('console logs an information object', async () => {
      expect(diagnose).toMatchObject(expectedObject)
    })
  }, 10000)

  test('Get information while viewing a stream', ({ given, when, then }) => {
    let viewer
    let diagnose

    given('connection to a stream', async () => {
      viewer = new View('streamName', mockViewTokenGenerator)
      await viewer.connect()
      expect(viewer.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })

    when('I call Logger diagnose function', async () => {
      diagnose = await Logger.diagnose()
    })

    then('console logs an information object', async () => {
      expect(diagnose).toMatchObject(expectedObject)
    })
  }, 10000)

  test('Get information while viewing a stream with stats', ({ given, when, then }) => {
    let viewer
    let diagnose

    given('connection to a stream and stats enabled', async () => {
      viewer = new View('streamName', mockViewTokenGenerator)
      await viewer.connect()
      expect(viewer.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
      viewer.webRTCPeer.initStats()
      const stats = await viewer.webRTCPeer.peer.getStats()
      viewer.webRTCPeer.peerConnectionStats.parseStats(stats)
      Diagnostics.addStats(stats)
    })

    when('I call Logger diagnose function', async () => {
      diagnose = await Logger.diagnose(1)
    })

    then('console logs an information object with stats attribute not empty', async () => {
      expect(diagnose).toMatchObject(expectedObject)
      expect(diagnose.stats.length).toBe(1)
    })
  }, 10000)

  test('Get information while publishing a stream', ({ given, when, then }) => {
    let diagnose
    let publisher
    const mediaStream = new MediaStream([{ kind: 'video' }, { kind: 'audio' }])

    given('a stream being published', async () => {
      publisher = new Publish('streamName', mockPublishTokenGenerator)
      await publisher.connect({ mediaStream })
      expect(publisher.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })

    when('I call Logger diagnose function', async () => {
      diagnose = await Logger.diagnose()
    })

    then('console logs an information object', async () => {
      expect(diagnose).toMatchObject(expectedObject)
    })
  }, 10000)

  test('Get information while failing to publish a stream', ({ given, when, then }) => {
    let diagnose
    let publisher
    let expectedError
    const mediaStream = new MediaStream([{ kind: 'video' }, { kind: 'audio' }])

    given('a stream cannot be published', async () => {
      const mockErrorTokenGenerator = () => Promise.resolve(null)
      publisher = new Publish('streamName', mockErrorTokenGenerator)

      expectedError = expect(() => publisher.connect({ mediaStream }))
      expectedError.rejects.toThrow(Error)
    })

    when('I call Logger diagnose function', async () => {
      diagnose = await Logger.diagnose()
    })

    then('console logs an information object', async () => {
      expect(diagnose).toMatchObject(expectedObject)
    })
  }, 10000)

  test('Get information in another browser', ({ given, when, then }) => {
    let viewer
    let diagnose

    given('I am in Firefox and start a connection to a stream', async () => {
      changeBrowserMock('Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0')

      viewer = new View('streamName', mockViewTokenGenerator)
      await viewer.connect()
      expect(viewer.webRTCPeer.getRTCPeerStatus()).toEqual('connected')
    })

    when('I call Logger diagnose function', async () => {
      diagnose = await Logger.diagnose()
    })

    then("console logs an information object with Firefox's userAgent", async () => {
      expect(diagnose.userAgent).not.toBe(expectedObject.userAgent)
    })
  }, 10000)
})
