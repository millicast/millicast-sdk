export default class MockMediaStream {
  constructor(tracks = []) {
    this.audioTracks = []
    this.videoTracks = []
    for (const track of tracks) {
      this.addTrack(track)
    }
  }

  getAudioTracks() {
    return this.audioTracks
  }

  getVideoTracks() {
    return this.videoTracks
  }

  getTracks() {
    return this.audioTracks.concat(this.videoTracks)
  }

  addTrack(track) {
    const trackParsed = track
    trackParsed.getSettings = trackParsed.getSettings ?? getSettings
    if (track.kind === 'audio') {
      this.audioTracks.push(trackParsed)
    } else {
      this.videoTracks.push(trackParsed)
    }
  }
}

const getSettings = () => {
  return {
    channelCount: 0,
  }
}

global.MediaStream = MockMediaStream
