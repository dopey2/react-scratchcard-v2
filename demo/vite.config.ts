import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/react-scratchcard-v2/',
  server: {
    port: 3000,
    open: true,
    host: true,
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      'react-scratchcard-v2': path.resolve(__dirname, '../src/index.ts')
    }
  }
});
