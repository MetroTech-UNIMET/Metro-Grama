import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      {
        find: "@components",
        replacement: path.resolve(__dirname, "src/components"),
      },
    ],
  },
  preview: {
    host: "0.0.0.0",
    port: 1403,
  },
  server: {
    host: "0.0.0.0",
    port: 1403,
  },
});
