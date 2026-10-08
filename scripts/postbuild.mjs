/**
 * Nach dem Build: Content-Security-Policy mit Hashes aller Inline-Scripts
 * erzeugen und in dist/_headers eintragen. So braucht die CSP kein 'unsafe-inline'
 * für Scripts. JSON-LD (type="application/ld+json") wird nicht ausgeführt und
 * braucht keinen Hash.
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const hashes = new Set();
for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8');
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs) || /application\/ld\+json/.test(attrs)) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
}

// Optionales Tracking (nur aktiv, wenn in site.ts eine GA4-ID gesetzt ist)
const site = await readFile(new URL('../src/content/site.ts', import.meta.url), 'utf8');
const tracking = /ga4MeasurementId:\s*'G-/.test(site);
const ga = tracking ? ' https://www.googletagmanager.com' : '';
const gaConnect = tracking ? ' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com' : '';

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')}${ga}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data:${tracking ? ' https://*.google-analytics.com https://www.googletagmanager.com' : ''}`,
  "font-src 'self'",
  "media-src 'self'",
  `connect-src 'self'${gaConnect}`,
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const headersPath = join(DIST, '_headers');
let headers = await readFile(headersPath, 'utf8');
headers = headers.replace(/^\/\*\n/m, `/*\n  Content-Security-Policy: ${csp}\n`);
await writeFile(headersPath, headers);
console.log(`postbuild: CSP mit ${hashes.size} Script-Hash(es) geschrieben.`);
