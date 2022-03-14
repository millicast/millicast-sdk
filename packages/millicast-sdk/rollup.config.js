import pkg from './package.json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import cleanup from 'rollup-plugin-cleanup'
import json from '@rollup/plugin-json'
import filesize from 'rollup-plugin-filesize'

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
      babel({
        babelHelpers: 'runtime',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                safari: '12',
                firefox: '66'
              },
              useBuiltIns: 'usage',
              corejs: {
                version: pkg.devDependencies['core-js'],
                proposals: false
              }
            }
          ]
        ],
        exclude: ['/node_modules/**'],
        plugins: ['@babel/plugin-transform-runtime']
      }),
      terser(),
      cleanup({
        comments: 'none',
        sourcemap: false
      }),
      filesize()
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
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: 6,
                safari: '12',
                firefox: '66'
              },
              useBuiltIns: 'usage',
              corejs: {
                version: pkg.devDependencies['core-js'],
                proposals: false
              }
            }
          ]
        ],
        exclude: ['/node_modules/**']
      }),
      filesize()
    ]
  }
]
