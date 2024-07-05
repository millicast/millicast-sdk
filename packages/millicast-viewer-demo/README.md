# Millicast Viewer Demo

The Viewer demo application demonstrates playback capability that you can add to your application using the Millicast SDK. You can use it to experience and test receiving high-value content with ultra-low latency.

## Getting started

1. Go to the [Dolby.io Streaming dashboard](https://dashboard.dolby.io/) and select your publish token. If you do not have a token, create it by clicking the **create** button.

2. Locate your `account ID` in the **token details** tab and copy the token.

3. Select the **publishing** tab and copy your `stream name`.

4. Open the Millicast SDK in a code editor, create a `.env` file in the `millicast-viewer-demo` folder, and add the following data to the file: 

```sh
MILLICAST_STREAM_NAME=yourStreamName
MILLICAST_ACCOUNT_ID=yourAccountId
```

This content is also available in the `.env.sample` file.

5. Replace `yourStreamName` and `yourAccountId` with the data copied from the dashboard.

6. Open a terminal in the `millicast-viewer-demo` folder.

7. Install all dependencies:
```sh
npm ci
```
8. Run the application:
```sh
npm start
```

9. Open `http://localhost:10002` and test the application.

To receive a stream, you need to broadcast it first. You can do it either via the Dolby.io dashboard by clicking the **broadcast** button, located next to your token, or you can use the [Publisher](../millicast-publisher-demo/) demo application. After you start broadcasting, the Viewer application will be able to play the streamed content.

## Custom connect options through URL parameters
This demo application allows the user to set some URL parameters for configuring stream connection options:

| Name                | Description                                                                                    | Default value
| --- | --- | --- |
| **url**             | WebSocket URL                                                                                  | `wss://turn.millicast.com/millisock`
| **accountId**       | Publisher's account ID.                                                                        | `null`
| **streamName**      | Publisher's stream name.                                                                       | `null`
| **metadata**        | Enable metadata extraction.                                                                    | `false`
| **disableVideo**    | Set to disable video from the stream.                                                          | `false`
| **disableAudio**    | Set to disable audio from the stream.                                                          | `false`
| **muted**           | Set to mute the video player at first connection.                                              | `true`
| **autoplay**        | Set to play the video at first connection.                                                     | `true`
| **autoReconnect**   | Set to enable auto reconnection.                                                               | `true`
| **disableControls** | Set to disable video player controls, such us volume, fullscreen, play/pause.                  | `false`
| **disableVolume**   | Set to disable volume control.                                                                 | `false`
| **disablePlay**     | Set to disable play/pause control.                                                             | `false`
| **disableFull**     | Set to disable fullscreen control.                                                             | `false`

## Introducing updates
After introducing any changes to the `public` directory, use the following command:
```
npm run prepare
```

