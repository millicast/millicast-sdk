const millicast = window.millicast

const accountId = window.accountId
const streamName = window.streamName

class MillicastViewTest {
  constructor () {
    const href = new URL(window.location.href)
    this.streamAccountId = (href.searchParams.get('streamAccountId')) ? href.searchParams.get('streamAccountId') : accountId
    this.streamName = (href.searchParams.get('streamName')) ? href.searchParams.get('streamName') : streamName
    this.playing = false
    this.disableVideo = false
    this.disableAudio = false
    const tokenGenerator = () => millicast.Director.getSubscriber(this.streamName, this.streamAccountId)
    this.millicastView = new millicast.View(this.streamName, tokenGenerator)
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

      const options = {
        disableVideo: this.disableVideo,
        disableAudio: this.disableAudio
      }
      this.millicastView.on('connectionStateChange', (state) => {
        console.log('Event from connectionStateChange: ', state)
      })
      await this.millicastView.connect(options)

      this.millicastView.webRTCPeer.initStats(1)
      this.millicastView.webRTCPeer.on('stats', (stats) => {
        console.log('Stats from event: ', stats)
        this.stats = stats
        this.loadStatsInTable(stats)
      })
    } catch (error) {
      console.log('There was an error while trying to connect with the publisher')
      this.millicastView.reconnect()
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

  loadStatsInTable (stats) {
    for (const [mediaTrack, data] of Object.entries(stats)) {
      if (mediaTrack !== 'raw') {
        for (const [statKey, value] of Object.entries(data.inbound)) {
          let valueParsed = value
          if (statKey === 'bitrate') {
            valueParsed /= 1000
          } else if (statKey === 'timestamp') {
            valueParsed = new Date(valueParsed).toISOString()
          }
          const element = document.getElementById(`stats-${mediaTrack}-${statKey}`)
          if (element) {
            element.innerHTML = `${valueParsed}`
          }
        }
      }
    }
  }
}

const millicastViewTest = new MillicastViewTest()
millicastViewTest.init()
