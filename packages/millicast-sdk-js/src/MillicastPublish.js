import Logger from './Logger'
import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from './MillicastWebRTC.js'

const logger = Logger.get('MillicastPublish')

/**
 * @class MillicastPublish
 * @classdesc It's in charge of the broadcast.
 * @example const MillicastPublish = new MillicastPublish();
 * @constructor
 */

export default class MillicastPublish {
  constructor () {
    this.webRTCPeer = new MillicastWebRTC()
    this.millicastSignaling = new MillicastSignaling()
  }

  /**
   * Starts the broadcast
   * @param {Object} options - general broadcast options.
   * @param {String} options.streamName - the name of the stream.
   * @param {mediaStream} options.mediaStream - the stream from the devices.
   * @param {Number} options.bandwith - the selected bandwith of the broadcast.
   * @param {Boolean} options.disableVideo - the selected status of the selected video device.
   * @param {Boolean} options.disableAudio - the selected status of the selected audio device.
   * @example const response = await MillicastPublish.broadcast(options);
   * @returns - sets the SDP answer from the external peer in your own peer.remoteDescription.
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
   * It stops the broadcast.
   * @example MillicastPublish.stop();
   */

  stop () {
    logger.info('Stopping broadcast')
    this.webRTCPeer.closeRTCPeer()
    this.millicastSignaling.close()
  }

  /**
   * Checks broadcast status.
   * @example const isActive = MillicastPublish.isActive();
   * @returns {Boolean} - true if connected, false if not.
   */

  isActive () {
    const rtcPeerState = this.webRTCPeer.getRTCPeerStatus()
    logger.info('Broadcast status: ', rtcPeerState)
    return rtcPeerState === 'connected'
  }
}
