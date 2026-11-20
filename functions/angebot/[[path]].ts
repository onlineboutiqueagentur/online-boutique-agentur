/**
 * /angebot/<slug>/ – Angebote aus dem CRM, ohne neuen Build.
 *
 * Gibt es im Speicher (KV, Bindung ANFRAGEN) einen Eintrag `angebot:<slug>`, wird die statische
 * Vorlage /angebot/_vorlage/ geladen und an allen Stellen mit data-a="…" mit den Daten gefüllt.
 * /angebot/brief/<slug>/ – dasselbe Angebot als persönlicher Brief, aus /angebot/brief/_vorlage/.
 * Sonst geht die Anfrage normal weiter – feste Seiten wie /angebot/beispiel/ bleiben, wie sie sind.
 * Format der Daten: lib/angebot-daten.ts
 */
import type { Env } from '../../lib/auth';
import {
  datum,
  euro,
  gesamtpreis,
  gueltigText,
  growText,
  betragPdf,
  datumPdf,
  anredeTeile,
  laden,
  rabattBetragText,
  rabattText,
  zusatzText,
  type AngebotDaten,
  type AngebotPosition,
} from '../../lib/angebot-daten';

/** Minimale Typen für die Cloudflare-Laufzeit (kein zusätzliches Paket nötig). */
interface Element {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): Element;
  setInnerContent(content: string, options?: { html?: boolean }): Element;
  prepend(content: string, options?: { html?: boolean }): Element;
  append(content: string, options?: { html?: boolean }): Element;
  remove(): Element;
  replace(content: string, options?: { html?: boolean }): Element;
  readonly attributes: IterableIterator<[string, string]>;
}
interface Rewriter {
  on(selector: string, handlers: { element(el: Element): void }): Rewriter;
  transform(response: Response): Response;
}
declare const HTMLRewriter: { new (): Rewriter };

interface PagesContext {
  request: Request;
  env: Env & { ASSETS: { fetch(input: Request | string): Promise<Response> } };
  params: { path?: string[] };
  next(): Promise<Response>;
}

const VORLAGE = '/angebot/_vorlage/';
const VORLAGE_BRIEF = '/angebot/brief/_vorlage/';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Hervorhebungen aus dem CRM: **fett** und __unterstrichen__ (auf bereits maskiertem Text) */
const format = (html: string) =>
  html.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>').replace(/__([^_\n]+?)__/g, '<u>$1</u>');

/** Persönlicher Gruß ist reiner Text – Zeilenumbrüche werden zu <br>, **fett** und __unterstrichen__ erlaubt. */
const grussHtml = (s: string) => format(escapeHtml(s)).replace(/\r?\n/g, '<br />');

/** Scoped-CSS-Attribut von Astro übernehmen, damit eingefügte Elemente gleich aussehen wie bei festen Angeboten */
const astroCid = (el: Element) => [...el.attributes].map(([name]) => name).find((name) => name.startsWith('data-astro-cid-'));

/** Weitere Positionen als Zeilen – gleiche Klassen wie die festen Zeilen der jeweiligen Vorlage */
/** Beschreibung: Leerzeile = neuer Absatz, einfacher Zeilenumbruch = <br> */
function absaetzeHtml(text: string, c: string): string {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((absatz) => absatz.trim())
    .filter(Boolean)
    .map((absatz) => `<p${c}>${format(escapeHtml(absatz)).replace(/\r?\n/g, '<br />')}</p>`)
    .join('');
}

/** Weitere Positionen als Tabellenzeilen im PDF (Offerte) */
/** Position „The Smart Website Concept“ – darunter steht die Domain der Kund:in */
const istConcept = (titel: string) => /smart website concept/i.test(titel);

function positionenPdfHtml(positionen: AngebotPosition[], pauschale: string, cid: string | undefined, domain: string | null): string {
  const c = cid ? ` ${cid}` : '';
  return positionen
    .map((pos) => {
      const notiz = pos.notiz ? absaetzeHtml(pos.notiz, c) : '';
      // lange, ausformulierte Punkte einspaltig, kurze zweispaltig
      const lang = pos.kacheln.some((k) => k.length > 40) ? ' class="pdf__liste-lang"' : '';
      const kacheln = pos.kacheln.length ? `<ul${lang}${c}>${pos.kacheln.map((k) => `<li${c}>${format(escapeHtml(k))}</li>`).join('')}</ul>` : '';
      const inhalt = notiz || kacheln ? `<tr class="pdf__inhalt"${c}><td colspan="3"${c}>${notiz}${kacheln}</td></tr>` : '';
      return `<tbody class="pdf__pos"${c}><tr class="pdf__band"${c}><td${c}>${escapeHtml(pos.titel)}${pos.untertitel ? `<span class="pdf__untertitel"${c}>${escapeHtml(pos.untertitel)}</span>` : ''}${domain && istConcept(pos.titel) ? `<span class="pdf__untertitel"${c}>für ${escapeHtml(domain)}</span>` : ''}</td><td class="pdf__anzahl"${c}>${escapeHtml(pos.anzahl || pauschale)}</td><td class="pdf__summe"${c}>${betragPdf(pos.betrag)}</td></tr>${inhalt}</tbody>`;
    })
    .join('');
}

function positionenHtml(positionen: AngebotPosition[], brief: boolean, cid: string | undefined, domain: string | null): string {
  const c = cid ? ` ${cid}` : '';
  return positionen
    .map((pos) => {
      const titel = escapeHtml(pos.titel);
      const notiz = pos.notiz ? escapeHtml(pos.notiz) : '';
      if (!brief) {
        const kacheln = pos.kacheln.length ? `<span class="a-price__note"${c}>${pos.kacheln.map((k) => format(escapeHtml(k))).join(' · ')}</span>` : '';
        return `<div class="a-price__line"${c}><dt${c}><span${c}>${titel}</span>${notiz ? `<span class="a-price__note"${c}>${notiz}</span>` : ''}${kacheln}</dt><dd${c}>${euro(pos.betrag)}</dd></div>`;
      }
      // ausformuliert wie in der Offerte: Beschreibung als Absätze, darunter die Aufzählung
      const text = pos.notiz ? absaetzeHtml(pos.notiz, c) : '';
      const liste = pos.kacheln.length ? `<ul class="b-pos__list"${c}>${pos.kacheln.map((k) => `<li${c}>${format(escapeHtml(k))}</li>`).join('')}</ul>` : '';
      const inhalt = text || liste ? `<dd class="b-pos"${c}>${text}${liste}</dd>` : '';
      return `<div class="b-line b-line--pos"${c}><dt class="b-concept"${c}><span class="b-concept__name"${c}>${titel}</span>${pos.untertitel ? `<span class="b-concept__tag"${c}>${escapeHtml(pos.untertitel)}</span>` : ''}${domain && istConcept(pos.titel) ? `<span class="b-pos__domain"${c}>für ${escapeHtml(domain)}</span>` : ''}</dt><dd class="b-pos__anzahl"${c}>${escapeHtml(pos.anzahl)}</dd><dd${c}>${euro(pos.betrag)}</dd>${inhalt}</div>`;
    })
    .join('');
}

function fuellen(response: Response, a: AngebotDaten, brief = false): Response {
  const p = a.preise;
  const zusatzSumme = a.zusatzSeiten * p.zusatzSeite;
  // Einmalpreis abzüglich Rabatt aus dem CRM
  const gesamt = gesamtpreis(a);
  const empfohlen = new Set(a.empfohlen);
  const pfad = brief ? `/angebot/brief/${a.slug}/` : `/angebot/${a.slug}/`;
  const vorlage = brief ? VORLAGE_BRIEF : VORLAGE;
  // „Sandra“ → „Hallo Sandra,“ · „Liebe Sandra“ → „Liebe Sandra,“
  const anrede = anredeTeile(a.anrede);
  let tippText = '';

  const text = (wert: string) => ({ element: (el: Element) => void el.setInnerContent(wert) });
  const wert = (v: string) => ({ element: (el: Element) => void el.setAttribute('value', v) });
  // Kopf: Titel, Beschreibung und Adressen der Vorlage auf dieses Angebot umschreiben
  const kopf = (attr: string) => ({
    element: (el: Element) => {
      const alt = el.getAttribute(attr);
      if (alt) el.setAttribute(attr, alt.replace('Vorname', anrede.name).replace('für Firma', `für ${a.firma}`).replace(vorlage, pfad));
    },
  });

  return new HTMLRewriter()
    .on('title', text(brief ? `Für ${anrede.name}: dein Angebot | Online Boutique Agentur` : `Dein Angebot, ${anrede.name} | Online Boutique Agentur`))
    .on('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]', kopf('content'))
    .on('link[rel="canonical"]', kopf('href'))
    .on('[data-a="firma"]', text(a.firma))
    .on('[data-a="hallo"]', text(anrede.gruss))
    .on('[data-a="gruss"]', {
      element: (el) => {
        if (a.gruss) el.setInnerContent(grussHtml(a.gruss), { html: true });
        else el.setInnerContent(el.getAttribute('data-standard') ?? '');
      },
    })
    .on('[data-a="meta"]', text(`Erstellt am ${datum(a.erstellt)} · ${gueltigText(datum(a.gueltigBis))}`))
    .on('[data-a="grow"]', text(growText(euro(p.zusatzSeite))))
    .on('[data-a="onepager"]', text(euro(p.onepager)))
    .on('[data-a="zusatz"]', { element: (el) => void (a.zusatzSeiten > 0 || el.remove()) })
    .on('[data-a="zusatz-text"]', text(zusatzText(a.zusatzSeiten)))
    .on('[data-a="zusatz-notiz"]', {
      element: (el) => void (a.zusatzSeitenNotiz ? el.setInnerContent(a.zusatzSeitenNotiz) : el.remove()),
    })
    .on('[data-a="zusatz-rechnung"]', text(`${a.zusatzSeiten} × ${euro(p.zusatzSeite)}`))
    .on('[data-a="zusatz-summe"]', text(euro(zusatzSumme)))
    .on('[data-a="positionen"]', {
      element: (el) => {
        if (a.positionen.length) el.replace(positionenHtml(a.positionen, brief, astroCid(el), a.domain), { html: true });
        else el.remove();
      },
    })
    // PDF (Offerte im Design der Rechnung)
    .on('[data-a="pdf-name"]', text(a.name))
    .on('[data-a="pdf-anschrift"]', {
      element: (el) => {
        if (!a.anschrift) return void el.remove();
        el.setInnerContent(`<br />${escapeHtml(a.anschrift).replace(/\r?\n/g, '<br />')}`, { html: true });
      },
    })
    .on('[data-a="concept-domain"]', { element: (el) => void (a.domain ? el.setInnerContent(`für ${a.domain}`) : el.remove()) })
    .on('[data-a="pdf-datum"]', text(datumPdf(a.erstellt)))
    .on('[data-a="pdf-gueltig"]', text(datumPdf(a.gueltigBis)))
    .on('[data-a="pdf-onepager"]', text(betragPdf(p.onepager)))
    .on('[data-a="pdf-zusatz-anzahl"]', text(`${a.zusatzSeiten} × ${betragPdf(p.zusatzSeite)}`))
    .on('[data-a="pdf-zusatz-summe"]', text(betragPdf(zusatzSumme)))
    .on('[data-a="pdf-rabatt-betrag"]', text(a.rabatt ? `− ${betragPdf(a.rabatt.betrag)}` : ''))
    .on('[data-a="pdf-gesamt"]', text(betragPdf(gesamt)))
    .on('[data-a="pdf-positionen"]', {
      element: (el) => {
        if (a.positionen.length) el.replace(positionenPdfHtml(a.positionen, el.getAttribute('data-pauschale') ?? 'Pauschale', astroCid(el), a.domain), { html: true });
        else el.remove();
      },
    })
    // Fester Concept-Baustein nur bei älteren Angeboten (Onepager-Preis > 0); Klappboxen nur mit dem Produkt
    .on('[data-a="concept-fest"]', { element: (el) => void ((a.produkte?.includes('onepager') && p.onepager > 0) || el.remove()) })
    // ohne monatliche Betreuung (0 €) kein Hinweis „Danach Hosting & Betreuung …“
    .on('[data-a="betreuung-hinweis"]', { element: (el) => void (p.betreuungMonat > 0 || el.remove()) })
    .on('[data-a="details"]', { element: (el) => void (a.produkte?.includes('onepager') || el.remove()) })
    .on('[data-a="extras-hinweis"]', { element: (el) => void (a.produkte?.includes('onepager') || el.remove()) })
    // Brief ohne unseren Vorschlagstext: nur der persönliche Gruß bleibt
    .on('[data-a="brief-standard"]', { element: (el) => void (a.standardText || el.remove()) })
    .on('[data-a="rabatt"]', { element: (el) => void (a.rabatt || el.remove()) })
    .on('[data-a="rabatt-name"]', text(a.rabatt ? rabattText(a.rabatt) : ''))
    .on('[data-a="rabatt-betrag"]', text(a.rabatt ? rabattBetragText(a.rabatt.betrag) : ''))
    .on('[data-a="gesamt"]', text(euro(gesamt)))
    .on('[data-a="betreuung"]', text(euro(p.betreuungMonat)))
    .on('[data-tipp]', { element: (el) => void (tippText = el.getAttribute('data-tipp') ?? '') })
    .on('[data-topping]', {
      element: (el) => {
        if (!empfohlen.has(el.getAttribute('data-topping') ?? '')) return;
        el.setAttribute('class', `${el.getAttribute('class') ?? ''} is-empfohlen`);
        // Scoped-CSS-Attribut von Astro übernehmen, damit der Hinweis gleich aussieht wie bei festen Angeboten
        const cid = astroCid(el);
        el.prepend(`<span class="a-topping__tip"${cid ? ` ${cid}` : ''}>${escapeHtml(tippText)}</span>`, { html: true });
      },
    })
    // Brief (/angebot/brief/<slug>/)
    .on('[data-a="brief"]', { element: (el) => void el.setAttribute('aria-label', `Brief an ${anrede.name}`) })
    .on('[data-a="brief-hallo"]', text(anrede.gruss))
    .on('[data-a="brief-gruss"]', {
      element: (el) => {
        if (a.gruss) el.setInnerContent(grussHtml(a.gruss), { html: true });
        else el.setInnerContent((el.getAttribute('data-standard') ?? '').replace('FIRMA', a.firma));
      },
    })
    .on('[data-a="datum"]', text(datum(a.erstellt)))
    .on('[data-brief-topping]', {
      element: (el) => {
        if (empfohlen.has(el.getAttribute('data-brief-topping') ?? '')) el.setAttribute('class', `${el.getAttribute('class') ?? ''} is-tipp`);
      },
    })
    .on('[data-brief-tipp]', {
      element: (el) => {
        if (!empfohlen.has(el.getAttribute('data-brief-tipp') ?? '')) return;
        const cid = astroCid(el);
        el.append(`<span class="b-topping__tipp"${cid ? ` ${cid}` : ''}>${escapeHtml(el.getAttribute('data-tipp-text') ?? '')}</span>`, { html: true });
      },
    })
    .on('[data-a="name"]', wert(a.name))
    .on('[data-a="company"]', wert(a.firma))
    .on('[data-a="email"]', wert(a.email))
    // Zusatzseiten gibt es nicht mehr – nur ältere Angebote haben noch welche
    .on('[data-a="message"]', wert(`The Smart Website Concept · ${euro(gesamt)}${a.zusatzSeiten > 0 ? ` · ${a.zusatzSeiten} Zusatzseite(n)` : ''}${a.positionen.length ? ` · ${a.positionen.map((pos) => pos.titel).join(', ')}` : ''}`))
    .on('[data-a="slug"]', wert(a.slug))
    .on('[data-a="note"]', text(`The Smart Website Concept · ${euro(gesamt)}`))
    .on('[data-a="gueltig"]', text(gueltigText(datum(a.gueltigBis))))
    .on('[data-a="online"]', text(`Online: www.online-boutique-agentur.at${pfad}`))
    .transform(response);
}

export const onRequestGet = async (ctx: PagesContext): Promise<Response> => {
  const teile = ctx.params.path ?? [];
  const brief = teile[0] === 'brief';
  const slug = (brief ? teile[1] : teile[0]) ?? '';
  // Die Vorlage selbst ist kein Angebot
  if (slug === '_vorlage') return new Response('Nicht gefunden', { status: 404 });
  if (teile.length !== (brief ? 2 : 1) || !ctx.env.ANFRAGEN) return ctx.next();

  const a = await laden(ctx.env.ANFRAGEN, slug);
  if (!a) return ctx.next();

  const url = new URL(ctx.request.url);
  const pfad = brief ? `/angebot/brief/${slug}/` : `/angebot/${slug}/`;
  if (!url.pathname.endsWith('/')) return Response.redirect(`${url.origin}${pfad}`, 301);

  const vorlage = await ctx.env.ASSETS.fetch(new URL(brief ? VORLAGE_BRIEF : VORLAGE, url).toString());
  if (!vorlage.ok) return ctx.next();

  const headers = new Headers(vorlage.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  // Persönliche Daten: nicht zwischenspeichern, damit Änderungen aus dem CRM sofort sichtbar sind
  headers.set('Cache-Control', 'private, no-store');
  headers.delete('ETag');
  headers.delete('Content-Length');
  return fuellen(new Response(vorlage.body, { status: 200, headers }), a, brief);
};
