import { loadFeature, defineFeature } from 'jest-cucumber'
import Logger from '../../src/Logger'
const feature = loadFeature('../features/LoggerHandlers.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  test('Gets messages from same level', ({ given, when, then }) => {
    const handler = jest.fn()

    given('I set a custom handler at INFO level', async () => {
      Logger.setHandler(handler, Logger.INFO)
    })

    when('I log a message at INFO level', async () => {
      Logger.info('This is a log message')
    })

    then('I receive this message in handler', async () => {
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ 0: 'This is a log message' }),
        { level: Logger.INFO, filterLevel: Logger.TRACE }
      )
    })
  })

  test('Gets messages from lower level', ({ given, when, then }) => {
    const handler = jest.fn()

    given('I set a custom handler at INFO level', async () => {
      Logger.setHandler(handler, Logger.INFO)
    })

    when('I log a message at DEBUG level', async () => {
      Logger.debug('This is a log message')
    })

    then('custom handler does not receive any message', async () => {
      expect(handler).not.toHaveBeenCalled()
    })
  })

  test('Gets messages from higher level', ({ given, when, then }) => {
    const handler = jest.fn()

    given('I set a custom handler at INFO level', async () => {
      Logger.setHandler(handler, Logger.INFO)
    })

    when('I log a message at ERROR level', async () => {
      Logger.error('This is a log message')
    })

    then('I receive this message in handler', async () => {
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ 0: 'This is a log message' }),
        { level: Logger.ERROR, filterLevel: Logger.TRACE }
      )
    })
  })

  test('Multiple handlers', ({ given, when, then }) => {
    const infoHandler = jest.fn()
    const errorHandler = jest.fn()

    given('I set a custom handler at INFO level and other at ERROR level', async () => {
      Logger.setHandler(infoHandler, Logger.INFO)
      Logger.setHandler(errorHandler, Logger.ERROR)
    })

    when('I log a message at ERROR level', async () => {
      Logger.error('This is a log message')
    })

    then('both handlers receive this message', async () => {
      expect(infoHandler).toHaveBeenCalledTimes(1)
      expect(infoHandler).toHaveBeenCalledWith(
        expect.objectContaining({ 0: 'This is a log message' }),
        { level: Logger.ERROR, filterLevel: Logger.TRACE }
      )

      expect(errorHandler).toHaveBeenCalledTimes(1)
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ 0: 'This is a log message' }),
        { level: Logger.ERROR, filterLevel: Logger.TRACE }
      )
    })
  })
})
