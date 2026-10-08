# Online Boutique Agentur – Website

**Eine Agentur. Zwei Perspektiven.** Eigenständige Website für
[www.online-boutique-agentur.at](https://www.online-boutique-agentur.at), herausgelöst aus der
WordPress-Installation von Eternal Flame.

- **Eine** Website, **eine** URL, **eine** Content-Basis
- **Zwei** Designwelten: `minimal` (ruhig, klar, elegant) und `louder` (laut, bunt, expressiv)
- Statisch gerendert mit [Astro](https://astro.build), gehostet auf **Cloudflare Pages**
- Kontaktformular als **Cloudflare Pages Function**: Mail über das eigene Postfach bei World4You (SMTP) + Speicherung in Cloudflare KV, Übersicht aller Anfragen unter **/admin** (eigener Login, wie bei kristinainhof.at)
- Keine Cookies, kein Tracking, keine externen Requests (Schriften, Bilder, Video selbst gehostet)

## Schnellstart

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/ (inkl. CSP-Header via scripts/postbuild.mjs)
npm run preview    # gebaute Seite lokal ansehen
npm run check      # Typ- und Template-Prüfung
```

Voraussetzung: Node.js ≥ 22.12 (siehe `.nvmrc`).

## Inhalte pflegen

**Alle Texte, Leistungen, Referenzen, Kontaktdaten stehen in einer Datei:**
[`src/content/site.ts`](src/content/site.ts)

| Was | Wo in `site.ts` | Zusätzlich |
| --- | --- | --- |
| Neue Leistung | `services.items` | Icon (PNG/SVG ~300×200) nach `src/assets/images/icons/` |
| Neue Kundenstimme | `testimonials.items` | Foto (3:2, ≥ 600 px breit) nach `src/assets/images/shared/` |
| Neue Erfahrung/Station | `experience.items` | Logo (300×200) nach `src/assets/images/logos/` |
| Zahlen („Some insights“) | `insights.items` | – |
| Kontaktdaten / Adresse | `agency` | fließt automatisch in Footer, Impressum und strukturierte Daten |
| Titel / Meta-Description | `seo` | – |

Bilder werden beim Build automatisch in **AVIF + WebP** in mehreren Größen erzeugt.
Dateinamen bitte sprechend wählen (z. B. `kundenstimme-vorname-nachname.jpg`), ALT-Text im Content-Eintrag.

**Bild je Designwelt:** Soll ein Bild in `louder` anders aussehen (z. B. mit orangem Schriftzug),
als `ThemedImage` mit `{ alt, minimal, louder }` anlegen – siehe `flowImages`.

## Architektur

```
CONTENT  src/content/site.ts          ← einmal gepflegt
   ↓
KOMPONENTEN  src/components/*.astro    ← gemeinsam (Hero, Services, Testimonials …)
   ↓
DESIGN-TOKENS  src/styles/tokens.css   ← :root = minimal, [data-design='louder'] = louder
```

- Die Designwelt ist ein Attribut auf `<html data-design="…">`. Komponenten-CSS reagiert über
  Tokens (Farben, Schriften, Radien) und gezielte `[data-design='louder']`-Regeln.
- Ein winziges Inline-Script im `<head>` setzt die gespeicherte Welt **vor** dem ersten Paint
  (kein Flackern). Speicherung: `localStorage` (`oba-design`), **kein Cookie**.
- `?design=louder` in der URL aktiviert die Louder-Welt (wird für die Weiterleitung der alten
  Louder-URL genutzt) und wird danach aus der Adresszeile entfernt. Canonical bleibt immer `/`.
- Bilder, die es nur in einer Welt gibt, werden per `loading="lazy"` + `display:none` **nicht**
  geladen, solange die Welt nicht aktiv ist.
- Übergang zwischen den Welten: View Transitions API (kreisförmige Enthüllung ab dem Klickpunkt),
  ohne Animation bei `prefers-reduced-motion`.

```
src/
  content/site.ts         Content-Basis
  components/             Hero, Navigation, DesignSwitch, Intro, SectionHead, FlowCollage,
                          Services, Experience, DesignType, Testimonials, Insights, Contact,
                          Footer, Consent, Seo, Variant, ThemedPicture, HeroPicture
  layouts/                Base (HTML-Gerüst), Page (Unterseiten)
  pages/                  index, impressum, datenschutz, 404, kontakt/danke, kontakt/fehler, sitemap.xml
  scripts/                design.ts (Switch), typewriter.ts, contact-form.ts
  styles/                 fonts.css, tokens.css, base.css
functions/api/contact.ts  Formular-Backend (Cloudflare Pages Function)
public/                   _headers, _redirects, robots.txt, fonts/, media/, favicon
scripts/postbuild.mjs     erzeugt CSP mit Script-Hashes in dist/_headers
docs/                     Analyse, Deployment, DNS, Migration, Content-Notizen, Audit
```

## Dokumentation

- [docs/ANALYSE.md](docs/ANALYSE.md) – Analyse der Live-Seiten & Vergleich der Designwelten
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) – Cloudflare Pages, Formular, Umgebungsvariablen
- [docs/DNS-WORLD4YOU.md](docs/DNS-WORLD4YOU.md) – Domain & E-Mail bleiben bei World4You
- [docs/MIGRATION.md](docs/MIGRATION.md) – 301-Redirects von eternalflame.at, Search Console
- [docs/CONTENT-NOTIZEN.md](docs/CONTENT-NOTIZEN.md) – Text-/SEO-Vorschläge (nicht umgesetzt)
- [docs/AUDIT.md](docs/AUDIT.md) – Launch-Audit & offene Punkte

## Lizenzen

Schriften (Mulish, Libre Baskerville, Anton, EB Garamond): SIL Open Font License 1.1.
Fotos: Manuela Kalupar (siehe Impressum).
