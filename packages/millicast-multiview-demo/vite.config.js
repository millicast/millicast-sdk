import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: "MILLICAST_",
  build: {
    lib: {
      entry: "src/multiviewer.js",
      name: "multiviewer",
      fileName: "multiviewer",
      formats: ["umd"]
    }
  },
  preview: {
    port: 10005
  }
})