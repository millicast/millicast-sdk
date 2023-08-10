import * as publisher from './publisher'
import * as subscriber from './subscriber'

document.addEventListener('DOMContentLoaded', async (event) => {
  // Get media element
  const myVideo = document.getElementById('my-video')

  document.getElementById('subscribe').addEventListener('click', subscriber.startSubscriber)
  document.getElementById('publish').addEventListener('click', (e) => publisher.startPublisher(e, myVideo))
})
