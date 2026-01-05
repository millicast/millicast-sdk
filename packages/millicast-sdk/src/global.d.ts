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

  // Fixes the 'env' does not exist on 'ImportMeta'
  interface ImportMetaEnv {
    readonly PACKAGE_VERSION: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {}
