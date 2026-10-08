# Launch-Audit

Stand: 06.10.2026 · Geprüft: lokaler Build (`npm run build`), Dev-Vorschau Desktop 1440 px + Mobil 375 px,
`astro check` (0 Fehler), Unit-Test der Formular-Function (9 Szenarien).
Legende: ✅ erledigt · ⚠️ erledigt mit Hinweis · 🔲 offen (vor Launch) · ⏭️ nach Launch prüfen

## 🔲 Vor dem Launch zwingend

1. **Impressum** – Unternehmensgegenstand und UID ergänzt; rechtliche Prüfung empfohlen.
2. **Datenschutzerklärung prüfen lassen** – Entwurf auf Basis des bestehenden Texts, an die neue Technik angepasst; gelb markiert: E-Mail-Dienst, AV-Vertrag Cloudflare.
3. **Namen im Impressum bestätigen** (Altmanninger vs. Lindner, siehe CONTENT-NOTIZEN).
4. ✅ **Formular eingerichtet und live getestet** (KV `oba-anfragen`, Versand über World4You, Admin-Login).
5. **DNS** gemäß DNS-WORLD4YOU.md (Variante A: nur `www`-CNAME) + Apex-Weiterleitung.
6. **Redirects** auf eternalflame.at (MIGRATION.md).

## Design

| Punkt | Status |
| --- | --- |
| Hauptversion (minimal) visuell wie Original | ✅ Farben, Schriften, Größen, Abstände, Bildradien, Collage-Positionen aus computed styles übernommen |
| Louder-Version visuell wie Original | ✅ Grau/Orange, Anton-Typo, eckige Bilder, orange Karten, zweispaltige Leistungen, „client love“ ×3 |
| Switch elegant & verständlich | ✅ Hero: Twin-Kreise (minimal / louder als Zwillinge, rücken beim Hover auseinander, aktive Welt vorne) · Sektion „Welcher Design-Typ“: Twin-Toggle mit gleitendem Knopf · Footer: Umschalter „Design-Typ minimal | louder“ · Übergang: kreisförmige Enthüllung |
| Switch funktioniert & speichert | ✅ getestet: Klick → Wechsel, `localStorage`, Wiederherstellung nach Reload, `?design=` aus URL entfernt |
| Responsive | ✅ keine horizontale Scrollbar (375 px geprüft), Collage auf Mobil ohne Überlappung (Original-Fehler behoben), mobiles Hochformat-Hero wie Original |
| Animationen | ✅ Schreibmaschine (Original-Timing), Zähler, Reveal/Slide (CSS scroll-driven), bounce/flash in Louder, Linien wachsen |
| Hover-States | ⚠️ neu: Outline-Buttons füllen sich (Original hatte kein sichtbares Hover), Nav-Unterstreichung |
| Scroll-Effekte | ✅ aus dem Original ausgelesen (Avada Motion Effects) und per CSS nachgebaut: Collage (feel ↑ + Blur, grow/glow ↓), Kundenstimmen (links ↑, rechts ↓), Leistungen/Erfahrung ↑, Hero-Titel ↑ + Blur – je ±50 px |
| Bewusste Abweichungen | ⚠️ Slider ohne Autoplay (WCAG 2.2.2); EB Garamond statt System-Garamond (einheitlich auf allen Geräten); dezenter Textschatten im Minimal-Hero |

## Content

| Punkt | Status |
| --- | --- |
| Texte, Leistungen, Erfahrung, Kundenstimmen, Zahlen, Kontakt, Footer, Navigation | ✅ vollständig, Wortlaut unverändert (Ausnahmen in CONTENT-NOTIZEN §A) |
| Navigation | ✅ alle Anker funktionieren (Original: „Erfahrungen“ ohne Ziel) |
| Eternal-Flame-Reste | ✅ entfernt (Wedding/Abschied-Buttons, Warenkorb-Off-Canvas, Kerzen-OG-Bild, Favicon). Bewusst behalten: Link „www.eternalflame.at“ als Referenz in „Gründung & Geschäftsführung“ |

## SEO

| Punkt | Status |
| --- | --- |
| Title / Meta Description | ✅ übernommen (Kürzungsvorschlag für Title in CONTENT-NOTIZEN §C6) |
| Genau eine H1, saubere H2/H3 | ✅ H1 „Online Boutique Agentur²“ · 9 × H2 · 14 × H3 (Original: leere H1, Überschriften als H5/P) |
| Canonical | ✅ immer `https://www.online-boutique-agentur.at/` – beide Designs = eine URL |
| Sitemap / robots.txt | ✅ `/sitemap.xml` (3 URLs), `robots.txt` mit Sitemap; Preview-Domains `noindex` |
| Open Graph / Twitter | ✅ eigenes 1200×630-Bild aus dem Hero-Foto |
| Strukturierte Daten | ✅ `ProfessionalService` (LocalBusiness) mit Adresse, Region, Leistungen · `Person` × 2 · `WebSite` |
| ALT-Texte / Dateinamen | ✅ beschreibend, deutsch; Icons bewusst `alt=""` (Name steht daneben) |
| ⏭️ | Rich-Results-Test, Search Console nach Go-live |

## GEO / AI Search

| Punkt | Status |
| --- | --- |
| Organisation, Personen, Standort, Region, Leistungen maschinenlesbar | ✅ via JSON-LD + semantisches HTML (`address`, `blockquote`, `figure`) |
| ⚠️ | Leistungen nur als Namen; Pias Nachname fehlt → Vorschläge in CONTENT-NOTIZEN §C |

## Performance

| Punkt | Status |
| --- | --- |
| JavaScript | ✅ < 1 KB gzip extern + kleine Inline-Scripts (Original: ~95 Script-Dateien inkl. jQuery, GSAP) |
| CSS | ✅ ~7 KB gzip |
| HTML | ✅ 14 KB gzip |
| Bilder | ✅ AVIF/WebP, responsive `srcset`, feste Maße (kein CLS), Lazy Loading; Hero 10–58 KB statt 230 KB JPEG; GIF 1,1 MB → animiertes WebP 345 KB |
| Fonts | ✅ selbst gehostet, WOFF2, `font-display: swap`, nur 2 kritische Preloads (Anton nur bei Louder) |
| Video | ✅ lädt erst kurz vor Sichtbarkeit (`preload="none"`) statt sofort 4,2 MB · ⚠️ Empfehlung: auf ~1 MB neu encodieren (z. B. HandBrake, 720p, CRF 28) und ein Posterbild ergänzen |
| Third-Party | ✅ keine |
| Design-Switch | ✅ kein Seitenwechsel, nur Attribut-Wechsel; Bilder der inaktiven Welt werden nicht geladen |
| ⏭️ | PageSpeed Insights nach Go-live (Lighthouse war lokal nicht verfügbar) |

## Accessibility (WCAG 2.2 AA)

| Punkt | Status |
| --- | --- |
| Semantik, Landmarks, Skip-Link | ✅ `header`, `nav`, `main`, `footer`, „Zum Inhalt springen“ |
| Tastatur & Fokus | ✅ alle Bedienelemente sind native `<button>`/`<a>`, sichtbarer Fokusring; Mobil-Menü als natives Popover (Esc, Fokus) |
| Design-Switch | ✅ Buttons mit Accessible Name („… zum lauten, farbigen Louder-Design wechseln“), `aria-pressed` im Toggle, Statusmeldung per `aria-live` |
| Formular | ✅ Labels, `autocomplete`, Fehlermeldungen mit `aria-invalid`/`aria-describedby`, Statusmeldung fokussiert |
| Reduced Motion | ✅ Schreibmaschine statisch, keine Zähl-/Scroll-Animationen, kein Video-Autoplay, Switch ohne Animation |
| Bewegung | ✅ kein Autoplay-Slider; Blink-Effekte („flash“) laufen nur einmal |
| Touch-Ziele | ✅ ≥ 44 px bzw. ≥ 24 px (WCAG 2.5.8) |
| Kontrast minimal | ✅ Text 19:1 / 11,5:1 · ⚠️ weiße Hero-Schrift auf hellem Foto – mit Textschatten verbessert |
| **Kontrast louder** | ⚠️ **Orange `#fab14f` auf Grau `#cecbc8` = 1,13:1** (Anforderung große Schrift: 3:1). Das ist der Markenlook des Originals und wurde 1:1 übernommen. Bei aktivierter Systemeinstellung „Kontrast erhöhen“ werden die Überschriften automatisch schwarz. **Entscheidung nötig**, ob Louder dauerhaft kontraststärker werden soll (z. B. Überschriften schwarz mit orangem Akzent oder dunklerer Hintergrund). |

## DSGVO / Privacy

| Punkt | Status |
| --- | --- |
| Cookies | ✅ keine |
| Tracking | ✅ keines (Original lud GA4, Meta Pixel, Clarity, Pinterest, Google Ads, Shoplytics **ohne Einwilligung**) |
| Consent-System | ✅ vorbereitet: erscheint nur, wenn in `site.ts` eine GA4-ID eingetragen wird; „Ablehnen“ gleichwertig, Widerruf über Footer, Script erst nach Einwilligung, CSP passt sich automatisch an |
| Externe Fonts / Embeds / Maps | ✅ keine |
| Designwahl im Local Storage | ✅ kein Cookie, keine Übertragung, in Datenschutzerklärung beschrieben |
| Formular | ✅ nur nötige Daten, Hinweis + Link zur Datenschutzerklärung, keine Speicherung in einer Datenbank |
| Impressum / Datenschutz | 🔲 rechtliche Prüfung (siehe oben) |

## Security

| Punkt | Status |
| --- | --- |
| HTTPS / HSTS | ✅ Cloudflare + `Strict-Transport-Security` |
| Security-Header | ✅ CSP (Script-Hashes, kein `unsafe-inline` für Scripts), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP` |
| Formularschutz | ✅ Origin-Check, Honeypot, Mindest-Ausfüllzeit, Größen-/Längenlimits, Validierung, HTML-Escaping, keine Header-Injection · ⚠️ Rate Limiting nur mit Cloudflare-Nameservern (DNS-Variante B) |
| Secrets | ✅ nur als Cloudflare-Secrets, `.gitignore` deckt `.env*`/`.dev.vars` ab, nichts im Frontend |
| Dependencies | ✅ nur `astro` + `sharp` (Build), keine Laufzeit-Bibliotheken; `npm audit`: 0 Schwachstellen |

## Migration

| Punkt | Status |
| --- | --- |
| Alte URLs erfasst | ✅ `/online-boutique-agentur/`, `/online-boutique-agentur-louder/`, `/agentur-fancy/`, `/agentur/`, `/impressum-agentur/` |
| Redirects | ✅ Regeln vorbereitet (MIGRATION.md) + Fallbacks in `_redirects` · 🔲 auf eternalflame.at aktivieren |
| Canonical / Sitemap / interne Links | ✅ alle intern relativ, keine Links mehr auf eternalflame.at außer der bewussten Referenz |

## World4You

| Punkt | Status |
| --- | --- |
| Domain bleibt bei World4You | ✅ |
| E-Mail bleibt bei World4You | ✅ Variante A ändert nur `www` |
| MX / SPF erhalten | ✅ dokumentiert, werden nicht angefasst |
| DKIM | ⚠️ öffentlich unter gängigen Selektoren nicht gefunden → im World4You-Panel prüfen |
| DMARC | ⚠️ nicht vorhanden → Empfehlung `p=none` (DNS-WORLD4YOU.md) |
