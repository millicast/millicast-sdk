import Logger from 'js-logger'
Logger.useDefaults({
    defaultLevel: Logger.DEBUG,
    formatter: function (messages, context) {
        messages.unshift(`[${context.name}] ${new Date().toISOString()} -`)
    }
})

export default Logger