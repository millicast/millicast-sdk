import {Publish} from "@nx-millicast/millicast-sdk"
import MillicastMedia from "./MillicastMedia"

export default class MillicastPublishUserMedia extends Publish {
  constructor(options, tokenGenerator, autoReconnect) {
    super(options.streamName, tokenGenerator, autoReconnect);
    this.mediaManager = new MillicastMedia(options);
  }

  static async build(options, tokenGenerator, autoReconnect = true) {
    const instance = new MillicastPublishUserMedia(options, tokenGenerator, autoReconnect);
    await instance.getMediaStream();
    return instance;
  }

  get constraints() {
    return this.mediaManager.constraints;
  }

  set constraints(constraints) {
    this.mediaManager.constraints = constraints;
  }

  get devices() {
    return this.mediaManager.getDevices;
  }

  get activeVideo() {
    return this.mediaManager.videoInput;
  }

  get activeAudio() {
    return this.mediaManager.audioInput;
  }

  async connect(
    options = {
      bandwidth: 0,
      disableVideo: false,
      disableAudio: false,
    }
  ) {
      await super.connect({
        ...options, 
        mediaStream: this.mediaManager.mediaStream
      });
  
    this.webRTCPeer.on('stats', (stats) => {
      console.log(stats)
    })
  }

  async getMediaStream() {
    try {
      return await this.mediaManager.getMedia();
    } catch (e) {
      throw e;
    }
  }

  destroyMediaStream() {
    this.mediaManager.mediaStream = null;
  }

  updateMediaStream(type, id) {
    if (type === "audio") {
      return new Promise((resolve, reject) => {
        this.mediaManager
          .changeAudio(id)
          .then((stream) => {
            this.mediaManager.mediaStream = stream;
            if (this.isActive()) {
              this.webRTCPeer.replaceTrack(stream.getAudioTracks()[0])
            }
            resolve(stream);
          })
          .catch((error) => {
            console.error("Could not update Audio: ", error);
            reject(error);
          });
      });
    } else if (type === "video") {
      return new Promise((resolve, reject) => {
        this.mediaManager
          .changeVideo(id)
          .then((stream) => {
            this.mediaManager.mediaStream = stream;
            if (this.isActive()) {
              this.webRTCPeer.replaceTrack(stream.getVideoTracks()[0])
            }
            resolve(stream);
          })
          .catch((error) => {
            console.error("Could not update Video: ", error);
            reject(error);
          });
      });
    } else {
      return Promise.reject(`Invalid Type: ${type}`);
    }
  }

  sendMessage(message) {
    if (this.options.codec === 'h264') this.sendMetadata(message)
  }

  muteMedia(type, boo) {
    if (type === "audio") {
      return this.mediaManager.muteAudio(boo);
    } else if (type === "video") {
      return this.mediaManager.muteVideo(boo);
    } else {
      return false;
    }
  }
}
