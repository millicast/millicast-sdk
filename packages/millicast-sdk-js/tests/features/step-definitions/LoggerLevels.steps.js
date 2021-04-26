import { loadFeature, defineFeature } from 'jest-cucumber'

let MillicastLogger
beforeEach(() => {
  jest.isolateModules(() => {
    MillicastLogger = require('../../../src/MillicastLogger').default
  })
})

const feature = loadFeature('../LoggerLevels.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  test('Set global level to INFO', ({ given, when, then }) => {
    given('global level is OFF', async () => {
      MillicastLogger.setLevel(MillicastLogger.OFF)
    })

    when('I set global level to INFO', async () => {
      MillicastLogger.setLevel(MillicastLogger.INFO)
    })

    then('new level is INFO', async () => {
      expect(MillicastLogger.getLevel()).toEqual(MillicastLogger.INFO)
    })
  })

  test('Set global level to INFO with named logger', ({ given, when, then }) => {
    let namedLogger
    given('global level is OFF and I have a named logger', async () => {
      MillicastLogger.setLevel(MillicastLogger.OFF)
      namedLogger = MillicastLogger.get('namedLogger')
    })

    when('I set global level to INFO', async () => {
      MillicastLogger.setLevel(MillicastLogger.INFO)
    })

    then('global and named logger level are at INFO', async () => {
      expect(MillicastLogger.getLevel()).toEqual(MillicastLogger.INFO)
      expect(namedLogger.getLevel()).toEqual(MillicastLogger.INFO)
    })
  })

  test('Set level of named logger', ({ given, when, then }) => {
    let namedLogger
    given('global level is OFF and I have a named logger', async () => {
      MillicastLogger.setLevel(MillicastLogger.OFF)
      namedLogger = MillicastLogger.get('namedLogger')
    })

    when('I set named logger level to INFO', async () => {
      namedLogger.setLevel(MillicastLogger.INFO)
    })

    then('global level is OFF and named logger level is INFO', async () => {
      expect(MillicastLogger.getLevel()).toEqual(MillicastLogger.OFF)
      expect(namedLogger.getLevel()).toEqual(MillicastLogger.INFO)
    })
  })

  test('Get named logger already created', ({ given, when, then }) => {
    let namedLogger
    let sameNamedLogger

    given('I have a named logger', async () => {
      namedLogger = MillicastLogger.get('namedLogger')
    })

    when('I get a named logger with same name', async () => {
      sameNamedLogger = MillicastLogger.get('namedLogger')
    })

    then('returns the same named logger', async () => {
      expect(namedLogger).toEqual(sameNamedLogger)
    })
  })

  test('Log message at logger level', ({ given, when, then }) => {
    const console = jest.spyOn(global.console, 'info')

    given('global level is INFO', async () => {
      MillicastLogger.setLevel(MillicastLogger.INFO)
    })

    when('I log a message at INFO', async () => {
      MillicastLogger.info('This is a log message')
    })

    then('a message is logged in console', async () => {
      expect(console).toBeCalledTimes(1)
      expect(console).toBeCalledWith(expect.any(String), 'This is a log message')
    })
  })
})
