'use strict';
/**
 * MillicastMedia class.
 * @param {Object} options - {constraints, }
 * @constructor
 */
class MillicastMedia {
  constructor(options) {
    // constructor syntactic sugar
    this.mediaStream = null;

    this.constraints = {
      /* audio: true, */
      audio: {
        echoCancellation: false,
        channelCount: {ideal:2}
      },
      video: true
    };
    /*Apply Options*/
    if(options){
      if(!!options.constraints)Object.assign(this.constraints, options.constraints);
    }
  }

  getInput(kind){
    let input = null;
    if(!kind)return input;
    if(this.mediaStream){
      for(let track of this.mediaStream.getTracks()){
        if(track.kind === kind){
          input = track;
          break;
        }
      }
    }
    return input;
  }


  get videoInput(){
    return this.getInput('video');
  }

  get audioInput(){
    return this.getInput('audio');
  }


  /**
   * Get User Media
   *
   * @param {Boolean} omitDevices - false by default.
   * @return {MediaStream}
   *
   */
  getMedia(omitDevices = false) {
    //gets user cam and mic
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia(this.constraints)
        .then((stream) => {
          this.mediaStream = stream;
          if (omitDevices !== true) {
            return this.getMediaDevices();
          }else{
            resolve(this.mediaStream);
          }
        })
        .then(() => {
          resolve(this.mediaStream);
        })
        .catch((error) => {
          console.error('Could not get Media: ', error, this.constraints);
          reject(error);
        })
    })
  }
  /**
   * Get Enumerate Devices
   *
   * @return {Promise} devices - sorted object containing arrays audioin, videoin
   *
   */
  getMediaDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return Promise.reject(new Error("Could not get list of media devices!  This might not be supported by this browser."));
    }
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.enumerateDevices()
        .then((list) => {
          let items = {audioin: [], videoin: []};//,active:{audio:null,video:null}};
          //console.log('*media*  list of devices: ', list);
          list.forEach(device => {
            //console.log('device: ',device);
            switch (device.kind) {
              case 'audioinput':
                if (device.deviceId !== 'default') {
                  items.audioin.push(device);
                }
                break;
              case 'videoinput':
                if (device.deviceId !== 'default') {
                  items.videoin.push(device);
                }
                break;
            }
          });
          this.devices = items;
          resolve(this.devices);
        })
        .catch((error) => {
          console.error('Could not get Media: ', error);
          //reject(error);
          this.devices = [];
          resolve(this.devices);
        });
    });
  }

  changeVideo(id){
    if(!id)return Promise.reject('Required id');
    let video = {
      deviceId:{
        exact: id
      }
    };
    let constraints = {video};
    Object.assign(this.constraints, constraints);
    return this.getMedia(true);
  }

  changeAudio(id){
    if(!id) return Promise.reject('Required id');
    let audio = {
      deviceId:{
        exact: id
      }
    };
    let constraints = {audio};
    Object.assign(this.constraints, constraints);
    return this.getMedia(true);
  }

  muteVideo(boolean = true){
    let changed = false;
    if(!this.mediaStream) {
      return changed;
    }
    this.mediaStream.getVideoTracks()[0].enabled = !boolean;
    changed = true;
    return changed;
  }

  muteAudio(boolean = true){
    let changed = false;
    if(!this.mediaStream) {
      console.error('There is no media stream object.');
      return changed;
    }
    this.mediaStream.getAudioTracks()[0].enabled = !boolean;
    changed = true;
    return changed;
  }

}

module.exports = MillicastMedia;
