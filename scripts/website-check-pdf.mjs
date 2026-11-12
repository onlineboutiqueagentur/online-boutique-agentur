/**
 * Erzeugt das PDF „Dein schneller Website-Check“ aus der Vorlage /vorschau/website-check-pdf/.
 * Vorher: npm run build && npx wrangler pages dev dist --port 8788
 * Aufruf: node scripts/website-check-pdf.mjs [basis-url]
 */
import { createRequire } from 'node:module';

// Playwright ist keine Projekt-Abhängigkeit: lokal oder global installiertes Paket verwenden (NODE_PATH)
const { chromium } = createRequire(import.meta.url)('playwright');

const basis = process.argv[2] ?? 'http://localhost:8788';
const ziel = new URL('../public/downloads/website-check-online-boutique-agentur.pdf', import.meta.url);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${basis}/vorschau/website-check-pdf/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: ziel.pathname, format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('PDF geschrieben:', ziel.pathname);
