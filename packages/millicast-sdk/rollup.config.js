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

// For UMD, we want to bundle most dependencies
const umdPlugins=[
  json(),
  typescript(),
  resolve({
    extensions: ['.js', '.ts'],
    browser: true, // Use browser-friendly versions
    preferBuiltins: false // Don't prefer Node.js built-ins
  }),
  commonjs()
];

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

const umdExternalModules=[
  // Only include modules that you expect to be loaded globally
  // Remove most of these unless they're definitely available as global scripts
];

export default [
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    external: externalModules,
    plugins: plugins
  },
  // UMD build - bundles dependencies
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/millicast.umd.js',
      format: 'umd',
      name: 'millicast', 
      sourcemap: true
    },
    external: umdExternalModules,
    plugins: umdPlugins
  }
];
