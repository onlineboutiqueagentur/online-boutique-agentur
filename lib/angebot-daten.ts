/**
 * Angebote aus dem CRM (Cloudflare KV, Bindung ANFRAGEN – derselbe Speicher wie die Anfragen).
 *
 * Das CRM (~/Websites/agentur-crm, worker/services/offers.ts) schreibt pro Angebot einen Eintrag
 * `angebot:<slug>`. Die Website liest ihn in functions/angebot/[[path]].ts und setzt beim Klick auf
 * „Angebot annehmen“ nur `angenommenAm` (functions/api/contact.ts). Feldnamen und Format müssen
 * deshalb in beiden Projekten exakt gleich bleiben.
 *
 * Hier stehen nur reine Funktionen ohne Bilder/Astro-Importe, damit auch die Functions sie nutzen können.
 */
import type { KV } from './auth';

export interface AngebotPreise {
  onepager: number;
  /** je zusätzlicher Inhaltsseite */
  zusatzSeite: number;
  /** Hosting & Betreuung pro Monat */
  betreuungMonat: number;
}

/** Standardpreise in Euro – gelten, wenn ein Angebot keine eigenen Preise hat */
export const preise: AngebotPreise = {
  onepager: 1480,
  zusatzSeite: 290,
  betreuungMonat: 29,
};

/** Rabatt auf den Einmalpreis – Name frei (z. B. „Best Friends Rabatt“), Betrag in ganzen Euro */
export interface AngebotRabatt {
  name: string;
  betrag: number;
  /** nur bei Prozent-Rabatt, z. B. 10 oder 12.5 */
  prozent: number | null;
}

/** Weitere Position aus dem CRM, z. B. „Brand Look“ – Betrag in ganzen Euro, Kacheln wie beim Concept */
export interface AngebotPosition {
  titel: string;
  /** kursiv unter dem Titel, z. B. „Make it boutique.“ */
  untertitel: string | null;
  /** Beschreibung – mehrere Sätze, Absätze mit Leerzeile */
  notiz: string | null;
  betrag: number;
  /** Aufzählungspunkte */
  kacheln: string[];
  /** Spalte „Anzahl“, z. B. „Pauschale“ oder „geschätzter Aufwand 5h“ */
  anzahl: string;
}

/** Gespeichertes Format (Version 1) */
export interface AngebotDaten {
  v: 1;
  slug: string;
  anrede: string;
  firma: string;
  name: string;
  email: string;
  /** Persönliche Zeilen nach „Hallo …,“ – reiner Text, Zeilenumbrüche erlaubt. Leer = Standardtext. */
  gruss: string | null;
  /** Produkte im Angebot – derzeit nur 'onepager' */
  produkte?: string[];
  zusatzSeiten: number;
  zusatzSeitenNotiz: string | null;
  empfohlen: string[];
  /** JJJJ-MM-TT */
  erstellt: string;
  gueltigBis: string;
  preise: AngebotPreise;
  /** Optional: Rabatt aus dem CRM; fehlt = kein Rabatt */
  rabatt?: AngebotRabatt;
  /** Weitere Positionen aus dem CRM */
  positionen: AngebotPosition[];
  /** false = im Brief nur der persönliche Gruß, ohne unseren Vorschlagstext (fehlt = true) */
  standardText: boolean;
  /** Anschrift fürs PDF (mehrzeilig) */
  anschrift: string | null;
  /** z. B. „www.evented.at“ – unter „The Smart Website Concept“ */
  domain: string | null;
  /** Nur von der Website gesetzt, wenn der Kunde annimmt (ISO-Zeitpunkt) */
  angenommenAm?: string;
}

const PREFIX = 'angebot:';
export const SLUG_RE = /^[a-z0-9-]{1,80}$/;
const DATUM_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 1480 → „€ 1.480,–“ (Tausenderpunkt wie im bisherigen Angebot) */
export const euro = (n: number) => `€ ${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')},–`;

/** '2026-12-31' → „31. Dezember 2026“ */
export const datum = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' });

export const zusatzText = (n: number) => (n === 1 ? '1 zusätzliche Inhaltsseite' : `${n} zusätzliche Inhaltsseiten`);
export const gueltigText = (datumText: string) => `Angebot gültig bis ${datumText}`;
export const growText = (preis: string) => `Jede weitere Inhaltsseite: ${preis}`;
/** PDF wie die Rechnung: 1480 → „1.480,00“, '2026-08-26' → „26.08.2026“ */
export const betragPdf = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')},00`;
export const datumPdf = (iso: string) => iso.split('-').reverse().join('.');

/**
 * Anrede aus dem CRM: nur der Name („Sandra“) → „Hallo Sandra,“; mit Grußwort („Liebe Sandra“) → genau so.
 * name = ohne Grußwort, für Seitentitel und „Brief an …“.
 */
const GRUSSWORT = /^(liebe[rs]?|hallo|hi|hey|servus|grüß dich|guten (morgen|tag|abend)|sehr geehrte[rs]?)(\s+|$)/i;
export function anredeTeile(anrede: string): { gruss: string; name: string } {
  const treffer = anrede.match(GRUSSWORT);
  if (!treffer) return { gruss: `Hallo ${anrede},`, name: anrede };
  return { gruss: `${anrede.replace(/[\s,!.]+$/, '')},`, name: anrede.slice(treffer[0].length).replace(/[\s,!.]+$/, '').trim() || anrede };
}

/** „Best Friends Rabatt“ bzw. „Rabatt (10 %)“ */
export const rabattText = (r: AngebotRabatt) => (r.prozent ? `${r.name} (${String(r.prozent).replace('.', ',')} %)` : r.name);
export const rabattBetragText = (betrag: number) => `− ${euro(betrag)}`;

/** Einmalpreis: Onepager + Zusatzseiten, abzüglich Rabatt (nie unter 0) */
export function gesamtpreis(a: { zusatzSeiten: number; preise: AngebotPreise; rabatt?: AngebotRabatt; positionen?: AngebotPosition[] }): number {
  const positionen = (a.positionen ?? []).reduce((summe, pos) => summe + pos.betrag, 0);
  const summe = a.preise.onepager + a.zusatzSeiten * a.preise.zusatzSeite + positionen;
  return Math.max(0, summe - (a.rabatt?.betrag ?? 0));
}

const ganzzahl = (n: unknown, min = 0) => (typeof n === 'number' && Number.isInteger(n) && n >= min ? n : null);
const text = (s: unknown) => (typeof s === 'string' && s.trim() ? s.trim() : null);

/** Weitere Positionen: nur mit Titel und Betrag ≥ 0; Kacheln als Textliste */
function positionenAus(raw: unknown): AngebotPosition[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((p): AngebotPosition[] => {
    if (!p || typeof p !== 'object') return [];
    const r = p as Record<string, unknown>;
    const titel = text(r.titel);
    const betrag = ganzzahl(r.betrag);
    if (!titel || betrag === null) return [];
    const kacheln = Array.isArray(r.kacheln) ? r.kacheln.map(text).filter((k): k is string => Boolean(k)) : [];
    return [{ titel, untertitel: text(r.untertitel), notiz: text(r.notiz), betrag, kacheln, anzahl: text(r.anzahl) ?? 'Pauschale' }];
  });
}

/** Rabatt nur übernehmen, wenn Name und ein Betrag > 0 da sind */
function rabattAus(raw: unknown): AngebotRabatt | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const name = text(r.name);
  const betrag = ganzzahl(r.betrag, 1);
  if (!name || betrag === null) return undefined;
  return { name, betrag, prozent: typeof r.prozent === 'number' && r.prozent > 0 && r.prozent <= 100 ? r.prozent : null };
}

/** Prüft einen Eintrag aus dem Speicher; unvollständige Einträge zählen als „nicht vorhanden“. */
export function pruefen(raw: unknown): AngebotDaten | null {
  if (!raw || typeof raw !== 'object') return null;
  const a = raw as Record<string, unknown>;
  const p = (a.preise ?? {}) as Record<string, unknown>;
  const slug = text(a.slug);
  const anrede = text(a.anrede);
  const firma = text(a.firma);
  const name = text(a.name);
  const email = text(a.email);
  const zusatzSeiten = ganzzahl(a.zusatzSeiten);
  const erstellt = typeof a.erstellt === 'string' && DATUM_RE.test(a.erstellt) ? a.erstellt : null;
  const gueltigBis = typeof a.gueltigBis === 'string' && DATUM_RE.test(a.gueltigBis) ? a.gueltigBis : null;
  if (!slug || !SLUG_RE.test(slug) || !anrede || !firma || !name || !email || zusatzSeiten === null || !erstellt || !gueltigBis) {
    return null;
  }
  return {
    v: 1,
    slug,
    anrede,
    firma,
    name,
    email,
    gruss: text(a.gruss),
    produkte: Array.isArray(a.produkte) ? a.produkte.filter((x): x is string => typeof x === 'string') : ['onepager'],
    zusatzSeiten,
    zusatzSeitenNotiz: text(a.zusatzSeitenNotiz),
    empfohlen: Array.isArray(a.empfohlen) ? a.empfohlen.filter((x): x is string => typeof x === 'string') : [],
    erstellt,
    gueltigBis,
    preise: {
      onepager: ganzzahl(p.onepager) ?? preise.onepager,
      zusatzSeite: ganzzahl(p.zusatzSeite) ?? preise.zusatzSeite,
      betreuungMonat: ganzzahl(p.betreuungMonat) ?? preise.betreuungMonat,
    },
    rabatt: rabattAus(a.rabatt),
    positionen: positionenAus(a.positionen),
    standardText: a.standardText !== false,
    anschrift: text(a.anschrift),
    domain: text(a.domain),
    angenommenAm: typeof a.angenommenAm === 'string' ? a.angenommenAm : undefined,
  };
}

export async function laden(kv: KV, slug: string): Promise<AngebotDaten | null> {
  if (!SLUG_RE.test(slug)) return null;
  return pruefen(await kv.get<unknown>(PREFIX + slug, 'json'));
}

/** Beim Annehmen: Zeitpunkt vermerken (nur beim ersten Mal). Alle anderen Felder bleiben, wie das CRM sie geschrieben hat. */
export async function alsAngenommenMarkieren(kv: KV, slug: string, zeitpunkt: string): Promise<boolean> {
  if (!SLUG_RE.test(slug)) return false;
  const raw = await kv.get<Record<string, unknown>>(PREFIX + slug, 'json');
  if (!raw) return false;
  if (!raw.angenommenAm) await kv.put(PREFIX + slug, JSON.stringify({ ...raw, angenommenAm: zeitpunkt }));
  return true;
}
