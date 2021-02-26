const MillicastStream = require('./MillicastStream.js');
const MillicastWebRTC = require('./MillicastWebRTC.js');
'use strict';

/**
 * MillicastMedia class.
 *
 * @constructor
 */
class MillicastView {
    constructor(options) {
        // constructor syntactic sugar
        if(!!options.streamId) this.streamId = options.streamId;
        this.mediaStream = null;

        this.webRTCPeer = new MillicastWebRTC();
        this.millicastStream = new MillicastStream();
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
            return this.mediaStream;
        } catch (e) {
            throw e;
        }
    }
    destoryMediaStream(){
      this.mediaStream = null;
    }

    view(options = {streamId: null}) {
        let mediaStream = this.mediaStream;
        let pc = null;
        let streamId = options.streamId;

        if(streamId && this.streamId){
           return Promise.reject('Required option: streamId');
        }

        this.streamId = !!streamId ? streamId : this.streamId;
        return this.webRTCPeer.getRTCConfiguration()
            .then((config) => {
                return this.webRTCPeer.getRTCPeer(config);
            })
            .then((peer) => {
                pc = peer;
                //let RTCOfferOptions = {offerToReceiveVideo: !disableVideo, offerToReceiveAudio: !disableAudio};
                return this.webRTCPeer.getRTCLocalSDP()
            })
            .then((localsdp) => {
                return this.millicastStream.subscribe(localsdp, streamId);
            })
            .then((remotesdp) => {
                //console.log('publish ',remotesdp);
                return this.webRTCPeer.setRTCRemoteSDP(remotesdp);
            });
    }

    stop() {
      this.webRTCPeer.closeRTCPeer();
      this.millicastStream.close();
    }

}

module.exports = MillicastView;
