import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    global: "(typeof globalThis !== 'undefined' ? globalThis : self)"
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