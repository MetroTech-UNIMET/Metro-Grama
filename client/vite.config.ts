/// <reference types="vitest" />
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';

import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { devtools } from '@tanstack/devtools-vite';

import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackStart({
      router: {
        routeFileIgnorePattern: '((components|hooks)|functions\\.ts|queryParams\\.ts)',
      },
    }),
    devtools(),
    viteReact(),
    tailwindcss(),
  ],
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
    outDir: 'dist',
  },
  preview: {
    host: '0.0.0.0',
    port: 1403,
  },
  server: {
    host: '0.0.0.0',
    port: 1403,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
