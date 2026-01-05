import { defineConfig, mergeConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'path'
import pkg from './package.json'

export default defineConfig({
  root: __dirname,
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
  },

  plugins: [
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      outDir: './dist',
      include: ['src/**/*.ts', 'src/**/*.js'],
      exclude: ['package.json', 'src/drm/*'],
      insertTypesEntry: true,
      copyDtsFiles: true,
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'src/workers/*.ts',
          dest: 'workers',
        },
        {
          src: 'src/drm/*',
          dest: 'drm',
        },
      ],
    }),
  ],

  build: {
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'millicast',
      fileName: format => `millicast.${format === 'es' ? 'esm' : format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [
        'events',
        're-emitter',
        'transaction-manager',
        'jwt-decode',
        'js-base64',
        'valibot',
        'js-logger',
        '@dolbyio/webrtc-stats',
        'ua-parser-js',
        'semantic-sdp',
      ],
      output: {
        globals: {
          events: 'events',
          're-emitter': 'reemit',
          'transaction-manager': 'TransactionManager',
          'jwt-decode': 'jwtDecode',
          'js-base64': 'jsBase64',
          valibot: 'v',
          'js-logger': 'Logger',
          '@dolbyio/webrtc-stats': 'WebRTCStats',
          'ua-parser-js': 'UAParser',
          'semantic-sdp': 'semanticSdp',
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
})
