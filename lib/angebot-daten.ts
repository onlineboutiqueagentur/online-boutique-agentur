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

const ganzzahl = (n: unknown, min = 0) => (typeof n === 'number' && Number.isInteger(n) && n >= min ? n : null);
const text = (s: unknown) => (typeof s === 'string' && s.trim() ? s.trim() : null);

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
