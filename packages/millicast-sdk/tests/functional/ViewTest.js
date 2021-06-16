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

      this.millicastView.webRTCPeer.initStats()
      this.millicastView.webRTCPeer.on('stats', (stats) => {
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
    const candidateInfo = document.getElementById('candidate-info')
    candidateInfo.innerHTML = `
      <tr>
        <td>${stats.candidateType}</td>
        <td>${stats.currentRoundTripTime}</td>
        <td>${stats.totalRoundTripTime}</td>
      </tr>
    `

    const tracksInfo = document.getElementById('tracks-info')
    const tracks = []

    for (const track of stats.video.inbounds) {
      tracks.push(`
        <tr>
          <td>Video</td>
          <td>${track.mimeType}</td>
          <td>${track.frameWidth}</td>
          <td>${track.frameHeight}</td>
          <td>${track.framesPerSecond}</td>
          <td>${track.totalBytesReceived}</td>
          <td>${track.packetsLostDeltaPerSecond}</td>
          <td>${track.packetsLostRatioPerSecond}</td>
          <td>${track.totalPacketsLost}</td>
          <td>${track.jitter}</td>
          <td>${track.bitrate / 1000}</td>
          <td>${new Date(track.timestamp).toISOString()}</td>
        </tr>
      `)
    }

    for (const track of stats.audio.inbounds) {
      tracks.push(`
        <tr>
          <td>Audio</td>
          <td>${track.mimeType}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>${track.totalBytesReceived}</td>
          <td>${track.packetsLostDeltaPerSecond}</td>
          <td>${track.packetsLostRatioPerSecond}</td>
          <td>${track.totalPacketsLost}</td>
          <td>${track.jitter}</td>
          <td>${track.bitrate / 1000}</td>
          <td>${new Date(track.timestamp).toISOString()}</td>
        </tr>
      `)
    }

    tracksInfo.innerHTML = tracks.join(' ')
  }
}

const millicastViewTest = new MillicastViewTest()
millicastViewTest.init()
