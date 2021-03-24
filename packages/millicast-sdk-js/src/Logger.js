import Logger from "js-logger";
import sentry from "../sentry";

Logger.useDefaults({
  defaultLevel: Logger.INFO,
  formatter: function (messages, context) {
    messages.unshift(`${new Date().toISOString()} -`);
    sentry.captureMessage(messages, context.level);
  },
});

const logger = Logger.get("MilliCast-sdk-js");

export default logger;
