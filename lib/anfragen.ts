/**
 * Speicherung der Kontaktanfragen in Cloudflare KV (Bindung: ANFRAGEN).
 * Jede Anfrage ist ein eigener Eintrag – gleichzeitige Anfragen überschreiben sich nicht.
 * Schlüssel sortieren sich „neueste zuerst“. Einträge löschen sich nach 2 Jahren selbst.
 */
import type { KV } from './auth';

export interface Anfrage {
  id: string;
  eingang: string; // ISO-Zeitpunkt
  gelesen: boolean;
  name: string;
  firma: string;
  /** Optional: Website der anfragenden Marke */
  webseite?: string;
  email: string;
  telefon: string;
  nachricht: string;
  /** Designwelt beim Absenden: minimal, louder oder unbekannt (z. B. ohne JavaScript) */
  design?: 'minimal' | 'louder' | 'unbekannt';
  /** Herkunft: normales Kontaktformular oder Croissant-Einladung (/croissant) */
  quelle?: 'website' | 'croissant';
  /** Nur Croissant-Einladung: Wo frühstücken wir? / Wann passt es? */
  format?: string;
  wunschtermin?: string;
  /** Nur Croissant-Einladung: im Quiz angetippte Aussagen */
  quiz?: string[];
  mail: 'gesendet' | 'fehlgeschlagen' | 'nicht eingerichtet';
}

export const AUFBEWAHRUNG_SEKUNDEN = 60 * 60 * 24 * 730; // 2 Jahre
const PREFIX = 'anfrage:';
const MAX_TS = 9_999_999_999_999;

/** Absteigend sortierbarer Schlüssel: neuere Anfragen haben kleinere Schlüssel. */
export const keyFor = (a: Pick<Anfrage, 'id' | 'eingang'>) =>
  `${PREFIX}${String(MAX_TS - Date.parse(a.eingang)).padStart(13, '0')}:${a.id}`;

const restTtl = (a: Anfrage) => {
  const alter = Math.floor((Date.now() - Date.parse(a.eingang)) / 1000);
  return Math.max(60, AUFBEWAHRUNG_SEKUNDEN - alter);
};

export async function speichern(kv: KV, a: Anfrage): Promise<void> {
  await kv.put(keyFor(a), JSON.stringify(a), { expirationTtl: restTtl(a) });
}

export async function alleLaden(kv: KV, limit = 1000): Promise<Anfrage[]> {
  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix: PREFIX, cursor });
    keys.push(...page.keys.map((k) => k.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor && keys.length < limit);

  const values = await Promise.all(keys.slice(0, limit).map((k) => kv.get<Anfrage>(k, 'json')));
  return values.filter((v): v is Anfrage => Boolean(v));
}

/** Findet eine Anfrage über ihre id (Schlüssel enthält id am Ende). */
export async function finden(kv: KV, id: string): Promise<{ key: string; anfrage: Anfrage } | null> {
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix: PREFIX, cursor });
    const hit = page.keys.find((k) => k.name.endsWith(`:${id}`));
    if (hit) {
      const anfrage = await kv.get<Anfrage>(hit.name, 'json');
      return anfrage ? { key: hit.name, anfrage } : null;
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return null;
}
