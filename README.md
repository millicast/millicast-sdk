# Millicast SDK for JavaScript
<!-- TODO: Add badges: NPM, build, tests, etc. -->
![npm (scoped)](https://img.shields.io/npm/v/@millicast/sdk)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/millicast/millicast-sdk)
![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/millicast/millicast-sdk?include_prereleases&label=pre-release)
![GitHub branch checks state](https://img.shields.io/github/checks-status/millicast/millicast-sdk/main)

This Software Development Kit (SDK) for JavaScript allows developers to simplify Millicast services integration into their own web apps.

## Table of Contents
* [Installation](#installation)
* [Basic Usage](#basic-usage)
* [API Reference](#api-reference)
* [Samples](#samples)
* [SDK developer information](#sdk-developer-information)
* [License](#license)


## Installation
You can use the CDN version of the SDK adding this tag to your document's `<head>`. Then `millicast` global variable will be available to use it.
```html
<script src='https://cdn.jsdelivr.net/npm/@millicast/sdk@latest/dist/millicast.umd.js'></script>
```

Or if you are building an application with Node.js, you can install the SDK package to your dependencies.


```sh
$ npm i --save @millicast/sdk
```

## Basic Usage
This simple example will show how to broadcast the user camera and microphone to Millicast Media Servers and viewing it.

You will need a Millicast account and a valid publishing token that you can find it in your dashboard ([link here](https://dash.millicast.com/#/signin)).


### Publisher app


```javascript
 import { Director, Publish } from '@millicast/sdk'
  //Define callback for generate new tokens
  const tokenGenerator = () => Director.getPublisher('my-publishing-token', 'my-stream-name')

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


### Viewer app

`index.html`
```html
<html>
<head>
  ...
</head>
<body>
  <video id="my-video"></video>
  
  <script src='viewer.js'></script>
</body>
</html>
```
`viewer.js`
```javascript
  import { Director, View } from '@millicast/sdk'

  //Define callback for generate new token
  const tokenGenerator = () => Director.getSubscriber('my-stream-name', 'my-account-id')
  
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
## API Reference
You can find the latest, most up to date, SDK documentation at our [API Reference page](https://millicast.github.io/millicast-sdk/). There are more examples with every module available.

## Samples
In this repo there are two pacakges that implement a broadcaster and viewer application using the SDK.
You can clone this repo and following the steps indicated in each example:
* [millicast-publisher-demo](https://github.com/millicast/millicast-sdk/tree/main/packages/millicast-publisher-demo#readme)
* [millicast-viewer-demo](https://github.com/millicast/millicast-sdk/tree/main/packages/millicast-viewer-demo#readme)

## SDK developer information
To develop and contribute to this project, there are some instructions of how to set up your environment to start contributing. [Follow this link.](https://github.com/millicast/millicast-sdk/blob/main/developer-info.md)

## License
Please refer to [LICENSE](https://github.com/millicast/millicast-sdk/blob/main/LICENSE) file.