import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
      plugins: [react(), spaFallback()],
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
