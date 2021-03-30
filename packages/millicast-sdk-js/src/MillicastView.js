import Logger from './Logger'
import EventEmitter from 'events'
import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from './MillicastWebRTC.js'
const logger = Logger.get('MillicastView')

export default class MillicastView extends EventEmitter {
  constructor () {
    super()
    this.webRTCPeer = new MillicastWebRTC()
    this.millicastSignaling = new MillicastSignaling()
  }

  async connect (
    options = {
      subscriberData: null,
      streamName: null,
      disableVideo: false,
      disableAudio: false
    }
  ) {
    logger.info(`Connecting to publisher. Stream name: ${options.streamName}`)
    logger.debug('All viewer connect options values: ', options)
    this.millicastSignaling.wsUrl = `${options.subscriberData.wsUrl}?token=${options.subscriberData.jwt}`

    const rtcConfiguration = await this.webRTCPeer.getRTCConfiguration()
    const peer = await this.webRTCPeer.getRTCPeer(rtcConfiguration)
    peer.ontrack = (event) => {
      logger.info('New track from peer.')
      logger.debug('Track event value: ', event)
      this.emit('new.track', event)
    }

    this.webRTCPeer.RTCOfferOptions = {
      offerToReceiveVideo: !options.disableVideo,
      offerToReceiveAudio: !options.disableAudio
    }
    const localSdp = await this.webRTCPeer.getRTCLocalSDP(true, null)

    const sdpSubscriber = await this.millicastSignaling.subscribe(localSdp, options.streamName)
    if (sdpSubscriber) {
      await this.webRTCPeer.setRTCRemoteSDP(sdpSubscriber)
    } else {
      logger.error('Failed to connect to publisher: ', sdpSubscriber)
      throw new Error('Failed to connect to publisher: ', sdpSubscriber)
    }

    return sdpSubscriber
  }
}
