import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        toji: path.resolve(__dirname, 'toji-study/index.html'),
      },
    },
  },
  server: {
    // Set DISABLE_HMR=true to stop file watching from reloading the page while agents edit files.
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
