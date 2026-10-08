# Deployment auf Cloudflare Pages

## 1. Repository

Projekt in ein (privates) Git-Repository legen (GitHub oder GitLab). `.gitignore` schließt
`node_modules`, `dist`, `.env*` und `.dev.vars` bereits aus – **niemals API-Keys committen**.

## 2. Pages-Projekt anlegen

Cloudflare Dashboard → *Workers & Pages* → *Create* → *Pages* → *Connect to Git*:

| Einstellung | Wert |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node-Version | Umgebungsvariable `NODE_VERSION` = `24` |

Der Ordner `functions/` wird automatisch als Pages Functions erkannt (`/api/contact`).
Jeder Push auf `main` → Produktion; andere Branches → Preview-URL (`*.pages.dev`, per `_headers` auf `noindex`).

## 3. Kontaktformular & Anfragen-Übersicht (/admin)

Aufgebaut wie bei kristinainhof.at: Jede Anfrage wird **gespeichert** (Cloudflare KV) **und per Mail** über dein Postfach bei World4You verschickt (SMTP, Port 587 mit STARTTLS) – kein zusätzlicher Mail-Anbieter.
Geht eine Mail verloren, steht die Anfrage trotzdem unter **/admin** – mit Hinweis „Mail nicht zugestellt“.

### 3.1 KV-Speicher anlegen
Dashboard → *Storage & Databases → KV* → *Create* → Name `oba-anfragen`.
Dann *Workers & Pages → online-boutique-agentur → Settings → Bindings* → **KV namespace**:
Variable name `ANFRAGEN` → Namespace `oba-anfragen` (für Production **und** Preview).

(Bereits eingerichtet: Namespace `oba-anfragen`, Bindung in `wrangler.toml`.)

### 3.2 Variablen & Secrets
*Settings → Variables and Secrets* (Production und Preview):

| Variable | Typ | Beispiel |
| --- | --- | --- |
| `ADMIN_USER` | Secret | `nina` |
| `ADMIN_PASSWORD` | Secret | langes Passwort (mind. 16 Zeichen) |
| `SESSION_SECRET` | Secret | Zufallswert, z. B. `openssl rand -hex 32` |
| `SMTP_PASSWORD` | Secret | Passwort des Postfachs hello@online-boutique-agentur.at |
| `MAIL_TO`, `SMTP_USER`, `SMTP_HOST`, `SMTP_PORT` | Text | stehen in `wrangler.toml` (Empfänger, Postfach, smtp.world4you.com, 587) |

**Tipp:** Noch sicherer ist ein eigenes Postfach nur für die Website (z. B. website@…): dann `SMTP_USER` in `wrangler.toml` und `SMTP_PASSWORD` umstellen.
Alternative ohne World4You: `RESEND_API_KEY` setzen (Resend-Konto + Domain-Verifizierung nötig).

Danach **neu deployen**, damit Bindings und Secrets aktiv werden.

### 3.3 Anfragen ansehen
`https://www.online-boutique-agentur.at/admin/` → mit ADMIN_USER / ADMIN_PASSWORD anmelden.
Alle/Ungelesen filtern, als gelesen markieren, „Antworten“ (öffnet dein Mailprogramm), löschen (zweiter Klick bestätigt).
Sitzung läuft nach 8 Stunden ab. **Passwort ändern:** Secret neu setzen + neu deployen. **Alle abmelden:** SESSION_SECRET neu setzen.

### 3.4 Schutz
- Unsichtbares Spam-Feld + Mindest-Ausfüllzeit, max. 5 Anfragen pro Stunde je Absender (IP nur gehasht, 1 h)
- Login: konstante Vergleichszeit, max. 5 Fehlversuche pro 15 Minuten je IP, Cookie HttpOnly/Secure/SameSite=Strict
- Admin-Aktionen nur von der eigenen Seite (Origin-Prüfung), /admin nicht indexiert und nicht gecacht
- Gespeicherte Anfragen löschen sich automatisch nach 2 Jahren

Lokal testen: `.dev.vars` mit den Variablen anlegen, `npm run build`, dann `npx wrangler pages dev dist`.

## 4. Domain verbinden

Siehe [DNS-WORLD4YOU.md](DNS-WORLD4YOU.md). Erst nach erfolgreichem Test der `*.pages.dev`-URL.

## 5. Nach dem Go-live

- `curl -sI https://www.online-boutique-agentur.at` → Security-Header prüfen
  (oder https://securityheaders.com)
- PageSpeed Insights: https://pagespeed.web.dev/ (mobil + desktop)
- Rich-Results-Test: https://search.google.com/test/rich-results
- Weiter mit [MIGRATION.md](MIGRATION.md)

## Kosten

Cloudflare Pages Free: unbegrenzte Requests für statische Inhalte, 100.000 Function-Aufrufe/Tag
(für ein Kontaktformular mehr als genug). Domain/E-Mail weiterhin bei World4You.
