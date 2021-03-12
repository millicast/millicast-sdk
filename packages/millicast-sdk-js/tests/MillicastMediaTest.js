class MillicastMediaTest {
  constructor(constraints = undefined) {
    const defaultConstraints = {
      audio: true,
      video: true
    }
    const constraintsToUse = constraints ? constraints : defaultConstraints
    this.millicastMedia = new millicast.MillicastMedia(constraintsToUse)
  }

  async testGetMedia() {
    const mediaStream = await this.millicastMedia.getMedia()
    console.log('GetMedia response:', mediaStream)
    document.getElementById('millicast-media-video-test').srcObject = mediaStream
    //await this.testGetDevices()
    return mediaStream
  }

  async testGetDevices() {
    const audioInputSelect = document.getElementById('audio-input-select')
    const audioOutputSelect = document.getElementById('audio-output-select')
    const videoSelect = document.getElementById('video-select')
    const devices = await this.millicastMedia.getMediaDevices()
    console.log('GetDevices response:', devices)
    this.fillSelectElement(audioInputSelect, devices.audioinput)
    this.fillSelectElement(audioOutputSelect, devices.audiooutput)
    this.fillSelectElement(videoSelect, devices.videoinput)
    return devices
  }

  fillSelectElement(selectElement, devices) {
    selectElement.innerHTML = ''
    for (const device of devices)
      selectElement.add(new Option(device.label, device.deviceId))
  }

  testGetTracks() {
    const videoTrack = this.millicastMedia.videoInput
    const audioTrack = this.millicastMedia.audioInput
    console.log('Video track:', videoTrack)
    console.log('Audio track:', audioTrack)
    return {
      videoTrack,
      audioTrack,
    }
  }

  async testChangeAudio(selectObject) {
    const deviceId = selectObject.value
    const mediaStream = await this.millicastMedia.changeAudio(deviceId)
    console.log('ChangeAudio response:', mediaStream)
    document.getElementById('millicast-media-video-test').srcObject = mediaStream
    return mediaStream
  }

  async testChangeVideo(selectObject) {
    const deviceId = selectObject.value
    const mediaStream = await this.millicastMedia.changeVideo(deviceId)
    console.log('ChangeVideo response:', mediaStream)
    document.getElementById('millicast-media-video-test').srcObject = mediaStream
    return mediaStream
  }

  testMuteAudio() {
    const muted = this.millicastMedia.muteAudio(true)
    console.log('MuteAudio response:', muted)
    return muted
  }

  testMuteVideo() {
    const muted = this.millicastMedia.muteVideo(true)
    console.log('MuteVideo response:', muted)
    return muted
  }

  testUnmuteAudio() {
    const muted = this.millicastMedia.muteAudio(false)
    console.log('UnmuteAudio response:', muted)
    return muted
  }

  testUnmuteVideo() {
    const muted = this.millicastMedia.muteVideo(false)
    console.log('UnmuteVideo response:', muted)
    return muted
  }
}

const millicastMediaTest = new MillicastMediaTest()
