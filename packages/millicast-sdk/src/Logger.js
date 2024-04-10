import jsLogger from 'js-logger'
import { version } from '../package.json'
import Diagnostics from './utils/Diagnostics'

/**
 * @module Logger
 * @description Manages all log messages from SDK modules, you can use this logger to add your custom
 * messages and set your custom log handlers to forward all messages to your own monitoring
 * system.
 *
 * By default all loggers are set in level OFF (Logger.OFF), and there are available
 * the following log levels.
 *
 * This module is based on [js-logger](https://github.com/jonnyreeves/js-logger) you can refer
 * to its documentation or following our examples.
 * @example
 * // Log a message
 * Logger.info('This is an info log', 445566)
 * // [Global] 2021-04-05T15:58:44.893Z - This is an info log 445566
 * @example
 * // Create a named logger
 * const myLogger = Logger.get('CustomLogger')
 * myLogger.setLevel(Logger.WARN)
 * myLogger.warn('This is a warning log')
 * // [CustomLogger] 2021-04-05T15:59:53.377Z - This is a warning log
 * @example
 * // Profiling
 * // Start timing something
 * Logger.time('Timer name')
 *
 * // ... some time passes ...
 *
 * // Stop timing something.
 * Logger.timeEnd('Timer name')
 * // Timer name: 35282.997802734375 ms
 */

jsLogger.useDefaults({ defaultLevel: jsLogger.TRACE })

const LOG_LEVELS = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR']

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
    history.push(messages.join(' '))
    if (history.length >= maxLogHistorySize) {
      history = history.slice(-maxLogHistorySize)
    }
  } else {
    history = []
  }
}

const consoleHandler = jsLogger.createDefaultHandler({ formatter })
jsLogger.setHandler((messages, context) => {
  historyHandler(messages, context)
  if (enabledFor(context.level, context.name)) {
    consoleHandler(messages, context)
  }

  for (const { handler, level } of customHandlers) {
    if (context.level.value >= level.value) {
      handler(messages, context)
    }
  }
})

const DEFAULT_LOG_HISTORY_SIZE = 10000
let maxLogHistorySize = DEFAULT_LOG_HISTORY_SIZE
let history = []
let loggerLevel = jsLogger.OFF
const namedLoggerLevels = {}
const customHandlers = []

/**
 * @typedef {Object} LogLevel
 * @global
 * @property {Number} value - The numerical representation of the level.
 * @property {String} name - Human readable name of the log level.
 */

/** @constant {LogLevel} TRACE - Logger.TRACE */
/** @constant {LogLevel} DEBUG - Logger.DEBUG */
/** @constant {LogLevel} INFO  - Logger.INFO */
/** @constant {LogLevel} TIME  - Logger.TIME */
/** @constant {LogLevel} WARN  - Logger.WARN */
/** @constant {LogLevel} ERROR - Logger.ERROR */
/** @constant {LogLevel} OFF   - Logger.OFF */

const Logger = {
  ...jsLogger,
  enabledFor,
  /**
   * @function
   * @name getHistory
   * @description Get all logs generated during a session.
   * All logs are recollected besides the log level selected by the user.
   * @returns {Array<String>} All logs recollected from level TRACE.
   * @example Logger.getHistory()
   * // Outupt
   * // [
   * //   "[Director] 2021-04-05T14:09:26.625Z - Getting publisher connection data for stream name:  1xxx2",
   * //   "[Director] 2021-04-05T14:09:27.064Z - Getting publisher response",
   * //   "[Publish]  2021-04-05T14:09:27.066Z - Broadcasting"
   * // ]
   */
  getHistory: () => history,
  /**
   * @function
   * @name getHistoryMaxSize
   * @description Get the maximum count of logs preserved during a session.
   * @example Logger.getHistoryMaxSize()
   */
  getHistoryMaxSize: () => maxLogHistorySize,

  /**
   * @function
   * @name setHistoryMaxSize
   * @description Set the maximum count of logs to preserve during a session.
   * By default it is set to 10000.
   * @param {Number} maxSize - Max size of log history. Set 0 to disable history or -1 to unlimited log history.
   * @example Logger.setHistoryMaxSize(100)
   */
  setHistoryMaxSize: maxSize => { maxLogHistorySize = maxSize },

  /**
   * @function
   * @name setLevel
   * @description Set log level to all loggers.
   * @param {LogLevel} level - New log level to be set.
   * @example
   * // Global Level
   * Logger.setLevel(Logger.DEBUG)
   *
   * // Module Level
   * Logger.get('Publish').setLevel(Logger.DEBUG)
   */
  setLevel: level => {
    loggerLevel = level
    for (const key in namedLoggerLevels) {
      namedLoggerLevels[key] = level
    }
  },

  /**
   * @function
   * @name getLevel
   * @description Get global current logger level.
   * Also you can get the level of any particular logger.
   * @returns {LogLevel}
   * @example
   * // Global Level
   * Logger.getLevel()
   * // Output
   * // {value: 2, name: 'DEBUG'}
   *
   * // Module Level
   * Logger.get('Publish').getLevel()
   * // Output
   * // {value: 5, name: 'WARN'}
   */
  getLevel: () => loggerLevel,

  /**
   * @function
   * @name get
   * @description Gets or creates a named logger. Named loggers are used to group log messages
   * that refers to a common context.
   * @param {String} name
   * @returns {Object} Logger object with same properties and functions as Logger except
   * history and handlers related functions.
   * @example
   * const myLogger = Logger.get('MyLogger')
   * // Set logger level
   * myLogger.setLevel(Logger.DEBUG)
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
    const logger = jsLogger.get(name)
    logger.setLevel = (level) => { namedLoggerLevels[name] = level }
    logger.getLevel = () => namedLoggerLevels[name]
    return logger
  },
  /**
   * Callback which handles log messages.
   *
   * @callback loggerHandler
   * @global
   * @param {any[]} messages         - Arguments object with the supplied log messages.
   * @param {Object} context
   * @param {LogLevel} context.level - The currrent log level.
   * @param {String?} context.name   - The optional current logger name.
   */
  /**
   * @function
   * @name setHandler
   * @description Add your custom log handler to Logger at the specified level.
   * @param {loggerHandler} handler  - Your custom log handler function.
   * @param {LogLevel} level         - Log level to filter messages.
   * @example
   * const myHandler = (messages, context) => {
   *  // You can filter by logger
   *  if (context.name === 'Publish') {
   *    sendToMyLogger(messages[0])
   *  }
   *
   *  // You can filter by logger level
   *  if (context.level.value >= Logger.INFO.value) {
   *    sendToMyLogger(messages[0])
   *  }
   * }
   *
   * Logger.setHandler(myHandler, Logger.INFO)
   */
  setHandler: (handler, level) => { customHandlers.push({ handler, level }) },
  /**
   * @function
   * @name diagnose
   * @description Returns an object with diagnostics about the state of the connection and environment.
   * @param {Number} [statsCount = 5]  - Amount of stats objects to be saved.
   * @param {Number} [historySize = 5000]  - Amount of history messages to be returned.
   * @param {String} minLogLevel         - Levels of history messages to be included.
     * examples of minLogLevel values in level order:
     * 1 - TRACE
     * 2 - DEBUG
     * 3 - INFO
     * 4 - WARN
     * 5 - ERROR
     * If 'INFO' (3) given, return INFO (3), WARN (4), and ERROR (5) level messages.
   * @returns {Object} Relevant information about the current state, such us userAgent, SDK version, besides others.
   * @example
   * // Log and get a diagnose object with the last 3 stats reports
   * const diagnostics = await Logger.diagnose(3)
   */
  diagnose: (statsCount, historySize, minLogLevel = 'TRACE') => {
    const result = Diagnostics.get(statsCount)
    const history = Logger.getHistory()

    if (!Number.isInteger(historySize) || historySize <= 0) {
      throw new Error('Invalid Argument Exception : historySize must be a positive integer.')
    }

    if (!LOG_LEVELS.includes(minLogLevel.toUpperCase())) {
      throw new Error('Invalid Argument Exception : the minLogLevel parameter only excepts "trace", "debug", "info", "warn", and "error" as arguments.')
    }
    if (LOG_LEVELS.includes(minLogLevel.toUpperCase())) {
      const filteredLogLevels = LOG_LEVELS.slice(LOG_LEVELS.indexOf(minLogLevel.toUpperCase()))
      const filteredLevels = history.filter((log) => filteredLogLevels.some(level => log.includes(level)))
      result.history = filteredLevels.slice(-historySize)
    }
    return result
  },
  /**
   * @var
   * @name VERSION
   * @description Returns the current SDK version.
   */
  VERSION: version
}

export default Logger
