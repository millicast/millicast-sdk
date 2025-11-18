import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

const plugins=[
  json(),
  typescript(),
  resolve({
    extensions: ['.js', '.ts']
  }),
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
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    external: externalModules,
    plugins: plugins
  }
];