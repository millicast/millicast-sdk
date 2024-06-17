import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'millicast',
      formats: ['es', 'cjs', 'umd'],
      fileName: 'millicast'
    }
  }
})
