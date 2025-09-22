import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173, // Porta do frontend
    strictPort: true,
    open: true,
    proxy: {
      // Proxy para todas as chamadas /api -> backend
      "/api": {
        target: "http://localhost:4444", // backend
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      // Proxy para logs ou endpoints específicos do backend
      "/logs": {
        target: "http://localhost:4444",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/logs/, "/logs"),
      },
    },
    allowedHosts: [
      "localhost",
      ".pythagora.ai",
    ],
    watch: {
      ignored: ["**/node_modules/**", "**/dist/**", "**/public/**", "**/log/**"],
    },
  },
});
