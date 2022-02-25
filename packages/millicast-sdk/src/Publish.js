import jwtDecode from 'jwt-decode'
import reemit from 're-emitter'
import { atob } from 'Base64'
import Logger from './Logger'
import BaseWebRTC from './utils/BaseWebRTC'
import Signaling, { signalingEvents, VideoCodec } from './Signaling'
import PeerConnection, { webRTCEvents } from './PeerConnection'
const logger = Logger.get('Publish')

const connectOptions = {
  mediaStream: null,
  bandwidth: 0,
  disableVideo: false,
  disableAudio: false,
  codec: VideoCodec.H264,
  simulcast: false,
  scalabilityMode: null,
  peerConfig: null
}

/**
 * @class Publish
 * @extends BaseWebRTC
 * @classdesc Manages connection with a secure WebSocket path to signal the Millicast server
 * and establishes a WebRTC connection to broadcast a MediaStream.
 *
 * Before you can broadcast, you will need:
 *
 * - [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API) which has at most one audio track and at most one video track. This will be used for stream the contained tracks.
 *
 * - A connection path that you can get from {@link Director} module or from your own implementation based on [Get a Connection Path](https://dash.millicast.com/docs.html?pg=how-to-broadcast-in-js#get-connection-paths-sect).
 * @constructor
 * @param {String} streamName - Millicast existing stream name.
 * @param {tokenGeneratorCallback} tokenGenerator - Callback function executed when a new token is needed.
 * @param {Boolean} [autoReconnect=true] - Enable auto reconnect to stream.
 */
export default class Publish extends BaseWebRTC {
  constructor (streamName, tokenGenerator, autoReconnect = true) {
    super(streamName, tokenGenerator, logger, autoReconnect)
  }

  /**
   * Starts broadcast to an existing stream name.
   *
   * In the example, `getYourMediaStream` and `getYourPublisherConnection` is your own implementation.
   * @param {Object} options - General broadcast options.
   * @param {String} options.sourceId - Source unique id. Only avialable if stream is multisource.
   * @param {Boolean} options.stereo - True to modify SDP for support stereo. Otherwise False.
   * @param {Boolean} options.dtx - True to modify SDP for supporting dtx in opus. Otherwise False.
   * @param {Boolean} options.absCaptureTime - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
   * @param {Boolean} options.dependencyDescriptor - True to modify SDP for supporting aom dependency descriptor header extension. Otherwise False.
   * @param {MediaStream|Array<MediaStreamTrack>} options.mediaStream - MediaStream to offer in a stream. This object must have
   * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
   * @param {Number} [options.bandwidth = 0] - Broadcast bandwidth. 0 for unlimited.
   * @param {Boolean} [options.disableVideo = false] - Disable the opportunity to send video stream.
   * @param {Boolean} [options.disableAudio = false] - Disable the opportunity to send audio stream.
   * @param {VideoCodec} options.codec - Codec for publish stream.
   * @param {Boolean} options.simulcast - Enable simulcast. **Only available in Google Chrome and with H.264 or VP8 video codecs.**
   * @param {String} options.scalabilityMode - Selected scalability mode. You can get the available capabilities using <a href="PeerConnection#.getCapabilities">PeerConnection.getCapabilities</a> method.
   * **Only available in Google Chrome.**
   * @param {RTCConfiguration} options.peerConfig - Options to configure the new RTCPeerConnection.
   * @param {Boolean} [options.record] - Enable stream recording. If record is not provided, use default Token configuration. **Only available in Tokens with recording enabled.**
   * @param {Array<String>} [options.events] - Specify which events will be delivered by the server (any of "active" | "inactive").*
   * @returns {Promise<void>} Promise object which resolves when the broadcast started successfully.
   * @fires PeerConnection#connectionStateChange
   * @fires Signaling#broadcastEvent
   * @example await publish.connect(options)
   * @example
   * import Publish from '@millicast/sdk'
   *
   * //Define callback for generate new token
   * const tokenGenerator = () => getYourPublisherInformation(token, streamName)
   *
   * //Create a new instance
   * const streamName = "My Millicast Stream Name"
   * const millicastPublish = new Publish(streamName, tokenGenerator)
   *
   * //Get MediaStream
   * const mediaStream = getYourMediaStream()
   *
   * //Options
   * const broadcastOptions = {
   *    mediaStream: mediaStream
   *  }
   *
   * //Start broadcast
   * try {
   *  await millicastPublish.connect(broadcastOptions)
   * } catch (e) {
   *  console.log('Connection failed, handle error', e)
   * }
   */
  async connect (options = connectOptions) {
    this.options = { ...connectOptions, ...options, setSDPToPeer: false }
    await initConnection({ migrate: false, instance: this })
  }

  reconnect () {
    this.options.mediaStream = this.webRTCPeer?.getTracks() ?? this.options.mediaStream
    super.reconnect()
  }

  async replaceConnection () {
    logger.info('Migrating current connection')
    this.options.mediaStream = this.webRTCPeer?.getTracks() ?? this.options.mediaStream
    await initConnection({ migrate: true, instance: this })
  }

  /**
 * Initialize recording in an active stream.
 */
  async record () {
    if (this.recordingAvailable) {
      await this.signaling.cmd('record')
      logger.info('Broadcaster start recording')
    } else {
      logger.error('Record not available')
    }
  }

  /**
   * Finalize recording in an active stream.
   */
  async unrecord () {
    if (this.recordingAvailable) {
      await this.signaling.cmd('unrecord')
      logger.info('Broadcaster stop recording')
    } else {
      logger.error('Unrecord not available')
    }
  }
}

const initConnection = async (data) => {
  logger.debug('Broadcast option values: ', data.instance.options)
  let promises
  if (!data.instance.options.mediaStream) {
    logger.error('Error while broadcasting. MediaStream required')
    throw new Error('MediaStream required')
  }
  if (!data.migrate && data.instance.isActive()) {
    logger.warn('Broadcast currently working')
    throw new Error('Broadcast currently working')
  }
  let publisherData
  try {
    publisherData = await data.instance.tokenGenerator()
  } catch (error) {
    logger.error('Error generating token.')
    throw error
  }
  if (!publisherData) {
    logger.error('Error while broadcasting. Publisher data required')
    throw new Error('Publisher data required')
  }
  const recordingAvailable = jwtDecode(publisherData.jwt)[atob('bWlsbGljYXN0')].record
  if (data.instance.options.record && !recordingAvailable) {
    logger.error('Error while broadcasting. Record option detected but recording is not available')
    throw new Error('Record option detected but recording is not available')
  }

  const signalingInstance = new Signaling({
    streamName: data.instance.streamName,
    url: `${publisherData.urls[0]}?token=${publisherData.jwt}`
  })
  const webRTCPeerInstance = data.migrate ? new PeerConnection() : data.instance.webRTCPeer

  await webRTCPeerInstance.createRTCPeer(data.instance.options.peerConfig)
  reemit(webRTCPeerInstance, data.instance, [webRTCEvents.connectionStateChange])
  reemit(signalingInstance, data.instance, [signalingEvents.broadcastEvent])

  const getLocalSDPPromise = webRTCPeerInstance.getRTCLocalSDP(data.instance.options)
  const signalingConnectPromise = signalingInstance.connect()
  promises = await Promise.all([getLocalSDPPromise, signalingConnectPromise])
  const localSdp = promises[0]

  const publishPromise = signalingInstance.publish(localSdp, data.instance.options)
  const setLocalDescriptionPromise = webRTCPeerInstance.peer.setLocalDescription(webRTCPeerInstance.sessionDescription)
  promises = await Promise.all([publishPromise, setLocalDescriptionPromise])
  let remoteSdp = promises[0]

  if (!data.instance.options.disableVideo && data.instance.options.bandwidth > 0) {
    remoteSdp = webRTCPeerInstance.updateBandwidthRestriction(remoteSdp, data.instance.options.bandwidth)
  }

  await webRTCPeerInstance.setRTCRemoteSDP(remoteSdp)

  logger.info('Broadcasting to streamName: ', data.instance.streamName)

  const oldSignaling = data.instance.signaling
  const oldWebRTCPeer = data.instance.webRTCPeer
  data.instance.signaling = signalingInstance
  data.instance.webRTCPeer = webRTCPeerInstance
  data.instance.setReconnect()

  if (data.migrate) {
    data.instance.webRTCPeer.on(webRTCEvents.connectionStateChange, (state) => {
      if (state === 'connected') {
        oldSignaling?.close?.()
        oldWebRTCPeer?.closeRTCPeer?.()
        logger.info('Current connection migrated')
      }
    })
  }
}
