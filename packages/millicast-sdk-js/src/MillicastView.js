import Logger from './Logger'
const logger = Logger.get('MillicastView')
import EventEmitter from "events";
import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from "./MillicastWebRTC.js";
import MillicastDirector from "./MillicastDirector.js";

export default class MillicastView extends EventEmitter {
    constructor() {
      super()
      this.webRTCPeer = new MillicastWebRTC();
      this.millicastSignaling = new MillicastSignaling()
    }

    async connect(options = {streamAccountId: null, streamName: null, disableVideo: false, disableAudio: false}){
      logger.info(`Connecting to publisher. Stream account: ${options.streamAccountId}, stream name: ${options.streamName}`)
      logger.debug('All viewer connect options values: ', options)
      let setRTCRemoteSDPResponse = null
      const directorResponse = await MillicastDirector.getSubscriber(options.streamAccountId, options.streamName)
      this.millicastSignaling.wsUrl = `${directorResponse.wsUrl}?token=${directorResponse.jwt}`
      const rtcConfiguration = await this.webRTCPeer.getRTCConfiguration()
      const peer = await this.webRTCPeer.getRTCPeer(rtcConfiguration)
      peer.ontrack = (event) => {
        logger.info("New track from peer.")
        logger.debug("Track event value: ", event)
        this.emit('new.track', event)
      }
      this.webRTCPeer.RTCOfferOptions = {
        offerToReceiveVideo: !options.disableVideo,
        offerToReceiveAudio: !options.disableAudio,
      }
      const localSDP = await this.webRTCPeer.getRTCLocalSDP(true, null)
      const SDPSubscriber = await this.millicastSignaling.subscribe(localSDP, options.streamName)
      setRTCRemoteSDPResponse = (SDPSubscriber) ? await this.webRTCPeer.setRTCRemoteSDP(SDPSubscriber) : null
      if(!SDPSubscriber){
        logger.error('Failed to connect to publisher: ', SDPSubscriber)
        throw new Error('Failed to connect to publisher: ', SDPSubscriber)
      }

      return SDPSubscriber
    }
}