import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/luna-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        id: '/luna-app/',
        name: 'Luna - Tu Ciclo',
        short_name: 'Luna',
        description: 'App de seguimiento menstrual con predicciones, síntomas y estadísticas',
        lang: 'es',
        dir: 'ltr',
        start_url: '/luna-app/',
        scope: '/luna-app/',
        theme_color: '#4a1d6b',
        background_color: '#1a0a2e',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['health', 'lifestyle'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})