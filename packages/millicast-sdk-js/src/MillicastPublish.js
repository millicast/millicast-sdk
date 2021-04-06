import MillicastLogger from './MillicastLogger'
import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from './MillicastWebRTC.js'

const logger = MillicastLogger.get('MillicastPublish')

/**
 * @class MillicastPublish
 * @classdesc Manages connection with a secure WebSocket path to signal the Millicast server
 * and establishes a WebRTC connection to broadcast a MediaStream.
 *
 * Before you can broadcast, you will need:
 *
 * - [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API) which has at most one audio track and at most one video track. This will be used for stream the contained tracks.
 *
 * - A connection path that you can get from {@link MillicastDirector} module or from your own implementation based on [Get a Connection Path](https://dash.millicast.com/docs.html?pg=how-to-broadcast-in-js#get-connection-paths-sect).
 */

export default class MillicastPublish {
  constructor () {
    this.webRTCPeer = new MillicastWebRTC()
    this.millicastSignaling = null
  }

  /**
   * Starts broadcast to an existing stream name.
   *
   * In the example, `getYourMediaStream` and `getYourPublisherConnection` is your own implementation.
   * @param {Object} options - General broadcast options.
   * @param {MillicastPublisherResponse} options.publisherData - Millicast publisher connection path.
   * @param {String} options.streamName - Millicast existing Stream Name.
   * @param {MediaStream} options.mediaStream - [MediaStream]{@link https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API} object.
   * @param {Number} [options.bandwidth = 0] - Broadcast bandwidth. 0 for unlimited.
   * @param {Boolean} [options.disableVideo = false] - Disable the opportunity to send video stream.
   * @param {Boolean} [options.disableAudio = false] - Disable the opportunity to send audio stream.
   * @returns {Promise<void>} Promise object which resolves when the broadcast started successfully.
   * @example await millicastPublish.broadcast(options)
   * @example
   * import MillicastPublish from 'millicast-sdk-js'
   *
   * //Create a new instance
   * const millicastPublish = new MillicastPublish()
   * const streamName = "My Millicast Stream Name"
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
   *    streamName: streamName,
   *    mediaStream: mediaStream,
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
      streamName: null,
      mediaStream: null,
      bandwidth: 0,
      disableVideo: false,
      disableAudio: false
    }
  ) {
    logger.debug('Broadcast option values: ', options)
    if (!options.streamName) {
      logger.error('Error while broadcasting. Stream name required')
      throw new Error('Streamname required')
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
      streamName: options.streamName,
      url: `${options.publisherData.wsUrl}?token=${options.publisherData.jwt}`
    })

    await this.webRTCPeer.getRTCPeer()

    this.webRTCPeer.RTCOfferOptions = {
      offerToReceiveVideo: !options.disableVideo,
      offerToReceiveAudio: !options.disableAudio
    }
    const localSdp = await this.webRTCPeer.getRTCLocalSDP(null, options.mediaStream)
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
    logger.info('Broadcasting to streamName: ', options.streamName)
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
