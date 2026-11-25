import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({ plugins: [react(), tailwindcss(), VitePWA({
  registerType: 'prompt', includeAssets: ['favicon.svg', 'icons/*.png'],
  manifest: {
    id: '/', name: 'EcoUAM — Conoce y cuida nuestros espacios verdes', short_name: 'EcoUAM',
    description: 'Proyecto académico independiente de educación ambiental.', lang: 'es',
    start_url: '/', scope: '/', display: 'standalone', background_color: '#f7f9f6', theme_color: '#245844',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: { maximumFileSizeToCacheInBytes: 2300000, globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], navigateFallback: '/index.html', cleanupOutdatedCaches: true },
  devOptions: { enabled: false },
})] })
