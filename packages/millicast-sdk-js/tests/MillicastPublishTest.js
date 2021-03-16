class MillicastPublishTest {
  constructor() {
    this.millicastPublish = new millicast.MillicastPublish()
  }

  async init(){
    this.mediaStream = await millicastMediaTest.testGetMedia()
  }

  async testStart(options = undefined) {
    const accountId = 'tnJhvK'
    const disableVideo = document.getElementById('disable-video-checkbox').checked
    const disableAudio = document.getElementById('disable-audio-checkbox').checked
    const bandwidth = Number.parseInt(document.getElementById('bitrate-select').value)

    const broadcastOptions = options ?? {
      token: '9d8e95ce075bbcd2bc7613db2e7a6370d90e6c54f714c25f96ee7217024c1849', 
      streamName: 'km0n0h1u', 
      mediaStream: this.mediaStream,
      bandwidth: bandwidth, 
      disableVideo: disableVideo,
      disableAudio: disableAudio
    }
    try{
      const response = await this.millicastPublish.broadcast(broadcastOptions)
      console.log('BROADCASTING!! Start response: ', response);
      const viewLink = `https://viewer.millicast.com/v2?streamId=${accountId}/${broadcastOptions.streamName}`
      console.log('Broadcast viewer link: ', viewLink)
      document.getElementById('broadcast-status-label').innerHTML = `LIVE! View link: <a href='${viewLink}'>${viewLink}</a>`
    }
    catch(error){
      console.log('There was an error while trying to broadcast: ', error)
    }
  }

  testStop() {
    this.millicastPublish.stop()
    console.log('Broadcast stopped')
    document.getElementById('broadcast-status-label').innerHTML = 'READY!'
  }

  async testUpdateBitrate(selectObject){
    if(this.millicastPublish.isActive()){
      const bitrate = selectObject.value
      await this.millicastPublish.webRTCPeer.updateBitrate(bitrate)
      console.log('Bitrate updated')
    }
  }
}

const millicastPublishTest = new MillicastPublishTest()
millicastPublishTest.init()