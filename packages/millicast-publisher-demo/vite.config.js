import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: "MILLICAST_",
  build: {
    lib: {
      entry: "src/publisher.js",
      name: "publisher",
      fileName: "publisher",
      formats: ["umd"]
    },
  },
  preview: {
    port: 10001
  }
})