import dotenv from 'dotenv';
dotenv.config();

process.env.DISABLE_HMR = 'true';

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { nammaRouter } from './src/server/nammaRoutes.ts';
import { runMarketplaceTests } from './src/server/tests.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const BACKEND_PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : null;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Mount NammaServices REST API routes (Auth, Providers, Services, Bookings, Reviews, Admin, DB)
  app.use('/api', nammaRouter);

  // Health check & test runner endpoints
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'LocalFix API Server',
      tagline: 'Ungal Area, Ungal Services.',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/tests/run', (_req, res) => {
    const testResults = runMarketplaceTests();
    const allPassed = testResults.every((t) => t.passed);
    res.json({
      success: allPassed,
      results: testResults,
      timestamp: new Date().toISOString(),
    });
  });

  if (!isProd) {
    // Development mode: attach Vite dev server middleware with HMR disabled (environment constraint)
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'spa',
    });
    // In dev mode with HMR disabled, browsers in iframes may request pre-bundled deps with an older hash ?v=...
    // Strip outdated hash queries on /node_modules/.vite/deps to prevent 504 Outdated Optimize Dep errors.
    app.use('/node_modules/.vite/deps', (req, _res, next) => {
      if (req.url && req.url.includes('?v=')) {
        req.url = req.url.split('?')[0];
      }
      next();
    });

    app.use(vite.middlewares);

    // Explicit SPA fallback for HTML routes in dev mode
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    console.log('[NammaServices] Vite middleware and SPA fallback attached in dev mode');
  } else {
    // Production mode: serve built static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Global error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[NammaServices] Express Error Handler:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LocalFix] Marketplace web server listening on http://0.0.0.0:${PORT}`);
  });

  if (BACKEND_PORT && BACKEND_PORT !== PORT) {
    try {
      const backendServer = app.listen(BACKEND_PORT, '0.0.0.0', () => {
        console.log(`[LocalFix] Dedicated backend API listening on http://0.0.0.0:${BACKEND_PORT}`);
      });
      backendServer.keepAliveTimeout = 65000;
      backendServer.headersTimeout = 66000;
    } catch (e) {
      console.warn(`[LocalFix] Could not bind secondary BACKEND_PORT ${BACKEND_PORT}:`, e);
    }
  }

  // Keep-alive timeouts configured for reverse proxy (Nginx / Cloud Run)
  // Ensures Node's keepAliveTimeout (65s) is higher than reverse proxy connection reuse to prevent race-condition connection resets
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.requestTimeout = 300000;

  // Handle client errors gracefully without abrupt TCP RST
  server.on('clientError', (err: any, socket) => {
    if (err.code === 'ECONNRESET' || !socket.writable) {
      return;
    }
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  // Handle upgrade requests gracefully (prevents default Node socket.destroy() TCP RST)
  server.on('upgrade', (_req, socket) => {
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
    }
  });

  // Graceful process error management
  process.on('uncaughtException', (err) => {
    console.error('[NammaServices] Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[NammaServices] Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Graceful shutdown
  const handleShutdown = (signal: string) => {
    console.log(`[NammaServices] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[NammaServices] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[NammaServices] Fatal server startup error:', err);
  process.exit(1);
});
