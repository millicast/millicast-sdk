import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import injectProcessEnv from 'rollup-plugin-inject-process-env'
import dotenv from 'dotenv'
import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'

const environment = dotenv.config()

export default [
  {
    input: 'src/publisher.js',
    output: {
      name: 'publisher',
      file: 'dist/publisher.umd.js',
      format: 'umd',
      globals: {
        'millicast-sdk-js': 'millicastSdkJs'
      }
    },
    plugins: [
      nodeResolve({ preferBuiltins: false }),
      commonjs({
        include: [/node_modules/, /src/],
        transformMixedEsModules: true
      }),
      injectProcessEnv({
        ...environment.parsed
      }),
      babel({
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env'],
        exclude: ['/node_modules/**'],
        plugins: ['@babel/plugin-transform-runtime']
      }),
      terser(),
      cleanup({
        comments: 'none',
        sourcemap: false
      })
    ]
  }
]
