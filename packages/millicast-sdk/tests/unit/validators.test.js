import { validatePublishConnectOptions } from '../../src/utils/validators'
import { VideoCodec } from '../../src/types/Codecs.types'

describe('validatePublishConnectOptions', () => {
  test('returns no error for valid options', () => {
    const options = {
      sourceId: 'source-1',
      stereo: true,
      dtx: true,
      absCaptureTime: true,
      dependencyDescriptor: false,
      bandwidth: 0,
      metadata: false,
      disableVideo: false,
      disableAudio: false,
      codec: VideoCodec.H264,
      simulcast: true,
      scalabilityMode: 'L1T3',
      peerConfig: { autoInitStats: true },
      record: false,
      events: ['active', 'inactive'],
      priority: 1,
    }

    const result = validatePublishConnectOptions(options)

    expect(result.error).toBeUndefined()
    expect(result.value).toBe(options)
  })

  test('returns validation error for non-object input', () => {
    const result = validatePublishConnectOptions(null)

    expect(result.error).toBeDefined()
    expect(result.error?.messages).toEqual(['Publish Connection Options must be an object'])
  })

  test('collects multiple validation errors', () => {
    const result = validatePublishConnectOptions({
      sourceId: 123,
      stereo: 'true',
      bandwidth: '1000',
      codec: 'invalid-codec',
      events: ['active', 'not-supported'],
      priority: 'high',
    })

    expect(result.error).toBeDefined()
    expect(result.error?.messages).toEqual(
      expect.arrayContaining([
        'Invalid sourceId: 123',
        'Invalid stereo: true',
        'Invalid bandwidth: 1000',
        'Invalid codec: invalid-codec',
        'Invalid events: active,not-supported',
        'Invalid priority: high',
      ]),
    )
  })

  test('validates events whitelist', () => {
    const validResult = validatePublishConnectOptions({ events: ['active', 'inactive', 'viewercount'] })
    const invalidResult = validatePublishConnectOptions({ events: ['active', 'vad'] })

    expect(validResult.error).toBeUndefined()
    expect(invalidResult.error).toBeDefined()
    expect(invalidResult.error?.messages).toContain('Invalid events: active,vad')
  })
})
