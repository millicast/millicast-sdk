import MillicastSignaling from './MillicastSignaling'
import MillicastWebRTC from './MillicastWebRTC.js'
import MillicastDirector from './MillicastDirector.js'

/**
 * MillicastPublish class.
 *
 * @constructor
 */
export default class MillicastPublish {
    constructor() {
        this.broadcastOptions = null
        this.webRTCPeer = new MillicastWebRTC()
        this.millicastSignaling = new MillicastSignaling()
    }

    broadcast(options = {token: null, streamName: null, mediaStream: null, bandwidth: 0, disableVideo: false, disableAudio: false}) {
        this.broadcastOptions = options
        const mediaStream = this.getBroadcastMediaStream()
        let bandwidth = options.bandwidth
        let disableVideo = options.disableVideo, disableAudio = options.disableAudio
        let pc = null
        let token = options.token
        let streamName = options.streamName
        let director = null
        if(!token){
            return Promise.reject('Token required')
        }
        if(!streamName){
            return Promise.reject('Streamname required')
        }
        if(!mediaStream){
          return Promise.reject('MediaStream required')
        }
        if(this.isActive()){
            return Promise.reject('Broadcast currently working')
        }

        return MillicastDirector.getPublisher(token, streamName)
            .then((dir)=>{
                director = dir
                return this.webRTCPeer.getRTCConfiguration()
            })
            .then((config) => {
                return this.webRTCPeer.getRTCPeer(config)
            })
            .then((peer) => {
                pc = peer
                this.webRTCPeer.RTCOfferOptions = {offerToReceiveVideo: !options.disableVideo, offerToReceiveAudio: !options.disableAudio}
                return this.webRTCPeer.getRTCLocalSDP(null, mediaStream)
            })
            .then((localsdp) => {
                this.millicastSignaling.wsUrl = `${director.wsUrl}?token=${director.jwt}`
                return this.millicastSignaling.publish(localsdp)
            })
            .then((remotesdp) => {
                if (remotesdp && remotesdp.indexOf('\na=extmap-allow-mixed') !== -1) {
                  remotesdp = remotesdp.split('\n').filter(function (line) {
                    return line.trim() !== 'a=extmap-allow-mixed'
                  }).join('\n')
                  console.log('trimed a=extmap-allow-mixed - sdp \n',remotesdp)
                }
                if (disableVideo === false && bandwidth > 0) {
                    remotesdp = this.webRTCPeer.updateBandwidthRestriction(remotesdp, bandwidth)
                }
                return this.webRTCPeer.setRTCRemoteSDP(remotesdp)
            });
    }

    getBroadcastMediaStream(){
        return this.broadcastOptions.mediaStream
    }

    stop() {
        this.webRTCPeer.closeRTCPeer()
        this.millicastSignaling.close()
        this.broadcastOptions = null
    }

    isActive(){
        const rtcPeerState = this.webRTCPeer.getRTCPeerStatus()
        console.log("RTCPeer status: ", rtcPeerState)
        return rtcPeerState === 'connected'
    }
}
