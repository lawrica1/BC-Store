import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "pwa-192.svg", "pwa-512.svg"],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: "BC Store",
        short_name: "BC Store",
        description: "Boutique, réparation et installation technique.",
        theme_color: "#080C14",
        background_color: "#080C14",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "/pwa-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,svg,png,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/localhost:4000\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "bc-store-api",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 300
              }
            }
          },
          {
            urlPattern: /\/products\/.*\.(?:png|jpg|jpeg|webp|svg)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "bc-store-product-images",
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    port: 3000
  },
  preview: {
    port: 3000
  }
});
