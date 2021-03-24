import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from "./MillicastWebRTC.js";

export default class MillicastView {
    constructor(options = {sdp: null, streamId: null}) {
        this.webRTCPeer = new MillicastWebRTC();
        this.millicastSignaling = new MillicastSignaling()
        this.sdp = options.sdp
        this.streamId = options.streamId

        //this.millicastSignaling.subscribe(this.sdp, this.streamId)
    }

    


}