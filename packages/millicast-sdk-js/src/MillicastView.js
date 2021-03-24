import Logger from './Logger'
const logger = Logger.get('MillicastView')
import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from "./MillicastWebRTC.js";
import MillicastDirector from "./MillicastDirector.js";

export default class MillicastView {
    constructor() {
        this.webRTCPeer = new MillicastWebRTC();
        this.millicastSignaling = null
    }

    async connect(options = {streamAccountId: null, streamName: null, disableVideo: false, disableAudio: false}){
      let setRTCRemoteSDPResponse = null
      const directorResponse = await MillicastDirector.getSubscriber(options.streamAccountId, options.streamName)
      this.millicastSignaling = new MillicastSignaling({url: directorResponse.wsUrl})
      const rtcConfiguration = await this.webRTCPeer.getRTCConfiguration()
      const peer = await this.webRTCPeer.getRTCPeer(rtcConfiguration)
      this.webRTCPeer.RTCOfferOptions = {
        offerToReceiveVideo: !options.disableVideo,
        offerToReceiveAudio: !options.disableAudio,
      }
      const description = await this.webRTCPeer.getRTCLocalSDP(true, null)
      const subscribeResponse = await this.millicastSignaling.subscribe(description.sdp, options.streamName)
      setRTCRemoteSDPResponse = (subscribeResponse.sdp) ? await this.webRTCPeer.setRTCRemoteSDP(subscribeResponse.sdp) : null
      if(!setRTCRemoteSDPResponse){
        logger.error('Failed to connect to publisher: ', setRTCRemoteSDPResponse)
        throw new Error('Failed to connect to publisher: ', setRTCRemoteSDPResponse)
      }

      return setRTCRemoteSDPResponse
    }
}