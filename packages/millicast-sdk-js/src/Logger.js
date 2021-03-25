import Logger from "js-logger";
import sentry from "../sentry";

Logger.useDefaults({
  defaultLevel: Logger.DEBUG,
  formatter: function (messages, context) {
    messages.unshift(`[${context.name}] ${new Date().toISOString()} -`);
  },
});

export default Logger;
