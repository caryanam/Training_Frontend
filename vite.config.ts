import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/rtc/v1/validate": {
        target: "https://livekit.nexorainstitute.in",
        rewrite: (path) => path.replace(/^\/rtc\/v1\/validate/, "/rtc/validate"),
        changeOrigin: true,
      },
      "/rtc/v1": {
        target: "https://livekit.nexorainstitute.in",
        rewrite: (path) => path.replace(/^\/rtc\/v1/, "/rtc"),
        ws: true,
        changeOrigin: true,
      },
      "/rtc": {
        target: "https://livekit.nexorainstitute.in",
        ws: true,
        changeOrigin: true,
      },
      "/twirp": {
        target: "https://livekit.nexorainstitute.in",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

