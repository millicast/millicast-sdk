import { loadFeature, defineFeature } from 'jest-cucumber'
import axios from 'axios'
import PeerConnection, { defaultTurnServerLocation } from '../../../src/PeerConnection'
import './__mocks__/MockMediaStream'
const feature = loadFeature('../GetIceServer.feature', { loadRelativePath: true, errors: true })

jest.mock('axios')

defineFeature(feature, test => {
  afterEach(async () => {
    PeerConnection.setTurnServerLocation(defaultTurnServerLocation)
    jest.restoreAllMocks()
  })

  test('Get RTC Ice servers with custom location', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
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
      iceServers = await peerConnection.getRTCIceServers(location)
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
    const peerConnection = new PeerConnection()
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
      iceServers = await peerConnection.getRTCIceServers()
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
    const peerConnection = new PeerConnection()
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
      iceServers = await peerConnection.getRTCIceServers()
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
    const peerConnection = new PeerConnection()
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
      iceServers = await peerConnection.getRTCIceServers()
    })

    then('returns empty ICE Servers', async () => {
      expect(iceServers).toEqual([])
    })
  })

  test('Error sending request for get RTC Ice servers', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
    const axiosResponse = {
      response: {
        data: {}
      }
    }
    let iceServers

    given('I do not have an ICE server location', async () => {})

    when('I want to get the RTC Ice Servers and server responds with 500 error', async () => {
      axios.put.mockRejectedValue(axiosResponse)
      iceServers = await peerConnection.getRTCIceServers()
    })

    then('returns empty ICE Servers', async () => {
      expect(iceServers).toEqual([])
    })
  })

  test('Get RTC Ice servers with custom location set in static method', ({ given, when, then }) => {
    const peerConnection = new PeerConnection()
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

    when('I set the TURN server location and I want to get the RTC Ice Servers', async () => {
      axios.put.mockResolvedValue(axiosResponse)
      PeerConnection.setTurnServerLocation(location)
      iceServers = await peerConnection.getRTCIceServers()
    })

    then('returns the ICE Servers', async () => {
      expect(PeerConnection.getTurnServerLocation()).toBe(location)
      for (const iceServer of iceServers) {
        expect(iceServer.url).toBeUndefined()
        expect(iceServer.urls).not.toBeUndefined()
        expect(axiosResponse.data.v.iceServers.filter(x => x.url === iceServer.urls)).toBeDefined()
      }
    })
  })
})
