// Insertable streams for `MediaStreamTrack` is supported.
export const supportsInsertableStreams =
  window.RTCRtpSender &&
  'createEncodedStreams' in RTCRtpSender.prototype &&
  window.RTCRtpReceiver &&
  'createEncodedStreams' in RTCRtpReceiver.prototype

// WebRTC RTP Script Transform is supported
export const supportsRTCRtpScriptTransform = 'RTCRtpScriptTransform' in window
