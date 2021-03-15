"use strict";
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
      audio: {
        echoCancellation: false,
        channelCount: { ideal: 2 },
      },
      video: true,
    };
    /*Apply Options*/
    if (options && !!options.constraints)
      Object.assign(this.constraints, options.constraints);
  }

  getInput(kind) {
    let input = null;
    if (!kind) return input;
    if (this.mediaStream) {
      for (let track of this.mediaStream.getTracks()) {
        if (track.kind === kind) {
          input = track;
          break;
        }
      }
    }
    return input;
  }

  get videoInput() {
    return this.getInput("video");
  }

  get audioInput() {
    return this.getInput("audio");
  }

  /**
   * Get User Media
   *
   * @return {MediaStream}
   *
   */
  async getMedia() {
    //gets user cam and mic
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia(
        this.constraints
      );
      // if(omitDevices !== true)
      //   return await this.getMediaDevices()
      return this.mediaStream;
    } catch (error) {
      console.error("Could not get Media: ", error, this.constraints);
      throw error;
    }
  }
  /**
   * Get Enumerate Devices
   *
   * @return {Promise} devices - sorted object containing arrays audioin, videoin
   *
   */
  async getMediaDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
      throw new Error(
        "Could not get list of media devices!  This might not be supported by this browser."
      );

    try {
      const items = { audioinput: [], videoinput: [], audiooutput: [] };
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      for (const device of mediaDevices)
        this.addMediaDevicesToList(items, device);
      this.devices = items;
    } catch (error) {
      console.error("Could not get Media: ", error);
      this.devices = [];
    }
    return this.devices;
  }

  addMediaDevicesToList(items, device) {
    if (device.deviceId !== "default" && items[device.kind])
      items[device.kind].push(device);
  }

  async changeVideo(id) {
    return await this.changeSource(id, "video");
  }

  async changeAudio(id) {
    return await this.changeSource(id, "audio");
  }

  async changeSource(id, sourceType) {
    if (!id) throw new Error("Required id");

    this.constraints[sourceType] = {
      ...this.constraints[sourceType],
      deviceId: {
        exact: id,
      },
    };
    return await this.getMedia();
  }

  muteVideo(boolean = true) {
    let changed = false;
    if (this.mediaStream) {
      this.mediaStream.getVideoTracks()[0].enabled = !boolean;
      changed = true;
    } else {
      console.error("There is no media stream object.");
    }
    return changed;
  }

  muteAudio(boolean = true) {
    let changed = false;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks()[0].enabled = !boolean;
      changed = true;
    } else {
      console.error("There is no media stream object.");
    }
    return changed;
  }
}

module.exports = MillicastMedia;
