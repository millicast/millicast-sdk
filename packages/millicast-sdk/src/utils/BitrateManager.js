import Logger from './Logger'

const logger = Logger.get('BitrateManager')

export default class BitrateManager {
  constructor (peerConnection) {
    this.pc = peerConnection
    this.currentBitrates = {
      video: null,
      audio: null
    }
  }

  async updateVideoBitrate (bitrate) {
    logger.info('Updating video bandwidth restriction, bitrate value: ', bitrate)

    const videoSenders = this.pc.getSenders().filter(sender =>
      sender.track && sender.track.kind === 'video'
    )

    for (const sender of videoSenders) {
      await this.setVideoSenderBitrate(sender, bitrate)
    }

    this.currentBitrates.video = bitrate
  }

  async updateAudioBitrate (bitrate) {
    logger.info('Updating audio bandwidth restriction, bitrate value: ', bitrate)

    const audioSenders = this.pc.getSenders().filter(sender =>
      sender.track && sender.track.kind === 'audio'
    )

    for (const sender of audioSenders) {
      await this.setAudioSenderBitrate(sender, bitrate)
    }

    this.currentBitrates.audio = bitrate
  }

  async setVideoSenderBitrate (sender, bitrate) {
    const params = sender.getParameters()

    if (params.encodings && params.encodings.length > 0) {
      // Handle simulcast - set bitrates for different layers
      if (params.encodings.length > 1) {
        // Simulcast: distribute bitrate across layers
        this.setSimulcastBitrates(params.encodings, bitrate)
      } else {
        // Single encoding
        params.encodings[0].maxBitrate = bitrate
      }

      await sender.setParameters(params)
    }
  }

  async setAudioSenderBitrate (sender, bitrate) {
    const params = sender.getParameters()

    if (params.encodings && params.encodings.length > 0) {
      params.encodings[0].maxBitrate = bitrate
      await sender.setParameters(params)
    }
  }

  setSimulcastBitrates (encodings, totalBitrate) {
    // Distribute bitrate across simulcast layers
    // Typical distribution: high=70%, medium=20%, low=10%
    const distributions = [0.7, 0.2, 0.1]

    encodings.forEach((encoding, index) => {
      if (index < distributions.length) {
        encoding.maxBitrate = Math.floor(totalBitrate * distributions[index])
      }
    })
  }

  // Get current bitrate settings
  async getCurrentBitrates () {
    const senders = this.pc.getSenders()
    const bitrates = { video: [], audio: [] }

    for (const sender of senders) {
      if (sender.track) {
        const params = sender.getParameters()
        const kind = sender.track.kind

        if (params.encodings && params.encodings.length > 0) {
          const senderBitrates = params.encodings.map(enc => enc.maxBitrate)
          bitrates[kind].push(...senderBitrates)
        }
      }
    }

    return bitrates
  }
}
