const millicast = window.millicast
const accountId = window.accountId
const streamName = window.streamName
const token = window.token

const tokenGenerator = () => millicast.Director.getPublisher({ token, streamName })

class MillicastPublishTest {
  constructor () {
    this.streamCount = null
    this.millicastPublish = new millicast.Publish(streamName, tokenGenerator)
  }

  async init () {
    this.media = window.media
    this.mediaStream = await this.media.getMedia()
    console.log('GetMedia response:', this.mediaStream)
    document.getElementById('millicast-media-video-test').srcObject = this.mediaStream
    this.setCodecOptions()
  }

  async loadCamera () {
    this.mediaStream = await this.media.getMedia()
    console.log('GetMedia response:', this.mediaStream)
    document.getElementById('millicast-media-video-test').srcObject = this.mediaStream
  }

  async loadVideo () {
    const videoUrl = document.getElementById('video-src').value
    const videoElement = document.getElementById('millicast-media-video-test')
    if (videoUrl) {
      videoElement.srcObject = null
      videoElement.src = videoUrl
      videoElement.load()
      videoElement.oncanplay = () => {
        this.mediaStream = videoElement.captureStream()
        console.log('LoadVideo response:', this.mediaStream)
      }
      videoElement.play()
    }
  }

  setCodecOptions () {
    const capabilities = millicast.PeerConnection.getCapabilities('video')
    const options = []

    for (const codec of capabilities.codecs) {
      options.push(`<option value='${codec.codec}'>${codec.codec}</option>`)
    }

    document.getElementById('codec-select').innerHTML = options.join('\n')

    this.selectedCodec = capabilities.codecs[0]?.codec

    if (capabilities.codecs[0]?.scalabilityModes) {
      const scalabilityOptions = []
      for (const scalability of capabilities.codecs[0].scalabilityModes) {
        scalabilityOptions.push(`<option value='${scalability}'>${scalability}</option>`)
      }
      scalabilityOptions.push('<option value=\'none\'>None</option>')
      document.getElementById('scalability-mode-select').innerHTML = scalabilityOptions.join('\n')
    } else {
      document.getElementById('scalability-mode-select').innerHTML = '<option value=\'none\'>None</option>'
    }
    this.selectedScalabilityMode = document.getElementById('scalability-mode-select').value
  }

  async testStart (options = undefined) {
    const bandwidth = Number.parseInt(document.getElementById('bitrate-select').value)

    try {
      const broadcastOptions = options ?? {
        mediaStream: this.mediaStream,
        bandwidth: bandwidth,
        disableVideo: false,
        disableAudio: false,
        simulcast: this.selectedCodec === 'h264' || this.selectedCodec === 'vp8' ? this.simulcast : false,
        codec: this.selectedCodec,
        scalabilityMode: this.selectedScalabilityMode === 'none' ? null : this.selectedScalabilityMode,
        record: false,
        absCaptureTime: true
      }
      this.millicastPublish.on('connectionStateChange', (state) => {
        if (state === 'connected') {
          const viewLink = `http://localhost:10002/?streamAccountId=${accountId}&streamId=${streamName}`
          document.getElementById('viewer').innerHTML = `<iframe src="${viewLink}" height=480 width=854 style="border:none;"></iframe>`
          console.log('Broadcast viewer link: ', viewLink)
          document.getElementById('broadcast-status-label').innerHTML = `LIVE! View link: <a href='${viewLink}'>${viewLink}</a>`
        }
      })
      await this.millicastPublish.connect(broadcastOptions)

      // On Peer stats
      this.millicastPublish.webRTCPeer.on('stats', (stats) => {
        this.stats = stats
        this.loadStatsInTable(stats)
      })

      // Subscribing to User Count Event.
      this.streamCount = await millicast.StreamEvents.init()
      this.streamCount.onUserCount(accountId, streamName, data => {
        document.getElementById('broadcast-viewers').innerHTML = `Viewers: ${data.count}`
      })

      // Start Stats
      this.testGetStats()
    } catch (error) {
      console.log('There was an error while trying to broadcast: ', error)
    }
  }

  testStop () {
    this.millicastPublish.stop()
    this.streamCount.stop()
    this.testStopStats()
    console.log('Broadcast stopped')
    document.getElementById('broadcast-status-label').innerHTML = 'READY!'
    document.getElementById('broadcast-viewers').innerHTML = ''
    document.getElementById('viewer').innerHTML = '<div style="height: 480px; width: 640px;"></div>'
  }

  changeCodec (selectObject) {
    document.getElementById('scalability-mode-select').innerHTML = ''
    this.selectedCodec = selectObject.value

    const capabilities = millicast.PeerConnection.getCapabilities('video')
    const selectedCapability = capabilities.codecs.find(x => x.codec === this.selectedCodec)
    if (selectedCapability.scalabilityModes) {
      const scalabilityOptions = []
      for (const scalability of selectedCapability.scalabilityModes) {
        scalabilityOptions.push(`<option value='${scalability}'>${scalability}</option>`)
      }
      scalabilityOptions.push('<option value=\'none\'>None</option>')
      document.getElementById('scalability-mode-select').innerHTML = scalabilityOptions.join('\n')
    } else {
      document.getElementById('scalability-mode-select').innerHTML = '<option value=\'none\'>None</option>'
    }
    this.selectedScalabilityMode = document.getElementById('scalability-mode-select').value
  }

  changeScalability (selectObject) {
    this.selectedScalabilityMode = selectObject.value
  }

  setSimulcast (checkboxObject) {
    this.simulcast = checkboxObject.checked
  }

  async testUpdateBitrate (selectObject) {
    if (this.millicastPublish.isActive()) {
      const bitrate = selectObject.value
      await this.millicastPublish.webRTCPeer.updateBitrate(bitrate)
      console.log('Bitrate updated')
    }
  }

  testMuteAudio (checkboxObject) {
    const muted = this.media.muteAudio(checkboxObject.checked)
    console.log('MuteAudio response:', muted)
  }

  testMuteVideo (checkboxObject) {
    const muted = this.media.muteVideo(checkboxObject.checked)
    console.log('MuteVideo response:', muted)
  }

  async testChangeVideo () {
    const currentVideoDevice = (this.mediaStream.getVideoTracks()[0]).getSettings().deviceId

    const deviceList = await this.media.getMediaDevices()
    console.log(deviceList.videoinput)
    const newDevice = deviceList.videoinput.find(vi => vi.deviceId !== currentVideoDevice)
    console.log(newDevice)

    const newStream = await this.media.changeVideo(newDevice.deviceId)
    const video = newStream.getVideoTracks()[0]

    console.log(video)

    this.millicastPublish.webRTCPeer.replaceTrack(video)
    this.mediaStream = newStream
    document.getElementById('millicast-media-video-test').srcObject = this.mediaStream
  }

  testGetStats () {
    this.millicastPublish.webRTCPeer.initStats()
    document.getElementById('stats').classList.add('show')
  }

  testStopStats () {
    this.millicastPublish.webRTCPeer.stopStats()
    document.getElementById('stats').classList.remove('show')
    const candidateInfo = document.getElementById('candidate-info')
    const tracksInfo = document.getElementById('tracks-info')
    candidateInfo.innerHTML = tracksInfo.innerHTML = ''
  }

  loadStatsInTable (stats) {
    const candidateInfo = document.getElementById('candidate-info')
    candidateInfo.innerHTML = `
      <tr>
        <td>${stats.candidateType}</td>
        <td>${stats.availableOutgoingBitrate / 1000}</td>
        <td>${stats.currentRoundTripTime}</td>
        <td>${stats.totalRoundTripTime}</td>
      </tr>
    `

    const tracksInfo = document.getElementById('tracks-info')
    const tracks = []

    for (const track of stats.video.outbounds) {
      tracks.push(`
        <tr>
          <td>Video</td>
          <td>${track.id}</td>
          <td>${track.mimeType}</td>
          <td>${track.frameWidth}</td>
          <td>${track.frameHeight}</td>
          <td>${track.qualityLimitationReason}</td>
          <td>${track.framesPerSecond || '-'}</td>
          <td>${track.totalBytesSent}</td>
          <td>${track.bitrate / 1000}</td>
          <td>${new Date(track.timestamp).toISOString()}</td>
        </tr>
      `)
    }

    for (const track of stats.audio.outbounds) {
      tracks.push(`
        <tr>
          <td>Audio</td>
          <td>${track.id}</td>
          <td>${track.mimeType}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>${track.totalBytesSent}</td>
          <td>${track.bitrate / 1000}</td>
          <td>${new Date(track.timestamp).toISOString()}</td>
        </tr>
      `)
    }

    tracksInfo.innerHTML = tracks.join(' ')
  }
}

const millicastPublishTest = new MillicastPublishTest()
millicastPublishTest.init()
