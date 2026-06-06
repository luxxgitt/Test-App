import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/test-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'FitLife',
        short_name: 'FitLife',
        description: 'Application de fitness et nutrition personnalisée',
        theme_color: '#0D0D0D',
        background_color: '#0D0D0D',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/test-app/',
        start_url: '/test-app/',
        icons: [
          {
            src: '/test-app/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/test-app/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
