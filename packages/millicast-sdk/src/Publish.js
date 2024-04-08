import jwtDecode from 'jwt-decode'
import reemit from 're-emitter'
import { atob } from 'Base64'
import joi from 'joi'
import Logger from './Logger'
import BaseWebRTC from './utils/BaseWebRTC'
import Signaling, { signalingEvents } from './Signaling'
import { VideoCodec } from './utils/Codecs'
import PeerConnection, { webRTCEvents } from './PeerConnection'
import FetchError from './utils/FetchError'

const logger = Logger.get('Publish')

const connectOptions = {
  mediaStream: null,
  bandwidth: 0,
  disableVideo: false,
  disableAudio: false,
  codec: VideoCodec.H264,
  simulcast: false,
  scalabilityMode: null,
  peerConfig: {
    autoInitStats: true
  }
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
 * - A connection path that you can get from {@link Director} module or from your own implementation.
 * @constructor
 * @deprecated streamName is no longer used, use tokenGenerator
 * @param {String} streamName - Deprecated: Millicast existing stream name.
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
   * @param {Boolean} [options.stereo = false] - True to modify SDP for support stereo. Otherwise False.
   * @param {Boolean} [options.dtx = false] - True to modify SDP for supporting dtx in opus. Otherwise False.
   * @param {Boolean} [options.absCaptureTime = false] - True to modify SDP for supporting absolute capture time header extension. Otherwise False.
   * @param {Boolean} [options.dependencyDescriptor = false] - True to modify SDP for supporting aom dependency descriptor header extension. Otherwise False.
   * @param {MediaStream|Array<MediaStreamTrack>} options.mediaStream - MediaStream to offer in a stream. This object must have
   * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
   * @param {Number} [options.bandwidth = 0] - Broadcast bandwidth. 0 for unlimited.
   * @param {Boolean} [options.disableVideo = false] - Disable the opportunity to send video stream.
   * @param {Boolean} [options.disableAudio = false] - Disable the opportunity to send audio stream.
   * @param {VideoCodec} [options.codec = 'h264'] - Codec for publish stream.
   * @param {Boolean} [options.simulcast = false] - Enable simulcast. **Only available in Chromium based browsers and with H.264 or VP8 video codecs.**
   * @param {String} [options.scalabilityMode = null] - Selected scalability mode. You can get the available capabilities using <a href="PeerConnection#.getCapabilities">PeerConnection.getCapabilities</a> method.
   * **Only available in Google Chrome.**
   * @param {RTCConfiguration} [options.peerConfig = null] - Options to configure the new RTCPeerConnection.
   * @param {Boolean} [options.record = false ] - Enable stream recording. If record is not provided, use default Token configuration. **Only available in Tokens with recording enabled.**
   * @param {Array<String>} [options.events = null] - Specify which events will be delivered by the server (any of "active" | "inactive" | "viewercount").*
   * @param {Number} [options.priority = null] - When multiple ingest streams are provided by the customer, add the ability to specify a priority between all ingest streams. Decimal integer between the range [-2^31, +2^31 - 1]. For more information, visit [our documentation](https://docs.dolby.io/streaming-apis/docs/backup-publishing).
   * @returns {Promise<void>} Promise object which resolves when the broadcast started successfully.
   * @fires PeerConnection#connectionStateChange
   * @fires Signaling#broadcastEvent
   * @example await publish.connect(options)
   * @example
   * import Publish from '@millicast/sdk'
   *
   * //Define callback for generate new token
   * const tokenGenerator = () => getYourPublisherConnection(token, streamName)
   *
   * //Create a new instance
   * // streamName is not necessary in the constructor anymore, could be null or undefined
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
    const schema = joi.object({
      sourceId: joi.string(),
      stereo: joi.boolean(),
      dtx: joi.boolean(),
      absCaptureTime: joi.boolean(),
      dependencyDescriptor: joi.boolean(),
      mediaStream: joi
        .alternatives()
        .try(
          joi.array().items(joi.object()),
          joi.object()
        ),
      bandwidth: joi.number(),
      disableVideo: joi.boolean(),
      disableAudio: joi.boolean(),
      codec: joi.string().valid(...Object.values(VideoCodec)),
      simulcast: joi.boolean(),
      scalabilityMode: joi.string(),
      peerConfig: joi.object(),
      record: joi.boolean(),
      events: joi.array().items(joi.string().valid('active', 'inactive', 'viewercount')),
      priority: joi.number()
    })
    const { error, value } = schema.validate(options)
    if (error) logger.warn(error, value)
    this.options = { ...connectOptions, ...options, peerConfig: { ...connectOptions.peerConfig, ...options.peerConfig }, setSDPToPeer: false }
    await this.initConnection({ migrate: false })
  }

  async reconnect (data) {
    this.options.mediaStream = this.webRTCPeer?.getTracks() ?? this.options.mediaStream
    super.reconnect(data)
  }

  async replaceConnection () {
    logger.info('Migrating current connection')
    this.options.mediaStream = this.webRTCPeer?.getTracks() ?? this.options.mediaStream
    await this.initConnection({ migrate: true })
  }

  /**
 * Initialize recording in an active stream and change the current record option.
 */
  async record () {
    if (this.recordingAvailable) {
      this.options.record = true
      await this.signaling?.cmd('record')
      logger.info('Broadcaster start recording')
    } else {
      logger.error('Record not available')
    }
  }

  /**
   * Finalize recording in an active stream and change the current record option.
   */
  async unrecord () {
    if (this.recordingAvailable) {
      this.options.record = false
      await this.signaling?.cmd('unrecord')
      logger.info('Broadcaster stop recording')
    } else {
      logger.error('Unrecord not available')
    }
  }

  async initConnection (data) {
    logger.debug('Broadcast option values: ', this.options)
    this.stopReconnection = false
    let promises
    if (!this.options.mediaStream) {
      logger.error('Error while broadcasting. MediaStream required')
      throw new Error('MediaStream required')
    }
    if (!data.migrate && this.isActive()) {
      logger.warn('Broadcast currently working')
      throw new Error('Broadcast currently working')
    }
    let publisherData
    try {
      publisherData = await this.tokenGenerator()
      //  Set the iceServers from the publish data into the peerConfig
      this.options.peerConfig.iceServers = publisherData?.iceServers
    } catch (error) {
      logger.error('Error generating token.')
      if (error instanceof FetchError) {
        if (error.status === 401 || !this.autoReconnect) {
          // should not reconnect
          this.stopReconnection = true
        } else {
          // should reconnect with exponential back off if autoReconnect is true
          this.reconnect()
        }
      }
      throw error
    }
    if (!publisherData) {
      logger.error('Error while broadcasting. Publisher data required')
      throw new Error('Publisher data required')
    }
    const decodedJWT = jwtDecode(publisherData.jwt)
    this.streamName = decodedJWT.millicast.streamName
    this.recordingAvailable = decodedJWT[atob('bWlsbGljYXN0')].record
    if (this.options.record && !this.recordingAvailable) {
      logger.error('Error while broadcasting. Record option detected but recording is not available')
      throw new Error('Record option detected but recording is not available')
    }

    const signalingInstance = new Signaling({
      streamName: this.streamName,
      url: `${publisherData.urls[0]}?token=${publisherData.jwt}`
    })
    const webRTCPeerInstance = data.migrate ? new PeerConnection() : this.webRTCPeer

    await webRTCPeerInstance.createRTCPeer(this.options.peerConfig)
    // Stop emiting events from the previous instances
    this.stopReemitingWebRTCPeerInstanceEvents?.()
    this.stopReemitingSignalingInstanceEvents?.()
    // And start emitting from the new ones
    this.stopReemitingWebRTCPeerInstanceEvents = reemit(webRTCPeerInstance, this, [webRTCEvents.connectionStateChange])
    this.stopReemitingSignalingInstanceEvents = reemit(signalingInstance, this, [signalingEvents.broadcastEvent])

    const getLocalSDPPromise = webRTCPeerInstance.getRTCLocalSDP(this.options)
    const signalingConnectPromise = signalingInstance.connect()
    promises = await Promise.all([getLocalSDPPromise, signalingConnectPromise])
    const localSdp = promises[0]

    let oldSignaling = this.signaling
    this.signaling = signalingInstance

    const publishPromise = this.signaling.publish(localSdp, this.options)
    const setLocalDescriptionPromise = webRTCPeerInstance.peer.setLocalDescription(webRTCPeerInstance.sessionDescription)
    promises = await Promise.all([publishPromise, setLocalDescriptionPromise])
    let remoteSdp = promises[0]

    if (!this.options.disableVideo && this.options.bandwidth > 0) {
      remoteSdp = webRTCPeerInstance.updateBandwidthRestriction(remoteSdp, this.options.bandwidth)
    }

    await webRTCPeerInstance.setRTCRemoteSDP(remoteSdp)

    logger.info('Broadcasting to streamName: ', this.streamName)

    let oldWebRTCPeer = this.webRTCPeer
    this.webRTCPeer = webRTCPeerInstance
    this.setReconnect()

    if (data.migrate) {
      this.webRTCPeer.on(webRTCEvents.connectionStateChange, (state) => {
        if (['connected', 'disconnected', 'failed', 'closed'].includes(state)) {
          oldSignaling?.close?.()
          oldWebRTCPeer?.closeRTCPeer?.()
          oldSignaling = oldWebRTCPeer = null
        }
      })
    }
  }
};
