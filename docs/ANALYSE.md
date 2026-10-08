# Analyse der bestehenden Live-Seiten

Analysiert am 06.10.2026 im Browser (1440 px Desktop, 375 px Mobil) plus HTML-Quelltext:

- **minimal** (Hauptversion): https://www.eternalflame.at/online-boutique-agentur/
- **louder**: https://www.eternalflame.at/online-boutique-agentur-louder/

Was sich nicht eindeutig feststellen ließ, ist als **Annahme** markiert.

## 1. Technik der bisherigen Umsetzung

| Bereich | Befund |
| --- | --- |
| CMS / Theme | WordPress, Theme **Avada 7.11**, Fusion Builder 3.11, WooCommerce 8.8 (Eternal Flame Shop) |
| Scripts | ~95 Script-Dateien: jQuery, jQuery UI, GSAP + ScrollTrigger, Swiper, Flexslider, Bootstrap, WooCommerce, Datepicker/Timepicker, Mailchimp, GTM4WP … – fast alles ohne Bezug zur Agentur-Seite |
| Tracking (vor Einwilligung geladen!) | Google Tag Manager (GTM-KK8SCVP), Google Analytics 4 (2 Properties), Google Ads/DoubleClick, Meta Pixel, Microsoft Clarity, Pinterest Tag, Shoplytics, Mailchimp, Sourcebuster |
| Cookies beim ersten Aufruf | `_ga`, `_ga_*`, `_gcl_au`, `_fbp`, `_clck`, `_clsk`, `_pin_unauth`, `sbjs_*`, `mailchimp_landing_site` – **ohne Einwilligung** |
| Cookie-Banner | „Wir lieben Kekse ♥ … Mit deiner weiteren Nutzung gehen wir von deinem Einverständnis aus. [OK]“ – reines Hinweis-Banner ohne Ablehnen-Option → nicht DSGVO-konform |
| Schriften | Mulish (200/400), Libre Baskerville (400, italic), Anton (400) lokal über Avada; **„Garamond, serif“ als Systemschrift** → auf macOS/iOS/Android meist Fallback auf Times |
| Formular | Avada Fusion Form (AJAX an WordPress), Felder Name*, Firma*, E-Mail*, Tel., Notizen; Erfolgs-/Fehlermeldung als Alert |
| Video | Selbst gehostetes MP4 (H.264, 4,2 MB), `autoplay muted loop preload="auto"` → lädt sofort komplett |
| Design-Switch | Normaler Link auf eine **zweite Seite** (`/agentur-fancy/` → Louder, Rückweg auf Hauptseite). Kein gespeicherter Zustand. |
| SEO | Beide Seiten mit identischem Title/Description und **selbstreferenzierendem Canonical** → Duplicate Content. Leere `<h1>`-Elemente (Avada-Titel), eigentliche Überschriften als `<h5>`/`<p>`. Kein strukturiertes Datenmodell für die Agentur. Louder-OG-Bild zeigt eine Eternal-Flame-Kerze. |
| Navigation | Anker `#erfahrungen` existiert nicht (Link ohne Ziel), `#kundenliebe` sitzt vor „Some insights“, `#leistungen` dreimal vergeben |
| Mobil | Feel/Flow/Grow/Glow-Bilder überlappen sich, Hero-Untertitel läuft rechts aus dem Viewport (Louder) |
| Hover-States | Outline-Buttons ohne sichtbares Hover-Feedback (transparent → transparent) |

## 2. Seitenstruktur (identisch in beiden Welten)

1. **Hero** – Foto Pia & Nina vor Leinenvorhang (fixiert), Navigation, „Online *Boutique* Agentur ²“, Untertitel
2. **Intro** – Bild links, rechts „Wir **l(i)eben**| Boutique Agentur.“ (Schreibmaschine), Text, Button „Lass uns reden“
3. Linie · **„*Harmonie* als Basis für *gemeinsamen* Erfolg.“** + Text
4. **Collage** feel – flow – grow – glow (4 versetzte Hochformate)
5. Linie · **„Wenn *Kopf* und *Herz* im Einklang sind.“** + Text
6. Linie · **„Unsere *Leistungen*.“** + Text + 9 Leistungen (Icon + Name, 3×3)
7. Linie · **„Unsere Erfahrung/Expertise/Unser Know-how.“** (Schreibmaschine) + 5 Stationen mit Logos + „Jetzt anfragen“
8. **„Welcher Design-Typ bist du?“** – Slider (2 Vorschaubilder) + Text + Switch-Button
9. **Kundenstimmen** – 3 Karten (Nina Kraft, Manuela Kalupar, Sandra Schier), versetzt
10. **Some insights** – Foto fixiert + Grau-Verlauf (multiply), 4 Zähler (2 · +10² · +999 · 100 %)
11. **Kontakt** – Video links, „Erzähl uns von dir.“ + Formular rechts
12. **Kontaktblock** – Name, Adresse, E-Mail, Telefon, WhatsApp
13. **Footer-Leiste** – © 2026 Online Boutique Agentur | Impressum | Datenschutz

## 3. Vergleich der Designwelten

| | minimal | louder |
| --- | --- | --- |
| Grundfarbe | `#f6f4f2` (warmes Off-White) | `#cecbc8` (warmes Grau) |
| Akzent | Schwarz | Orange `#fab14f` |
| Überschriften | Libre Baskerville 29–30 px, -1 px, *Kursiv-Akzente* | Anton 50–90 px, Kleinschreibung, +2 px, orange/schwarz |
| Hero | Zentriert, weiß, 50 px | Linksbündig, Anton 90 px orange, je Wort eine Zeile, Untertitel `#3f3f3f`, Navigation rechts & dunkel |
| Bildecken | 20 px Radius | eckig |
| Intro-Bild | S/W-Foto | animiertes GIF mit orangem „B“ |
| Collage | Fotos mit weißem Serif-Schriftzug | gleiche Fotos mit orangem Anton-Schriftzug |
| „unsere leistungen“ | zentriert über Text | zweispaltig: 80 px Überschrift rechtsbündig links, Text rechts |
| Design-Typ-Sektion | Hintergrund wie Seite | Hintergrund Orange |
| Kundenstimmen-Titel | „Loved by our *clients*.“ (Garamond 28 px) | „client love“ ×3 gestapelt, blinkend (flash) |
| Karten | weiß, 20 px Radius | orange, eckig |
| Zähler | weiß | orange |
| Footer-Text | weiß | orange |
| Animationen | ruhig: Reveal von oben, Slide-in | zusätzlich bounce-in (flow), flash (Überschriften) |
| Gemeinsam | Mulish als Fließtext (200), Garamond für Leistungs-/Erfahrungsnamen, Icons, Logos, Kundenfotos, Insights-Foto, Video, Formular, alle Texte |

**Textunterschiede:** Louder hat bei „unsere leistungen“ einen abgeschnittenen Einleitungstext
(beginnt mit „persönlich für dich da …“) – vermutlich ein Versehen → in der neuen Seite gilt der
vollständige Text der Hauptversion für beide Welten. „Geschätftsführerin“ (Tippfehler in minimal)
→ „Geschäftsführerin“ wie in louder.

## 4. Sprache des Switches

Bestehende Begriffe auf der Seite: **„welcher design-typ bist du?“**, **„Twins-Look: Gleiche DNA.
Zwei Perspektiven.“**, Buttons **„Switch to louder design“ / „Switch to minimal design“**, Sticker
in den Vorschaubildern **„switch to twin design“**.

→ Entscheidung: Die Welten heißen weiterhin **minimal** und **louder** (eigene Begriffe der Marke,
statt generischer Wörter wie Calm/Bold). Der Hero-Switch ist der orange **„switch to twin design“-Sticker**
aus der bestehenden Bildsprache (Zwillinge = zwei Designs). „Dark/Light“-Assoziationen werden
vermieden: kein Sonne/Mond-Icon, kein Schalter-Look.

## 5. Gemeinsame Komponenten vs. Varianten

- **Komplett gemeinsam (nur Tokens):** Navigation, Buttons, Leistungen, Erfahrung, Kontakt, Formular, Footer
- **Gemeinsam + Layout-Variante:** Hero (zentriert ↔ linksbündig), Section-Head (zentriert ↔ zweispaltig), Kundenstimmen-Titel
- **Gemeinsam + Bild-Variante:** Intro-Bild, Collage (`ThemedImage`)
- **Nur Animation unterschiedlich:** Collage (bounce), Design-Typ-Titel & client love (flash)
