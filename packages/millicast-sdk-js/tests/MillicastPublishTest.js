const millicast = window.millicast

class MillicastPublishTest {
  constructor () {
    this.millicastPublish = new millicast.MillicastPublish()
    this.streamCount = new millicast.MillicastStreamEvents()
  }

  async init () {
    this.millicastMedia = window.millicastMedia
    const mediaStream = await this.millicastMedia.getMedia()
    console.log('GetMedia response:', mediaStream)
    document.getElementById('millicast-media-video-test').srcObject = mediaStream
  }

  async testStart (options = undefined) {
    const accountId = 'tnJhvK'
    const bandwidth = Number.parseInt(document.getElementById('bitrate-select').value)
    const token = '9d8e95ce075bbcd2bc7613db2e7a6370d90e6c54f714c25f96ee7217024c1849'
    const streamName = 'km0n0h1u'
    try {
      const getPublisherResponse = await millicast.MillicastDirector.getPublisher(token, streamName)
      const broadcastOptions = options ?? {
        publisherData: getPublisherResponse,
        streamName: streamName,
        mediaStream: this.millicastMedia.mediaStream,
        bandwidth: bandwidth,
        disableVideo: false,
        disableAudio: false
      }
      const response = await this.millicastPublish.broadcast(broadcastOptions)
      console.log('BROADCASTING!! Start response: ', response)
      const viewLink = `https://viewer.millicast.com/v2?streamId=${accountId}/${broadcastOptions.streamName}`
      console.log('Broadcast viewer link: ', viewLink)
      document.getElementById('broadcast-status-label').innerHTML = `LIVE! View link: <a href='${viewLink}'>${viewLink}</a>`

      this.streamCount.userCount(accountId, streamName)
      this.streamCount.on('viewerCountChanged', (event) => {
        document.getElementById('broadcast-viewers').innerHTML = `Viewers: ${event.count}`
      })
    } catch (error) {
      console.log('There was an error while trying to broadcast: ', error)
    }
  }

  testStop () {
    this.millicastPublish.stop()
    this.streamCount.close()
    console.log('Broadcast stopped')
    document.getElementById('broadcast-status-label').innerHTML = 'READY!'
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
}

const millicastPublishTest = new MillicastPublishTest()
millicastPublishTest.init()
