import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), basicSsl(), svgr()],
  server: {
    host: true,
    port: 5173,
    https: true,
    proxy: {
      "/api": {
        target: "http://192.168.10.126:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://192.168.10.126:5000",
        changeOrigin: true,
      },
    },
  },
});
