import Logger from "js-logger";
Logger.useDefaults({
  defaultLevel: Logger.INFO,
  formatter: function (messages, context) {
    messages.unshift(`${new Date().toISOString()} -`);
  },
});

const logger = Logger.get("MilliCast-sdk-js");
logger.error("shit!");
console.error("shit! 2");
export default logger;
