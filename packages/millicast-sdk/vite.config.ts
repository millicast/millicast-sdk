import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { nodePolyfills } from 'vite-plugin-node-polyfills'; 
import { resolve } from 'path';
import pkg from './package.json';

export default defineConfig({
  root: __dirname,
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
  },

  plugins: [
    nodePolyfills({
      include: ['events'],
    }),
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
      formats: ['es', 'umd'],
      fileName: format => {
        if (format === 'es') return 'millicast.mjs';
        return 'millicast.umd.js';
      },
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
  worker: {
    format: 'es',
  },
});
