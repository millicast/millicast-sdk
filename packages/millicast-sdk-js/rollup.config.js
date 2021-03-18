import pkg from "./package.json";
import nodeResolve from "@rollup/plugin-node-resolve";
import babel from '@rollup/plugin-babel';
import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-node-polyfills";
import { terser } from "rollup-plugin-terser";

export default [
  // browser-friendly UMD build
  {
    input: "src/index.js",
    output: {
      name: "millicast",
      file: pkg.browser,
      format: "umd",
      globals: {
        events: 
        "EventEmmiter",
        "transaction-manager": "TransactionManager",
      },
    },
    plugins: [
      nodePolyfills(),
      nodeResolve(),
      commonjs(),
      babel({ 
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-transform-runtime']
      }),
      terser()
    ],
  },

  {
    input: "src/index.js",
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [nodePolyfills(), nodeResolve(), commonjs()],
  },
];
