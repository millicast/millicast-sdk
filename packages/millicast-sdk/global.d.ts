export {}

declare global {
  interface RTCRtpSender {
    createEncodedStreams?: () => { readable: ReadableStream; writable: WritableStream }
  }
  interface RTCRtpReceiver {
    createEncodedStreams?: () => { readable: ReadableStream; writable: WritableStream }
  }
}
