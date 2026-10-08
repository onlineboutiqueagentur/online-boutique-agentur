# DNS-Plan: Website auf Cloudflare – Domain & E-Mail bleiben bei World4You

## Ist-Zustand (öffentlich abgefragt am 06.10.2026)

| Name | Typ | Wert | Zweck |
| --- | --- | --- | --- |
| `online-boutique-agentur.at` | NS | `ns1.world4you.at`, `ns2.world4you.at` | DNS liegt bei World4You |
| `online-boutique-agentur.at` | A | `81.19.154.98` | World4You-Webspace |
| `www` | A | `81.19.154.98` | World4You-Webspace |
| `online-boutique-agentur.at` | **MX** | `10 mail.online-boutique-agentur.at` | **E-Mail – nicht anfassen** |
| `mail` | A | `81.19.149.70` | **Mailserver – nicht anfassen** |
| `imap` | CNAME | `imap.world4you.com` | **E-Mail-Client – nicht anfassen** |
| `online-boutique-agentur.at` | **TXT (SPF)** | `v=spf1 mx include:spf.w4ymail.at -all` | **nicht anfassen** |
| `_dmarc` | TXT | – (nicht vorhanden) | siehe Empfehlung unten |
| DKIM | TXT | – unter gängigen Selektoren nicht gefunden | im World4You-Panel prüfen |

> ⚠️ Vor jeder Änderung: im World4You-Kundenbereich **Screenshot/Export aller DNS-Einträge** machen.
> Öffentlich nicht sichtbare Einträge (z. B. DKIM mit unbekanntem Selektor, `autodiscover`) gibt es eventuell zusätzlich.

---

## Umstellung durchgeführt am 07.10.2026 (Variante A)

- Cloudflare Pages → *Custom domains*: `www.online-boutique-agentur.at` hinzugefügt (Methode „Mein DNS-Anbieter“).
- World4You DNS: `www` **A `81.19.154.98` → CNAME `online-boutique-agentur.pages.dev`** (Eintrag bearbeitet).
- World4You *Domains → Weiterleitung* (Apex): Ziel von `https://www.eternalflame.at/online-boutique-agentur`
  auf **`https://www.online-boutique-agentur.at`** geändert („Normale Weiterleitung“).
- Unverändert: Apex A `81.19.154.98` (World4You-Weiterleitungsserver), `ftp` A `81.19.154.98`,
  MX, SPF, `mail` A `81.19.149.70`, `imap` CNAME.

- World4You *SSL / TLS*: kostenloses „Basic-Wildcard-SSL | Let's Encrypt“ (0 €, automatische Verlängerung alle 3 Monate)
  bestellt, damit `https://online-boutique-agentur.at` (ohne www) erreichbar ist und weiterleitet.

**Zurück auf den alten Stand:** `www` wieder als A `81.19.154.98` setzen und Weiterleitungsziel auf
`www.eternalflame.at/online-boutique-agentur` zurückstellen.

## Empfehlung: Variante A – nur `www` auf Cloudflare zeigen lassen (kein Risiko für E-Mail)

Die Nameserver bleiben bei World4You. Es wird **ein einziger Eintrag geändert**.
MX, SPF, DKIM, DMARC, `mail`, `imap` bleiben unberührt.

### Schritte

1. **Cloudflare Pages-Projekt anlegen** und deployen (siehe [DEPLOYMENT.md](DEPLOYMENT.md)).
   Ergebnis: `https://<projekt>.pages.dev` funktioniert.
2. In Cloudflare Pages → *Custom domains* → **`www.online-boutique-agentur.at`** hinzufügen.
   Cloudflare zeigt den benötigten CNAME-Wert an (`<projekt>.pages.dev`).
3. Im **World4You-Kundenbereich → DNS**:
   - Eintrag `www` Typ **A** `81.19.154.98` **löschen**
   - Neu: `www` Typ **CNAME** → `<projekt>.pages.dev`
   - Sonst **nichts** ändern.
4. Warten, bis Cloudflare die Domain als *Active* anzeigt (SSL-Zertifikat wird automatisch ausgestellt; meist < 30 min, TTL beachten).
5. **Apex** `online-boutique-agentur.at` → `www`:
   Der Apex-A-Eintrag zeigt weiterhin auf den World4You-Webspace. Dort eine **301-Weiterleitung**
   auf `https://www.online-boutique-agentur.at/` einrichten (World4You „Weiterleitung“ im Panel oder
   `.htaccess` auf dem Webspace):
   ```apache
   RewriteEngine On
   RewriteRule ^(.*)$ https://www.online-boutique-agentur.at/$1 [R=301,L]
   ```
   (HTTPS auf dem Apex muss bei World4You aktiv sein, damit `https://online-boutique-agentur.at` sauber weiterleitet.)
6. Testen (siehe Checkliste unten).

**Vorteil:** E-Mail kann nicht beschädigt werden. **Nachteil:** Zonen-Features von Cloudflare
(WAF-Regeln, Rate Limiting auf der eigenen Domain, Apex-Hosting) stehen nicht zur Verfügung.
Cloudflare Pages bringt trotzdem CDN, HTTPS, DDoS-Schutz und die Header aus `_headers` mit.

---

## Variante B – Nameserver zu Cloudflare (Domain-Registrierung + E-Mail bleiben bei World4You)

Nur sinnvoll, wenn WAF-/Rate-Limiting-Regeln und Apex direkt bei Cloudflare gewünscht sind.

1. Cloudflare → *Add a site* → `online-boutique-agentur.at` (Free-Plan genügt).
2. Cloudflare importiert vorhandene Einträge – **jede Zeile gegen den World4You-Export prüfen** und
   fehlende ergänzen, insbesondere:
   - `MX` `10 mail.online-boutique-agentur.at`
   - `mail` A `81.19.149.70` → **Proxy AUS (graue Wolke, „DNS only“)**
   - `imap` CNAME `imap.world4you.com` → **DNS only**
   - SPF-TXT unverändert übernehmen
   - DKIM-, DMARC-, `autodiscover`/`autoconfig`/`smtp`/`pop`/`webmail`-Einträge, falls vorhanden → **DNS only**
3. `www` → CNAME `<projekt>.pages.dev` (Proxy an), Apex → über Pages *Custom domain* hinzufügen
   oder Redirect Rule „Apex → www (301)“.
4. Erst wenn alles geprüft ist: bei World4You die **Nameserver** auf die zwei Cloudflare-Nameserver ändern.
5. Nach der Umstellung sofort E-Mail senden **und** empfangen testen.

> Grundregel: Alles, was mit E-Mail zu tun hat, ist in Cloudflare **immer „DNS only“** (graue Wolke).

---

## Empfehlung zur E-Mail-Sicherheit (unabhängig von der Website)

- **DMARC fehlt.** Empfohlener Start (nur Monitoring, ändert nichts an der Zustellung):
  `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:hello@online-boutique-agentur.at`
  Später auf `p=quarantine` verschärfen.
- **DKIM:** Im World4You-Panel prüfen, ob DKIM-Signierung aktiviert ist; falls ja, ist der Eintrag
  unter einem eigenen Selektor vorhanden. Falls nicht: bei World4You aktivieren.
- **Kontaktformular-Absender:** Wird ein E-Mail-Dienst (z. B. Brevo) mit Absender
  `website@online-boutique-agentur.at` genutzt, verlangt dieser eine Domain-Verifizierung
  (DKIM-Eintrag des Dienstes + ggf. SPF-Erweiterung). Dafür **SPF nicht ersetzen, sondern ergänzen**, z. B.:
  `v=spf1 mx include:spf.w4ymail.at include:spf.brevo.com -all` (genauen Wert aus dem Dienst übernehmen).

## Test-Checkliste nach der Umstellung

```bash
dig +short www.online-boutique-agentur.at CNAME     # → <projekt>.pages.dev
dig +short online-boutique-agentur.at MX            # → 10 mail.online-boutique-agentur.at (unverändert!)
dig +short online-boutique-agentur.at TXT           # → SPF unverändert
curl -sI https://online-boutique-agentur.at | grep -i location   # → https://www.online-boutique-agentur.at/
curl -sI https://www.online-boutique-agentur.at | head -1        # → HTTP/2 200
```

- [ ] E-Mail an hello@ von extern senden → kommt an
- [ ] E-Mail von hello@ nach extern senden → kommt an (nicht im Spam)
- [ ] Webmail/IMAP im Mailprogramm funktioniert
- [ ] Kontaktformular sendet und Mail kommt an
