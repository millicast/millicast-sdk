import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    global: "(typeof globalThis !== 'undefined' ? globalThis : self)"
  },
  build: {
    sourcemap: 'inline',
    lib: {
      entry: 'src/index.js',
      name: 'millicast-debug',
      formats: ['umd'],
      fileName: 'millicast.debug'
    },
  }
})