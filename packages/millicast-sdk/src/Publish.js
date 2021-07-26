import jwtDecode from 'jwt-decode'
import reemit from 're-emitter'
import Logger from './Logger'
import BaseWebRTC from './utils/BaseWebRTC'
import Signaling, { VideoCodec } from './Signaling'
import { webRTCEvents } from './PeerConnection'
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
   * @returns {Promise<void>} Promise object which resolves when the broadcast started successfully.
   * @fires PeerConnection#connectionStateChange
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
    logger.debug('Broadcast option values: ', options)
    this.options = { ...connectOptions, ...options }
    if (!this.options.mediaStream) {
      logger.error('Error while broadcasting. MediaStream required')
      throw new Error('MediaStream required')
    }
    if (this.isActive()) {
      logger.warn('Broadcast currently working')
      throw new Error('Broadcast currently working')
    }
    let publisherData
    try {
      publisherData = await this.tokenGenerator()
    } catch (error) {
      logger.error('Error generating token.')
      throw error
    }
    if (!publisherData) {
      logger.error('Error while broadcasting. Publisher data required')
      throw new Error('Publisher data required')
    }
    const recordingAvailable = jwtDecode(publisherData.jwt).millicast.record
    if (this.options.record && !recordingAvailable) {
      logger.error('Error while broadcasting. Record option detected but recording is not available')
      throw new Error('Record option detected but recording is not available')
    }
    this.signaling = new Signaling({
      streamName: this.streamName,
      url: `${publisherData.urls[0]}?token=${publisherData.jwt}`
    })

    await this.webRTCPeer.createRTCPeer(this.options.peerConfig)
    reemit(this.webRTCPeer, this, [webRTCEvents.connectionStateChange])

    const localSdp = await this.webRTCPeer.getRTCLocalSDP(this.options)
    let remoteSdp = await this.signaling.publish(localSdp, this.options.codec, this.options.record)

    if (!this.options.disableVideo && this.options.bandwidth > 0) {
      remoteSdp = this.webRTCPeer.updateBandwidthRestriction(remoteSdp, this.options.bandwidth)
    }

    await this.webRTCPeer.setRTCRemoteSDP(remoteSdp)

    this.setReconnect()
    logger.info('Broadcasting to streamName: ', this.streamName)
  }

  reconnect () {
    this.options.mediaStream = this.webRTCPeer?.getTracks() ?? this.options.mediaStream
    super.reconnect()
  }
}
