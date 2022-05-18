import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import injectProcessEnv from 'rollup-plugin-inject-process-env'
import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import serve from 'rollup-plugin-serve'

import getEnvironment from './env'

const environment = getEnvironment()

let watchPlugins = []
if (process.env.ROLLUP_WATCH) {
  watchPlugins = [
    serve({
      open: true,
      contentBase: 'dist',
      port: 10002
    })
  ]
}

export default [
  {
    input: 'src/viewer.js',
    output: {
      name: 'viewer',
      file: 'dist/viewer.umd.js',
      format: 'umd',
      globals: {
        'millicast-sdk': 'millicastSdkJs'
      }
    },
    plugins: [
      nodeResolve({ preferBuiltins: false }),
      commonjs({
        include: [/node_modules/, /src/],
        transformMixedEsModules: true
      }),
      injectProcessEnv({
        ...environment
      }),
      babel({
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env'],
        exclude: ['/node_modules/**'],
        plugins: ['@babel/plugin-transform-runtime'],
        inputSourceMap: false,
        sourceMaps: 'inline'
      }),
      terser(),
      cleanup({
        comments: 'none',
        sourcemap: false
      }),
      ...watchPlugins
    ]
  }
]
