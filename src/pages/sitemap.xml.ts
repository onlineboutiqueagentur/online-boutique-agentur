import type { APIRoute } from 'astro';

// Nur indexierbare Seiten. Beide Designwelten teilen sich dieselbe URL.
// /croissant/ vorerst nicht in der Sitemap (Seite ist auf noindex, nur per Direktlink/QR erreichbar)
const pages = ['/', '/impressum/', '/datenschutz/'];

export const GET: APIRoute = ({ site }) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((p) => `  <url><loc>${new URL(p, site).href}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
