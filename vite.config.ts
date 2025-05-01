
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
        configure: (proxy, options) => {
          // Add handler for proxy requests
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Log proxy request for debugging
            console.log('Proxy request:', req.url);
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Log proxy response headers for debugging
            console.log('Proxy response status:', proxyRes.statusCode);
            console.log('Proxy response headers:', proxyRes.headers);
          });
          
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
          });
        },
        rewrite: (path) => {
          // Extract the URL parameter from the path
          const url = new URL(path, 'http://localhost:8080');
          const targetUrl = url.searchParams.get('url');
          console.log('Rewriting proxy path to:', targetUrl);
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
