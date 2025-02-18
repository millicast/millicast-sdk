import typescript from '@rollup/plugin-typescript'
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

const getBundleConfig = (name, input) => (
  {
    input,
    output: {
      name,
      file: `dist/${name}.umd.js`,
      format: 'umd',
      globals: {
        'millicast-sdk': 'millicastSdkJs'
      }
    },
    plugins: [
      typescript(),
      nodeResolve({ preferBuiltins: false }),
      commonjs({
        include: [/node_modules/, /src/],
        transformMixedEsModules: true
      }),
      injectProcessEnv({
        ...environment
      }),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
        exclude: ['/node_modules/**']
      }),
      terser(),
      cleanup({
        comments: 'none',
        sourcemap: false
      }),
      ...watchPlugins
    ]
  }
)

export default [
  getBundleConfig('viewer', 'src/viewer.js'),
  getBundleConfig('worker', 'src/worker.ts')
]
