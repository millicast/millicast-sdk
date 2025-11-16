import webWorkerLoader from 'rollup-plugin-web-worker-loader'
import json from '@rollup/plugin-json'

export default {
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
    'valibot',
    'js-logger',
    '@dolbyio/webrtc-stats',
    'ua-parser-js',
    'semantic-sdp'
  ],
  plugins: [
    webWorkerLoader({
      targetPlatform: 'browser',
      inline: true,
      preserveSource: false
    }),
    json()
  ]
}
