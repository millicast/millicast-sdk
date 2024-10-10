// Insertable streams for `MediaStreamTrack` is supported.
export const supportsInsertableStreams: boolean =
  window.RTCRtpSender &&
  !!window.RTCRtpSender.prototype.createEncodedStreams &&
  typeof window.RTCRtpSender.prototype.createEncodedStreams === 'function' &&
  window.RTCRtpReceiver &&
  !!window.RTCRtpReceiver.prototype.createEncodedStreams

// WebRTC RTP Script Transform is supported
export const supportsRTCRtpScriptTransform = 'RTCRtpScriptTransform' in window
