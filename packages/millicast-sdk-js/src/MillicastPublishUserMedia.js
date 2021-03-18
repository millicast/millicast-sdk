import MillicastPublish from "./MillicastPublish";
import MillicastMedia from "./MillicastMedia";

/**
 * @class MillicastPublishUserMedia
 * @classdesc A high level module for streaming.
 * @param {Object} options
 * @param {mediaStream} options.MediaStream - the mediaStream of the selected devices.
 * @param {Object} options.constraints - the selected options of the selected devices (audio and video controls).
 * @example
 * import MillicastPublishUserMedia from '';
 *
 * //Create a new instance
 * const millicastPublishUserMedia = await MillicastPublishUserMedia.build(options);
 *
 * //Set video source
 * const mediaStream = await millicastPublishUserMedia.getMediaStream();
 * console.log("GetMedia response:", mediaStream);
 * document.getElementById("millicast-media-video-test").srcObject = mediaStream;
 *
 * //Get devices
 * const devices = await millicastPublishUserMedia.devices;
 * console.log("GetDevices response:", devices);
 *
 * const audioInputSelect = document.getElementById("audio-input-select");
 * const audioOutputSelect = document.getElementById("audio-output-select");
 * const videoSelect = document.getElementById("video-select");
 *
 * const fillSelectElement(selectElement, devices) => {
 * selectElement.innerHTML = "";
 * for (const device of devices) {
 *   selectElement.add(new Option(device.label, device.deviceId));
 * }
 *
 * //Set devices
 * fillSelectElement(audioInputSelect, devices.audioinput);
 * fillSelectElement(audioOutputSelect, devices.audiooutput);
 * fillSelectElement(videoSelect, devices.videoinput);
 *
 * //Get bandwith from selection
 * const bandwidth = Number.parseInt(
 *    document.getElementById("bitrate-select").value
 * );
 *
 * //Options
 * const broadcastOptions = options ?? {
 *    token: "", <- your publishing token
 *    streamName: "",<- your stream name
 *    bandwidth: bandwidth,
 *    disableVideo: false,
 *    disableAudio: false,
 *  };
 *
 * //Start broadcast
 * const response = await millicastPublishUserMedia.broadcast(
 *   broadcastOptions
 * );
 * console.log("BROADCASTING!! Start response: ", response);
 *
 * //Create stream link
 * const viewLink = `https://viewer.millicast.com/v2?streamId=${accountId}/${broadcastOptions.streamName}`;
 * console.log("Broadcast viewer link: ", viewLink);
 *
 * document.getElementById("broadcast-status-label").innerHTML = `LIVE! View link: <a href='${viewLink}'>${viewLink}</a>`;
 *
 * @constructor
 */

export default class MillicastPublishUserMedia extends MillicastPublish {
  constructor(options = undefined) {
    super();
    this.mediaManager = new MillicastMedia(options);
  }

  /**
   * Builds an instance of MillicastPublishUserMedia and sets the mediaStream.
   * @param {Object} options - the options passed to the constructor.
   * @returns {InstanceType} - the newly created instance.
   */

  static async build(options = undefined) {
    const instance = new MillicastPublishUserMedia(options);
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

  /**
   * Starts the stream.
   * @param {Object} options - general broadcast options.
   * @param {String} options.token - user token for authentication.
   * @param {String} options.streamName - the name of the stream.
   * @param {mediaStream} options.mediaStream - the stream from the devices.
   * @param {Number} options.bandwith - the selected bandwith of the broadcast.
   * @param {Boolean} options.disableVideo - the selected status of the selected video device.
   * @param {Boolean} options.disableAudio - the selected status of the selected audio device.
   * @example const response = await MillicastPublish.broadcast(options);
   * @returns - the stream.
   */

  broadcast(
    options = {
      token: null,
      streamName: null,
      bandwidth: 0,
      disableVideo: false,
      disableAudio: false,
    }
  ) {
    return super.broadcast({
      ...options,
      mediaStream: this.mediaManager.mediaStream,
    });
  }

  async getMediaStream() {
    try {
      return await this.mediaManager.getMedia();
    } catch (e) {
      throw e;
    }
  }

  /**
   * Stops the stream.
   * @example MillicastPublisherUserMedia.destroyMediaStream();
   */

  destroyMediaStream() {
    this.mediaManager.mediaStream = null;
  }

  //Used for change audio and video given by type before broadcast.
  //The goal of this method is to update the mediaStream and change it in WebRTC while broadcasting.
  updateMediaStream(type, id) {
    if (type === "audio") {
      return new Promise((resolve, reject) => {
        this.mediaManager
          .changeAudio(id)
          .then((stream) => {
            this.mediaManager.mediaStream = stream;
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

  /**
   * @param {String} type - the type of device ("audio" or "video").
   * @param {Boolean} boo - true or false depending of the state of the selected device stream.
   * @returns {Boolean} - returns the new state of the selected device.
   */

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
