import Logger from '../Logger';

const logger = Logger.get('BitrateManager');

export default class BitrateManager {
  private readonly peerConnection: RTCPeerConnection;
  private readonly currentBitrates: { video: number } = { video: 0 };
  
  constructor(peerConnection: RTCPeerConnection) {
    this.peerConnection = peerConnection;
  }

  async updateVideoBitrate(bitrate: number) {
    logger.info('Updating video bandwidth restriction, bitrate value: ', bitrate);

    const videoSenders = this.peerConnection
      .getSenders()
      .filter((sender: RTCRtpSender) => sender.track && sender.track.kind === 'video');

    for (const sender of videoSenders) {
      await this.setVideoSenderBitrate(sender, bitrate);
    }

    this.currentBitrates.video = bitrate;
  }

  async setVideoSenderBitrate(sender: RTCRtpSender, bitrate: number) {
    const params = sender.getParameters();

    if (params.encodings && params.encodings.length > 0) {
      // Handle simulcast - set bitrates for different layers
      if (params.encodings.length > 1) {
        // Simulcast: distribute bitrate across layers
        this.setSimulcastBitrates(params.encodings, bitrate);
      } else {
        // Single encoding
        params.encodings[0].maxBitrate = bitrate;
      }

      await sender.setParameters(params);
    }
  }

  setSimulcastBitrates(encodings: RTCRtpEncodingParameters[], totalBitrate: number) {
    // Distribute bitrate across simulcast layers
    // Typical distribution: high=70%, medium=20%, low=10%
    const distributions = [0.7, 0.2, 0.1];

    encodings.forEach((encoding, index) => {
      if (index < distributions.length) {
        encoding.maxBitrate = Math.floor(totalBitrate * distributions[index]);
      }
    });
  }

}
