import EventEmitter from 'events'
import reemit from 're-emitter'
import MillicastLogger from './MillicastLogger'
import MillicastSignaling, { MillicastVideoCodec, signalingEvents } from './MillicastSignaling'
import MillicastWebRTC, { webRTCEvents } from './MillicastWebRTC.js'
const logger = MillicastLogger.get('MillicastPublish')
const maxReconnectionInterval = 32000

/**
 * Callback invoke when a new token for broadcast is needed.
 *
 * @callback publishTokenGeneratorCallback
 * @returns {Promise<MillicastDirectorResponse>} Prmoise object which represents the result of getting the publishing connection path.
 *
 * You can use your own token generator or use the <a href='MillicastDirector#.getPublisher'>getPublisher method</a>.
 */

/**
 * @class MillicastPublish
 * @extends EventEmitter
 * @classdesc Manages connection with a secure WebSocket path to signal the Millicast server
 * and establishes a WebRTC connection to broadcast a MediaStream.
 *
 * Before you can broadcast, you will need:
 *
 * - [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API) which has at most one audio track and at most one video track. This will be used for stream the contained tracks.
 *
 * - A connection path that you can get from {@link MillicastDirector} module or from your own implementation based on [Get a Connection Path](https://dash.millicast.com/docs.html?pg=how-to-broadcast-in-js#get-connection-paths-sect).
 * @constructor
 * @param {String} streamName - Millicast existing stream name.
 * @param {publishTokenGeneratorCallback} tokenGenerator - Callback function executed when a new token for broadcast is needed.
 * @param {Boolean} autoReconnect - Enable auto reconnect to stream.
 */
export default class MillicastPublish extends EventEmitter {
  constructor (streamName, tokenGenerator, autoReconnect = true) {
    super()
    if (!streamName) {
      logger.error('Stream Name is required to construct a publisher.')
      throw new Error('Stream Name is required to construct a publisher.')
    }
    if (!tokenGenerator) {
      logger.error('Token generator is required to construct a publisher.')
      throw new Error('Token generator is required to construct a publisher.')
    }
    this.webRTCPeer = new MillicastWebRTC()
    this.millicastSignaling = null
    this.streamName = streamName
    this.codec = MillicastVideoCodec.H264
    this.autoReconnect = autoReconnect
    this.reconnectionInterval = 1000
    this.alreadyDisconnected = false
    this.firstReconnection = true
    this.tokenGenerator = tokenGenerator
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
   * @param {MillicastVideoCodec} options.codec - Codec for publish stream.
   * @param {Boolean} options.simulcast - Enable simulcast.
   * @param {String} options.scalabilityMode - Selected scalability mode. You can get the available capabilities using <a href="MillicastWebRTC#.getCapabilities">MillicastWebRTC.getCapabilities</a> method.
   * @returns {Promise<void>} Promise object which resolves when the broadcast started successfully.
   * @fires MillicastWebRTC#connectionStateChange
   * @example await millicastPublish.broadcast(options)
   * @example
   * import MillicastPublish from 'millicast-sdk-js'
   *
   * //Create a new instance
   * const streamName = "My Millicast Stream Name"
   * const millicastPublish = new MillicastPublish(streamName)
   *
   * //Get MediaStream
   * const mediaStream = getYourMediaStream()
   *
   * //Get Millicast Publisher data
   * const publisherData = getYourPublisherInformation(streamName, token)
   *
   * //Options
   * const broadcastOptions = {
   *    publisherData: publisherData,
   *    mediaStream: mediaStream
   *  }
   *
   * //Start broadcast
   * try {
   *  await millicastPublish.broadcast(broadcastOptions)
   * } catch (e) {
   *  console.log('Connection failed, handle error', e)
   * }
   */
  async broadcast (
    options = {
      mediaStream: null,
      bandwidth: 0,
      disableVideo: false,
      disableAudio: false,
      codec: MillicastVideoCodec.H264,
      simulcast: false,
      scalabilityMode: null
    }
  ) {
    logger.debug('Broadcast option values: ', options)
    if (!options.mediaStream) {
      logger.error('Error while broadcasting. MediaStream required')
      throw new Error('MediaStream required')
    }
    if (this.isActive()) {
      logger.warn('Broadcast currently working')
      throw new Error('Broadcast currently working')
    }
    const publisherData = await this.tokenGenerator()
    if (!publisherData) {
      logger.error('Error while broadcasting. Publisher data required')
      throw new Error('Publisher data required')
    }

    this.millicastSignaling = new MillicastSignaling({
      streamName: this.streamName,
      url: `${publisherData.urls[0]}?token=${publisherData.jwt}`
    })

    await this.webRTCPeer.getRTCPeer()
    reemit(this.webRTCPeer, this, [webRTCEvents.connectionStateChange])

    this.webRTCPeer.RTCOfferOptions = {
      offerToReceiveVideo: !options.disableVideo,
      offerToReceiveAudio: !options.disableAudio
    }
    this.codec = options.codec
    const localSdp = await this.webRTCPeer.getRTCLocalSDP({ mediaStream: options.mediaStream, simulcast: options.simulcast, codec: options.codec, scalabilityMode: options.scalabilityMode })
    let remoteSdp = await this.millicastSignaling.publish(localSdp, options.codec)

    if (!options.disableVideo && options.bandwidth > 0) {
      remoteSdp = this.webRTCPeer.updateBandwidthRestriction(remoteSdp, options.bandwidth)
    }

    await this.webRTCPeer.setRTCRemoteSDP(remoteSdp)

    this.setReconnect()
    logger.info('Broadcasting to streamName: ', this.streamName)
  }

  /**
   * Stops active broadcast.
   * @example millicastPublish.stop();
   */
  stop () {
    logger.info('Stopping broadcast')
    this.webRTCPeer.closeRTCPeer()
    this.millicastSignaling?.close()
    this.millicastSignaling = null
  }

  /**
   * Get if the current broadcast is active.
   * @example const isActive = millicastPublish.isActive();
   * @returns {Boolean} - True if connected, false if not.
   */
  isActive () {
    const rtcPeerState = this.webRTCPeer.getRTCPeerStatus()
    logger.info('Broadcast status: ', rtcPeerState || 'not_established')
    return rtcPeerState === 'connected'
  }

  setReconnect () {
    if (this.autoReconnect) {
      this.millicastSignaling.on(signalingEvents.connectionError, () => {
        if (this.firstReconnection || !this.alreadyDisconnected) {
          this.firstReconnection = false
          this.reconnect()
        }
      })

      this.webRTCPeer.on(webRTCEvents.connectionStateChange, (state) => {
        if ((state === 'failed' || (state === 'disconnected' && this.alreadyDisconnected)) && this.firstReconnection) {
          this.firstReconnection = false
          this.reconnect()
        } else if (state === 'disconnected') {
          this.alreadyDisconnected = true
          window.setTimeout(() => this.setReconnect(), 1500)
        } else {
          this.alreadyDisconnected = false
        }
      })
    }
  }

  reconnect () {
    setTimeout(async () => {
      try {
        if (!this.isActive()) {
          const reconnectPublisherData = await this.tokenGenerator()
          this.webRTCPeer.peer?.restartIce()
          this.millicastSignaling.wsUrl = `${reconnectPublisherData.urls[0]}?token=${reconnectPublisherData.jwt}`
          const sessionDescription = await this.webRTCPeer.peer.createOffer()
          await this.webRTCPeer.peer.setLocalDescription(sessionDescription)
          const remoteSdp = await this.millicastSignaling.publish(sessionDescription.sdp, this.codec)
          await this.webRTCPeer.setRTCRemoteSDP(remoteSdp)
          this.alreadyDisconnected = false
          this.reconnectionInterval = 1000
          this.firstReconnection = true
        }
      } catch (error) {
        this.reconnectionInterval = this.reconnectionInterval < maxReconnectionInterval ? this.reconnectionInterval * 2 : this.reconnectionInterval
        logger.error(`Reconnection failed, retrying in ${this.reconnectionInterval}ms. Error was: `, error)
        this.reconnect()
      }
    }, this.reconnectionInterval)
  }
}
