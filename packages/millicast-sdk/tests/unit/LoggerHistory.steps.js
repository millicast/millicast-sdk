import { loadFeature, defineFeature } from 'jest-cucumber'

let Logger
beforeEach(() => {
  jest.isolateModules(() => {
    Logger = require('../../src/Logger').default
  })
})

const feature = loadFeature('../features/LoggerHistory.feature', { loadRelativePath: true, errors: true })

const arrayGenerator = l => Array.from(Array(l).keys())
const matcher = (i, message = 'This is a log message number') => expect.stringMatching(`${message} ${i}`)

defineFeature(feature, test => {
  test('Get history with logger turned OFF', ({ given, when, then }) => {
    given('I set logger level at OFF', async () => {
      Logger.setLevel(Logger.OFF)
    })

    when('I log a message at INFO level', async () => {
      Logger.info('This is a log message')
    })

    then('I get this message from history', async () => {
      const history = Logger.getHistory()
      expect(history.length).toBe(1)
      expect(history[0]).toEqual(expect.stringContaining('This is a log message'))
    })
  })

  test('Get history when log 5 messages', ({ given, when, then }) => {
    const logNumbers = arrayGenerator(5)

    given('I have no previous logs and history max size is 5', async () => {
      Logger.setHistoryMaxSize(5)
    })

    when('I log 5 messages at INFO level', async () => {
      logNumbers.forEach(i => Logger.info(`This is a log message number ${i}`))
    })

    then('I get those messages from history', async () => {
      const history = Logger.getHistory()
      expect(history.length).toBe(5)
      expect(history).toEqual(expect.arrayContaining(
        logNumbers.map(i => matcher(i))
      ))
    })
  })

  test('Get history when log more than 5 messages', ({ given, when, then }) => {
    const logNumbers = arrayGenerator(6)

    given('I have no previous logs and history max size is 5', async () => {
      Logger.setHistoryMaxSize(5)
    })

    when('I log 6 messages at INFO level', async () => {
      logNumbers.forEach(i => Logger.info(`This is a log message number ${i}`))
    })

    then('I get the last 5 messages from history', async () => {
      const history = Logger.getHistory()
      expect(history.length).toBe(5)
      expect(history).toEqual(expect.arrayContaining(
        logNumbers.slice(1).map(i => matcher(i))
      ))
    })
  })

  test('Disable history with no previous logs', ({ given, when, then }) => {
    given('I have no previous logs and history max size is 0', async () => {
      Logger.setHistoryMaxSize(0)
    })

    when('I log a message at INFO level', async () => {
      Logger.info('This is a log message')
    })

    then('log history is empty', async () => {
      const history = Logger.getHistory()
      expect(history.length).toBe(0)
    })
  })

  test('Disable history with previous logs', ({ given, when, then }) => {
    given('I have one previous log message and history max size is 5', async () => {
      Logger.setHistoryMaxSize(5)
      Logger.info('This is a previous log message')
    })

    when('I set history max size to 0 and I log a message at INFO level', async () => {
      Logger.setHistoryMaxSize(0)
      Logger.info('This is a log message')
    })

    then('log history is empty', async () => {
      const history = Logger.getHistory()
      expect(history.length).toBe(0)
    })
  })

  test('Change max size after logs some messages', ({ given, when, then }) => {
    const logNumbers = arrayGenerator(5)

    given('I have 5 previous log messages and history max size is 5', async () => {
      Logger.setHistoryMaxSize(5)
      logNumbers.forEach(i => Logger.info(`This is a previous log message ${i}`))
    })

    when('I set history max size to 6 and I log a message at ERROR level', async () => {
      Logger.setHistoryMaxSize(6)
      Logger.info('This is a log message')
    })

    then('I get all log messages from history', async () => {
      const history = Logger.getHistory()
      expect(history.length).toBe(6)
      expect(history).toEqual(expect.arrayContaining([
        ...logNumbers.map(i => matcher(i, 'This is a previous log message')),
        expect.stringMatching('This is a log message')
      ]))
    })
  })

  test('Get current max history size', ({ given, when, then }) => {
    let result

    given('history max size is 5', async () => {
      Logger.setHistoryMaxSize(5)
    })

    when('I get current history max size', async () => {
      result = Logger.getHistoryMaxSize()
    })

    then('returns 5', async () => {
      expect(result).toBe(5)
    })
  })
})
