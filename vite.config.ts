import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    proxy: {
      '/grants': {
        target: 'https://api.endaoment.org',
        changeOrigin: true,
        rewrite: () => '/v1/transfers/grants/fund/1cf2305e-9fd5-4ea1-9eb5-1970ee6bdf17',
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  }
});