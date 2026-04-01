import express from 'express';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Force Playwright to look in the correct directory
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || '/ms-playwright';

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve Chromium executable path manually
function resolveChromiumExecutable() {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH || '/ms-playwright';
  
  // Common executable names to search for
  const execNames = ['chrome-headless-shell', 'headless_shell', 'chromium', 'chrome'];
  
  try {
    if (!fs.existsSync(browsersPath)) {
      console.error(`Browsers path does not exist: ${browsersPath}`);
      return null;
    }

    // Walk through directories to find the executable
    const entries = fs.readdirSync(browsersPath);
    for (const entry of entries) {
      const entryPath = join(browsersPath, entry);
      if (!fs.statSync(entryPath).isDirectory()) continue;

      // Search recursively for known executable names
      const found = findExecutable(entryPath, execNames);
      if (found) return found;
    }
  } catch (err) {
    console.error('Error resolving Chromium executable:', err);
  }

  return null;
}

function findExecutable(dir, names) {
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isFile() && names.includes(entry)) {
        // Verify it's executable
        try {
          fs.accessSync(fullPath, fs.constants.X_OK);
          return fullPath;
        } catch {
          // Not executable, continue searching
        }
      }

      if (stat.isDirectory()) {
        const found = findExecutable(fullPath, names);
        if (found) return found;
      }
    }
  } catch (err) {
    // Ignore permission errors
  }
  return null;
}

// Parse large JSON bodies (base64 images can be big)
app.use(express.json({ limit: '50mb' }));

// CORS — allow cross-origin requests from Lovable preview
app.use('/api/export', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve static files from dist/
app.use(express.static(join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/export/health', (req, res) => {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH || '/ms-playwright';
  const resolvedExecutable = resolveChromiumExecutable();
  const executableExists = resolvedExecutable ? fs.existsSync(resolvedExecutable) : false;

  res.json({
    status: 'ok',
    browsersPath,
    resolvedExecutable,
    executableExists,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

// Export endpoint
app.post('/api/export', async (req, res) => {
  const { type, state } = req.body;

  if (!type || !state) {
    return res.status(400).json({ error: 'Missing type or state' });
  }

  let browser;
  try {
    // Build launch options
    const launchOptions = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    // Try to resolve and pass executablePath
    const execPath = resolveChromiumExecutable();
    if (execPath) {
      console.log(`Using Chromium executable: ${execPath}`);
      launchOptions.executablePath = execPath;
    } else {
      console.warn('Could not resolve Chromium executable, falling back to Playwright default');
    }

    browser = await chromium.launch(launchOptions);

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

// SPA fallback — MUST BE LAST
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`PLAYWRIGHT_BROWSERS_PATH = ${process.env.PLAYWRIGHT_BROWSERS_PATH}`);
  const exec = resolveChromiumExecutable();
  console.log(`Resolved Chromium executable: ${exec || 'NOT FOUND'}`);
});
