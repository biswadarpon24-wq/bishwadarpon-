import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { initSchema } from './src/server/db.ts';
import { seedInitialData } from './src/server/seed.ts';
import { createApiRouter } from './src/server/routes.ts';
import { generateNewsSitemap, generateXmlSitemap, getBaseUrl, injectDynamicMeta } from './src/server/seo.ts';

async function startServer() {
  initSchema();
  seedInitialData();

  const app = express();
  const port = Number(process.env.PORT || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve public assets (images, audio, uploads, favicon)
  const publicDir = path.resolve(process.cwd(), 'public');
  app.use(express.static(publicDir, { index: false }));

  // Technical SEO endpoints
  app.get('/robots.txt', (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml\nSitemap: ${baseUrl}/news-sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.type('application/xml').send(generateXmlSitemap(baseUrl));
  });

  app.get('/news-sitemap.xml', (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.type('application/xml').send(generateNewsSitemap(baseUrl));
  });

  // Mount API routes
  app.use('/api', createApiRouter());

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const templatePath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const enriched = injectDynamicMeta(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(enriched);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir, { index: false }));

    app.use('*', (req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      const template = fs.readFileSync(indexPath, 'utf-8');
      const enriched = injectDynamicMeta(template, req);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(enriched);
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`বিশ্ব দর্পণ (Bishwa Darpon) server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
