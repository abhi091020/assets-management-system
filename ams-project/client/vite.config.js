import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverUrl = env.VITE_SERVER_URL || "http://localhost:5000";

  return {
    plugins: [react(), basicSsl(), svgr()],
    server: {
      host: true,
      port: 5173,
      https: true,
      proxy: {
        "/api": {
          target: serverUrl,
          changeOrigin: true,
        },
        "/uploads": {
          target: serverUrl,
          changeOrigin: true,
        },
      },
    },
  };
});