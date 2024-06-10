# @millicast/sdk

## 0.1.45

### Patch Changes

- 448bc44: New 'history' property added to the diagnose method response which contains recent events. Two new diagnose parameters, 'historySize' and 'minLogLevel', added to customize diagnose method history property.
- 86feed2: Update docs allowing simulcast to all Chromium based browsers
- ed91010: Added MILLICAST_DIRECTOR_ENDPOINT as a environment variable for demos apps to set Director's endpoint as pleased
- 5bd8ef5: Stats are now initialized by default. Logger.diagnose method changed to accept an object as parameter, with statsCount, historySize, minLogLevel, statsFormat.
- faef94f: Deprecated the streamName argument in publish and view
- 3bc547c: Added SEI user unregistered data extraction and insertion for H.264 codec.

## 0.1.44

### Patch Changes

- 4149116: added missed layer info in view command
- 4a44f4b: Added Logger.diagnose(statsCount) function to get useful debugging information
- 4a44f4b: Added changesets for changelog control
