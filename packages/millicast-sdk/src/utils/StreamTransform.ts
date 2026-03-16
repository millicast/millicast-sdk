// Insertable streams for `MediaStreamTrack` is supported.
// Uses global type augmentation from global.d.ts for createEncodedStreams
export const supportsInsertableStreams: boolean =
  typeof window !== 'undefined' &&
  !!window.RTCRtpSender &&
  typeof window.RTCRtpSender.prototype.createEncodedStreams === 'function' &&
  !!window.RTCRtpReceiver &&
  typeof window.RTCRtpReceiver.prototype.createEncodedStreams === 'function'


// WebRTC RTP Script Transform is supported
export const supportsRTCRtpScriptTransform = typeof window !== 'undefined' && 'RTCRtpScriptTransform' in window
