import Logger from 'js-logger'
Logger.useDefaults({
    defaultLevel: Logger.DEBUG,
    formatter: function (messages, context) {
        messages.unshift(`[${context.name}] ${new Date().toISOString()} -`)
    }
})

const logger = Logger.get('MilliCast-sdk-js')
export default logger