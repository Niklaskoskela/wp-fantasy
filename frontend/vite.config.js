import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  optimizeDeps: {
    exclude: ['shared'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxying:', req.method, req.url, '→', 'http://localhost:5050' + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err.message, 'for', req.url);
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist', // Output to dist folder for consistency with backend expectations
  },
});