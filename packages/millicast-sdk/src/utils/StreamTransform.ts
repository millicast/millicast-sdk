/* eslint-disable */

// Insertable streams for `MediaStreamTrack` is supported.
export const supportsInsertableStreams: boolean =
  window.RTCRtpSender &&
  !!(window.RTCRtpSender.prototype as any)['createEncodedStreams'] &&
  typeof (window.RTCRtpSender.prototype as any)['createEncodedStreams'] === 'function' &&
  window.RTCRtpReceiver &&
  !!(window.RTCRtpReceiver.prototype as any)['createEncodedStreams']


// WebRTC RTP Script Transform is supported
export const supportsRTCRtpScriptTransform = 'RTCRtpScriptTransform' in window
