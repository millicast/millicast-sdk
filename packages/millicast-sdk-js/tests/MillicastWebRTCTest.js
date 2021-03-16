class MillicastWebRTCTest {
  constructor() {
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

    // const publishSdp = await this.millicastSignaling.publish(sdp)

    await this.millicastWebRTC.getRTCPeer()
    const sdp = await this.millicastWebRTC.getRTCLocalSDP(false, null)
    const response = this.millicastWebRTC.setRTCRemoteSDP(sdp)
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
    const response = await this.millicastWebRTC.resolveLocalSDP(null)
    console.log('resolveLocalSDP response: ', response)
    return response
  }

  testUpdateBandwidthRestriction() {
  }

  testUpdateBitrate() {
  }
}

const millicastWebRTCTest = new MillicastWebRTCTest()