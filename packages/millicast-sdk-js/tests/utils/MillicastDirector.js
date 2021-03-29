class MillicastDirector {
  static async getPublisher (token, streamName) {
    const payload = { streamName }
    const response = await this.request(
      'https://director.millicast.com/api/director/publish',
      'POST',
      token,
      payload
    )
    return response.data
  }

  static async getSubscriber (
    streamAccountId,
    streamName,
    unauthorizedSubscribe = true
  ) {
    const payload = { streamAccountId, streamName, unauthorizedSubscribe }
    const token = null
    const response = await this.request(
      'https://director.millicast.com/api/director/subscribe',
      'POST',
      token,
      payload
    )
    return response.data
  }

  static request (url, method, token, payload) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = (evt) => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          const res = JSON.parse(xhr.responseText)
          // console.log(res);
          switch (xhr.status) {
            case 200:
              resolve(res)
              break
            default:
              reject(res)
              break
          }
        }
      }
      xhr.open(method, url, true)
      xhr.setRequestHeader('Content-Type', 'application/json;')
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      payload ? xhr.send(JSON.stringify(payload)) : xhr.send()
    })
  }
}

window.millicastDirector = MillicastDirector
