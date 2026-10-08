# Migration von eternalflame.at → online-boutique-agentur.at

Ziel: Die alten Agentur-URLs leiten dauerhaft (301) auf die neue Domain weiter. Die Louder-Seite
wird **nicht** als eigene URL weitergeführt, sondern öffnet die neue Seite direkt im Louder-Design.

## 1. Redirect-Tabelle

| Alte URL (eternalflame.at) | Neue URL | Code |
| --- | --- | --- |
| `/online-boutique-agentur/` | `https://www.online-boutique-agentur.at/` | 301 |
| `/online-boutique-agentur-louder/` | `https://www.online-boutique-agentur.at/?design=louder` | 301 |
| `/agentur-fancy/` | `https://www.online-boutique-agentur.at/?design=louder` | 301 |
| `/agentur/` | `https://www.online-boutique-agentur.at/` | 301 |
| `/impressum-agentur/` | `https://www.online-boutique-agentur.at/impressum/` | 301 |

`?design=louder` setzt die Designwelt, speichert sie lokal und wird aus der Adresszeile entfernt.
Die neue Seite hat immer den Canonical `https://www.online-boutique-agentur.at/` → **kein Duplicate Content**.

> Prüfen: `/impressum-agentur/` wird evtl. auch vom Eternal-Flame-Shop verlinkt. Falls Eternal
> Flame ein eigenes Impressum hat, ist der Redirect unkritisch; sonst erst ein Shop-Impressum anlegen.

## 2. Umsetzung auf eternalflame.at (WordPress)

**Option 1 – `.htaccess`** (vor dem WordPress-Block einfügen):

```apache
# Online Boutique Agentur → neue Domain
RewriteEngine On
RewriteRule ^online-boutique-agentur/?$ https://www.online-boutique-agentur.at/ [R=301,L]
RewriteRule ^online-boutique-agentur-louder/?$ https://www.online-boutique-agentur.at/?design=louder [R=301,L,QSD]
RewriteRule ^agentur-fancy/?$ https://www.online-boutique-agentur.at/?design=louder [R=301,L,QSD]
RewriteRule ^agentur/?$ https://www.online-boutique-agentur.at/ [R=301,L]
RewriteRule ^impressum-agentur/?$ https://www.online-boutique-agentur.at/impressum/ [R=301,L]
```

**Option 2 – Plugin „Redirection“** (falls bereits vorhanden): gleiche Regeln als 301 anlegen.

Danach in WordPress die vier Agentur-Seiten **auf „Entwurf“ setzen** (nicht löschen, bis die
Weiterleitungen sicher funktionieren), aus Menüs, interner Verlinkung und der Yoast-/Rank-Math-Sitemap entfernen.

## 3. Reihenfolge am Launch-Tag

1. Neue Seite live unter `www.online-boutique-agentur.at` (DNS-Doku), alle Tests grün
2. Redirects auf eternalflame.at aktivieren
3. Test:
   ```bash
   curl -sI https://www.eternalflame.at/online-boutique-agentur/ | grep -iE "^(HTTP|location)"
   curl -sI https://www.eternalflame.at/online-boutique-agentur-louder/ | grep -iE "^(HTTP|location)"
   ```
4. Google Search Console (siehe unten)

## 4. Google Search Console

1. Neue Property **Domain** `online-boutique-agentur.at` anlegen (Verifizierung per DNS-TXT bei World4You – ändert nichts an E-Mail).
2. Sitemap einreichen: `https://www.online-boutique-agentur.at/sitemap.xml`
3. URL-Prüfung → `https://www.online-boutique-agentur.at/` → *Indexierung beantragen*.
4. In der Property **eternalflame.at**: alte URLs per URL-Prüfung testen (sollen „Weitergeleitet“ zeigen).
   Das *Adressänderungs-Tool* ist **nicht** passend (es gilt nur für ganze Domains).
5. Nach 2–6 Wochen: Bericht *Seiten* prüfen – alte Agentur-URLs sollten aus dem Index verschwinden.

## 5. Bing Webmaster Tools

Site hinzufügen (Import aus Search Console möglich), Sitemap einreichen. Optional IndexNow.

## 6. Externe Verweise aktualisieren

- Google-Unternehmensprofil (Website-URL), Social-Media-Profile, E-Mail-Signaturen
- Verlinkungen bei Kund:innen/Partnern (z. B. Referenzseiten)
- Auf eternalflame.at ggf. einen Link „Agentur“ im Footer auf die neue Domain setzen

## 7. Was bewusst NICHT übernommen wird

- WordPress, Avada, WooCommerce, alle Plugins und deren Scripts
- Tracking von Eternal Flame (GTM, GA4, Meta Pixel, Clarity, Pinterest, Google Ads, Shoplytics, Mailchimp)
- Das Eternal-Flame-Cookie-Banner und dessen Cookies
- Eternal-Flame-Favicon und OG-Bild (Kerze)
