import EventEmitter from 'events'
import reemit from 're-emitter'
import MillicastLogger from './MillicastLogger'
import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC, { webRTCEvents } from './MillicastWebRTC.js'

const logger = MillicastLogger.get('MillicastPublish')

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
 */

export default class MillicastPublish extends EventEmitter {
  constructor (streamName) {
    super()
    if (!streamName) {
      logger.error('Stream Name is required to construct a publisher.')
      throw new Error('Stream Name is required to construct a publisher.')
    }
    this.webRTCPeer = new MillicastWebRTC()
    this.millicastSignaling = null
    this.streamName = streamName
  }

  /**
   * Starts broadcast to an existing stream name.
   *
   * In the example, `getYourMediaStream` and `getYourPublisherConnection` is your own implementation.
   * @param {Object} options - General broadcast options.
   * @param {MillicastDirectorResponse} options.publisherData - Millicast publisher connection path.
   * @param {MediaStream|Array<MediaStreamTrack>} options.mediaStream - MediaStream to offer in a stream. This object must have
   * 1 audio track and 1 video track, or at least one of them. Alternative you can provide both tracks in an array.
   * @param {Number} [options.bandwidth = 0] - Broadcast bandwidth. 0 for unlimited.
   * @param {Boolean} [options.disableVideo = false] - Disable the opportunity to send video stream.
   * @param {Boolean} [options.disableAudio = false] - Disable the opportunity to send audio stream.
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
      publisherData: null,
      mediaStream: null,
      bandwidth: 0,
      disableVideo: false,
      disableAudio: false
    }
  ) {
    logger.debug('Broadcast option values: ', options)
    if (!options.publisherData) {
      logger.error('Error while broadcasting. Publisher data required')
      throw new Error('Publisher data required')
    }
    if (!options.mediaStream) {
      logger.error('Error while broadcasting. MediaStream required')
      throw new Error('MediaStream required')
    }
    if (this.isActive()) {
      logger.warn('Broadcast currently working')
      throw new Error('Broadcast currently working')
    }

    this.millicastSignaling = new MillicastSignaling({
      streamName: this.streamName,
      url: `${options.publisherData.urls[0]}?token=${options.publisherData.jwt}`
    })

    await this.webRTCPeer.getRTCPeer()
    reemit(this.webRTCPeer, this, [webRTCEvents.connectionStateChange])

    this.webRTCPeer.RTCOfferOptions = {
      offerToReceiveVideo: !options.disableVideo,
      offerToReceiveAudio: !options.disableAudio
    }
    const localSdp = await this.webRTCPeer.getRTCLocalSDP({ mediaStream: options.mediaStream })
    let remoteSdp = await this.millicastSignaling.publish(localSdp)
    if (remoteSdp?.indexOf('\na=extmap-allow-mixed') !== -1) {
      logger.debug('SDP before trimming: ', remoteSdp)
      remoteSdp = remoteSdp
        .split('\n')
        .filter(function (line) {
          return line.trim() !== 'a=extmap-allow-mixed'
        })
        .join('\n')
      logger.debug('SDP trimmed result: ', remoteSdp)
    }
    if (!options.disableVideo && options.bandwidth > 0) {
      remoteSdp = this.webRTCPeer.updateBandwidthRestriction(remoteSdp, options.bandwidth)
    }

    await this.webRTCPeer.setRTCRemoteSDP(remoteSdp)
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
}
