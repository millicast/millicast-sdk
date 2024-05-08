import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: "MILLICAST_",
  build: {
    lib: {
      entry: "src/viewer.js",
      name: "viewer",
      fileName: "viewer",
      formats: ["umd"]
    }
  },
  preview: {
    port: 10002
  }
})