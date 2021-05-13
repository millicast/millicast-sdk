export default class MockMediaStream {
  constructor (tracks = []) {
    this.audioTracks = tracks.filter(x => x.kind === 'audio') ?? []
    this.videoTracks = tracks.filter(x => x.kind === 'video') ?? []
  }

  getAudioTracks () {
    return this.audioTracks
  }

  getVideoTracks () {
    return this.videoTracks
  }

  getTracks () {
    return this.audioTracks.concat(this.videoTracks)
  }

  addTrack (track) {
    if (track.kind === 'audio') {
      this.audioTracks.push(track)
    } else {
      this.videoTracks.push(track)
    }
  }
}

global.MediaStream = MockMediaStream
