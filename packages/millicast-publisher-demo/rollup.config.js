import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from '@rollup/plugin-terser'
import { babel } from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'

export default [
  {
    input: 'src/publisher.js',
    output: {
      name: 'publisher',
      file: 'dist/publisher.umd.js',
      format: 'umd',
      globals: {
        '@millicast/sdk': 'millicastSdkJs'
      }
    },
    external: ['@millicast/sdk'],
    plugins: [
      nodeResolve({preferBuiltins: false, browser: true }),
      commonjs({
        include: [/node_modules/, /src/],
        transformMixedEsModules: true
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
      }),
      ...watchPlugins
    ]
  }
]