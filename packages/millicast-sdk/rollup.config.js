import pkg from './package.json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import cleanup from 'rollup-plugin-cleanup'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'

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
      replace({
        values: {
          'process.env.MILLICAST_DIRECTOR_ENDPOINT': undefined,
          'process.env.MILLICAST_TURN_SERVER_LOCATION': undefined,
          'process.env.MILLICAST_EVENTS_LOCATION': undefined,
          'process.env.MILLICAST_FIXED_ACCOUNT_ID': undefined
        },
        preventAssignment: true
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
      babel({
        babelHelpers: 'bundled',
        presets: [['@babel/preset-env', { targets: { node: 6 } }]],
        exclude: ['/node_modules/**']
      })
    ]
  }
]
