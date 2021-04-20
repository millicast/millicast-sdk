import { loadFeature, defineFeature } from 'jest-cucumber'
import MillicastLogger from '../../../src/MillicastLogger'
const feature = loadFeature('../LoggerHandlers.feature', { loadRelativePath: true, errors: true })

defineFeature(feature, test => {
  test('Gets messages from same level', ({ given, when, then }) => {
    const handler = jest.fn()

    given('I set a custom handler at INFO level', async () => {
      MillicastLogger.setHandler(handler, MillicastLogger.INFO)
    })

    when('I log a message at INFO level', async () => {
      MillicastLogger.info('This is a log message')
    })

    then('I receive this message in handler', async () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith(
        expect.objectContaining({ 0: 'This is a log message' }),
        { level: MillicastLogger.INFO, filterLevel: MillicastLogger.TRACE }
      )
    })
  })

  test('Gets messages from lower level', ({ given, when, then }) => {
    const handler = jest.fn()

    given('I set a custom handler at INFO level', async () => {
      MillicastLogger.setHandler(handler, MillicastLogger.INFO)
    })

    when('I log a message at DEBUG level', async () => {
      MillicastLogger.debug('This is a log message')
    })

    then('custom handler does not receive any message', async () => {
      expect(handler).not.toBeCalled()
    })
  })

  test('Gets messages from higher level', ({ given, when, then }) => {
    const handler = jest.fn()

    given('I set a custom handler at INFO level', async () => {
      MillicastLogger.setHandler(handler, MillicastLogger.INFO)
    })

    when('I log a message at ERROR level', async () => {
      MillicastLogger.error('This is a log message')
    })

    then('I receive this message in handler', async () => {
      expect(handler).toBeCalledTimes(1)
      expect(handler).toBeCalledWith(
        expect.objectContaining({ 0: 'This is a log message' }),
        { level: MillicastLogger.ERROR, filterLevel: MillicastLogger.TRACE }
      )
    })
  })

  test('Multiple handlers', ({ given, when, then }) => {
    const infoHandler = jest.fn()
    const errorHandler = jest.fn()

    given('I set a custom handler at INFO level and other at ERROR level', async () => {
      MillicastLogger.setHandler(infoHandler, MillicastLogger.INFO)
      MillicastLogger.setHandler(errorHandler, MillicastLogger.ERROR)
    })

    when('I log a message at ERROR level', async () => {
      MillicastLogger.error('This is a log message')
    })

    then('both handlers receive this message', async () => {
      expect(infoHandler).toBeCalledTimes(1)
      expect(infoHandler).toBeCalledWith(
        expect.objectContaining({ 0: 'This is a log message' }),
        { level: MillicastLogger.ERROR, filterLevel: MillicastLogger.TRACE }
      )

      expect(errorHandler).toBeCalledTimes(1)
      expect(errorHandler).toBeCalledWith(
        expect.objectContaining({ 0: 'This is a log message' }),
        { level: MillicastLogger.ERROR, filterLevel: MillicastLogger.TRACE }
      )
    })
  })
})
