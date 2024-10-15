import { VideoCodec } from '../../src/types/Codecs.types'
import { validatePublishConnectOptions } from '../../src/utils/Validators'

describe('Validator: "validatePublishConnectOptions"', () => {
  let validPublishConnectionOptions: any
  beforeEach(() => {
    validPublishConnectionOptions = {
      bandwidth: 0,
      sourceId: 'sourceId',
      codec: VideoCodec.H264,
      events: ['viewercount'],
      metadata: false,
      simulcast: false,
      disableVideo: false,
      disableAudio: false,
      peerConfig: { autoInitStats: true, statsIntervalMs: 5000 },
      mediaStream: {} as MediaStream,
    }
  })
  it('should return error for non object arguments', () => {
    const falseValidate = validatePublishConnectOptions(false)
    expect(falseValidate.error?.messages[0]).toBe('Publish Connection Options must be an object')
    const undefinedValidate = validatePublishConnectOptions(undefined)
    expect(undefinedValidate.error?.messages[0]).toBe('Publish Connection Options must be an object')
    const nullVaidate = validatePublishConnectOptions(null)
    expect(nullVaidate.error?.messages[0]).toBe('Publish Connection Options must be an object')
    const arrayVaidate = validatePublishConnectOptions([])
    expect(arrayVaidate.error?.messages[0]).toBe('Publish Connection Options must be an object')
  })
  it('should validate for empty object', () => {
    const { error } = validatePublishConnectOptions({})
    expect(error).toBeUndefined()
  })
  it('should not return error for valid options', () => {
    const { error } = validatePublishConnectOptions(validPublishConnectionOptions)
    expect(error).toBeUndefined()
  })
  describe('should return error for invalid', () => {
    it('bandwidth', () => {
      validPublishConnectionOptions.bandwidth = true
      const { error } = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(error?.messages[0]).toContain('Invalid bandwidth')
    })
    it('sourceId', () => {
      validPublishConnectionOptions.sourceId = 2
      const { error } = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(error?.messages[0]).toContain('Invalid sourceId')
    })
    it('metadata', () => {
      validPublishConnectionOptions.metadata = {}
      const { error } = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(error?.messages[0]).toContain('Invalid metadata')
    })
    it('peerConfig', () => {
      validPublishConnectionOptions.peerConfig = 2
      const { error } = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(error?.messages[0]).toContain('Invalid peerConfig')
    })
    it('videoCodec', () => {
      validPublishConnectionOptions.codec = 'random string'
      const randomStringValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(randomStringValidation.error?.messages[0]).toContain('Invalid codec')
      validPublishConnectionOptions.codec = ''
      const emptyStringValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(emptyStringValidation.error?.messages[0]).toContain('Invalid codec')
    })
    it('mediaStream', () => {
      validPublishConnectionOptions.mediaStream = 'random string'
      const randomStringValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(randomStringValidation.error?.messages[0]).toContain('Invalid mediaStream')
      validPublishConnectionOptions.mediaStream = null
      const nullValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(nullValidation.error?.messages[0]).toContain('Invalid mediaStream')
      validPublishConnectionOptions.mediaStream = [1, true, 'string']
      const invalidArrayValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(invalidArrayValidation.error?.messages[0]).toContain('Invalid mediaStream')
    })
    it('events', () => {
      validPublishConnectionOptions.events = 'active'
      const stringEventsValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(stringEventsValidation.error?.messages[0]).toContain('Invalid events')
      validPublishConnectionOptions.events = ['active', 'fake_event']
      const fakeEventValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(fakeEventValidation.error?.messages[0]).toContain('Invalid events')
      validPublishConnectionOptions.events = [1, 2, 3]
      const improperEventTypeValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(improperEventTypeValidation.error?.messages[0]).toContain('Invalid events')
    })
  })
  describe('should not return error for valid', () => {
    it('videoCodec', () => {
      validPublishConnectionOptions.codec = 'vp8'
      const vp8Validation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(vp8Validation.error).toBeUndefined()
      validPublishConnectionOptions.codec = 'vp9'
      const vp9Validation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(vp9Validation.error).toBeUndefined()
      validPublishConnectionOptions.codec = 'av1'
      const av1Validation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(av1Validation.error).toBeUndefined()
      validPublishConnectionOptions.codec = 'h264'
      const h264Validation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(h264Validation.error).toBeUndefined()
      validPublishConnectionOptions.codec = 'h265'
      const h265Validation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(h265Validation.error).toBeUndefined()
    })
    it('mediaStream', () => {
      validPublishConnectionOptions.mediaStream = {}
      const emptyObjValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(emptyObjValidation.error).toBeUndefined()
      validPublishConnectionOptions.mediaStream = {
        id: '12345',
        active: true,
        addTrack: jest.fn,
        removeTrack: jest.fn,
      }
      const mediaStreamValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(mediaStreamValidation.error).toBeUndefined()
      validPublishConnectionOptions.mediaStream = []
      const emptyArrayValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(emptyArrayValidation.error).toBeUndefined()
      validPublishConnectionOptions.mediaStream = [
        {
          id: '12345',
          active: true,
          addTrack: jest.fn,
          removeTrack: jest.fn,
        },
        {
          id: '67890',
          active: false,
          addTrack: jest.fn,
          removeTrack: jest.fn,
        },
      ]
      const arrayObjsValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(arrayObjsValidation.error).toBeUndefined()
    })
    it('events', () => {
      validPublishConnectionOptions.events = []
      const emptyEventsValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(emptyEventsValidation.error).toBeUndefined()
      validPublishConnectionOptions.events = ['active', 'inactive', 'viewercount']
      const properEventsValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(properEventsValidation.error).toBeUndefined()
      validPublishConnectionOptions.events = ['active']
      const singleEventValidation = validatePublishConnectOptions(validPublishConnectionOptions)
      expect(singleEventValidation.error).toBeUndefined()
    })
  })
})
