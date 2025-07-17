import { loadFeature, defineFeature } from 'jest-cucumber'

let Logger
beforeEach(() => {
  jest.isolateModules(() => {
    Logger = require('../../src/Logger').default
  })
})

const feature = loadFeature('../features/LoggerLevels.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, (test) => {
  test('Set global level to INFO', ({ given, when, then }) => {
    given('global level is OFF', async () => {
      Logger.setLevel(Logger.OFF)
    })

    when('I set global level to INFO', async () => {
      Logger.setLevel(Logger.INFO)
    })

    then('new level is INFO', async () => {
      expect(Logger.getLevel()).toEqual(Logger.INFO)
    })
  })

  test('Set global level to INFO with named logger', ({ given, when, then }) => {
    let namedLogger
    given('global level is OFF and I have a named logger', async () => {
      Logger.setLevel(Logger.OFF)
      namedLogger = Logger.get('namedLogger')
    })

    when('I set global level to INFO', async () => {
      Logger.setLevel(Logger.INFO)
    })

    then('global and named logger level are at INFO', async () => {
      expect(Logger.getLevel()).toEqual(Logger.INFO)
      expect(namedLogger.getLevel()).toEqual(Logger.INFO)
    })
  })

  test('Set level of named logger', ({ given, when, then }) => {
    let namedLogger
    given('global level is OFF and I have a named logger', async () => {
      Logger.setLevel(Logger.OFF)
      namedLogger = Logger.get('namedLogger')
    })

    when('I set named logger level to INFO', async () => {
      namedLogger.setLevel(Logger.INFO)
    })

    then('global level is OFF and named logger level is INFO', async () => {
      expect(Logger.getLevel()).toEqual(Logger.OFF)
      expect(namedLogger.getLevel()).toEqual(Logger.INFO)
    })
  })

  test('Get named logger already created', ({ given, when, then }) => {
    let namedLogger
    let sameNamedLogger

    given('I have a named logger', async () => {
      namedLogger = Logger.get('namedLogger')
    })

    when('I get a named logger with same name', async () => {
      sameNamedLogger = Logger.get('namedLogger')
    })

    then('returns the same named logger', async () => {
      expect(namedLogger).toEqual(sameNamedLogger)
    })
  })

  test('Log message at logger level', ({ given, when, then }) => {
    const console = jest.spyOn(global.console, 'info')

    given('global level is INFO', async () => {
      Logger.setLevel(Logger.INFO)
    })

    when('I log a message at INFO', async () => {
      Logger.info('This is a log message')
    })

    then('a message is logged in console', async () => {
      expect(console).toHaveBeenCalledTimes(1)
      expect(console).toHaveBeenCalledWith(expect.any(String), 'This is a log message')
    })
  })
})
