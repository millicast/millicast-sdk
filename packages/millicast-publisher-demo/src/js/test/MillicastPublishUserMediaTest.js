class MillicastPublishUserMediaTest {
  constructor() {
    this.mediaStream = null;
    this.options = {
      streamName: 'km0n0h1u',
      constraints: {
        audio: {
          echoCancellation: true,
          channelCount: { ideal: 2 },
        },
        video: {
          height: 1080,
          width: 1920
        },
      }
    }
    this.millicastPublishUserMedia = null
  }

  async init() {
    this.millicastPublishUserMedia = await publisher.MillicastPublishUserMedia.build(
      this.options
    );
    await this.setVideoSource();
    await this.getDevices();
  }

  async setVideoSource() {
    this.mediaStream = await this.millicastPublishUserMedia.getMediaStream();
    console.log("GetMedia response:", this.mediaStream);
    document.getElementById(
      "millicast-media-video-test"
    ).srcObject = this.mediaStream;
  }

  async getDevices() {
    const audioInputSelect = document.getElementById("audio-input-select");
    const audioOutputSelect = document.getElementById("audio-output-select");
    const videoSelect = document.getElementById("video-select");
    const devices = await this.millicastPublishUserMedia.devices;
    console.log("GetDevices response:", devices);
    this.fillSelectElement(audioInputSelect, devices.audioinput);
    this.fillSelectElement(audioOutputSelect, devices.audiooutput);
    this.fillSelectElement(videoSelect, devices.videoinput);
  }

  fillSelectElement(selectElement, devices) {
    selectElement.innerHTML = "";
    for (const device of devices)
      selectElement.add(new Option(device.label, device.deviceId));
  }

  async testStart(options = undefined) {
    const accountId = "tnJhvK";
    const bandwidth = Number.parseInt(
      document.getElementById("bitrate-select").value
    );

    const broadcastOptions = options ?? {
      bandwidth: bandwidth,
      disableVideo: false,
      disableAudio: false,
    };
    try {
      const response = await this.millicastPublishUserMedia.connect(
        broadcastOptions
      );
      console.log("BROADCASTING!! Start response: ", response);
      const viewLink = `https://viewer.millicast.com/v2?streamId=${accountId}/${broadcastOptions.streamName}`;
      console.log("Broadcast viewer link: ", viewLink);
      document.getElementById(
        "broadcast-status-label"
      ).innerHTML = `LIVE! View link: <a href='${viewLink}'>${viewLink}</a>`;
    } catch (error) {
      console.log("There was an error while trying to broadcast: ", error);
    }
  }

  testStop() {
    this.millicastPublishUserMedia.stop();
    console.log("Broadcast stopped");
    document.getElementById("broadcast-status-label").innerHTML = "READY!";
  }

  async testUpdateBitrate(selectObject) {
    if (this.millicastPublishUserMedia.isActive()) {
      const bitrate = selectObject.value;
      await this.millicastPublishUserMedia.webRTCPeer.updateBitrate(bitrate);
      console.log("Bitrate updated");
    }
  }

  testMuteAudio(checkboxObject) {
    const muted = this.millicastPublishUserMedia.muteMedia(
      "audio",
      checkboxObject.checked
    );
    console.log("MuteMedia audio response:", muted);
  }

  testMuteVideo(checkboxObject) {
    const muted = this.millicastPublishUserMedia.muteMedia(
      "video",
      checkboxObject.checked
    );
    console.log("MuteMedia video response:", muted);
  }

  async testChangeAudio(selectObject) {
    const deviceId = selectObject.value;
    this.mediaStream = await this.millicastPublishUserMedia.updateMediaStream(
      "audio",
      deviceId
    );
    console.log("ChangeAudio response:", this.mediaStream);
    document.getElementById(
      "millicast-media-video-test"
    ).srcObject = this.mediaStream;
    return this.mediaStream;
  }

  async testChangeVideo(selectObject) {
    const deviceId = selectObject.value;
    this.mediaStream = await this.millicastPublishUserMedia.updateMediaStream(
      "video",
      deviceId
    );
    console.log("ChangeVideo response:", this.mediaStream);
    document.getElementById(
      "millicast-media-video-test"
    ).srcObject = this.mediaStream;
    return this.mediaStream;
  }
}

const millicastPublishUserMediaTest = new MillicastPublishUserMediaTest();
millicastPublishUserMediaTest.init();
