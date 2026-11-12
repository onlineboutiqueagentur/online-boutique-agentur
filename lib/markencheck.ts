/**
 * Anonyme Statistik zum Marken-Check (/marken-check) in Cloudflare KV (Bindung ANFRAGEN).
 *
 * Pro Durchlauf ein Eintrag `markencheck:<id>`. Die id entsteht zufällig im Browser beim Start und
 * lebt nur im Arbeitsspeicher der Seite (kein Cookie, kein Local Storage). Gespeichert wird nur,
 * wie weit jemand gekommen ist – keine IP, keine Antworten im Detail, kein Name.
 * Die Daten stehen in den Metadaten des Eintrags, damit die Übersicht ohne Einzelabrufe auskommt.
 * Einträge löschen sich nach 13 Monaten selbst.
 */
import type { KV } from './auth';
import { markencheck } from '../src/content/markencheck';

export interface CheckLauf {
  /** Startzeitpunkt (ISO) */
  start: string;
  /** Erledigte Schritte: 0 = gestartet, 1 = Gefühl gewählt, 1 + n = n Fragen beantwortet */
  schritt: number;
  fertig: boolean;
  /** Ergebnis-Kennung (z. B. „knistert“) und Gesamtwert in Prozent – nur wenn fertig */
  ergebnis?: string;
  prozent?: number;
  /** Prozent je Bereich – nur wenn fertig */
  bereiche?: Record<string, number>;
  gefuehle?: string[];
  /** Woher: ?von=… / utm_source oder die Domain der verweisenden Seite (ohne Pfad) */
  herkunft?: string;
  geraet?: 'mobil' | 'desktop';
  /** Kontaktformular nach dem Ergebnis abgeschickt */
  lead?: boolean;
  /** Ergebnis per Mail schicken lassen */
  mail?: boolean;
}

export const CHECK_ID_RE = /^\d{13}-[0-9a-f]{8}$/;
const PREFIX = 'markencheck:';
const AUFBEWAHRUNG_SEKUNDEN = 60 * 60 * 24 * 400;
export const ANZAHL_FRAGEN = markencheck.fragen.length;
export const MAX_SCHRITT = 1 + ANZAHL_FRAGEN;
const GEFUEHLE = new Set(markencheck.gefuehl.optionen);
const ERGEBNISSE = new Set(markencheck.ergebnisse.map((e) => e.id));
const BEREICHE = new Set(Object.keys(markencheck.bereiche));

const prozent = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : undefined);

/** Prüft, was der Browser schickt. Ungültiges wird verworfen (null) oder weggelassen. */
export function pruefeLauf(raw: unknown): { id: string; lauf: CheckLauf } | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === 'string' && CHECK_ID_RE.test(r.id) ? r.id : null;
  if (!id) return null;
  const startMs = Number(id.slice(0, 13));
  // Startzeit aus der id: nicht in der Zukunft, höchstens einen Tag alt
  if (startMs > Date.now() + 60_000 || Date.now() - startMs > 86_400_000) return null;
  const schritt = typeof r.schritt === 'number' && Number.isInteger(r.schritt) ? Math.max(0, Math.min(MAX_SCHRITT, r.schritt)) : 0;
  const fertig = r.fertig === true && schritt === MAX_SCHRITT;

  const lauf: CheckLauf = { start: new Date(startMs).toISOString(), schritt, fertig };
  if (Array.isArray(r.gefuehle)) {
    const g = r.gefuehle.filter((x): x is string => typeof x === 'string' && GEFUEHLE.has(x)).slice(0, 2);
    if (g.length) lauf.gefuehle = g;
  }
  if (fertig) {
    if (typeof r.ergebnis === 'string' && ERGEBNISSE.has(r.ergebnis)) lauf.ergebnis = r.ergebnis;
    lauf.prozent = prozent(r.prozent);
    if (r.bereiche && typeof r.bereiche === 'object') {
      const b: Record<string, number> = {};
      for (const [k, v] of Object.entries(r.bereiche as Record<string, unknown>)) {
        const p = prozent(v);
        if (BEREICHE.has(k) && p !== undefined) b[k] = p;
      }
      lauf.bereiche = b;
    }
  }
  if (typeof r.herkunft === 'string') {
    const h = r.herkunft.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40);
    if (h) lauf.herkunft = h;
  }
  if (r.geraet === 'mobil' || r.geraet === 'desktop') lauf.geraet = r.geraet;
  if (r.lead === true) lauf.lead = true;
  if (r.mail === true) lauf.mail = true;
  return { id, lauf };
}

export async function speichereLauf(kv: KV, id: string, lauf: CheckLauf): Promise<void> {
  await kv.put(PREFIX + id, '', { expirationTtl: AUFBEWAHRUNG_SEKUNDEN, metadata: lauf });
}

/** Text zu einem Abbruch-Schritt für die Übersicht */
export function schrittText(schritt: number): string {
  // Das Wunschgefühl ist der Einstieg („Bevor wir starten“), die Croissant-Fragen sind 1 bis 10
  if (schritt === 0) return 'Vor dem Start: Wunschgefühl';
  const frage = markencheck.fragen[schritt - 1];
  return frage ? `Frage ${schritt}: ${frage.text.replace('{gefuehl}', '…')}` : 'Beim Ergebnis';
}

export interface CheckStatistik {
  tage: number;
  gestartet: number;
  fertig: number;
  leads: number;
  /** Ergebnis per Mail schicken lassen */
  mails: number;
  /** Wo aufgehört wurde (nur nicht fertige Durchläufe), in Ablauf-Reihenfolge */
  abbrueche: { schritt: number; text: string; anzahl: number }[];
  ergebnisse: Record<string, number>;
  gefuehle: Record<string, number>;
  herkunft: Record<string, number>;
  geraete: Record<string, number>;
  /** Durchschnitt je Bereich über alle fertigen Durchläufe */
  bereiche: Record<string, number>;
  /** Die letzten Durchläufe, neueste zuerst */
  letzte: CheckLauf[];
}

const zaehle = (obj: Record<string, number>, key: string | undefined) => {
  if (key) obj[key] = (obj[key] ?? 0) + 1;
};

export async function statistik(kv: KV, tage: number): Promise<CheckStatistik> {
  const seit = Date.now() - tage * 86_400_000;
  const laeufe: CheckLauf[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list<CheckLauf>({ prefix: PREFIX, cursor });
    for (const k of page.keys) {
      const startMs = Number(k.name.slice(PREFIX.length, PREFIX.length + 13));
      if (startMs >= seit && k.metadata) laeufe.push(k.metadata);
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor && laeufe.length < 20_000);

  const s: CheckStatistik = {
    tage,
    gestartet: laeufe.length,
    fertig: 0,
    leads: 0,
    mails: 0,
    abbrueche: [],
    ergebnisse: {},
    gefuehle: {},
    herkunft: {},
    geraete: {},
    bereiche: {},
    letzte: [...laeufe].sort((a, b) => b.start.localeCompare(a.start)).slice(0, 25),
  };
  const abbruch = new Map<number, number>();
  const summe: Record<string, { n: number; total: number }> = {};
  for (const l of laeufe) {
    if (l.fertig) s.fertig++;
    else abbruch.set(l.schritt, (abbruch.get(l.schritt) ?? 0) + 1);
    if (l.lead) s.leads++;
    if (l.mail) s.mails++;
    zaehle(s.ergebnisse, l.ergebnis);
    l.gefuehle?.forEach((g) => zaehle(s.gefuehle, g));
    zaehle(s.herkunft, l.herkunft ?? 'direkt');
    zaehle(s.geraete, l.geraet);
    for (const [k, v] of Object.entries(l.bereiche ?? {})) {
      summe[k] ??= { n: 0, total: 0 };
      summe[k].n++;
      summe[k].total += v;
    }
  }
  s.abbrueche = [...abbruch.entries()].sort((a, b) => a[0] - b[0]).map(([schritt, anzahl]) => ({ schritt, text: schrittText(schritt), anzahl }));
  for (const [k, { n, total }] of Object.entries(summe)) s.bereiche[k] = Math.round(total / n);
  return s;
}

/* ---------- Ergebnis per Mail (/api/marken-check-mail) ---------- */

type BereichId = keyof typeof markencheck.bereiche;
type Ergebnis = (typeof markencheck.ergebnisse)[number];

const prozentVon = (werte: number[]) =>
  werte.length ? Math.round((werte.reduce((a, v) => a + (v - 1) / 4, 0) / werte.length) * 100) : 0;

/** Wertet die Antworten (1–5 je Frage) aus – dieselbe Logik wie im Browser (src/scripts/markencheck.ts). */
export function auswerten(werte: number[]) {
  const ids = Object.keys(markencheck.bereiche) as BereichId[];
  const bereiche = Object.fromEntries(
    ids.map((b) => [b, prozentVon(werte.filter((_, i) => markencheck.fragen[i].bereich === b))]),
  ) as Record<BereichId, number>;
  const gesamt = prozentVon(werte);
  let ergebnis: Ergebnis = markencheck.ergebnisse[0];
  for (const x of markencheck.ergebnisse) if (gesamt >= x.ab) ergebnis = x;
  const sortiert = [...ids].sort((a, b) => bereiche[b] - bereiche[a]);
  const staerkster = sortiert[0];
  const schwaechster = sortiert[sortiert.length - 1];
  return { ids, bereiche, gesamt, ergebnis, staerkster, schwaechster, ausgeglichen: bereiche[staerkster] - bereiche[schwaechster] < 10 };
}

/** Prüft die Anfrage „Ergebnis per Mail“: 10 Antworten 1–5 und 1–2 bekannte Gefühle. Der Mailtext entsteht nur auf dem Server. */
export function pruefeMailCheck(raw: unknown): { werte: number[]; gefuehle: string[] } | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.werte) || r.werte.length !== ANZAHL_FRAGEN) return null;
  const werte = r.werte.map(Number);
  if (!werte.every((w) => Number.isInteger(w) && w >= 1 && w <= 5)) return null;
  const gefuehle = Array.isArray(r.gefuehle) ? r.gefuehle.filter((x): x is string => typeof x === 'string' && GEFUEHLE.has(x)).slice(0, 2) : [];
  return { werte, gefuehle };
}

/** Der persönliche Mailtext: Ergebnis, Auswertung, nächster Schritt und der Website-Check als Liste. */
export function ergebnisMail(werte: number[], gefuehle: string[], vorname: string) {
  const m = markencheck;
  const a = auswerten(werte);
  const gefuehl = gefuehle.join(' und ') || 'dein Wunschgefühl';
  const mitGefuehl = (t: string) => t.replaceAll('{gefuehl}', gefuehl);
  const kurz = `${a.ergebnis.symbol} ${a.ergebnis.titel.replace(/\.$/, '')} (${a.gesamt} %)`;
  const linie = '────────────────────────';
  const text = [
    vorname ? `Hallo ${vorname},` : 'Hallo,',
    '',
    m.mail.einleitung,
    '',
    linie,
    `DEIN LIEBESSTATUS: ${a.ergebnis.titel} ${a.ergebnis.symbol}`,
    linie,
    a.ergebnis.text,
    '',
    `${m.auswertung.titel.toUpperCase()}`,
    `Dein Wunschgefühl: ${gefuehl}`,
    ...a.ids.map((b) => `• ${m.bereiche[b].frage} ${a.bereiche[b]} %`),
    '',
    ...(a.ausgeglichen
      ? [m.auswertung.ausgeglichen]
      : [
          mitGefuehl(m.auswertung.staerke).replace('{frage}', m.bereiche[a.staerkster].frage),
          mitGefuehl(m.auswertung.potenzial).replace('{frage}', m.bereiche[a.schwaechster].frage),
        ]),
    '',
    linie,
    m.auswertung.tippTitel.toUpperCase(),
    linie,
    mitGefuehl(m.auswertung.tipps[a.schwaechster]),
    '',
    linie,
    `${m.bonus.eyebrow.toUpperCase()}: ${m.bonus.titel}`,
    linie,
    m.bonus.text,
    '',
    ...m.bonus.punkte.flatMap((p) => [`☐ ${p.titel}`, `   ${p.text}`, '']),
    `Als PDF zum Ausdrucken und Abhaken: https://www.online-boutique-agentur.at${m.bonus.pdfUrl}`,
    '',
    linie,
    `${m.bonus.angebotTitel} ${m.bonus.angebotBetont}`,
    linie,
    m.bonus.angebotText,
    '',
    m.mail.abschluss,
    '',
    m.mail.gruss,
    '',
    '—',
    m.bonus.fusszeile,
    'hello@online-boutique-agentur.at',
  ].join('\n');
  // Für Admin/CRM: kurze Zusammenfassung + alle Antworten (wie beim Kontaktformular)
  const zusammenfassung = [
    '— Marken-Check —',
    `Wunschgefühl: ${gefuehl}`,
    `Ergebnis: ${kurz}`,
    a.ids.map((b) => `${m.bereiche[b].name} ${a.bereiche[b]} %`).join(' · '),
    '',
    'Antworten (1–5 Croissants):',
    ...m.fragen.map((f, i) => `${i + 1}. ${mitGefuehl(f.text)} → ${'🥐'.repeat(werte[i])} (${werte[i]} von 5)`),
  ].join('\n');
  return { betreff: `${m.mail.betreff}: ${a.ergebnis.titel} ${a.ergebnis.symbol}`, text, kurz, zusammenfassung, auswertung: a };
}
