import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

// Define the common plugins array
const plugins=[
  json(),
  resolve({
    extensions: ['.js']
  }),
  // Converts CommonJS dependencies to ES Modules for bundling
  commonjs()
];

// Define external modules once
const externalModules=[
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
];

export default [
  // ES Module build (The modern standard)
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'es' // 'es' or 'esm'
    },
    external: externalModules,
    plugins: plugins
  }
];