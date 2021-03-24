import Logger from './Logger'
const logger = Logger.get('MillicastView')
import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from "./MillicastWebRTC.js";
import MillicastDirector from "./MillicastDirector.js";

export default class MillicastView {
    constructor() {
        this.webRTCPeer = new MillicastWebRTC();
        this.millicastSignaling = new MillicastSignaling()
    }

    async connect(options = {streamAccountId: null, streamName: null, disableVideo: false, disableAudio: false}){
      let setRTCRemoteSDPResponse = null
      const directorResponse = await MillicastDirector.getSubscriber(options.streamAccountId, options.streamName)
      this.millicastSignaling.wsUrl = `${directorResponse.wsUrl}?token=${directorResponse.jwt}`
      const rtcConfiguration = await this.webRTCPeer.getRTCConfiguration()
      const peer = await this.webRTCPeer.getRTCPeer(rtcConfiguration)
      this.webRTCPeer.RTCOfferOptions = {
        offerToReceiveVideo: !options.disableVideo,
        offerToReceiveAudio: !options.disableAudio,
      }
      const localSDP = await this.webRTCPeer.getRTCLocalSDP(true, null)
      const SDPSubscriber = await this.millicastSignaling.subscribe(localSDP, options.streamName)
      setRTCRemoteSDPResponse = (SDPSubscriber) ? await this.webRTCPeer.setRTCRemoteSDP(SDPSubscriber) : null
      if(!SDPSubscriber){
        logger.error('Failed to connect to publisher: ', setRTCRemoteSDPResponse)
        throw new Error('Failed to connect to publisher: ', setRTCRemoteSDPResponse)
      }

      return setRTCRemoteSDPResponse
    }
}