/// <reference types='vitest' />
import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'
import * as path from 'path'
import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/millicast-sdk',

  plugins: [
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    outDir: '../../dist/packages/millicast-sdk',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: 'src/index.ts',
      name: 'millicast',
      fileName: 'millicast',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [],
    },
    target: ['safari11', 'firefox66'],
  },
})