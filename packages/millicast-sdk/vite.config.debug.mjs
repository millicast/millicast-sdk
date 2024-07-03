import { defineConfig } from 'vite'

export default defineConfig({
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