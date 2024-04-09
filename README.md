# Millicast SDK for JavaScript

[![npm (scoped)](https://img.shields.io/npm/v/@millicast/sdk)](https://www.npmjs.com/package/@millicast/sdk)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/millicast/millicast-sdk)](https://github.com/millicast/millicast-sdk/releases)
[![Check tests](https://github.com/millicast/millicast-sdk/actions/workflows/check-tests.yml/badge.svg?branch=main)](https://github.com/millicast/millicast-sdk/actions/workflows/check-tests.yml)

This Software Development Kit (SDK) for JavaScript allows developers to simplify Millicast services integration into their own web apps.

## Table of Contents
- [Millicast SDK for JavaScript](#millicast-sdk-for-javascript)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
    - [Publisher app](#publisher-app)
    - [Viewer app](#viewer-app)
  - [API Reference](#api-reference)
  - [Samples](#samples)
  - [JS Frameworks](#js-frameworks)
    - [React Native](#react-native)
  - [SDK developer information](#sdk-developer-information)
  - [License](#license)


## Installation
You can use the CDN version of the SDK adding this tag to your document's `<head>`. Then `millicast` global variable will be available to use it.
```html
<script src='https://cdn.jsdelivr.net/npm/@millicast/sdk@latest/dist/millicast.umd.js'></script>
```

Or if you are building an application with Node.js, you can install the SDK package to your dependencies.


```sh
npm i --save @millicast/sdk
```

## Basic Usage
This simple example will show how to broadcast the user camera and microphone to Millicast Media Servers and viewing it.

You will need a Millicast account and a valid publishing token that you can find it in your dashboard ([link here](https://dash.millicast.com/#/signin)).


### Publisher app

In vanilla JavaScript:

`publisher.html`

```html
<html>
  <head>
    <!-- Import the Millicast JS SDK -->
    <script src="https://cdn.jsdelivr.net/npm/@millicast/sdk@latest/dist/millicast.umd.js"></script>
  </head>

  <body>
    <script type="module">
      const yourPublishingToken = "..."
      const yourStreamName = "..."

      // Define callback for generate new tokens
      const tokenGenerator = () => millicast.Director.getPublisher({
        token: yourPublishingToken,
        streamName: yourStreamName
      })

      // Create a new instance
      const millicastPublish = new millicast.Publish(yourStreamName, tokenGenerator)

      // Get user camera and microphone
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

      // Publishing options
      const broadcastOptions = {
        mediaStream
      }

      // Start broadcast
      try {
        await millicastPublish.connect(broadcastOptions)
      } catch (e) {
        console.log('Connection failed, handle error', e)
      }
    </script>
  </body>
</html>
```

Please be sure to set up the credentials filling up the `yourStreamName` and `yourPublishingToken` fields.


### Viewer app

In vanilla JavaScript:

`viewer.html`

```html
<html>
  <head>
    <!-- Import the Millicast JS SDK -->
    <script src="https://cdn.jsdelivr.net/npm/@millicast/sdk@latest/dist/millicast.umd.js"></script>
  </head>

  <body>
    <video id="my-video" controls autoplay muted></video>

    <script type="module">
      // Get media element
      const video = document.getElementById('my-video')

      // Set the credentials for the streaming
      const yourStreamName = "..."
      const yourStreamAccountId = "..."

      // Define callback for generate new token
      const tokenGenerator = () => millicast.Director.getSubscriber({
        streamName: yourStreamName,
        streamAccountId: yourStreamAccountId
      })

      // Create a new instance
      const millicastView = new millicast.View(yourStreamName, tokenGenerator, video)

      // Start connection to publisher
      try {
        await millicastView.connect()
      } catch (e) {
        console.log('Connection failed, handle error', e)
      }
    </script>
  </body>
</html>
```

Please be sure to set up the credentials filling up the `yourStreamName` and `yourStreamAccountId` fields.

## API Reference
You can find the latest, most up to date, SDK documentation at our [API Reference page](https://millicast.github.io/millicast-sdk/). There are more examples with every module available.

## Samples
In this repo there are two packages that implement a broadcaster and viewer application using the SDK.
You can clone this repo and following the steps indicated in each example:
* [millicast-publisher-demo](https://github.com/millicast/millicast-sdk/tree/main/packages/millicast-publisher-demo#readme)
* [millicast-viewer-demo](https://github.com/millicast/millicast-sdk/tree/main/packages/millicast-viewer-demo#readme)
* [millicast-webaudio-delay-demo](https://github.com/millicast/millicast-sdk/tree/main/packages/millicast-webaudio-delay-demo#readme)

## JS Frameworks

This section is intended to explain how properly integrate this SDK with different JS frameworks, with links to official guides that will contain a more step by step oriented explanation on how to do it. 

Right now, we only have a React Native guide.

### React Native Integration
This SDK can be used for React Native based projects. In order to accomplish this integration, some configuration steps are needed. This library assumes all webRTC methods are natively defined (usually, inside web browsers). However this is not the case for native Android/iOS native applications. In order to solve this, we have tested and worked along with [React Native webRTC project](https://github.com/react-native-webrtc/react-native-webrtc) for this purpose. 

Check out this guide on [how to integrate Millicast JS SDK with React Native webRTC](https://docs.dolby.io/streaming-apis/docs/rn)!

## SDK developer information
To develop and contribute to this project, there are some instructions of how to set up your environment to start contributing. [Follow this link.](https://github.com/millicast/millicast-sdk/blob/main/developer-info.md)

## License
Please refer to [LICENSE](https://github.com/millicast/millicast-sdk/blob/main/LICENSE) file.
