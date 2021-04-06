import Logger from 'js-logger'

Logger.useDefaults({ defaultLevel: Logger.TRACE })

const formatter = (messages, context) => {
  messages.unshift(`[${context.name || 'Global'}] ${new Date().toISOString()} - ${context.level.name} -`)
}
const enabledFor = (level, loggerName) => {
  if (loggerName) {
    return level.value >= namedLoggerLevels[loggerName].value
  }
  return level.value >= loggerLevel.value
}

const historyHandler = (messages, context) => {
  messages = Array.prototype.slice.call(messages)
  messages = messages.map((m) => typeof m === 'object' ? JSON.stringify(m) : m)
  formatter(messages, context)

  if (maxLogHistorySize !== 0) {
    if (history.lenght === maxLogHistorySize) {
      history = history.slice(1)
    }
    history.push(messages.join(' '))
  }
}

const consoleHandler = Logger.createDefaultHandler({ formatter })
Logger.setHandler((messages, context) => {
  historyHandler(messages, context)
  if (enabledFor(context.level, context.name)) {
    consoleHandler(messages, context)
  }

  for (const { handler, level } of customHandlers) {
    if (context.level >= level.value) {
      handler(messages, context)
    }
  }
})

const DEFAULT_LOG_HISTORY_SIZE = 10000
let maxLogHistorySize = DEFAULT_LOG_HISTORY_SIZE
let history = []
let loggerLevel = Logger.OFF
const namedLoggerLevels = {}
const customHandlers = []

/**
 * @typedef {Object} LogLevel
 * @property {Number} value - The numerical representation of the level.
 * @property {String} name - Human readable name of the log level.
 */

/**
 * Manages all log messages from SDK modules, you can use this logger to add your custom
 * messages and set your custom log handlers to forward all messages to your own monitoring
 * system.
 *
 * By default all loggers are set in level OFF (MillicastLogger.OFF), and there are available
 * the following log levels.
 *
 * This module is based on [js-logger](https://github.com/jonnyreeves/js-logger) you can refer
 * to its documentation or following our examples.
 *
 *
 * @namespace
 * @property {LogLevel} TRACE - MillicastLogger.TRACE
 * @property {LogLevel} DEBUG - MillicastLogger.DEBUG
 * @property {LogLevel} INFO  - MillicastLogger.INFO
 * @property {LogLevel} TIME  - MillicastLogger.TIME
 * @property {LogLevel} WARN  - MillicastLogger.WARN
 * @property {LogLevel} ERROR - MillicastLogger.ERROR
 * @property {LogLevel} OFF   - MillicastLogger.OFF
 * @example
 * // Log a message
 * MillicastLogger.info('This is an info log', 445566)
 * // [Global] 2021-04-05T15:58:44.893Z - This is an info log 445566
 * @example
 * // Create a named logger
 * const myLogger = MillicastLogger.get('CustomLogger')
 * myLogger.setLevel(MillicastLogger.WARN)
 * myLogger.warn('This is a warning log')
 * // [CustomLogger] 2021-04-05T15:59:53.377Z - This is a warning log
 * @example
 * // Profiling
 * // Start timing something
 * MillicastLogger.time('Timer name')
 *
 * // ... some time passes ...
 *
 * // Stop timing something.
 * MillicastLogger.timeEnd('Timer name')
 * // Timer name: 35282.997802734375 ms
 */
const MillicastLogger = {
  ...Logger,
  enabledFor,
  /**
   * Get all logs generated during a session.
   * All logs are recollected besides the log level selected by the user.
   * @returns {Array<String>} All logs recollected from level TRACE.
   * @example MillicastLogger.getHistory()
   * // Outupt
   * // [
   * //   "[MillicastDirector] 2021-04-05T14:09:26.625Z - Getting publisher connection data for stream name:  1xxx2",
   * //   "[MillicastDirector] 2021-04-05T14:09:27.064Z - Getting publisher response",
   * //   "[MillicastPublish]  2021-04-05T14:09:27.066Z - Broadcasting"
   * // ]
   */
  getHistory: () => history,
  /**
   * Set the maximum count of logs to preserve during a session.
   * By default it is set to 10000.
   * @param {Number} maxSize - Max size of log history. Set 0 to disable history or -1 to unlimited log history.
   * @example MillicastLogger.setHistoryMaxSize(100)
   */
  setHistoryMaxSize: maxSize => { maxLogHistorySize = maxSize },
  /**
   * Set log level to all loggers.
   * @param {LogLevel} level - New log level to be set.
   * @example
   * // Global Level
   * MillicastLogger.setLevel(MillicastLogger.DEBUG)
   *
   * // Module Level
   * MillicastLogger.get('MillicastPublish').setLevel(MillicastLogger.DEBUG)
   */
  setLevel: level => {
    loggerLevel = level
    for (const key in namedLoggerLevels) {
      namedLoggerLevels[key] = level
    }
  },
  /**
   * Get global current logger level.
   * Also you can get the level of any particular logger.
   * @returns {LogLevel}
   * @example
   * // Global Level
   * MillicastLogger.getLevel()
   * // Output
   * // {value: 2, name: 'DEBUG'}
   *
   * // Module Level
   * MillicastLogger.get('MillicastPublish').getLevel()
   * // Output
   * // {value: 5, name: 'WARN'}
   */
  getLevel: () => loggerLevel,
  /**
   * Gets or creates a named logger. Named loggers are used to group log messages
   * that refers to a common context.
   * @param {String} name
   * @returns {Object} Logger object with same properties and functions as MillicastLogger except
   * history and handlers related functions.
   * @example
   * const myLogger = MillicastLogger.get('MyLogger')
   * // Set logger level
   * myLogger.setLevel(MillicastLogger.DEBUG)
   *
   * myLogger.debug('This is a debug log')
   * myLogger.info('This is a info log')
   * myLogger.warn('This is a warning log')
   *
   * // Get logger level
   * myLogger.getLevel()
   * // {value: 3, name: 'INFO'}
   */
  get: name => {
    if (!namedLoggerLevels[name]) {
      namedLoggerLevels[name] = loggerLevel
    }
    const logger = Logger.get(name)
    logger.setLevel = (level) => { namedLoggerLevels[name] = level }
    logger.getLevel = () => namedLoggerLevels[name]
    return logger
  },
  /**
   * Callback which handles log messages.
   *
   * @callback loggerHandler
   * @param {Any[]} messages         - Arguments object with the supplied log messages.
   * @param {Object} context
   * @param {LogLevel} context.level - The currrent log level.
   * @param {String?} context.name   - The optional current logger name.
   */
  /**
   * Add your custom log handler to Millicast Logger at the specified level.
   * @param {loggerHandler} handler  - Your custom log handler function.
   * @param {LogLevel} level         - Log level to filter messages.
   * @example
   * const myHandler = (messages, context) => {
   *  // You can filter by logger
   *  if (context.name === 'MillicastPublish') {
   *    sendToMyLogger(messages[0])
   *  }
   *
   *  // You can filter by logger level
   *  if (context.level.value >= MillicastLogger.INFO.value) {
   *    sendToMyLogger(messages[0])
   *  }
   * }
   *
   * MillicastLogger.setHandler(myHandler, MillicastLogger.INFO)
   */
  setHandler: (handler, level) => { customHandlers.push({ handler, level }) }
}

export default MillicastLogger
