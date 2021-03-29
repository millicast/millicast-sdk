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
    return this.getPublisher(
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
    let director = null

    return this.getSubscriber(
      this.streamAccountId,
      this.streamName,
      true
    ).then((dir) => {
      director = dir
      return this.millicastWebRTC
        .resolveLocalSDP(false, options.mediaStream)
        .then((localSdp) => {
          this.millicastSignaling.wsUrl = `${director.wsUrl}?token=${director.jwt}`
          return this.millicastSignaling
            .subscribe(localSdp, this.streamAccountId)
            .then((response) => {
              console.log('subscribe sdp: ', response)
            })
        })
    })
  }

  async testPublish () {
    let director = null

    return this.getPublisher(
      this.token,
      this.streamName
    ).then((dir) => {
      director = dir
      return this.millicastWebRTC
        .resolveLocalSDP(true, null)
        .then((localSdp) => {
          this.millicastSignaling.wsUrl = `${director.wsUrl}?token=${director.jwt}`
          return this.millicastSignaling
            .publish(localSdp)
            .then((publishSdp) => {
              console.log('publish sdp: ', publishSdp)
              return publishSdp
            })
        })
    })
  }

  async getPublisher (token, streamName) {
    const payload = { streamName }
    const response = await this.request(
      'https://director.millicast.com/api/director/publish',
      'POST',
      token,
      payload
    )
    return response.data
  }

  async getSubscriber (
    streamAccountId,
    streamName,
    unauthorizedSubscribe = true
  ) {
    const payload = { streamAccountId, streamName, unauthorizedSubscribe }
    const token = null
    const response = await this.request(
      'https://director.millicast.com/api/director/subscribe',
      'POST',
      token,
      payload
    )
    return response.data
  }

  request (url, method, token, payload) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = (evt) => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          const res = JSON.parse(xhr.responseText)
          // console.log(res);
          switch (xhr.status) {
            case 200:
              resolve(res)
              break
            default:
              reject(res)
              break
          }
        }
      }
      xhr.open(method, url, true)
      xhr.setRequestHeader('Content-Type', 'application/json;')
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      payload ? xhr.send(JSON.stringify(payload)) : xhr.send()
    })
  }
}

window.millicastSignalingTest = new MillicastSignalingTest()
