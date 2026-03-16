import 'vite/client'

declare global {
  // Fixes the 'createEncodedStreams' errors
  interface RTCRtpSender {
    createEncodedStreams?: () => {
      readable: ReadableStream
      writable: WritableStream
    }
  }
  interface RTCRtpReceiver {
    createEncodedStreams?: () => {
      readable: ReadableStream
      writable: WritableStream
    }
  }

  // Header extension negotiation API (not yet in standard TypeScript definitions)
  // See: https://w3c.github.io/webrtc-extensions/#rtcrtptransceiver-interface
  interface RTCRtpHeaderExtensionToNegotiate {
    uri: string
    direction?: RTCRtpTransceiverDirection | 'stopped'
  }

  interface RTCRtpTransceiverWithHeaderExtensions extends RTCRtpTransceiver {
    getHeaderExtensionsToNegotiate?: () => RTCRtpHeaderExtensionToNegotiate[]
    setHeaderExtensionsToNegotiate?: (extensions: RTCRtpHeaderExtensionToNegotiate[]) => void
  }

  // Fixes the 'env' does not exist on 'ImportMeta'
  interface ImportMetaEnv {
    readonly PACKAGE_VERSION: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {}
