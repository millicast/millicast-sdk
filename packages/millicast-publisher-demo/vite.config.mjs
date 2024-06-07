import { defineConfig } from "vite";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';

export default defineConfig({
  envPrefix: "MILLICAST_",
  server: {
    port: 10001,
    watch: {
      include: ['dist/**'],
    }
  },
  build: {
    watch: {
      include: "src/**"
    },
    lib: {
      entry: "src/publisher.js",
      name: "publisher",
      fileName: (format) => `publisher.${format}.js`,
      formats: ["umd"]
    },
    rollupOptions: {
      plugins: [
        nodeResolve({ preferBuiltins: false }),
        commonjs({
          include: [/node_modules/, /src/],
          transformMixedEsModules: true
        }),
        babel({
          babelHelpers: 'runtime',
          presets: [['@babel/preset-env', { targets: "defaults" }]],
          exclude: /node_modules/,
          plugins: ['@babel/plugin-transform-runtime']
        }),
        terser(),
        cleanup({
          comments: 'none',
          sourcemap: false
        })
      ]
    }
  }
});