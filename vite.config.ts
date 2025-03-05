import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

import vueDevTools from 'vite-plugin-vue-devtools'
import graphql from '@rollup/plugin-graphql'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    graphql(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Koshtorys',
        short_name: 'Koshtorys',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        start_url: '/',
        display: 'fullscreen',
        background_color: '#0C111D',
        theme_color: '#FFFFFF',
      },
      // workbox: {
      //   globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      //   cleanupOutdatedCaches: true,
      //   clientsClaim: true,
      //   skipWaiting: true,
      //   runtimeCaching: [
      //     {
      //       urlPattern: ({ request }) =>
      //         request.destination === 'script' || request.destination === 'style',
      //       handler: 'NetworkFirst',
      //       options: {
      //         cacheName: 'bundles-cache',
      //         expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
      //       },
      //     },
      //     {
      //       urlPattern: ({ request }) => request.destination === 'image',
      //       handler: 'CacheFirst',
      //       options: {
      //         cacheName: 'images-cache',
      //         expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      //       },
      //     },
      //   ],
      // },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
