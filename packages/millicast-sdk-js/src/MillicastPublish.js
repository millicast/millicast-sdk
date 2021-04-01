import Logger from './Logger'
import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from './MillicastWebRTC.js'

const logger = Logger.get('MillicastPublish')

/**
 * @class MillicastPublish
 * @classdesc <p>Manages broadcasts.</p>
 * <p>Before you can broadcast, you will need:
 * <br>
 * - Access to the Millicast Publish API. This will be used by the broadcast method so it can establish the connection. More information here: <a href="https://dash.millicast.com/docs.html?pg=how-to-broadcast-in-js#pub-sub-api-sect">Publish</a>
 * <br>
 * - MediaStream which has the access to the user camera, microphone or screen. This will be used for stream the contained tracks. More information here: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API">MediaStream</a>
 * <br>
 * - Connection path is required for broadcasting. You can use MillicastDirector module or your own implementation.
 * </p>
 */

export default class MillicastPublish {
  constructor () {
    this.webRTCPeer = new MillicastWebRTC()
    this.millicastSignaling = new MillicastSignaling()
  }

  /**
   * Starts broadcast to an existing stream name. In the example, getYourMediaStream and getYourPublisherConnection is your own implementation.
   * @param {Object} options - General broadcast options.
   * @param {MillicastPublisherResponse} options.publisherData - Millicast publisher connection path.
   * @param {String} options.streamName - Millicast existing stream name.
   * @param {MediaStream} options.mediaStream - [MediaStream]{@link https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API} object.
   * @param {Number} [options.bandwith = 0] - Broadcast bandwith. 0 for unlimited.
   * @param {Boolean} [options.disableVideo = false] - Disable the opportunity to send video stream.
   * @param {Boolean} [options.disableAudio = false] - Disable the opportunity to send audio stream.
   * @returns {Promise<void>} Promise object which represents the result of setting the [peer remote description]{@link https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setRemoteDescription}.
   * @example const response = await millicastPublish.broadcast(options);
   * @example
   * import MillicastPublish from 'millicast-sdk-js';
   *
   * //Create a new instance
   * const millicastPublish = new MillicastPublish();
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
   *  };
   *
   * //Start broadcast
   * const response = await millicastPublish.broadcast(broadcastOptions);
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
    logger.info('Broadcasting')
    logger.debug('Broadcast option values: ', options)
    const bandwidth = options.bandwidth
    const disableVideo = options.disableVideo
    const streamName = options.streamName
    if (!streamName) {
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

    const config = await this.webRTCPeer.getRTCConfiguration()
    await this.webRTCPeer.getRTCPeer(config)

    this.webRTCPeer.RTCOfferOptions = {
      offerToReceiveVideo: !options.disableVideo,
      offerToReceiveAudio: !options.disableAudio
    }
    const localSdp = await this.webRTCPeer.getRTCLocalSDP(null, options.mediaStream)

    this.millicastSignaling.wsUrl = `${options.publisherData.wsUrl}?token=${options.publisherData.jwt}`
    this.millicastSignaling.streamName = streamName

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
    if (!disableVideo && bandwidth > 0) {
      remoteSdp = this.webRTCPeer.updateBandwidthRestriction(remoteSdp, bandwidth)
    }

    return this.webRTCPeer.setRTCRemoteSDP(remoteSdp)
  }

  /**
   * Stops active broadcast.
   * @example millicastPublish.stop();
   */

  stop () {
    logger.info('Stopping broadcast')
    this.webRTCPeer.closeRTCPeer()
    this.millicastSignaling.close()
  }

  /**
   * Get if the current broadcast is active.
   * @example const isActive = millicastPublish.isActive();
   * @returns {Boolean} - True if connected, false if not.
   */

  isActive () {
    const rtcPeerState = this.webRTCPeer.getRTCPeerStatus()
    logger.info('Broadcast status: ', rtcPeerState)
    return rtcPeerState === 'connected'
  }
}
