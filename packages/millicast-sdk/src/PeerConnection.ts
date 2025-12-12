import { EventEmitter } from 'events'
import reemit from 're-emitter'
import PeerConnectionStats, { peerConnectionStatsEvents } from './PeerConnectionStats'
import SdpParser from './utils/SdpParser'
import UserAgent from './utils/UserAgent'
import Logger from './Logger'
import { VideoCodec, AudioCodec } from './types/Codecs.types'
import {ConnectionType, ConnectionTypeValue, webRTCEvents} from './types/PeerConnection.types'

const logger = Logger.get('PeerConnection')

interface RTCRtpEncodingParametersExtended extends RTCRtpEncodingParameters {
  scalabilityMode?: string
}


interface LocalSDPOptions {
  stereo?: boolean
  dtx?: boolean
  mediaStream?: MediaStream | MediaStreamTrack[] | null
  codec?: VideoCodec
  simulcast?: boolean
  scalabilityMode?: string | null
  absCaptureTime?: boolean
  dependencyDescriptor?: boolean
  disableAudio?: boolean
  disableVideo?: boolean
  setSDPToPeer?: boolean
  multiplexedAudioTracks?: number
}

const localSDPOptions: LocalSDPOptions = {
  stereo: false,
  mediaStream: null,
  codec: VideoCodec.H264,
  simulcast: false,
  scalabilityMode: null,
  disableAudio: false,
  disableVideo: false,
  setSDPToPeer: true,
}

interface RTCConfigurationExtended extends RTCConfiguration {
  autoInitStats?: boolean
  statsIntervalMs?: number
}

interface MillicastCodec {
  codec: string
  mimeType: string
  scalabilityModes?: string[]
  channels?: number
}

/**

 * @class PeerConnection
 * @extends EventEmitter
 * @classdesc Manages WebRTC connection and SDP information between peers.
 * @example const peerConnection = new PeerConnection()
 * @constructor
 */
export default class PeerConnection extends EventEmitter {
  mode: ConnectionTypeValue | null
  sessionDescription: RTCSessionDescriptionInit | null
  peer: RTCPeerConnection | null
  peerConnectionStats: PeerConnectionStats | null
  transceiverMap: Map<RTCRtpTransceiver, (value: RTCRtpTransceiver) => void>

  constructor () {
    super()
    this.mode = null
    this.sessionDescription = null
    this.peer = null
    this.peerConnectionStats = null
    this.transceiverMap = new Map()
  }

  async createRTCPeer (
    config: RTCConfigurationExtended = { autoInitStats: true, statsIntervalMs: 1000 },
    mode: ConnectionTypeValue = ConnectionType.Viewer
  ): Promise<void> {
    logger.info('Creating new RTCPeerConnection')
    logger.debug('RTC configuration provided by user: ', config)
    this.peer = instanceRTCPeerConnection(this, config)
    this.mode = mode
    if (config.autoInitStats) {
      this.initStats(config)
    }
  }

  getRTCPeer (): RTCPeerConnection | null {
    logger.info('Getting RTC Peer')
    return this.peer
  }

  async closeRTCPeer (): Promise<void> {
    logger.info('Closing RTCPeerConnection')
    this.peer?.close()
    this.peer = null
    this.stopStats()
    this.emit(webRTCEvents.connectionStateChange, 'closed')
  }

  async setRTCRemoteSDP (sdp: string): Promise<void> {
    logger.info('Setting RTC Remote SDP')
    const answer: RTCSessionDescriptionInit = { type: 'answer', sdp }

    try {
      await this.peer!.setRemoteDescription(answer)
      logger.info('RTC Remote SDP was set successfully.')
      logger.debug('RTC Remote SDP new value: ', sdp)
    } catch (e) {
      logger.error('Error while setting RTC Remote SDP: ', e)
      throw e
    }
  }

  async getRTCLocalSDP (options: LocalSDPOptions = localSDPOptions): Promise<string> {
    logger.info('Getting RTC Local SDP')
    options = { ...localSDPOptions, ...options }
    logger.debug('Options: ', options)

    const mediaStream = getValidMediaStream(options.mediaStream)
    if (mediaStream) {
      addMediaStreamToPeer(this.peer!, mediaStream, options)
    } else {
      addReceiveTransceivers(this.peer!, options)
    }

    logger.info('Creating peer offer')
    const response = await this.peer!.createOffer()
    logger.info('Peer offer created')
    logger.debug('Peer offer response: ', response.sdp)

    this.sessionDescription = response
    if (!options.disableAudio) {
      if (options.stereo) {
        this.sessionDescription.sdp = SdpParser.setStereo(this.sessionDescription.sdp!)
      }
      if (options.dtx) {
        this.sessionDescription.sdp = SdpParser.setDTX(this.sessionDescription.sdp!)
      }
      this.sessionDescription.sdp = SdpParser.setMultiopus(this.sessionDescription.sdp!, mediaStream)
    }
    if (!options.disableVideo && options.simulcast) {
      this.sessionDescription.sdp = SdpParser.setSimulcast(this.sessionDescription.sdp!, options.codec!)
    }
    if (options.absCaptureTime) {
      this.sessionDescription.sdp = SdpParser.setAbsoluteCaptureTime(this.sessionDescription.sdp!)
    }
    if (options.dependencyDescriptor) {
      this.sessionDescription.sdp = SdpParser.setDependencyDescriptor(this.sessionDescription.sdp!)
    }

    if (options.setSDPToPeer) {
      await this.peer!.setLocalDescription(this.sessionDescription)
      logger.info('Peer local description set')
    }

    return this.sessionDescription.sdp!
  }

  async addRemoteTrack (media: string, streams: MediaStream[]): Promise<RTCRtpTransceiver> {
    return new Promise((resolve, reject) => {
      try {
        const transceiver = this.peer!.addTransceiver(media, {
          direction: 'recvonly',
          streams,
        })
        this.transceiverMap.set(transceiver, resolve)
      } catch (e) {
        reject(e)
      }
    })
  }

  updateBandwidthRestriction (sdp: string, bitrate: number): string {
    if (this.mode === ConnectionType.Viewer) {
      logger.error('Viewer attempting to update bitrate, this is not allowed')
      throw new Error('It is not possible for a viewer to update the bitrate.')
    }

    logger.info('Updating bandwidth restriction, bitrate value: ', bitrate)
    logger.debug('SDP value: ', sdp)
    return SdpParser.setVideoBitrate(sdp, bitrate)
  }

  async updateBitrate (bitrate: number = 0): Promise<void> {
    if (this.mode === ConnectionType.Viewer) {
      logger.error('Viewer attempting to update bitrate, this is not allowed')
      throw new Error('It is not possible for a viewer to update the bitrate.')
    }
    if (!this.peer) {
      logger.error('Cannot update bitrate. No peer found.')
      throw new Error('Cannot update bitrate. No peer found.')
    }

    logger.info('Updating bitrate to value: ', bitrate)
    this.sessionDescription = await this.peer.createOffer()
    await this.peer.setLocalDescription(this.sessionDescription)
    const sdp = this.updateBandwidthRestriction(this.peer.remoteDescription!.sdp!, bitrate)
    await this.setRTCRemoteSDP(sdp)
    logger.info('Bitrate restrictions updated: ', `${bitrate > 0 ? bitrate : 'unlimited'} kbps`)
  }

  getRTCPeerStatus (): RTCPeerConnectionState | RTCIceConnectionState | null {
    logger.info('Getting RTC peer status')
    if (!this.peer) {
      return null
    }
    const connectionState = getConnectionState(this.peer)
    logger.info('RTC peer status getted, value: ', connectionState)
    return connectionState
  }

  replaceTrack (mediaStreamTrack: MediaStreamTrack): void {
    if (!this.peer) {
      logger.error('Could not change track if there is not an active connection.')
      return
    }

    const currentSender = this.peer.getSenders().find(s => s.track?.kind === mediaStreamTrack.kind)

    if (currentSender) {
      currentSender.replaceTrack(mediaStreamTrack)
    } else {
      logger.error(`There is no ${mediaStreamTrack.kind} track in active broadcast.`)
    }
  }

static getCapabilities(kind: 'audio' | 'video'): RTCRtpCapabilities | null {
  const browserData = new UserAgent()
  const browserCapabilities = RTCRtpSender.getCapabilities(kind)

  if (browserCapabilities) {
    const codecs: Record<string, Partial<MillicastCodec>> = {}
    let regex = new RegExp(`^video/(${Object.values(VideoCodec).join('|')})x?$`, 'i')

    if (kind === 'audio') {
      regex = new RegExp(`^audio/(${Object.values(AudioCodec).join('|')})$`, 'i')

      if (browserData.isChrome()) {
        codecs['multiopus'] = { mimeType: 'audio/multiopus', channels: 6 } 
      }
    }

    for (const codec of browserCapabilities.codecs) {
      const matches = codec.mimeType.match(regex)
      if (matches) {
        const codecName = matches[1].toLowerCase()
        
        codecs[codecName] = { 
          ...codecs[codecName], 
          mimeType: codec.mimeType 
        }
        // TODO fix and remove any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((codec as any).scalabilityModes) {
          let modes = (codecs[codecName].scalabilityModes as string[]) || []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          modes = [...modes, ...(codec as any).scalabilityModes]
          codecs[codecName].scalabilityModes = [...new Set(modes)]
        }
        if (codec.channels) {
          codecs[codecName].channels = codec.channels
        }
      }
    }
    // TODO fix and remove any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (browserCapabilities as any).codecs = Object.keys(codecs).map((key) => {
      return { codec: key, ...codecs[key] }
    })
  }

  return browserCapabilities
}

  getTracks (): (MediaStreamTrack | null)[] | undefined {
    return this.peer?.getSenders()?.map(sender => sender.track)
  }

  initStats (options?: RTCConfigurationExtended): void {
    if (this.peerConnectionStats) {
      logger.warn(
        'PeerConnection.initStats() has already been called. Automatic initialization occurs via View.connect(), Publish.connect() or this.createRTCPeer(). See options'
      )
    } else if (this.peer) {
      this.peerConnectionStats = new PeerConnectionStats(this.peer, options)
      reemit(this.peerConnectionStats, this, [peerConnectionStatsEvents.stats])
    } else {
      logger.warn('Cannot init peer stats: RTCPeerConnection not initialized')
    }
  }

  stopStats (): void {
    this.peerConnectionStats?.stop()
    this.peerConnectionStats = null
  }
}

const isMediaStreamValid = (mediaStream: MediaStream | null): boolean =>
  (mediaStream?.getAudioTracks().length ?? 0) <= 1 && (mediaStream?.getVideoTracks().length ?? 0) <= 1

const getValidMediaStream = (
  mediaStream: MediaStream | MediaStreamTrack[] | null | undefined
): MediaStream | null => {
  if (!mediaStream) {
    return null
  }

  if (mediaStream instanceof MediaStream && isMediaStreamValid(mediaStream)) {
    return mediaStream
  } else if (!(mediaStream instanceof MediaStream)) {
    logger.info('Creating MediaStream to add received tracks.')
    const stream = new MediaStream()
    for (const track of mediaStream) {
      stream.addTrack(track)
    }

    if (isMediaStreamValid(stream)) {
      return stream
    }
  }

  logger.error('MediaStream must have 1 audio track and 1 video track, or at least one of them.')
  throw new Error('MediaStream must have 1 audio track and 1 video track, or at least one of them.')
}

const instanceRTCPeerConnection = (
  instanceClass: PeerConnection,
  config: RTCConfiguration
): RTCPeerConnection => {
  const instance = new RTCPeerConnection(config)
  addPeerEvents(instanceClass, instance)
  return instance
}

async function delay (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const addPeerEvents = (instanceClass: PeerConnection, peer: RTCPeerConnection): void => {
  peer.ontrack = async (event: RTCTrackEvent) => {
    logger.info('New track from peer.')
    logger.debug('Track event value: ', event)
    const resolve = instanceClass.transceiverMap.get(event.transceiver)
    if (resolve) {
      while (!event.transceiver.mid) {
        await delay(100)
      }
      resolve(event.transceiver)
      instanceClass.transceiverMap.delete(event.transceiver)
    }

    setTimeout(() => {
      instanceClass.emit(webRTCEvents.track, event)
    }, 0)
  }

  if (peer.connectionState) {
    peer.onconnectionstatechange = (/*event: Event*/ ) => {
      logger.info('Peer connection state change: ', peer.connectionState)
      instanceClass.emit(webRTCEvents.connectionStateChange, peer.connectionState)
    }
  } else {
    peer.oniceconnectionstatechange = (/*event: Event*/) => {
      logger.info('Peer ICE connection state change: ', peer.iceConnectionState)
      instanceClass.emit(webRTCEvents.connectionStateChange, peer.iceConnectionState)
    }
  }

  peer.onnegotiationneeded = async (/*event: Event*/) => {
    if (!peer.remoteDescription) return
    logger.info('Peer onnegotiationneeded, updating local description')
    const offer = await peer.createOffer()
    logger.info('Peer onnegotiationneeded, got local offer', offer.sdp)
    offer.sdp = SdpParser.updateMissingVideoExtensions(offer.sdp!, peer.remoteDescription.sdp!)
    await peer.setLocalDescription(offer)
    const sdp = SdpParser.renegotiate(offer.sdp!, peer.remoteDescription.sdp!)
    logger.info('Peer onnegotiationneeded, updating remote description', sdp)
    await peer.setRemoteDescription({ type: 'answer', sdp })
    logger.info('Peer onnegotiationneeded, renegotiation done')
  }
}

const addMediaStreamToPeer = (
  peer: RTCPeerConnection,
  mediaStream: MediaStream,
  options: LocalSDPOptions
): void => {
  logger.info('Adding mediaStream tracks to RTCPeerConnection')
  for (const track of mediaStream.getTracks()) {
    const initOptions: RTCRtpTransceiverInit = {
      streams: [mediaStream],
    }

    if (track.kind === 'audio') {
      initOptions.direction = !options.disableAudio ? 'sendonly' : 'inactive'
    }

    if (track.kind === 'video') {
      initOptions.direction = !options.disableVideo ? 'sendonly' : 'inactive'

      if (options.scalabilityMode && new UserAgent().isChrome()) {
        logger.debug(`Video track with scalability mode: ${options.scalabilityMode}.`)
        initOptions.sendEncodings = [
          { scalabilityMode: options.scalabilityMode } as RTCRtpEncodingParametersExtended,
        ]
      } else if (options.scalabilityMode) {
        logger.warn('SVC is only supported in Google Chrome')
      }
    }

    peer.addTransceiver(track, initOptions)
    logger.info(`Track '${track.label}' added: `, `id: ${track.id}`, `kind: ${track.kind}`)
  }
}

const addReceiveTransceivers = (peer: RTCPeerConnection, options: LocalSDPOptions): void => {
  const browserData = new UserAgent()
  if (!options.disableVideo) {
    const transceiver = peer.addTransceiver('video', {
      direction: 'recvonly',
    })
    if (browserData.isOpera()) {
      transceiver.setCodecPreferences(
        RTCRtpReceiver.getCapabilities('video')!.codecs.filter(
          codec =>
            // TODO fix and remove any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            codec.mimeType !== 'video/H264' || (codec as any).sdpFmtpLine.includes('profile-level-id=4')
        )
      )
    }
  }
  if (!options.disableAudio) {
    peer.addTransceiver('audio', {
      direction: 'recvonly',
    })
  }
  for (let i = 0; i < (options.multiplexedAudioTracks || 0); i++) {
    peer.addTransceiver('audio', {
      direction: 'recvonly',
    })
  }
}

const getConnectionState = (peer: RTCPeerConnection): RTCPeerConnectionState | RTCIceConnectionState => {
  const connectionState = peer.connectionState ?? peer.iceConnectionState

  // Map ICE connection states to peer connection states
  const iceStateMap: Record<string, RTCPeerConnectionState | RTCIceConnectionState> = {
    checking: 'connecting',
    completed: 'connected',
  }

  return iceStateMap[connectionState] ?? connectionState
}


