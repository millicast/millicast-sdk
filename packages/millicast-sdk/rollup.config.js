export default [
  // ES Module build
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'es'
    },
    external: [
      'events',
      'eventemitter3',
      're-emitter',
      'transaction-manager',
      'jwt-decode',
      'Base64',
      'js-base64',
      'valibot',
      'js-logger',
      '@dolbyio/webrtc-stats',
      'ua-parser-js',
      'semantic-sdp'
    ],
    plugins: []
  },
  // UMD build
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/millicast.umd.js',
      format: 'umd',
      name: 'millicast'
    },
    external: [
      'events',
      'eventemitter3',
      're-emitter',
      'transaction-manager',
      'jwt-decode',
      'Base64',
      'js-base64',
      'valibot',
      'js-logger',
      '@dolbyio/webrtc-stats',
      'ua-parser-js',
      'semantic-sdp'
    ],
    plugins: []
  }
]
