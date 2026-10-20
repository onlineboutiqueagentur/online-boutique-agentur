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
import { datum, euro, gueltigText, growText, laden, zusatzText, type AngebotDaten } from '../../lib/angebot-daten';

/** Minimale Typen für die Cloudflare-Laufzeit (kein zusätzliches Paket nötig). */
interface Element {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): Element;
  setInnerContent(content: string, options?: { html?: boolean }): Element;
  prepend(content: string, options?: { html?: boolean }): Element;
  append(content: string, options?: { html?: boolean }): Element;
  remove(): Element;
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

/** Persönlicher Gruß ist reiner Text – Zeilenumbrüche werden zu <br>. */
const grussHtml = (s: string) => escapeHtml(s).replace(/\r?\n/g, '<br />');

/** Scoped-CSS-Attribut von Astro übernehmen, damit eingefügte Elemente gleich aussehen wie bei festen Angeboten */
const astroCid = (el: Element) => [...el.attributes].map(([name]) => name).find((name) => name.startsWith('data-astro-cid-'));

function fuellen(response: Response, a: AngebotDaten, brief = false): Response {
  const p = a.preise;
  const zusatzSumme = a.zusatzSeiten * p.zusatzSeite;
  const gesamt = p.onepager + zusatzSumme;
  const empfohlen = new Set(a.empfohlen);
  const pfad = brief ? `/angebot/brief/${a.slug}/` : `/angebot/${a.slug}/`;
  const vorlage = brief ? VORLAGE_BRIEF : VORLAGE;
  let tippText = '';

  const text = (wert: string) => ({ element: (el: Element) => void el.setInnerContent(wert) });
  const wert = (v: string) => ({ element: (el: Element) => void el.setAttribute('value', v) });
  // Kopf: Titel, Beschreibung und Adressen der Vorlage auf dieses Angebot umschreiben
  const kopf = (attr: string) => ({
    element: (el: Element) => {
      const alt = el.getAttribute(attr);
      if (alt) el.setAttribute(attr, alt.replace('Vorname', a.anrede).replace('für Firma', `für ${a.firma}`).replace(vorlage, pfad));
    },
  });

  return new HTMLRewriter()
    .on('title', text(brief ? `Für ${a.anrede}: dein Angebot | Online Boutique Agentur` : `Dein Angebot, ${a.anrede} | Online Boutique Agentur`))
    .on('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]', kopf('content'))
    .on('link[rel="canonical"]', kopf('href'))
    .on('[data-a="firma"]', text(a.firma))
    .on('[data-a="hallo"]', text(`Hallo ${a.anrede},`))
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
    .on('[data-a="brief"]', { element: (el) => void el.setAttribute('aria-label', `Brief an ${a.anrede}`) })
    .on('[data-a="brief-hallo"]', text(`Hallo ${a.anrede},`))
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
    .on('[data-a="message"]', wert(`The Smart Website Concept · ${euro(gesamt)} · ${a.zusatzSeiten} Zusatzseite(n)`))
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
