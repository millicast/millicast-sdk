import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    global: "(typeof globalThis !== 'undefined' ? globalThis : self)",
    // Bundled UMD deps (js-logger, ua-parser-js, Base64) must not register with a host AMD loader (e.g. webpack)
    'define.amd': 'undefined'
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/index.js',
      name: 'millicast',
      formats: ['es', 'cjs', 'umd'],
      fileName: 'millicast'
    },
    target: ['safari11','firefox66']
  },
})