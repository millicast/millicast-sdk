# Millicast SDK for JavaScript
<!-- TODO: Add badges: NPM, build, tests, etc. -->
![npm (scoped)](https://img.shields.io/npm/v/@millicast/sdk)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/millicast/millicast-sdk)
![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/millicast/millicast-sdk?include_prereleases&label=pre-release)
![GitHub branch checks state](https://img.shields.io/github/checks-status/millicast/millicast-sdk/main)

This Software Development Kit (SDK) for JavaScript allows developers to simplify Millicast services integration into their own web apps.

You can find the latest, most up to date, SDK documentation at our [doc site](https://millicast.github.io/millicast-sdk/).

## Quick Start
You can either using the SDK using the CDN version of the package or installing via NPM.


```html
<script src='https://cdn.jsdelivr.net/npm/@millicast/sdk@latest/dist/millicast.umd.js'></script>
<script>
</script>
```


```sh
$ npm i --save @millicast/sdk
```

 ```javascript
 import { Director, Publish } from '@millicast/sdk'

  //Get your Millicast credentials
  const publishToken = 'Your publishing token'
  const streamName = 'Your publishing stream name'

  //Define callback for generate new token
  const tokenGenerator = () => Director.getPublisher(publishToken, streamName)

  //Create a new instance
  const millicastPublish = new Publish(streamName, tokenGenerator)

  //Get User camera and microphone
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

  //Publishing Options
  const broadcastOptions = {
      mediaStream
    }

  //Start broadcast
  try {
    await millicastPublish.connect(broadcastOptions)
  } catch (e) {
    console.log('Connection failed, handle error', e)
  }
```

```html
<body>
  <video
    id="my-video"
  >
  </video>
</body>
```

```javascript
 import { Director, View } from '@millicast/sdk'
  
  //Get your Millicast credentials
  const accountId = 'Publisher account ID'
  const streamName = 'Publisher stream name'

  //Define callback for generate new token
  const tokenGenerator = () => Director.getSubscriber(streamName, accountId)
  
  //Create a new instance
  const millicastView = new View(streamName, tokenGenerator)
  
  //Set event handler for receive stream from publisher and add it to your <video> tag
  millicastView.on('track', (event) => {
    const video = document.getElementById('my-video')
    video.srcObject = event.streams[0]
  })

  //Start connection to publisher
  try {
  await millicastView.connect()
  } catch (e) {
    console.log('Connection failed, handle error', e)
  }
```