import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // Main React app entry point (for web development)
        main: resolve(__dirname, "src/index.html"),

        // Extension scripts (these don't use React)
        background: resolve(__dirname, "public/background.js"),
        "browser-icon": resolve(__dirname, "public/browser-icon.js"),
        sidepanelviews: resolve(__dirname, "public/sidepanelviews.js"),
        signin: resolve(__dirname, "public/signin.js"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep extension scripts in root of dist
          if (
            ["background", "browser-icon", "sidepanelviews", "signin"].includes(
              chunkInfo.name
            )
          ) {
            return "[name].js";
          }
          // Put other assets in assets folder
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          // Keep HTML files in root
          if (assetInfo.name && assetInfo.name.endsWith(".html")) {
            return "[name].[ext]";
          }
          return "assets/[name]-[hash].[ext]";
        },
      },
    },
    // Copy public assets
    copyPublicDir: true,
  },
  publicDir: "public",
});
