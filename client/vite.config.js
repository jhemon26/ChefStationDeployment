import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const resolveProxyTarget = (apiUrl) => {
  try {
    return new URL(apiUrl).origin;
  } catch {
    return 'http://localhost:5000';
  }
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const proxyTarget = resolveProxyTarget(env.VITE_API_URL || 'http://localhost:5000/api');

  return {
    envDir: '..',
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
