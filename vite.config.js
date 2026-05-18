import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react({
      include: /\.(jsx|js|tsx|ts)$/,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png', 'robots.txt'],
      manifest: {
        name: 'KMS Digital - Posyandu Lebakwangi',
        short_name: 'KMS Digital',
        description:
          'Kartu Menuju Sehat Digital untuk Posyandu - pantau pertumbuhan balita, forum tanya jawab, dan laporan kesehatan',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#FF7070',
        background_color: '#f9f9fb',
        lang: 'id',
        categories: ['health', 'medical', 'education'],
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://api.kmslebakwangi.com' &&
              /\/api\/(artikel|kategori|desa|posyandu)/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-public-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://api.kmslebakwangi.com' &&
              /\/api\/(anak|pengukuran|laporan|orang-tua|post|comment|profile)/.test(
                url.pathname
              ),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-private-cache',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  esbuild: {
    loader: 'jsx',
    include: /\.(jsx|js|tsx|ts)$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: 'hidden',
  },
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    css: false,
  },
});
