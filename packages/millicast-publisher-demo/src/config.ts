interface Config {
    accountId: string
    streamName: string
    publishToken: string
    directorUrl: string
}

const config : Config = {
    directorUrl: import.meta.env.VITE_MILLICAST_DIRECTOR_ENDPOINT || 'https://director.millicast.com/',
    streamName: import.meta.env.VITE_MILLICAST_STREAM_NAME,
    accountId: import.meta.env.VITE_MILLICAST_ACCOUNT_ID,
    publishToken: import.meta.env.VITE_MILLICAST_PUBLISH_TOKEN,
}

export default config;