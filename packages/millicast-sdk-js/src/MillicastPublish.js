import Logger from './Logger'
import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from './MillicastWebRTC.js'
const logger = Logger.get('MillicastPublish')

/**
 * @class MillicastPublish
 * @classdesc Manages broadcasts.
 * @example const millicastPublish = new MillicastPublish();
 * @constructor
 */

export default class MillicastPublish {
  constructor () {
    this.webRTCPeer = new MillicastWebRTC()
    this.millicastSignaling = new MillicastSignaling()
  }

  /**
   * Starts broadcast
   * @param {Object} options - General broadcast options.
   * @param {Object} options.publisherData - Millicast get publisher response.
   * @param {String} options.streamName - Millicast stream name.
   * @param {MediaStream} options.mediaStream - [MediaStream]{@link https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API} object.
   * @param {Number} [options.bandwith = 0] - Broadcast bandwith. 0 for unlimited.
   * @param {Boolean} [options.disableVideo = false] - Disable peer to let send video.
   * @param {Boolean} [options.disableAudio = false] - Disable peer to let send audio.
   * @returns {Promise} Promise object which represents the result of [setting the peer remote description]{@link https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setRemoteDescription}.
   * @example const response = await millicastPublish.broadcast(options);
   * @example
   * import MillicastPublish from 'millicast-sdk-js';
   *
   * //Create a new instance
   * const millicastPublish = MillicastPublish();
   *
   * //Get Millicast Publisher data
   * const publisherData = //response from Millicast Director API. https://director.millicast.com/api/director/publish
   *
   * //Get MediaStream
   * const mediaStream = //Get MediaStream through MediaStream API.
   *
   * //Options
   * const broadcastOptions = {
   *    publisherData: publisherData,
   *    streamName: "My Millicast Stream Name",
   *    mediaStream: mediaStream,
   *  };
   *
   * //Start broadcast
   * const response = await millicastPublish.broadcast(broadcastOptions);
   *
   * //Stop broadcast
   * millicastPublish.stop();
   */

  broadcast (
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

    return this.webRTCPeer.getRTCConfiguration()
      .then((config) => {
        return this.webRTCPeer.getRTCPeer(config)
      })
      .then((peer) => {
        this.webRTCPeer.RTCOfferOptions = {
          offerToReceiveVideo: !options.disableVideo,
          offerToReceiveAudio: !options.disableAudio
        }
        return this.webRTCPeer.getRTCLocalSDP(null, options.mediaStream)
      })
      .then((localsdp) => {
        this.millicastSignaling.wsUrl = `${options.publisherData.wsUrl}?token=${options.publisherData.jwt}`
        this.millicastSignaling.streamName = streamName
        return this.millicastSignaling.publish(localsdp)
      })
      .then((remotesdp) => {
        if (remotesdp && remotesdp.indexOf('\na=extmap-allow-mixed') !== -1) {
          logger.debug('SDP before trimming: ', remotesdp)
          remotesdp = remotesdp
            .split('\n')
            .filter(function (line) {
              return line.trim() !== 'a=extmap-allow-mixed'
            })
            .join('\n')
          logger.debug('SDP trimmed result: ', remotesdp)
        }
        if (disableVideo === false && bandwidth > 0) {
          remotesdp = this.webRTCPeer.updateBandwidthRestriction(
            remotesdp,
            bandwidth
          )
        }
        return this.webRTCPeer.setRTCRemoteSDP(remotesdp)
      })
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
   * Checks broadcast is active.
   * @example const isActive = millicastPublish.isActive();
   * @returns {Boolean} - True if connected, false if not.
   */

  isActive () {
    const rtcPeerState = this.webRTCPeer.getRTCPeerStatus()
    logger.info('Broadcast status: ', rtcPeerState)
    return rtcPeerState === 'connected'
  }
}
