import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/index.js',
      name: 'millicast',
      formats: ['es', 'cjs', 'umd'],
      fileName: 'millicast'
    }
  }
})