import webWorkerLoader from 'rollup-plugin-web-worker-loader'
import json from '@rollup/plugin-json'

export default [
  // ES Module build (existing)
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
      'semantic-sdp',
      './drm/rtc-drm-transform.js'
    ],
    plugins: [
      webWorkerLoader({
        targetPlatform: 'browser',
        inline: true,
        preserveSource: false
      }),
      json()
    ]
  },
  // UMD build for browser global usage (NEW)
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/millicast.umd.js',
      format: 'umd',
      name: 'millicast',  // This exposes window.millicast
      globals: {
        'events': 'events',
        'eventemitter3': 'EventEmitter3',
        're-emitter': 'reEmitter',
        'transaction-manager': 'TransactionManager',
        'jwt-decode': 'jwtDecode',
        'Base64': 'Base64',
        'js-base64': 'Base64',
        'valibot': 'valibot',
        'js-logger': 'Logger',
        '@dolbyio/webrtc-stats': 'WebRTCStats',
        'ua-parser-js': 'UAParser',
        'semantic-sdp': 'SemanticSDP'
      }
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
      'semantic-sdp',
      './drm/rtc-drm-transform.js'
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
]
