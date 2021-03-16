
class MillicastWebRTCTest {
  constructor() {
    this.token =
      "5159e188181e7fea4b21bd4af7a04e1c634af11995d421431a2472c134b59f31";
    this.streamName = "kmc1vt0c";
    this.streamAccountId = "tnJhvK";
    this.millicastWebRTC = new millicast.MillicastWebRTC()
    this.millicastSignaling = new millicast.MillicastSignaling()
  }

  async testGetRTCPeer() {
    const response = await this.millicastWebRTC.getRTCPeer()
    console.log('getRTCPeer response: ', response)
    return response
  }

  async testCloseRTCPeer() {
    await this.millicastWebRTC.getRTCPeer()
    const response = await this.millicastWebRTC.closeRTCPeer()
    console.log('closeRTCPeer response: ', response)
    return response
  }

  async testGetRTCConfiguration() {
    try {
      const response = await this.millicastWebRTC.getRTCConfiguration()
      console.log('getRTCConfiguration response: ', response)
      return response
    } catch (error) {
      console.log('getRTCConfiguration response: ', error)
      return error
    }
  }

  async testGetRTCIceServers() {
    try {
      const response = await this.millicastWebRTC.getRTCIceServers()
      console.log('getRTCIceServers response: ', response)
      return response
    } catch (error) {
      console.log('getRTCIceServers response: ', error)
      return error
    }
  }

  async testSetRTCRemoteSDP() {
    // const sdp = await this.millicastWebRTC.resolveLocalSDP(null)
    // const remoteSDP = await this.millicastSignaling.publish(sdp)

    // const response = await this.millicastWebRTC.setRTCRemoteSDP(remoteSDP)
    // console.log('setRTCRemoteSDP response: ', response)
    // return response

    const director = await millicast.MillicastDirector.getPublisher(this.token, this.streamName)
    const localsdp = await this.millicastWebRTC.resolveLocalSDP(true, null)
    this.millicastSignaling.wsUrl = `${director.wsUrl}?token=${director.jwt}`;
    let remotesdp = await this.millicastSignaling.publish(localsdp)

    if (remotesdp && remotesdp.indexOf('\na=extmap-allow-mixed') !== -1) {
      remotesdp = remotesdp.split('\n').filter(function (line) {
        return line.trim() !== 'a=extmap-allow-mixed'
      }).join('\n')
      // console.log('trimed a=extmap-allow-mixed - sdp \n',remotesdp)
    }
    // console.log(remotesdp)

    const response = await this.millicastWebRTC.setRTCRemoteSDP(remotesdp)
    console.log('setRTCRemoteSDP response: ', response)
    return response
  }

  async testGetRTCLocalSDP() {
    await this.millicastWebRTC.getRTCPeer()
    try {
      const response = await this.millicastWebRTC.getRTCLocalSDP(true, null)
      console.log('getRTCLocalSDP response: ', response)
      // this.sdp = response
      return response
    } catch (error) {
      console.log('getRTCLocalSDP response: ', error)
      return error
    }
  }

  async testResolveLocalSDP() {
    const response = await this.millicastWebRTC.resolveLocalSDP(false, null)
    console.log('resolveLocalSDP response: ', response)
    return response
  }

  testUpdateBandwidthRestriction() {
  }

  testUpdateBitrate() {
  }
}

const millicastWebRTCTest = new MillicastWebRTCTest()