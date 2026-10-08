// @ts-check
import { defineConfig } from 'astro/config';

// Rein statischer Build für Cloudflare Pages.
// Das Kontaktformular läuft als Cloudflare Pages Function (siehe /functions).
export default defineConfig({
  site: 'https://www.online-boutique-agentur.at',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
});
