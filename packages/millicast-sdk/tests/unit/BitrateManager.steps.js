import { loadFeature, defineFeature } from 'jest-cucumber'
import BitrateManager from '../../src/utils/BitrateManager'
import './__mocks__/MockBrowser'

const feature = loadFeature('../features/BitrateManager.feature', { loadRelativePath: true, errors: true })

jest.setTimeout(30000)

const createMockSender = (kind, encodingCount = 1) => {
  const encodings = []
  for (let i = 0; i < encodingCount; i++) {
    encodings.push({})
  }
  return {
    track: { kind },
    getParameters: jest.fn().mockReturnValue({
      encodings,
      codecs: [],
      headerExtensions: [],
      rtcp: {}
    }),
    setParameters: jest.fn().mockResolvedValue(undefined)
  }
}

const createMockPeerConnection = (senders = []) => {
  return {
    getSenders: jest.fn().mockReturnValue(senders),
    getTransceivers: jest.fn().mockReturnValue([])
  }
}

defineFeature(feature, test => {
  test('Update video bitrate on a single video sender', ({ given, when, then }) => {
    let bitrateManager
    let videoSender

    given('a peer connection with 1 video sender', () => {
      videoSender = createMockSender('video', 1)
      const peer = createMockPeerConnection([videoSender])
      bitrateManager = new BitrateManager(peer)
    })

    when('I update the video bitrate to 2000000', async () => {
      await bitrateManager.updateVideoBitrate(2000000)
    })

    then('the video sender parameters are updated with the bitrate', () => {
      expect(videoSender.setParameters).toHaveBeenCalledTimes(1)
      const params = videoSender.setParameters.mock.calls[0][0]
      expect(params.encodings[0].maxBitrate).toBe(2000000)
    })
  })

  test('Update video bitrate with simulcast encodings', ({ given, when, then }) => {
    let bitrateManager
    let videoSender

    given('a peer connection with 1 video sender with 3 simulcast encodings', () => {
      videoSender = createMockSender('video', 3)
      const peer = createMockPeerConnection([videoSender])
      bitrateManager = new BitrateManager(peer)
    })

    when('I update the video bitrate to 3000000', async () => {
      await bitrateManager.updateVideoBitrate(3000000)
    })

    then('the simulcast encodings are distributed across layers', () => {
      expect(videoSender.setParameters).toHaveBeenCalledTimes(1)
      const params = videoSender.setParameters.mock.calls[0][0]
      // Distribution: 70%, 20%, 10%
      expect(params.encodings[0].maxBitrate).toBe(Math.floor(3000000 * 0.7))
      expect(params.encodings[1].maxBitrate).toBe(Math.floor(3000000 * 0.2))
      expect(params.encodings[2].maxBitrate).toBe(Math.floor(3000000 * 0.1))
    })
  })

})
