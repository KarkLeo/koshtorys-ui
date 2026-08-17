/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { VitePWA } from 'vite-plugin-pwa';
import vueDevTools from 'vite-plugin-vue-devtools';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const buildDate = new Date().toISOString();

// The Vue devtools plugin injects a client that reaches for the devtools app context on
// teardown. Inside the headless-browser storybook project that context does not exist, so every
// story file ended its run with an unhandled `Cannot read properties of undefined (reading 'app')`
// rejection — 35 of them, enough to fail the vitest run even though all stories passed.
// Devtools are a dev-server convenience, so they are simply left out under test.
const isTest = Boolean(process.env.VITEST);

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), ...(isTest ? [] : [vueDevTools()]), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'icons/*.png'],
    manifest: {
      name: 'Koshtorys',
      short_name: 'Koshtorys',
      icons: [{
        src: '/icons/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      }, {
        src: '/icons/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }, {
        src: '/icons/pwa-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      }, {
        src: '/icons/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }],
      start_url: '/',
      display: 'fullscreen',
      background_color: '#0C111D',
      theme_color: '#0C111D'
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [{
        urlPattern: ({
          request
        }) => request.destination === 'script' || request.destination === 'style',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'bundles-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7
          }
        }
      }, {
        urlPattern: ({
          request
        }) => request.destination === 'image',
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30
          }
        }
      }]
    }
  })],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(buildDate)
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        plugins: [
        // The plugin will run tests for the stories defined in your Storybook config
        // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
        storybookTest({
          configDir: path.join(dirname, '.storybook')
        })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{
              browser: 'chromium'
            }]
          }
        }
      }
    ]
  }
});