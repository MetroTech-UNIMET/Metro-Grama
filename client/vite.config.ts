import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from '@tanstack/router-plugin/vite'

import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [ tanstackRouter(),react(), tailwindcss(),],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      {
        find: '@components',
        replacement: path.resolve(__dirname, 'src/components'),
      },
      {
        find: '@ui',
        replacement: path.resolve(__dirname, 'src/components/ui'),
      },
      {
        find: '@utils',
        replacement: path.resolve(__dirname, 'src/lib/utils'),
      },
    ],
  },
  build: {
    outDir: '../www-build',
  },
  preview: {
    host: '0.0.0.0',
    port: 1403,
  },
  server: {
    host: '0.0.0.0',
    port: 1403,
  },
});
