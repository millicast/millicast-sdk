const MillicastMedia = require('./MillicastMedia.js');
const MillicastStream = require('./MillicastStream.js');
const MillicastWebRTC = require('./MillicastWebRTC.js');
const MillicastDirector =  require('./MillicastDirector.js');
'use strict';

/**
 * MillicastMedia class.
 *
 * @constructor
 */
class MillicastPublish {
    constructor(options) {

        // constructor syntactic sugar
        this.mediaStream = null;

        this.mediaConstraints = {
            audio: true,
            video: true
        };
        if (!!options.constraints) Object.assign(this.mediaConstraints, options.constraints);

        this.mediaManager = new MillicastMedia({});
        this.mediaManager.constraints = this.mediaConstraints;

        this.webRTCPeer = new MillicastWebRTC();

        this.millicastStream = new MillicastStream();
        //this.millicastStream.wsUrl
    }

    get constraints() {
        //let tracks = this.mediaStream.getVideoTracks();
        //return tracks.length > 0 ? tracks[0] : {label: 'none'};
        return this.mediaManager.constraint;
    }

    set constraints(constraints) {
        Object.assign(this.mediaConstraints, constraints);
        this.mediaManager.constraints = this.mediaConstraints;
    }

    get devices() {
        return this.mediaManager.devices;
    }

    get activeVideo(){
        return this.mediaManager.videoInput;
    }

    get activeAudio(){
        return this.mediaManager.audioInput;
    }

    /**
     * Get Media Stream
     *
     * @param {Object}
     * @return {Promise}
     *
     */
    async getMediaStream() {
        try {
            this.mediaStream = await this.mediaManager.getMedia();
            return this.mediaStream
        } catch (e) {
            throw e;
        }
    }
    destoryMediaStream(){
        this.mediaStream = null;
    }

    updateMediaStream(type, id){
        if(type === 'audio'){
            // return this.mediaManager.changeAudio(id);

          return new Promise((resolve, reject) => {
            this.mediaManager.changeAudio(id)
              .then(stream => {
                this.mediaStream = stream;
                resolve(stream);
              })
              .catch((error) => {
                console.error('Could not update Audio: ', error);
                reject(error);
              })
          })
        }else if(type === 'video'){
          return new Promise((resolve, reject) => {
            this.mediaManager.changeVideo(id)
              .then(stream => {
                this.mediaStream = stream;
                resolve(stream);
              })
              .catch((error) => {
                console.error('Could not update Video: ', error);
                reject(error);
              })
          })
        }else{
            return Promise.reject(`Invalid Type: ${type}`);
        }
    }

    async muteMedia(type, boo){
        if(type === 'audio'){
            return this.mediaManager.muteAudio(boo);
        }else if(type === 'video'){
            return this.mediaManager.muteVideo(boo);
        }else{
            return false;//return Promise.reject(`Invalid Type: ${type}`);
        }
    }

    async unMuteMedia(type){
        if(type === 'audio'){
            return this.mediaManager.muteAudio(false);
        }else if(type === 'video'){
            return this.mediaManager.muteVideo(false);
        }else{
            return false;//return Promise.reject(`Invalid Type: ${type}`);
        }
    }


    updateBitrate(bitrate = 0){
        let peer;
        let RTCOfferOptions = {offerToReceiveVideo: !disableVideo, offerToReceiveAudio: !disableAudio};
        return this.webRTCPeer.getRTCPeer()
            .then((pc)=>{
                peer = pc;
                return  this.webRTCPeer.getRTCPublisherSDP(null, RTCOfferOptions)
            })
            .then((lsdp) => {
                let msdp = this.millicastStream.updateBandwidthRestriction(peer.remoteDescription.sdp, bitrate);
                return this.webRTCPeer.setRTCRemoteSDP(msdp);
            })
    }

    broadcast(options = {token: null, streamName: null, bandwidth: 0, disableVideo: false, disableAudio: false}) {
        let mediaStream = this.mediaStream;
        let bandwidth = options.bandwidth;
        let disableVideo = options.disableVideo, disableAudio = options.disableAudio;
        let pc = null;
        let token = options.token;
        let streamName = options.streamName;
        let director = null;
        if(!token){
            return Promise.reject('Token required');
        }
        if(!streamName){
            return Promise.reject( 'Streamname required');
        }

        return MillicastDirector.getPublisher(token, streamName)
            .then((dir)=>{
                director = dir;
                return this.webRTCPeer.getRTCConfiguration()
            })
            .then((config) => {
                return this.webRTCPeer.getRTCPeer(config);
            })
            .then((peer) => {
                pc = peer;
                let disableVideo= false, disableAudio= false;
                let RTCOfferOptions = {offerToReceiveVideo: !disableVideo, offerToReceiveAudio: !disableAudio};
                return this.webRTCPeer.getRTCPublisherSDP(mediaStream, RTCOfferOptions)
            })
            .then((localsdp) => {
                this.millicastStream.wsUrl = `${director.wsUrl}?token=${director.jwt}`;
                return this.millicastStream.publish(localsdp);
            })
            .then((remotesdp) => {
                if (remotesdp && remotesdp.indexOf('\na=extmap-allow-mixed') !== -1) {
                  remotesdp = remotesdp.split('\n').filter(function (line) {
                    return line.trim() !== 'a=extmap-allow-mixed';
                  }).join('\n');
                  console.log('trimed a=extmap-allow-mixed - sdp \n',remotesdp);
                }
                if (disableVideo === false && bandwidth > 0) {
                    remotesdp = this.millicastStream.updateBandwidthRestriction(remotesdp, bandwidth);
                }
                return this.webRTCPeer.setRTCRemoteSDP(remotesdp);
            });
    }

    stop() {
        this.webRTCPeer.closeRTCPeer();
        this.millicastStream.close();
    }

}

module.exports = MillicastPublish;
