import pkg from './package.json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import cleanup from 'rollup-plugin-cleanup'
import injectProcessEnv from 'rollup-plugin-inject-process-env'
import json from '@rollup/plugin-json'

import getEnvironment from './env'
const environment = getEnvironment()

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'millicast',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs({
        include: [/node_modules/, /src/],
        transformMixedEsModules: true
      }),
      json(),
      injectProcessEnv({
        ...environment
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
  },
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs({
        include: [/node_modules/, /src/],
        transformMixedEsModules: true
      }),
      json(),
      injectProcessEnv({
        ...environment
      }),
      babel({
        babelHelpers: 'bundled',
        presets: [['@babel/preset-env', { targets: { node: 6 } }]],
        exclude: ['/node_modules/**']
      })
    ]
  }
]
