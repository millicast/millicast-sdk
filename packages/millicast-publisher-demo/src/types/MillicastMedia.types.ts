export type MillicastMediaOptinos = {
  constraints: MediaStreamConstraints
  streamName: String
}

export type MediaDevicesInfo = {
  audioinput: InputDeviceInfo[]
  videoinput: InputDeviceInfo[]
  audiooutput: InputDeviceInfo[]
}
