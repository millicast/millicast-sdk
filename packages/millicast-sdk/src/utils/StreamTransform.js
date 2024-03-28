// Insertable streams for `MediaStreamTrack` is supported.
export const supportsInsertableStreams = window.RTCRtpSender &&
    !!RTCRtpSender.prototype.createEncodedStreams &&
    window.RTCRtpReceiver &&
    !!RTCRtpReceiver.prototype.createEncodedStreams

// WebRTC RTP Script Transform is supported
export const supportsRTCRtpScriptTransform = 'RTCRtpScriptTransform' in window
