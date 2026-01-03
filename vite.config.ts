import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0', // Allow access from network
        strictPort: false, // Try next port if 3000 is busy
        hmr: {
          clientPort: 3000, // Ensure HMR works on mobile
        },
        cors: true, // Enable CORS for all origins
      },
      plugins: [
        react(),
        // Custom plugin to add CORS headers
        {
          name: 'add-cors-headers',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
              res.setHeader('Access-Control-Allow-Credentials', 'true');
              if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
              }
              next();
            });
          },
        },
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Optimize for mobile browsers
      optimizeDeps: {
        exclude: ['lucide-react'],
      },
    };
});
