import MillicastPublish from './MillicastPublish'
import MillicastMedia from './MillicastMedia'

/**
 * MillicastPublishUserMedia class.
 *
 * @constructor
 */
export default class MillicastPublishUserMedia extends MillicastPublish {
    constructor(options = undefined) {
      super()
      this.mediaManager = new MillicastMedia(options)
    }

    get constraints() {
      return this.mediaManager.constraint
    }

    set constraints(constraints) {
        this.mediaManager.constraints = constraints
    }

    get devices() {
        return this.mediaManager.getDevices
    }

    get activeVideo(){
        return this.mediaManager.videoInput
    }

    get activeAudio(){
        return this.mediaManager.audioInput
    }

    /**
     * Get Media Stream
     *
     * @param {Object}
     * @return {Promise}
     *
     */
    async getMediaStream() {
      try {
          return await this.mediaManager.getMedia()
      } catch (e) {
          throw e
      }
    }

    destoryMediaStream(){
      this.mediaManager.mediaStream = null
    }

    updateMediaStream(type, id){
        if(type === 'audio'){
          return new Promise((resolve, reject) => {
            this.mediaManager.changeAudio(id)
              .then(stream => {
                this.mediaManager.mediaStream = stream
                resolve(stream)
              })
              .catch((error) => {
                console.error('Could not update Audio: ', error)
                reject(error)
              })
          })
        }else if(type === 'video'){
          return new Promise((resolve, reject) => {
            this.mediaManager.changeVideo(id)
              .then(stream => {
                this.mediaManager.mediaStream = stream
                resolve(stream)
              })
              .catch((error) => {
                console.error('Could not update Video: ', error)
                reject(error)
              })
          })
        }else{
            return Promise.reject(`Invalid Type: ${type}`)
        }
    }

    async muteMedia(type, boo){
        if(type === 'audio'){
            return this.mediaManager.muteAudio(boo)
        }else if(type === 'video'){
            return this.mediaManager.muteVideo(boo)
        }else{
            return false
        }
    }
}
