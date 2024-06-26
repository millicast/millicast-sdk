import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: "MILLICAST_",
  server: {
    port: 10005,
    watch: {
      include: ['dist/**'],
    }
  },
  build: {
    lib: {
      entry: "src/multiviewer.js",
      name: "multiviewer",
      fileName: (format) => `multiviewer.${format}.js`,
      formats: ["umd"]
    }
  },
  preview: {
    port: 10005
  }
})