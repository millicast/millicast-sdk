import { View, Director, Logger } from '@millicast/sdk'

window.Logger = Logger

if (process.env.MILLICAST_DIRECTOR_ENDPOINT) {
  Director.setEndpoint(process.env.MILLICAST_DIRECTOR_ENDPOINT)
}

const addStream = (stream) => {
  const video = document.querySelector('#player')
  // Create new video element
  video.srcObject = stream
}

const removeStream = () => {
  const video = document.querySelector('#player')
  // Create new video element
  video.srcObject = null
}

const subscribe = async (streamName, streamAccountId) => {
  const tokenGenerator = () => Director.getSubscriber(streamName, streamAccountId)
  const millicastView = new View(streamName, tokenGenerator)
  millicastView.on('broadcastEvent', (event) => {
    const layers = event.data.layers !== null ? event.data.layers : {}
    if (event.name === 'layers' && Object.keys(layers).length <= 0) {
      // call play logic or being reconnect interval
      close().then(() => {
        subscribe(streamName, streamAccountId)
      })
      console.error('Feed no longer found.')
    }
  })

  millicastView.on('newTrack', (event) => {
    addStream(event.streams[0])
  })

  const close = () => {
    removeStream()
    millicastView.millicastSignaling?.close()
    return Promise.resolve({})
  }

  try {
    await millicastView.connect()
  } catch (error) {
    close().then(() => {
      subscribe(streamName, streamAccountId)
    })
    console.error(error)
  }
}

const context = cast.framework.CastReceiverContext.getInstance()
const player = context.getPlayerManager()

player.setMediaElement(document.querySelector('#player'))

/**
 * Intercept the LOAD request to be able to read in a contentId and get data.
 */
player.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD, loadRequestData => {
    const media = loadRequestData.media
    const { streamName, streamAccountId } = media.customData

    subscribe(streamName, streamAccountId)

    loadRequestData.media.contentUrl = 'https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    loadRequestData.media.contentType = 'video/mp4'

    return loadRequestData
  }
)

context.start()
