# @millicast/sdk

## 0.6.0

### Minor Changes

- 576652c: Added support for ABR strategy and iniital bitrate for the viewer.

## 0.5.0

### Minor Changes

- 6304c52: Added forceSmooth to viewer connect options.

### Patch Changes

- 8b24ea1: Improved support for frame metadata extraction on older browsers
- 4dfc848: Optimized the bundle size.
- 6304c52: Removed `onMetadata` event which was already deprecated. This has been superceded by `metadata` as of v0.3.0

## 0.4.0

### Minor Changes

- 5d25d25: Aligning types for sourceId property within project method and global types .d.ts file
  Added `metadata` event to documentation
  Updated DRM SDK and suppressed DRM verbose logging.
  Updated `@dolbyio/webrtc-stats` to newer version.

## 0.3.2

### Patch Changes

- Revert View mediaElement being removed

## 0.3.1

### Patch Changes

- e84dc75: Fixed build issue with Vite

## 0.3.0

### Minor Changes

- 43582cf: Added DRM support

### Patch Changes

- 1e19119: Fixed the excessive waiting time to resume the video playback when stream beomes active from inactive
- 2a57672: Fix security vulnerabilities
- 9d54c92: fixed bug: no video when the main source id is not null
- cff3555: Avoid connecting when A+V are disabled

## 0.2.1

### Patch Changes

- 635e55e: Added bitrateBitsPerSecond stats attribute. Now bitrate attribute is shown in Bytes per second and bitrateBitsPerSecond in bits per second.
- 1d7fc65: Add connection duration to timestamp.
- 405861e: Fix security vulnerabilities.
- 22b150f: Metadata UUID is now optional.

## 0.2.0

### Minor Changes

- d996963: Allow the user to configure the stats timeout value
- 332b9bf: Improve build time performance
- ec98d00: add hot reload in sdk

### Patch Changes

- 955d1c3: Let the browser determine the available codecs on Firefox
- ff4f101: Deprecate the old UUID and use a new one for messages that include a timecode
- ea41a2e: When enabling simulcast, first check if there is video in the SDP payload
- ff4f101: Add in a timecode for SDK generated messages as well
- ff4f101: update the metadata event triggered to be \'metadata\' instead of \'onMetadata\'
- 11fe87d: Block viewer from trying to update the bitrate, because it\'s not a permitted operation

## 0.1.46

### Patch Changes

- 448bc44: New 'history' property added to the diagnose method response which contains recent events. Two new diagnose parameters, 'historySize' and 'minLogLevel', added to customize diagnose method history property.
- 86feed2: Update docs allowing simulcast to all Chromium based browsers
- ed91010: Added MILLICAST_DIRECTOR_ENDPOINT as a environment variable for demos apps to set Director's endpoint as pleased
- 5bd8ef5: Stats are now initialized by default. Logger.diagnose method changed to accept an object as parameter, with statsCount, historySize, minLogLevel, statsFormat.
- faef94f: Deprecated the streamName argument in publish and view
- 3bc547c: Added SEI user unregistered data extraction and insertion for H.264 codec.
- 661f150: Added streamViewId variable in Signaling instance when subscribing to a stream.

## 0.1.44

### Patch Changes

- 4149116: added missed layer info in view command
- 4a44f4b: Added Logger.diagnose(statsCount) function to get useful debugging information
- 4a44f4b: Added changesets for changelog control
