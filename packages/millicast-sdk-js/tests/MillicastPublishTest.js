const millicast = window.millicast

class MillicastPublishTest {
  constructor () {
    this.millicastPublish = null
    this.streamCount = null
  }

  async init () {
    this.millicastMedia = window.millicastMedia
    this.mediaStream = await this.millicastMedia.getMedia()
    console.log('GetMedia response:', this.mediaStream)
    document.getElementById('millicast-media-video-test').srcObject = this.mediaStream
  }

  async testStart (options = undefined) {
    const accountId = 'tnJhvK'
    const bandwidth = Number.parseInt(document.getElementById('bitrate-select').value)
    const token = '9d8e95ce075bbcd2bc7613db2e7a6370d90e6c54f714c25f96ee7217024c1849'
    const streamName = 'km0n0h1u'

    this.millicastPublish = new millicast.MillicastPublish(streamName)
    try {
      const getPublisherResponse = await millicast.MillicastDirector.getPublisher(token, streamName)
      const broadcastOptions = options ?? {
        publisherData: getPublisherResponse,
        mediaStream: this.millicastMedia.mediaStream,
        bandwidth: bandwidth,
        disableVideo: false,
        disableAudio: false
      }
      this.millicastPublish.on('connectionStateChange', (state) => {
        if (state === 'connected') {
          const viewLink = `https://viewer.millicast.com/v2?streamId=${accountId}/${streamName}`
          document.getElementById('viewer').innerHTML = `<iframe src="${viewLink}" height=480 width=640 style="border:none;"></iframe>`
          console.log('Broadcast viewer link: ', viewLink)
          document.getElementById('broadcast-status-label').innerHTML = `LIVE! View link: <a href='${viewLink}'>${viewLink}</a>`
        }
      })
      this.millicastPublish.broadcast(broadcastOptions)

      // Subscribing to User Count Event.
      this.streamCount = await millicast.MillicastStreamEvents.init()
      this.streamCount.onUserCount(accountId, streamName, data => {
        document.getElementById('broadcast-viewers').innerHTML = `Viewers: ${data.count}`
      })
    } catch (error) {
      console.log('There was an error while trying to broadcast: ', error)
    }
  }

  testStop () {
    this.millicastPublish.stop()
    this.streamCount.stop()
    console.log('Broadcast stopped')
    document.getElementById('broadcast-status-label').innerHTML = 'READY!'
    document.getElementById('broadcast-viewers').innerHTML = ''
    document.getElementById('viewer').innerHTML = '<div style="height: 480px; width: 640px;"></div>'
  }

  async testUpdateBitrate (selectObject) {
    if (this.millicastPublish.isActive()) {
      const bitrate = selectObject.value
      await this.millicastPublish.webRTCPeer.updateBitrate(bitrate)
      console.log('Bitrate updated')
    }
  }

  testMuteAudio (checkboxObject) {
    const muted = this.millicastMedia.muteAudio(checkboxObject.checked)
    console.log('MuteAudio response:', muted)
  }

  testMuteVideo (checkboxObject) {
    const muted = this.millicastMedia.muteVideo(checkboxObject.checked)
    console.log('MuteVideo response:', muted)
  }

  async testChangeVideo () {
    const currentVideoDevice = (this.mediaStream.getVideoTracks()[0]).getSettings().deviceId

    const deviceList = await this.millicastMedia.getMediaDevices()
    console.log(deviceList.videoinput)
    const newDevice = deviceList.videoinput.find(vi => vi.deviceId !== currentVideoDevice)
    console.log(newDevice)

    const newStream = await this.millicastMedia.changeVideo(newDevice.deviceId)
    const video = newStream.getVideoTracks()[0]

    console.log(video)

    this.millicastPublish.webRTCPeer.replaceTrack(video)
    this.mediaStream = newStream
    document.getElementById('millicast-media-video-test').srcObject = this.mediaStream
  }
}

const millicastPublishTest = new MillicastPublishTest()
millicastPublishTest.init()
