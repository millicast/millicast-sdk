import { loadFeature, defineFeature } from 'jest-cucumber'
import axios from 'axios'
import MillicastWebRTC from '../../../src/MillicastWebRTC'
import { defaultConfig } from './__mocks__/MockRTCPeerConnection'
const feature = loadFeature('../ManageRTCPeer.feature', { loadRelativePath: true, errors: true })

jest.mock('axios')

defineFeature(feature, test => {
  afterEach(async () => {
    jest.restoreAllMocks()
  })

  test('Get RTC peer without configuration', ({ given, when, then }) => {
    let millicastWebRTC = null
    let peer = null

    given('I have no configuration', async () => {
      jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
      millicastWebRTC = new MillicastWebRTC()
    })

    when('I get the RTC peer', async () => {
      peer = await millicastWebRTC.getRTCPeer()
    })

    then('returns the peer', async () => {
      expect(peer.getConfiguration()).toMatchObject({ ...defaultConfig, bundlePolicy: 'max-bundle' })
    })
  })

  test('Get RTC peer again', ({ given, when, then }) => {
    let millicastWebRTC = null
    let peer = null

    given('I got the peer previously', async () => {
      jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
      millicastWebRTC = new MillicastWebRTC()
      await millicastWebRTC.getRTCPeer()
    })

    when('I get the RTC peer', async () => {
      peer = await millicastWebRTC.getRTCPeer()
    })

    then('returns the peer', async () => {
      expect(peer).toMatchObject(millicastWebRTC.peer)
    })
  })

  test('Get RTC peer with configuration', ({ given, when, then }) => {
    let millicastWebRTC = null
    let peer = null

    given('I have configuration', async () => {
      millicastWebRTC = new MillicastWebRTC()
    })

    when('I get the RTC peer', async () => {
      peer = await millicastWebRTC.getRTCPeer({
        bundlePolicy: 'max-bundle'
      })
    })

    then('returns the peer', async () => {
      expect(peer).toMatchObject(millicastWebRTC.peer)
      expect(peer.getConfiguration()).toMatchObject({
        bundlePolicy: 'max-bundle'
      })
    })
  })

  test('Close existing RTC peer', ({ given, when, then }) => {
    const handler = jest.fn()
    let millicastWebRTC = null

    given('I have a RTC peer', async () => {
      jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
      millicastWebRTC = new MillicastWebRTC()
      await millicastWebRTC.getRTCPeer()
      millicastWebRTC.on('peerClosed', handler)
    })

    when('I close the RTC peer', async () => {
      await millicastWebRTC.closeRTCPeer()
    })

    then('the peer is closed and emits peerClosed event', async () => {
      expect(handler).toBeCalledTimes(1)
      expect(millicastWebRTC.peer).toBeNull()
    })
  })

  test('Get RTC Ice servers with custom location', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const axiosResponse = {
      data: {
        v: {
          iceServers: [
            {
              url: 'stun:us-turn4.xirsys.com'
            },
            {
              username: 'gXvMYEfTmYMN0kBpnL0jJ947Fadjts8n4CFUTS4j_eqZ0De7Lx4lHzlI40gLyhI8AAAAAGCC7OptaWxsaWNhc3Q=',
              url: 'turn:us-turn4.xirsys.com:80?transport=udp',
              credential: 'b74d7ac6-a44b-11eb-a304-0242ac140004'
            }
          ]
        },
        s: 'ok'
      }
    }
    let location
    let iceServers

    given('I have an ICE server location', async () => {
      location = 'https://myIceServersLocation.com/webrtc'
    })

    when('I want to get the RTC Ice Servers', async () => {
      axios.put.mockResolvedValue(axiosResponse)
      iceServers = await millicastWebRTC.getRTCIceServers(location)
    })

    then('returns the ICE Servers', async () => {
      for (const iceServer of iceServers) {
        expect(iceServer.url).toBeUndefined()
        expect(iceServer.urls).not.toBeUndefined()
        expect(axiosResponse.data.v.iceServers.filter(x => x.url === iceServer.urls)).toBeDefined()
      }
    })
  })

  test('Get RTC Ice servers with default location', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const axiosResponse = {
      data: {
        v: {
          iceServers: [
            {
              url: 'stun:us-turn4.xirsys.com'
            },
            {
              username: 'gXvMYEfTmYMN0kBpnL0jJ947Fadjts8n4CFUTS4j_eqZ0De7Lx4lHzlI40gLyhI8AAAAAGCC7OptaWxsaWNhc3Q=',
              url: 'turn:us-turn4.xirsys.com:80?transport=udp',
              credential: 'b74d7ac6-a44b-11eb-a304-0242ac140004'
            }
          ]
        },
        s: 'ok'
      }
    }
    let iceServers

    given('I do not have an ICE server location', async () => {})

    when('I want to get the RTC Ice Servers', async () => {
      axios.put.mockResolvedValue(axiosResponse)
      iceServers = await millicastWebRTC.getRTCIceServers()
    })

    then('returns the ICE Servers', async () => {
      for (const iceServer of iceServers) {
        expect(iceServer.url).toBeUndefined()
        expect(iceServer.urls).not.toBeUndefined()
        expect(axiosResponse.data.v.iceServers.filter(x => x.url === iceServer.urls)).toBeDefined()
      }
    })
  })

  test('Get RTC Ice servers with different format', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const axiosResponse = {
      data: {
        v: {
          iceServers: [
            {
              urls: 'stun:us-turn4.xirsys.com'
            },
            {
              username: 'gXvMYEfTmYMN0kBpnL0jJ947Fadjts8n4CFUTS4j_eqZ0De7Lx4lHzlI40gLyhI8AAAAAGCC7OptaWxsaWNhc3Q=',
              urls: 'turn:us-turn4.xirsys.com:80?transport=udp',
              credential: 'b74d7ac6-a44b-11eb-a304-0242ac140004'
            }
          ]
        },
        s: 'ok'
      }
    }
    let iceServers

    given('I do not have an ICE server location', async () => {})

    when('I want to get the RTC Ice Servers and server returns urls instead url', async () => {
      axios.put.mockResolvedValue(axiosResponse)
      iceServers = await millicastWebRTC.getRTCIceServers()
    })

    then('returns the ICE Servers', async () => {
      for (const iceServer of iceServers) {
        expect(iceServer.url).toBeUndefined()
        expect(iceServer.urls).not.toBeUndefined()
        expect(axiosResponse.data.v.iceServers.filter(x => x.url === iceServer.urls)).toBeDefined()
      }
    })
  })

  test('Error getting RTC Ice servers', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const axiosResponse = {
      data: {
        v: {},
        s: 'error'
      }
    }
    let iceServers

    given('I do not have an ICE server location', async () => {})

    when('I want to get the RTC Ice Servers and server responds with error', async () => {
      axios.put.mockResolvedValue(axiosResponse)
      iceServers = await millicastWebRTC.getRTCIceServers()
    })

    then('returns empty ICE Servers', async () => {
      expect(iceServers).toEqual([])
    })
  })

  test('Error sending request for get RTC Ice servers', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const axiosResponse = {
      response: {
        data: {}
      }
    }
    let iceServers

    given('I do not have an ICE server location', async () => {})

    when('I want to get the RTC Ice Servers and server responds with 500 error', async () => {
      axios.put.mockRejectedValue(axiosResponse)
      iceServers = await millicastWebRTC.getRTCIceServers()
    })

    then('returns empty ICE Servers', async () => {
      expect(iceServers).toEqual([])
    })
  })

  test('Setting remote SDP to RTC peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const sdp = 'My SDP'

    given('I got the peer', async () => {
      jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
      await millicastWebRTC.getRTCPeer()
    })

    when('I set the remote description', async () => {
      await millicastWebRTC.setRTCRemoteSDP(sdp)
    })

    then('the SDP is setted', async () => {
      expect(millicastWebRTC.peer.currentRemoteDescription).toBeDefined()
    })
  })

  test('Error setting remote SDP to RTC peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const sdp = 'My SDP'
    let responseError

    given('I got the peer', async () => {
      jest.spyOn(MillicastWebRTC.prototype, 'getRTCIceServers').mockReturnValue([])
      await millicastWebRTC.getRTCPeer()
    })

    when('I set the remote description and peer returns an error', async () => {
      jest.spyOn(global.RTCPeerConnection.prototype, 'setRemoteDescription').mockRejectedValue(new Error('Invalid answer'))
      try {
        await millicastWebRTC.setRTCRemoteSDP(sdp)
      } catch (error) {
        responseError = error
      }
    })

    then('throws an error', async () => {
      expect(responseError.message).toBe('Invalid answer')
    })
  })
})
