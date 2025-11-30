import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: [
      "dcc4ck40gw4ss888084woocc.hosting.codeyourfuture.io",
      ".hosting.codeyourfuture.io", // Allow all subdomains
    ],
  },
});
