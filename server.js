import express from 'express';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse large JSON bodies (base64 images can be big)
app.use(express.json({ limit: '50mb' }));

// Serve static files from dist/
app.use(express.static(join(__dirname, 'dist')));

// Export endpoint
app.post('/api/export', async (req, res) => {
  const { type, state } = req.body;

  if (!type || !state) {
    return res.status(400).json({ error: 'Missing type or state' });
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    });

    // Navigate to the render route
    const renderUrl = `http://localhost:${PORT}/render/${type}`;
    await page.goto(renderUrl, { waitUntil: 'networkidle' });

    // Inject state
    await page.evaluate((s) => {
      window.__EXPORT_STATE__ = s;
    }, state);

    // Wait for data-ready="true" on #export-frame
    await page.waitForSelector('#export-frame[data-ready="true"]', {
      timeout: 15000,
    });

    // Small extra delay for rendering stability
    await page.waitForTimeout(300);

    // Screenshot the export frame
    const element = await page.$('#export-frame');
    if (!element) {
      return res.status(500).json({ error: 'Export frame not found' });
    }

    const screenshot = await element.screenshot({
      type: 'jpeg',
      quality: 90,
    });

    res.set('Content-Type', 'image/jpeg');
    res.set('Content-Disposition', 'attachment; filename="export.jpg"');
    res.send(screenshot);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed', details: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// SPA fallback — serve index.html for all non-API, non-static routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
