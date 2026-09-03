import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    global: 'globalThis'
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