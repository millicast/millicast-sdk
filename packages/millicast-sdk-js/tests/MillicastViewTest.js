class MillicastViewTest {
  constructor() {
    const href = new URL(window.location.href)
    this.streamAccountId = (!!href.searchParams.get('streamAccountId')) ? href.searchParams.get('streamAccountId') : 'tnJhvK';
    this.streamName = (!!href.searchParams.get('streamName')) ? href.searchParams.get('streamName') : 'km0n0h1u';
    this.playing = false
    this.disableVideo = false
    this.disableAudio = false
    this.millicastView = new millicast.MillicastView()
  }

  async init(){
    this.subscribe()
  }

  async subscribe() {
    const options = {
      streamAccountId: this.streamAccountId,
      streamName: this.streamName, 
      disableVideo: this.disableVideo, 
      disableAudio: this.disableAudio
    }
    try{
      this.millicastView.on('new.track', (event) => {
        this.addStreamToVideoTag(event)
      })
      await this.millicastView.connect(options)
      console.log('Viewer connected!!')
    }
    catch(error){
      console.log('There was an error while trying to connect with the publisher: ', error)
    }
  }

  addStreamToVideoTag(event){
    if(!this.playing)
      this.addStream(event.streams[0]);
  }

  addStream(stream) {
    this.playing = true
    const video = document.getElementById('millicast-view-test')

    if(this.disableVideo){
      if(video)video.parentNode.removeChild(video)
    }else{
      video.srcObject = stream
    }
  }
}

const millicastViewTest = new MillicastViewTest()
millicastViewTest.init()