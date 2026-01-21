import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    host: true,
    https: (() => {
      const keyPath = './certs/localhost-key.pem';
      const certPath = './certs/localhost.pem';
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
      }
      // Fallback to built-in (untrusted) TLS if cert files are missing
      console.warn(
        '\x1b[33m[dev] HTTPS certs not found in ./certs — falling back to untrusted self-signed HTTPS. Run `pnpm run gen:certs` to create trusted certs.\x1b[0m',
      );
      return true;
    })(),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'icons/*.svg', 'icons/*.ico', 'fonts/*'],
      manifest: false, // We're using the public/manifest.json file
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
