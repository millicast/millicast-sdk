import Logger from 'js-logger'

Logger.useDefaults({ defaultLevel: Logger.DEBUG })

const formatter = (messages, context) => {
  messages.unshift(`[${context.name}] ${new Date().toISOString()} -`)
}
const enabledFor = (level, loggerName) => {
  if (loggerName) {
    return level.value >= namedLoggerLevels[loggerName].value
  }
  return level.value >= loggerLevel.value
}

const historyHandler = (messages, context) => {
  messages = Array.prototype.slice.call(messages)
  formatter(messages, context)

  if (history.lenght === maxLogHistorySize) {
    history = history.slice(1)
  }
  history.push(messages.join(' '))
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
 * @class
 * @property {LogLevel} DEBUG
 */
const MillicastLogger = {
  ...Logger,
  /**
   * @member {LogLevel}
   */
  TRACE: Logger.TRACE,
  /**
   * @type {LogLevel}
   */
  DEBUG: Logger.DEBUG,
  /**
   * @type {LogLevel}
   */
  INFO: Logger.INFO,
  TIME: Logger.TIME,
  WARN: Logger.WARN,
  ERROR: Logger.ERROR,
  OFF: Logger.OFF,
  /**
   *
   * @returns {Array<String>} All logs recollected from level DEBUG.
   */
  getHistory: () => history,
  /**
   *
   * @param {Number} maxSize - Max size of log history. Set 0 to disable history or -1 to unlimited log history.
   */
  setHistoryMaxSize: maxSize => { maxLogHistorySize = maxSize },
  /**
   * Set log level to all loggers.
   * @param {Object} level New log level to be set.
   */
  setLevel: level => {
    loggerLevel = level
    for (const key in namedLoggerLevels) {
      namedLoggerLevels[key] = level
    }
  },
  /**
   *
   * @returns {Object}
   */
  getLevel: () => loggerLevel,
  /**
   *
   * @param {Object} level - The log level of message.
   * @param {String?} loggerName - The logger name of message.
   */
  enabledFor: (level, loggerName) => enabledFor(level, loggerName),
  /**
   *
   * @param {String} name
   * @returns {Object}
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
   * Callback which handles the log messages.
   *
   * @callback loggerHandler
   * @param {Any[]} messages - Arguments object with the supplied log messages.
   * @param {Object} context
   * @param {Object} context.level - The currrent log level.
   * @param {String?} context.name - The optional current logger name.
   */
  /**
   *
   * @param {loggerHandler} handler
   * @param {Object} level
   */
  setHandler: (handler, level) => { customHandlers.push({ handler, level }) }
}

export default MillicastLogger
