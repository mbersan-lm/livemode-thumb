import express from 'express';
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();

// Accept large bodies (base64 images can be big)
app.use(express.json({ limit: '50mb' }));

// Serve the built SPA
app.use(express.static(path.join(__dirname, '..', 'dist')));

// ─── Export endpoint ─────────────────────────────────────────────────────────
let browser = null;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browser;
}

const TYPE_MAP = {
  'cortes': 'cortes',
  'melhores-momentos': 'mm',
  'jogo-completo': 'jc',
  'ao-vivo': 'ao-vivo',
};

app.post('/api/export', async (req, res) => {
  const { type, state } = req.body;

  if (!type || !state) {
    return res.status(400).json({ error: 'Missing type or state' });
  }

  const routeType = TYPE_MAP[type] || type;

  let page = null;
  try {
    const b = await getBrowser();
    page = await b.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate to the render route
    const renderUrl = `http://localhost:${PORT}/render/${routeType}`;
    await page.goto(renderUrl, { waitUntil: 'networkidle', timeout: 15000 });

    // Inject the state and trigger the callback
    await page.evaluate((exportState) => {
      window.__EXPORT_STATE__ = exportState;
      if (window.__EXPORT_STATE_READY__) {
        window.__EXPORT_STATE_READY__();
      }
    }, state);

    // Wait for the component to signal it's ready
    await page.waitForSelector('#export-frame[data-ready="true"]', { timeout: 15000 });

    // Wait for fonts
    await page.evaluate(() => document.fonts.ready);

    // Small extra delay for paint
    await page.waitForTimeout(200);

    // Screenshot the export frame
    const element = await page.$('#export-frame');
    if (!element) {
      throw new Error('Export frame not found');
    }

    const buffer = await element.screenshot({ type: 'png' });

    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', 'inline');
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message || 'Export failed' });
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
});

// SPA fallback — serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (browser) await browser.close();
  process.exit(0);
});
