
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to avoid CORS issues
      '/api/proxy': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => {
          // Extract the URL parameter from the path
          const url = new URL(path, 'http://localhost:8080');
          const targetUrl = url.searchParams.get('url');
          return targetUrl || path;
        },
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
