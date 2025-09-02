import { CMCDDiagnostics, DiagnosticsObject, DiagnosticsOptions } from './types/stats.types';
import { ILogLevel, ILogHandler, ILogger } from 'js-logger';

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
export type LogLevel = {
    /**
     * - The numerical representation of the level.
     */
    value: number;
    /**
     * - Human readable name of the log level.
     */
    name: string;
};
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
interface CreateDefaultHandlerOptions {
    formatter?: ILogHandler;
}
declare const Logger: {
    createDefaultHandler: (options?: CreateDefaultHandlerOptions) => ILogHandler;
    enabledFor: (level: ILogLevel, loggerName: string) => boolean;
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
    getHistory: () => string[];
    /**
     * @function
     * @name getHistoryMaxSize
     * @description Get the maximum count of logs preserved during a session.
     * @example Logger.getHistoryMaxSize()
     */
    getHistoryMaxSize: () => number;
    /**
     * @function
     * @name setHistoryMaxSize
     * @description Set the maximum count of logs to preserve during a session.
     * By default it is set to 10000.
     * @param {Number} maxSize - Max size of log history. Set 0 to disable history or -1 to unlimited log history.
     * @example Logger.setHistoryMaxSize(100)
     */
    setHistoryMaxSize: (maxSize: number) => void;
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
    setLevel: (level: LogLevel) => void;
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
    getLevel: () => ILogLevel;
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
    get: (name: string) => ILogger;
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
    setHandler: (handler: ILogHandler, level: LogLevel) => void;
    /**
     * @function
     * @name diagnose
     * @description Returns diagnostics information about the connection and environment, formatted according to the specified parameters.
     * @param {Object | Number} config - Configuration object for the diagnostic parameters
     * @param {Number} [config.statsCount = 60] - Number of stats objects to be included in the diagnostics report.
     * @param {Number} [config.historySize = 1000]  - Amount of history messages to be returned.
     * @param {String} [config.minLogLevel] - Levels of history messages to be included.
     * examples of minLogLevel values in level order:
     * 1 - TRACE
     * 2 - DEBUG
     * 3 - INFO
     * 4 - WARN
     * 5 - ERROR
     * If 'INFO' (3) given, return INFO (3), WARN (4), and ERROR (5) level messages.
     * @param {String} [config.statsFormat='JSON'] - Format of the stats objects in the diagnostics report. Use Logger.JSON or Logger.CMCD.
     * @returns {Object} An object containing relevant diagnostics information such as userAgent, SDK version, and stats data.
     * @example
     * // Example using default parameters
     * const diagnosticsDefault = Logger.diagnose();
     *
     * // Example specifying statsCount and format
     * const diagnostics = Logger.diagnose({ statsCount: 30, minLogLevel: 'INFO', format: Logger.CMCD });
     *
     * // Output: Diagnostics object with specified configuration
     */
    diagnose: (config?: DiagnosticsOptions) => DiagnosticsObject | CMCDDiagnostics;
    JSON: string;
    CMCD: string;
    /**
     * @var
     * @name VERSION
     * @description Returns the current SDK version.
     */
    VERSION: string;
    useDefaults(options?: import('js-logger').ILoggerOpts): void;
    TRACE: ILogLevel;
    DEBUG: ILogLevel;
    INFO: ILogLevel;
    TIME: ILogLevel;
    WARN: ILogLevel;
    ERROR: ILogLevel;
    OFF: ILogLevel;
    trace(...x: any[]): void;
    debug(...x: any[]): void;
    info(...x: any[]): void;
    log(...x: any[]): void;
    warn(...x: any[]): void;
    error(...x: any[]): void;
    time(label: string): void;
    timeEnd(label: string): void;
};
export default Logger;
