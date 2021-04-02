const millicast = window.millicast

class MillicastSignalingTest {
  constructor () {
    this.token =
      '5159e188181e7fea4b21bd4af7a04e1c634af11995d421431a2472c134b59f31'
    this.streamName = 'kmc1vt0c'
    this.streamAccountId = 'tnJhvK'
    this.millicastSignaling = new millicast.MillicastSignaling()
    this.millicastWebRTC = new millicast.MillicastWebRTC()
  }

  async testConnect () {
    return millicast.MillicastDirector.getPublisher(
      this.token,
      this.streamName
    ).then((res) => {
      const wsUrl = `${res.wsUrl}?token=${res.jwt}`
      return this.millicastSignaling.connect(wsUrl).then((ws) => {
        console.log('webSocket open: ', ws)
        return ws
      })
    })
  }

  async testClose () {
    const ws = this.millicastSignaling.close()
    console.log('webSocket closed', ws)
    return ws
  }

  async testSubscribe (
    options = {
      mediaStream: null,
      disableVideo: false,
      disableAudio: false
    }
  ) {
    const director = await millicast.MillicastDirector.getSubscriber(this.streamAccountId, this.streamName, true)
    const config = await this.millicastWebRTC.getRTCConfiguration()
    await this.millicastWebRTC.getRTCPeer(config)
    const localSdp = await this.millicastWebRTC.getRTCLocalSDP(null, options.mediaStream)
    this.millicastSignaling.wsUrl = `${director.wsUrl}?token=${director.jwt}`
    this.millicastSignaling.streamName = this.streamAccountId
    const response = await this.millicastSignaling.subscribe(localSdp)
    console.log('subscribe sdp: ', response)
  }

  async testPublish () {
    const director = await millicast.MillicastDirector.getPublisher(this.token, this.streamName)
    const config = await this.millicastWebRTC.getRTCConfiguration()
    await this.millicastWebRTC.getRTCPeer(config)
    const localSdp = await this.millicastWebRTC.getRTCLocalSDP(null, null)
    this.millicastSignaling.wsUrl = `${director.wsUrl}?token=${director.jwt}`
    const response = await this.millicastSignaling.publish(localSdp)
    console.log('publish sdp: ', response)
  }
}

window.millicastSignalingTest = new MillicastSignalingTest()
