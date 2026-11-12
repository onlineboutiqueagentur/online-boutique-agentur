/**
 * Kampagnen-Herkunft (UTM-Parameter) für Anfragen merken – z. B. bei Instagram-Werbung:
 *   https://www.online-boutique-agentur.at/?utm_source=instagram&utm_medium=paid_social&utm_campaign=…&utm_content=…
 * Kommt jemand über so einen Link, merkt sich der Tab die Parameter (Session Storage „oba-kampagne“,
 * wird beim Schließen des Tabs gelöscht). Schickt die Person später ein Formular ab, gehen sie mit
 * (scripts/contact-form.ts) und stehen in der Anfrage unter /admin und in der Mail.
 * Gespeichert wird nur die Kampagne, nichts über die Person.
 */

const KEY = 'oba-kampagne';
export const UTM_FELDER = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export type Kampagne = Partial<Record<(typeof UTM_FELDER)[number], string>>;

/** UTM-Parameter aus einer URL – oder null, wenn keine dabei sind. */
function ausUrl(search: string): Kampagne | null {
  const params = new URLSearchParams(search);
  const k: Kampagne = {};
  for (const feld of UTM_FELDER) {
    const wert = params.get(feld)?.trim().slice(0, 100);
    if (wert) k[feld] = wert;
  }
  return Object.keys(k).length ? k : null;
}

/** Die Kampagne dieses Besuchs: aus der aktuellen URL, sonst die gemerkte. */
export function kampagne(): Kampagne | null {
  const jetzt = ausUrl(location.search);
  if (jetzt) return jetzt;
  try {
    const gemerkt = sessionStorage.getItem(KEY);
    return gemerkt ? (JSON.parse(gemerkt) as Kampagne) : null;
  } catch {
    return null;
  }
}

const neu = ausUrl(location.search);
if (neu) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(neu));
  } catch {
    // Speicher nicht verfügbar – dann zählt nur die URL der Seite mit dem Formular
  }
}
