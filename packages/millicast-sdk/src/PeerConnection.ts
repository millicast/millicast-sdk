import { EventEmitter } from 'events'
import reemit from 're-emitter'
import PeerConnectionStats, { peerConnectionStatsEvents } from './PeerConnectionStats'
import UserAgent from './utils/UserAgent'
import Logger from './Logger'
import { VideoCodec, AudioCodec } from './types/Codecs.types'
import {ConnectionType, type ConnectionTypeValue, webRTCEvents} from './types/PeerConnection.types'
import BitrateManager from './utils/BitrateManager'
import SdpParser from './utils/SdpParser'

const logger = Logger.get('PeerConnection')
const userAgent = new UserAgent()

interface RTCRtpEncodingParametersExtended extends RTCRtpEncodingParameters {
  scalabilityMode?: string
}
type RTCRtpCodecCapability = RTCRtpCapabilities['codecs'][number]

interface RTCRtpCodecCapabilityExtended extends RTCRtpCodecCapability {
  scalabilityModes?: string[]
  sdpFmtpLine?: string
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
  sessionDescription: RTCSessionDescriptionInit | undefined
  peer: RTCPeerConnection | null
  peerConnectionStats: PeerConnectionStats | undefined
  transceiverMap: Map<RTCRtpTransceiver, (value: RTCRtpTransceiver) => void>
  options: LocalSDPOptions
  bitrateManager: BitrateManager | null
  
  constructor () {
    super()
    this.mode = null
    this.sessionDescription = undefined
    this.peer = null
    this.peerConnectionStats = undefined
    this.transceiverMap = new Map()
    this.options = {}
    this.bitrateManager = null
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
    this.options = options
    logger.debug('Options: ', options)

    const mediaStream = getValidMediaStream(options.mediaStream)
    if (mediaStream) {
      await addMediaStreamToPeer(this.peer!, mediaStream, options)
    } else {
      addReceiveTransceivers(this.peer!, options)
    }

    logger.info('Creating peer offer')
    const response = await this.peer!.createOffer()

    logger.info('Peer offer created')
    logger.debug('Peer offer response: ', response.sdp)

    this.sessionDescription = response

    // Apply Opus codec parameters via SDP munging (after createOffer, before setLocalDescription).
    // This is required because no browser API supports modifying Opus fmtp parameters at runtime.
    // See: https://issues.webrtc.org/issues/443612840
    if (!options.disableAudio && this.sessionDescription.sdp) {
      if (options.stereo) {
        this.sessionDescription.sdp = SdpParser.setStereo(this.sessionDescription.sdp)
        logger.info('Applied stereo to SDP via munging')
      }
      if (options.dtx) {
        this.sessionDescription.sdp = SdpParser.setDTX(this.sessionDescription.sdp)
        logger.info('Applied DTX to SDP via munging')
      }
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

  async updateBandwidthRestriction (bitrate: number): Promise<void> {
    if (this.mode === ConnectionType.Viewer) {
      logger.error('Viewer attempting to update bitrate, this is not allowed')
      throw new Error('It is not possible for a viewer to update the bitrate.')
    }

    logger.info('Updating bandwidth restriction, bitrate value: ', bitrate)

    if (!this.bitrateManager && this.peer) {
      this.bitrateManager = new BitrateManager(this.peer)
    }

    // Use the new bitrate manager instead of SDP munging
    await this.bitrateManager!.updateVideoBitrate(bitrate)
  }

  async updateBitrate (bitrate = 0): Promise<void> {
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
    await this.updateBandwidthRestriction(bitrate)
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
  const browserCapabilities = RTCRtpSender.getCapabilities(kind)

  if (browserCapabilities) {
    const codecs: Record<string, Partial<MillicastCodec>> = {}
    let regex = new RegExp(`^video/(${Object.values(VideoCodec).join('|')})x?$`, 'i')

    if (kind === 'audio') {
      regex = new RegExp(`^audio/(${Object.values(AudioCodec).join('|')})$`, 'i')

      if (userAgent.isChrome()) {
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

        // Cast to extended type to access scalabilityModes
        const extendedCodec = codec as RTCRtpCodecCapabilityExtended
        if (extendedCodec.scalabilityModes) {
          let modes = (codecs[codecName].scalabilityModes as string[]) || []
          modes = [...modes, ...extendedCodec.scalabilityModes]
          codecs[codecName].scalabilityModes = [...new Set(modes)]
        }
        if (codec.channels) {
          codecs[codecName].channels = codec.channels
        }
      }
    }

    // Create a properly typed result
    const result: RTCRtpCapabilities = {
      ...browserCapabilities,
      codecs: Object.keys(codecs).map((key) => {
        return { codec: key, ...codecs[key] } as MillicastCodec
      }) as unknown as RTCRtpCodecCapability[]
    }

    return result
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
    this.peerConnectionStats = undefined
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
    syncVideoExtensions(peer)
    const offer = await peer.createOffer()
    logger.info('Peer onnegotiationneeded, got local offer', offer.sdp)
    await peer.setLocalDescription(offer)
    const sdp = renegotiateRemoteSdp(offer.sdp!, peer.remoteDescription.sdp!)
    logger.info('Peer onnegotiationneeded, updating remote description', sdp)
    await peer.setRemoteDescription({ type: 'answer', sdp })
    logger.info('Peer onnegotiationneeded, renegotiation done')
  }
}

function syncVideoExtensions (peer: RTCPeerConnection): void {
  const transceivers = peer.getTransceivers()
  const videoTransceivers = transceivers.filter(
    t => t.sender?.track?.kind === 'video' || t.receiver?.track?.kind === 'video'
  )

  if (videoTransceivers.length < 2) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refTx = videoTransceivers[0] as any
  if (typeof refTx.getHeaderExtensionsToNegotiate !== 'function') return

  const referenceExtensions = refTx.getHeaderExtensionsToNegotiate()

  for (let i = 1; i < videoTransceivers.length; i++) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = videoTransceivers[i] as any
      if (typeof tx.setHeaderExtensionsToNegotiate === 'function') {
        tx.setHeaderExtensionsToNegotiate(referenceExtensions)
      }
    } catch (error) {
      logger.warn(`Failed to sync video extensions for transceiver ${videoTransceivers[i].mid}:`, error)
    }
  }
}

function renegotiateRemoteSdp (localOffer: string, remoteAnswer: string): string {
  const splitSdp = (sdp: string) => {
    const idx = sdp.indexOf('\r\nm=')
    if (idx === -1) return { session: sdp, sections: [] as string[] }
    const session = sdp.substring(0, idx + 2)
    const rest = sdp.substring(idx + 2)
    return { session, sections: rest.split(/(?=m=)/).filter(s => s.length > 0) }
  }

  const getMid = (s: string) => s.match(/a=mid:(\S+)/)?.[1] ?? null
  const getType = (s: string) => s.match(/^m=(\w+)/)?.[1] ?? null
  const getDir = (s: string) => {
    if (s.includes('a=sendonly')) return 'sendonly'
    if (s.includes('a=recvonly')) return 'recvonly'
    if (s.includes('a=inactive')) return 'inactive'
    return 'sendrecv'
  }
  const reverseDir = (d: string) => {
    if (d === 'sendonly') return 'recvonly'
    if (d === 'recvonly') return 'sendonly'
    return d
  }

  const offer = splitSdp(localOffer)
  const answer = splitSdp(remoteAnswer)

  const answerByMid = new Map<string, string>()
  const templateByType = new Map<string, string>()
  for (const section of answer.sections) {
    const mid = getMid(section)
    if (mid) answerByMid.set(mid, section)
    const type = getType(section)
    if (type && !templateByType.has(type)) templateByType.set(type, section)
  }

  const result: string[] = []
  for (const offerSection of offer.sections) {
    const mid = getMid(offerSection)
    if (!mid) continue

    if (answerByMid.has(mid)) {
      result.push(answerByMid.get(mid)!)
    } else {
      const type = getType(offerSection)
      const template = type ? templateByType.get(type) : null
      if (template) {
        const templateDir = getDir(template)
        const answerDir = reverseDir(getDir(offerSection))
        let cloned = template.replace(/a=mid:\S+/, `a=mid:${mid}`)
        if (templateDir !== answerDir) {
          cloned = cloned.replace(`a=${templateDir}`, `a=${answerDir}`)
        }
        result.push(cloned)
      }
    }
  }

  return answer.session + result.join('')
}

const configureRtpExtensions = async (peer: RTCPeerConnection, options: LocalSDPOptions): Promise<void> => {
  const transceivers = peer.getTransceivers()

  for (const transceiver of transceivers) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const txAny = transceiver as any
    if (typeof txAny.getHeaderExtensionsToNegotiate !== 'function') {
      continue
    }

    const existingExtensions = txAny.getHeaderExtensionsToNegotiate()
    const extensionsToNegotiate = [...existingExtensions]

    const isVideo = transceiver.sender.track?.kind === 'video'

    // Add dependency descriptor for video if requested.
    // DD only makes sense with simulcast or SVC (scalabilityMode) — it describes layer dependencies.
    if (options.dependencyDescriptor && isVideo && (options.simulcast || options.scalabilityMode)) {
      const uri = 'https://aomediacodec.github.io/av1-rtp-spec/#dependency-descriptor-rtp-header-extension'
      const existing = extensionsToNegotiate.find((ext: { uri: string }) => ext.uri === uri)
      if (existing) {
        existing.direction = transceiver.direction
      } else {
        extensionsToNegotiate.push({ uri, direction: transceiver.direction })
      }
    }

    // Enable absolute capture time if requested.
    // The extension may already exist with direction 'stopped' — change it to 'sendrecv'.
    if (options.absCaptureTime) {
      const uri = 'http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time'
      const existing = extensionsToNegotiate.find((ext: { uri: string }) => ext.uri === uri)
      if (existing) {
        existing.direction = 'sendrecv'
      } else {
        extensionsToNegotiate.push({ uri, direction: 'sendrecv' })
      }
    }

    if (extensionsToNegotiate.length > 0) {
      try {
        txAny.setHeaderExtensionsToNegotiate(extensionsToNegotiate)
        logger.info(`Successfully configured header extensions for ${transceiver.mid}.`)
      } catch (error) {
        logger.error(`Failed to set header extensions for ${transceiver.mid}:`, error)
      }
    }
  }
}

const addMediaStreamToPeer = async (
  peer: RTCPeerConnection,
  mediaStream: MediaStream,
  options: LocalSDPOptions
): Promise<void> => {
  logger.debug('Adding mediaStream tracks to RTCPeerConnection')

  for (const track of mediaStream.getTracks()) {
    const initOptions: RTCRtpTransceiverInit = {
      streams: [mediaStream],
    }

    if (track.kind === 'audio') {
      initOptions.direction = !options.disableAudio ? 'sendonly' : 'inactive'
    }

    if (track.kind === 'video') {
      initOptions.direction = !options.disableVideo ? 'sendonly' : 'inactive'
      if (options.simulcast && !options.disableVideo) {
        if (userAgent.isChromium()) {
          logger.debug('Enabling simulcast')

          const settings = track.getSettings()
          const width = settings.width || 1280
          const height = settings.height || 720

          initOptions.sendEncodings = getOptimizedSimulcastEncodings(width, height)

          logger.debug(`Simulcast configured for ${width}x${height} with ${initOptions.sendEncodings.length} layers`)
        } else {
          logger.warn('Simulcast not supported in this browser')
        }
      } else if (options.scalabilityMode && userAgent.isChrome()) {
        logger.debug(`Video track with scalability mode: ${options.scalabilityMode}.`)
        initOptions.sendEncodings = [
          { scalabilityMode: options.scalabilityMode } as RTCRtpEncodingParametersExtended,
        ]
      }
    }

    const transceiver = peer.addTransceiver(track, initOptions)
    // Set codec preferences for simulcast if specified
    if (track.kind === 'video' && options.simulcast && options.codec) {
      setCodecPreferences(transceiver, options.codec)
    }
    await configureRtpExtensions(peer, options)
    logger.info(`Track '${track.label}' added: `, `id: ${track.id}`, `kind: ${track.kind}`)
  }
}

const addReceiveTransceivers = (peer: RTCPeerConnection, options: LocalSDPOptions): void => {
  if (!options.disableVideo) {
    const transceiver = peer.addTransceiver('video', {
      direction: 'recvonly',
    })
    if (userAgent.isOpera()) {
      const videoCapabilities = RTCRtpReceiver.getCapabilities('video')
      if (videoCapabilities) {
        transceiver.setCodecPreferences(
          videoCapabilities.codecs.filter(codec => {
            const extendedCodec = codec as RTCRtpCodecCapabilityExtended
            return (
              codec.mimeType !== 'video/H264' ||
              (extendedCodec.sdpFmtpLine?.includes('profile-level-id=4') ?? false)
            )
          })
        )
      }
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


const ResolutionTier = {
  '1080p': (1920*1080),
  '720p' : (1280*720),
  '480p': (640*480),
  'low': (320*240)
}

/**
 * Get optimized simulcast encodings.
 * @param {Number} width - Video width
 * @param {Number} height - Video height
 * @returns {Array} Optimized encoding configurations
 */

const getOptimizedSimulcastEncodings = (width: number, height: number) => {
  // Calculate total pixels to better determine resolution tier
  const totalPixels = width * height

  let resolutionTier

  if (totalPixels >= ResolutionTier['1080p'] * 0.8) {
    // Allow some tolerance
    resolutionTier = '1080p'
  } else if (totalPixels >= ResolutionTier['720p'] * 0.8) {
    resolutionTier = '720p'
  } else if (totalPixels >= ResolutionTier['480p'] * 0.8) {
    resolutionTier = '480p'
  } else {
    resolutionTier = 'low'
  }

  logger.info(`Detected resolution tier: ${resolutionTier} for ${width}x${height} (${totalPixels} pixels)`)

  switch (resolutionTier) {
    case '1080p':
      return [
        {
          rid: 'high',
          maxBitrate: 6000000, // 6 Mbps for 1080p
          scaleResolutionDownBy: 1,
          maxFramerate: 30
        },
        {
          rid: 'medium',
          maxBitrate: 2000000, // 2 Mbps for 720p equivalent
          scaleResolutionDownBy: Math.max(1.5, width / 1280), // Scale to ~720p
          maxFramerate: 30
        },
        {
          rid: 'low',
          maxBitrate: 300000, // 300 Kbps for 360p equivalent
          scaleResolutionDownBy: Math.max(3, width / 640), // Scale to ~360p
          maxFramerate: 15 // Lower framerate for low quality
        }
      ]

    case '720p':
      return [
        {
          rid: 'high',
          maxBitrate: 2000000, // 2 Mbps for 720p
          scaleResolutionDownBy: 1,
          maxFramerate: 30
        },
        {
          rid: 'medium',
          maxBitrate: 1200000, // 1.2 Mbps
          scaleResolutionDownBy: Math.max(1.5, width / 854), // Scale to ~480p
          maxFramerate: 30
        },
        {
          rid: 'low',
          maxBitrate: 300000, // 300 Kbps
          scaleResolutionDownBy: Math.max(2, width / 640), // Scale to ~360p
          maxFramerate: 15
        }
      ]

    case '480p':
      return [
        {
          rid: 'high',
          maxBitrate: 600000, // 600 Kbps for 480p
          scaleResolutionDownBy: 1,
          maxFramerate: 30
        },
        {
          rid: 'low',
          maxBitrate: 300000, // 300 Kbps for 360p
          scaleResolutionDownBy: 1.33,
          maxFramerate: 15
        }
      ]

    default:
      return [
        {
          rid: 'high',
          maxBitrate: 300000, // 300 Kbps
          scaleResolutionDownBy: 1,
          maxFramerate: 15
        }
      ]
  }
}

/**

 * Set codec preferences for a transceiver
 * @param {RTCRtpTransceiver} transceiver - The transceiver to configure
 * @param {String} preferredCodec - Preferred codec ('h264' or 'vp8')
 */
const setCodecPreferences = (transceiver : RTCRtpTransceiver, preferredCodec : string) => {
  try {
    if (!transceiver.setCodecPreferences || !RTCRtpSender.getCapabilities) {
      return
    }

    const capabilities = RTCRtpSender.getCapabilities('video')
    if (!capabilities) return

    const selectedCodec = capabilities.codecs.find((codec) => codec.mimeType.toLowerCase().includes(preferredCodec.toLowerCase()))

    if (selectedCodec) {
      transceiver.setCodecPreferences([selectedCodec])
      logger.info(`Codec preference set to: ${selectedCodec.mimeType}`)
    }
  } catch (e) {
    logger.warn('Failed to set codec preferences:', e)
  }
}


