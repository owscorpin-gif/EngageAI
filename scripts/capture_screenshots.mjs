/**
 * Engage AI – Screenshot Capture Script
 * Uses Playwright to capture high-quality screenshots of every page.
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'docs_images');
const BASE_URL = 'http://localhost:5173';
const VIEWPORT = { width: 1400, height: 900 };

const PAGES = [
  { name: 'login',          path: '/login',        file: 'login.png',          description: 'Login Page' },
  { name: 'dashboard',      path: '/',             file: 'dashboard.png',      description: 'Dashboard' },
  { name: 'analyze',        path: '/analyze',      file: 'analyze.png',        description: 'AI Video Analyzer' },
  { name: 'live_chat',      path: '/live',         file: 'live_chat.png',      description: 'YouTube Live Chat Manager' },
  { name: 'categorize',     path: '/categorize',   file: 'categorize.png',     description: 'Comment Categorization' },
  { name: 'decision',       path: '/decision',     file: 'decision_engine.png',description: 'Decision Engine' },
  { name: 'analytics',      path: '/analytics',    file: 'analytics.png',      description: 'Interactive Analytics' },
  { name: 'ai_learning',    path: '/learning',     file: 'ai_learning.png',    description: 'AI Learning & Prompt Memory' },
  { name: 'admin_panel',    path: '/admin',        file: 'admin_panel.png',    description: 'Admin Control Panel' },
  { name: 'personality',    path: '/personality',  file: 'personality.png',    description: 'Personality Voice Presets' },
  { name: 'settings',       path: '/settings',     file: 'settings.png',       description: 'Settings' },
  { name: 'billing',        path: '/billing',      file: 'billing.png',        description: 'Billing' },
];

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: 'dark',
    deviceScaleFactor: 1.5, // higher resolution
  });

  const page = await context.newPage();

  console.log('🔑  Logging in with mock credentials...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Take login screenshot BEFORE signing in
  const loginFile = path.join(OUTPUT_DIR, 'login.png');
  await page.screenshot({ path: loginFile, fullPage: true });
  console.log(`✅  Captured: login.png`);

  // Fill in login form (mock mode accepts any credentials)
  await page.fill('#auth-email', 'creator@engage.ai');
  await page.fill('#auth-password', 'password123');
  await page.click('#auth-submit-btn');
  await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Capture all authenticated pages
  for (const pg of PAGES) {
    if (pg.name === 'login') continue; // already captured
    try {
      console.log(`📸  Navigating to ${pg.description} (${pg.path})...`);
      await page.goto(`${BASE_URL}${pg.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      const outputPath = path.join(OUTPUT_DIR, pg.file);
      await page.screenshot({ path: outputPath, fullPage: true });
      console.log(`✅  Captured: ${pg.file}`);
    } catch (err) {
      console.error(`❌  Failed to capture ${pg.description}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\n🎉  All screenshots saved to: docs_images/');
}

captureScreenshots().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
