"use strict";

/**
 * @module
 * MillicastMedia class: it's in charge of the devices, their respective streams, and the states of those streams.
 * @param {Object} options - {mediaStream, constraints}
 * @example
 * const MillicastMedia = new MillicastMedia()
 * @constructor
 */

export default class MillicastMedia {
  constructor(options) {
    //constructor syntactic sugar
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

  get getDevices() {
    return this.getMediaDevices()
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

  /**
   * Get active video device
   * @example
   * const videoInput = MillicastMedia.videoInput()
   * @returns {MediaStreamTrack}
   */

  get videoInput() {
    return this.getInput("video");
  }

  /**
   * Get active audio device
   * @example
   * const audioInput = MillicastMedia.audioInput()
   * @returns {MediaStreamTrack}
   */

  get audioInput() {
    return this.getInput("audio");
  }

  /**
   * Get User Media
   * @example
   * const media = MillicastMedia.getMedia()
   * @returns {MediaStream}
   */

  async getMedia() {
    //gets user cam and mic
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia(
        this.constraints
      )
      return this.mediaStream
    } catch (error) {
      console.error("Could not get Media: ", error, this.constraints)
      throw error
    }
  }

  /**
   * Get Enumerate Devices
   * @example
   * const devices = MillicastMedia.getMediaDevices()
   * @returns {Promise} devices - sorted object containing arrays audioin, videoin
   */

  async getMediaDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
      throw new Error(
        "Could not get list of media devices!  This might not be supported by this browser."
      )

    try {
      const items = { audioinput: [], videoinput: [], audiooutput: [] }
      const mediaDevices = await navigator.mediaDevices.enumerateDevices()
      for (const device of mediaDevices)
        this.addMediaDevicesToList(items, device)
      this.devices = items
    } catch (error) {
      console.error("Could not get Media: ", error)
      this.devices = []
    }
    return this.devices
  }

  addMediaDevicesToList(items, device) {
    if (device.deviceId !== "default" && items[device.kind])
      items[device.kind].push(device);
  }

  /**
   * @param {String} id the id from the selected video device
   * @example
   * const media = MillicastMedia.changeVideo(id)
   * @returns {MediaStream} stream from the latest selected video device
   */

  async changeVideo(id) {
    return await this.changeSource(id, "video");
  }

  /**
   * @param {String} id the id from the selected audio device
   * @example
   * const media = MillicastMedia.changeAudio(id)
   * @returns {MediaStream} stream from the latest selected audio device
   */

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

  /**
   * @param {boolean} boo true or false depending of the state of the selected device stream
   *
   * @returns {boolean} if mediaStream exists, returns false for setting the new video state
   */

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

  /**
   * @param {boolean} boo true or false depending of the state of the selected device stream
   *
   * @returns {boolean} if mediaStream exists, returns false for setting the new audio state
   */

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
