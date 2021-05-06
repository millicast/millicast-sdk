const millicast = window.millicast

class MillicastViewTest {
  constructor () {
    const href = new URL(window.location.href)
    this.streamAccountId = (href.searchParams.get('streamAccountId')) ? href.searchParams.get('streamAccountId') : 'tnJhvK'
    this.streamName = (href.searchParams.get('streamName')) ? href.searchParams.get('streamName') : 'km0y5qxp'
    this.playing = false
    this.disableVideo = false
    this.disableAudio = false
    this.millicastView = new millicast.MillicastView(this.streamName)
    this.tracks = []
  }

  async init () {
    this.subscribe()
  }

  async subscribe () {
    try {
      this.millicastView.on('track', (event) => {
        this.tracks.push(event)
        console.log('Event from newTrack: ', event)
        this.addStreamToVideoTag(event)
      })
      this.millicastView.on('broadcastEvent', (event) => {
        console.log('Event from broadcastEvent: ', event)
      })

      const getSubscriberResponse = await millicast.MillicastDirector.getSubscriber(this.streamName, this.streamAccountId)
      const options = {
        subscriberData: getSubscriberResponse,
        disableVideo: this.disableVideo,
        disableAudio: this.disableAudio
      }
      this.millicastView.on('connectionStateChange', (state) => {
        console.log('Event from connectionStateChange: ', state)
      })
      this.millicastView.connect(options)
    } catch (error) {
      console.log('There was an error while trying to connect with the publisher: ', error)
    }
  }

  addStreamToVideoTag (event) {
    this.addStream(event.streams[0])
  }

  addStream (stream) {
    this.playing = true
    const video = document.getElementById('millicast-view-test')

    if (this.disableVideo) {
      if (video)video.parentNode.removeChild(video)
    } else {
      video.srcObject = stream
    }
  }
}

const millicastViewTest = new MillicastViewTest()
millicastViewTest.init()
