import { loadFeature, defineFeature } from 'jest-cucumber'
import axios from 'axios'
import MillicastWebRTC from '../../../src/MillicastWebRTC'
import { defaultConfig } from './__mocks__/MockRTCPeerConnection'
import './__mocks__/MockMediaStream'
import { changeBrowserMock } from './__mocks__/MockBrowser'
const feature = loadFeature('../ManageRTCPeer.feature', { loadRelativePath: true, errors: true })

jest.mock('axios')

defineFeature(feature, test => {
  afterEach(async () => {
    jest.restoreAllMocks()
    changeBrowserMock('Chrome')
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

  test('Get RTC Local SDP as subscriber role', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let sdp

    given('I do not have options', async () => {
      await millicastWebRTC.getRTCPeer()
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await millicastWebRTC.getRTCLocalSDP()
    })

    then('returns the SDP', async () => {
      expect(millicastWebRTC.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role with valid MediaStream', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let sdp
    let mediaStream
    let stereo

    given('I have a MediaStream with 1 audio track and 1 video track and I want support stereo', async () => {
      await millicastWebRTC.getRTCPeer()
      const tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
      mediaStream = new MediaStream(tracks)
      stereo = true
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await millicastWebRTC.getRTCLocalSDP({ mediaStream, stereo })
    })

    then('returns the SDP', async () => {
      expect(millicastWebRTC.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role with invalid MediaStream', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let errorResponse
    let mediaStream
    let stereo

    given('I have a MediaStream with 2 video tracks and no audio track', async () => {
      await millicastWebRTC.getRTCPeer()
      const tracks = [{ id: 1, kind: 'video', label: 'Video1' }, { id: 2, kind: 'video', label: 'Video2' }]
      mediaStream = new MediaStream(tracks)
      stereo = true
    })

    when('I want to get the RTC Local SDP', async () => {
      try {
        await millicastWebRTC.getRTCLocalSDP({ mediaStream, stereo })
      } catch (error) {
        errorResponse = error
      }
    })

    then('throw invalid MediaStream error', async () => {
      expect(errorResponse.message).toBe('MediaStream must have 1 audio track and 1 video track, or at least one of them.')
    })
  })

  test('Get RTC Local SDP as publisher role with valid list of tracks', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let sdp
    let tracks

    given('I have a list of tracks with 1 audio track and 1 video track', async () => {
      await millicastWebRTC.getRTCPeer()
      tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
    })

    when('I want to get the RTC Local SDP', async () => {
      sdp = await millicastWebRTC.getRTCLocalSDP({ mediaStream: tracks })
    })

    then('returns the SDP', async () => {
      expect(millicastWebRTC.peer.currentLocalDescription).toBeDefined()
      expect(sdp).toBeDefined()
    })
  })

  test('Get RTC Local SDP as publisher role with invalid list of tracks', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let errorResponse
    let tracks

    given('I have a list of tracks with 3 audio tracks and 1 video track', async () => {
      await millicastWebRTC.getRTCPeer()
      tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' },
        { id: 3, kind: 'audio', label: 'Audio2' }, { id: 4, kind: 'audio', label: 'Audio3' }]
    })

    when('I want to get the RTC Local SDP', async () => {
      try {
        await millicastWebRTC.getRTCLocalSDP({ mediaStream: tracks })
      } catch (error) {
        errorResponse = error
      }
    })

    then('throw invalid MediaStream error', async () => {
      expect(errorResponse.message).toBe('MediaStream must have 1 audio track and 1 video track, or at least one of them.')
    })
  })

  test('Update bitrate with restrictions', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await millicastWebRTC.getRTCPeer()
      await millicastWebRTC.setRTCRemoteSDP(sdp)
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).toBe(sdp)
    })

    when('I want to update the bitrate to 1000 kbps', async () => {
      await millicastWebRTC.updateBitrate(1000)
    })

    then('the bitrate is updated', async () => {
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).not.toBe(sdp)
    })
  })

  test('Update bitrate with no restrictions', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const sdp = 'My default SDP'

    given('I have a peer connected', async () => {
      await millicastWebRTC.getRTCPeer()
      await millicastWebRTC.setRTCRemoteSDP(sdp)
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).toBe(sdp)
    })

    when('I want to update the bitrate to unlimited', async () => {
      await millicastWebRTC.updateBitrate()
    })

    then('the bitrate is updated', async () => {
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).not.toBe(sdp)
    })
  })

  test('Update bitrate with restrictions in Firefox', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const sdp = 'My default SDP'

    given('I am using Firefox and I have a peer connected', async () => {
      changeBrowserMock('firefox')
      await millicastWebRTC.getRTCPeer()
      await millicastWebRTC.setRTCRemoteSDP(sdp)
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).toBe(sdp)
    })

    when('I want to update the bitrate to 1000 kbps', async () => {
      await millicastWebRTC.updateBitrate(1000)
    })

    then('the bitrate is updated', async () => {
      expect(millicastWebRTC.peer.currentRemoteDescription.sdp).not.toBe(sdp)
    })
  })

  test('Get existing RTC peer status', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let status

    given('I have a peer instanced', async () => {
      await millicastWebRTC.getRTCPeer()
    })

    when('I want to get the peer connection state', () => {
      status = millicastWebRTC.getRTCPeerStatus()
    })

    then('returns the connection state', async () => {
      expect(status).toBe('new')
    })
  })

  test('Get unexisting RTC peer status', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    let status

    given('I do not have a peer connected', async () => {})

    when('I want to get the peer connection state', () => {
      status = millicastWebRTC.getRTCPeerStatus()
    })

    then('returns no value', async () => {
      expect(status).toBeNull()
    })
  })

  test('Replace track to existing peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const track = { id: 3, kind: 'audio', label: 'Audio2' }

    given('I have a peer connected', async () => {
      await millicastWebRTC.getRTCPeer()
      const tracks = [{ id: 1, kind: 'audio', label: 'Audio1' }, { id: 2, kind: 'video', label: 'Video1' }]
      const mediaStream = new MediaStream(tracks)
      await millicastWebRTC.getRTCLocalSDP({ mediaStream })
    })

    when('I want to change current audio track', () => {
      millicastWebRTC.replaceTrack(track)
    })

    then('the track is changed', async () => {
      expect(millicastWebRTC.peer.getSenders()).toBeDefined()
      expect(millicastWebRTC.peer.getSenders()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            track: { ...track }
          })
        ])
      )
    })
  })

  test('Replace track to unexisting peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const track = { id: 3, kind: 'audio', label: 'Audio2' }

    given('I do not have a peer connected', async () => {})

    when('I want to change the audio track', () => {
      millicastWebRTC.replaceTrack(track)
    })

    then('the track is not changed', async () => {
      expect(millicastWebRTC.peer).toBeNull()
    })
  })

  test('Replace unexisting track to peer', ({ given, when, then }) => {
    const millicastWebRTC = new MillicastWebRTC()
    const track = { id: 2, kind: 'audio', label: 'Audio2' }

    given('I have a peer connected with video track', async () => {
      await millicastWebRTC.getRTCPeer()
      const tracks = [{ id: 1, kind: 'video', label: 'Video1' }]
      const mediaStream = new MediaStream(tracks)
      await millicastWebRTC.getRTCLocalSDP({ mediaStream })
    })

    when('I want to change the audio track', () => {
      millicastWebRTC.replaceTrack(track)
    })

    then('the track is not changed', async () => {
      expect(millicastWebRTC.peer.getSenders()).toBeDefined()
      expect(millicastWebRTC.peer.getSenders()).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({
            track: { ...track }
          })
        ])
      )
    })
  })
})
