import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Millicast',
      formats: ['es', 'umd'],
      fileName: format => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    rollupOptions: {
      external: ['re-emitter', 'events', 'ua-parser-js', '@dolbyio/webrtc-stats'],
      output: {
        globals: {
          're-emitter': 'reemit',
          events: 'events',
          'ua-parser-js': 'UAParser',
          '@dolbyio/webrtc-stats': 'WebRTCStats',
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
  },
  plugins: [
    dts({
      // Explicitly point to the package's tsconfig
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      insertTypesEntry: true,
      copyDtsFiles: true,
      // Helps ensure the types are bundled into the correct dist folder
      outDir: resolve(__dirname, '../../dist/packages/millicast-sdk'),
    }),
  ],
  worker: {
    format: 'es',
    plugins: () => [],
  },
})
