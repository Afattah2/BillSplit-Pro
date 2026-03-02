import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// SPA fallback: serve index.html for client routes (e.g. /app) so refresh works
function spaFallback() {
  const handler = (req: any, _res: any, next: () => void) => {
    const url = req.url?.split('?')[0] ?? '';
    if (url !== '/' && !url.includes('.') && !url.startsWith('/@') && !url.startsWith('/node_modules')) {
      req.url = '/index.html';
    }
    next();
  };
  return {
    name: 'spa-fallback',
    configureServer(server: any) {
      server.middlewares.stack.unshift({ route: '', handle: handler });
    },
    configurePreviewServer(server: any) {
      server.middlewares.stack.unshift({ route: '', handle: handler });
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['logo.png', 'favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
          manifest: {
            name: 'الحساب يجمع',
            short_name: 'الحساب يجمع',
            description: 'قسّم الفاتورة مع أصحابك بسهولة — امسح الفاتورة، وزّع الأصناف، واعرف مين يدين مين.',
            theme_color: '#4f46e5',
            background_color: '#f8fafc',
            display: 'standalone',
            start_url: '/',
            scope: '/',
            lang: 'ar',
            icons: [
              { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
              { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
              { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
        }),
        spaFallback(),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
