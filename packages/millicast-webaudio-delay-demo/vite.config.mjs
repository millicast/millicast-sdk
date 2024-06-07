import { defineConfig } from 'vite'

export default defineConfig({
  envPrefix: 'MILLICAST_',
  server: {
    port: 10003,
    watch: {
      include: ['dist/**'],
    }
  },
  build: {
    lib: {
      entry: 'src/viewer.js',
      name: 'viewer',
      fileName: (format) => `viewer.${format}.js`,
      formats: ['umd']
    }
  },
  preview: {
    port: 10003
  }
})
