/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'http';

function aiProxyPlugin(): Plugin {
  return {
    name: 'ai-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai-proxy', async (req: IncomingMessage, res: ServerResponse, next) => {
        const targetBase = req.headers['x-proxy-target'] as string | undefined;
        if (!targetBase) return next();

        const url = new URL(req.url || '/', 'http://localhost');
        const targetUrl = targetBase + url.pathname + url.search;

        // Forward headers, skip hop-by-hop and proxy-specific headers
        const skipHeaders = new Set(['x-proxy-target', 'host', 'origin', 'referer', 'connection', 'content-length']);
        const headers: Record<string, string> = {};
        for (const [key, val] of Object.entries(req.headers)) {
          if (skipHeaders.has(key)) continue;
          if (val) headers[key] = Array.isArray(val) ? val.join(', ') : val;
        }

        try {
          const body = await new Promise<Buffer>((resolve) => {
            const chunks: Buffer[] = [];
            req.on('data', (c: Buffer) => chunks.push(c));
            req.on('end', () => resolve(Buffer.concat(chunks)));
          });

          if (body.length > 0) {
            headers['content-length'] = String(body.length);
          }

          const upstream = await fetch(targetUrl, {
            method: req.method || 'POST',
            headers,
            body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : body,
          });

          // Build response headers, skip problematic ones for streaming
          const responseHeaders: Record<string, string> = {};
          upstream.headers.forEach((val, key) => {
            const lower = key.toLowerCase();
            if (lower === 'content-length' || lower === 'content-encoding' || lower === 'transfer-encoding') return;
            responseHeaders[key] = val;
          });

          res.writeHead(upstream.status, responseHeaders);

          if (upstream.body) {
            const reader = upstream.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(value);
            }
            res.end();
          } else {
            const text = await upstream.text();
            res.end(text);
          }
        } catch (err) {
          if (!res.headersSent) {
            res.writeHead(502, { 'content-type': 'application/json' });
          }
          res.end(JSON.stringify({ error: 'Proxy error', detail: String(err) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 12345,
      host: '0.0.0.0',
    },
    plugins: [react(), aiProxyPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
      'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY)
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-motion': ['framer-motion'],
            'vendor-genai': ['@google/genai'],
            'vendor-openai': ['openai'],
            'vendor-anthropic': ['@anthropic-ai/sdk'],
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: ['node_modules/', 'tests/']
      }
    }
  };
});
