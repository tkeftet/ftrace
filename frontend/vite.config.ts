import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true, // allows any tunnel domain (ngrok, cloudflare, etc.)
    proxy: {
      // Forward REST API calls to the backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        headers: { origin: "http://localhost:5173" },
      },
      // Socket.io connects directly to the backend via VITE_SOCKET_URL — not proxied here.
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy/stable third-party deps into their own chunks so the
        // main app bundle stays small and these chunks can be cached across
        // deploys. Function form (Rollup 4 dropped the object shorthand).
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@mui/x-data-grid")) return "mui-grid";
          if (id.includes("@mui/") || id.includes("@emotion/")) return "mui";
          if (id.includes("@tanstack/react-query")) return "query";
          if (
            id.includes("react-hook-form") ||
            id.includes("@hookform/") ||
            id.includes("/zod/")
          ) {
            return "forms";
          }
          if (
            /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(
              id,
            )
          ) {
            return "react";
          }
          return undefined;
        },
      },
    },
  },
});
