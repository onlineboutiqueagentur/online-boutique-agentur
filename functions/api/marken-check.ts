/**
 * /api/marken-check – anonyme Statistik zum Marken-Check (/marken-check)
 *
 * POST  (öffentlich, vom Check selbst): Fortschritt eines Durchlaufs speichern.
 *       Body (JSON): { id, schritt, fertig?, ergebnis?, prozent?, bereiche?, gefuehle?, herkunft?, geraet?, lead? }
 *       Der Browser sendet beim Start, beim Verlassen der Seite, beim Ergebnis und nach dem Kontaktformular.
 * GET   (nur eingeloggt, für /admin): Auswertung der letzten ?tage=30 Tage.
 *
 * Gespeichert wird keine IP und nichts, das auf eine Person schließen lässt (siehe lib/markencheck.ts).
 */
import { getSession, isAllowedOrigin, json, type Context } from '../../lib/auth';
import { pruefeLauf, speichereLauf, statistik } from '../../lib/markencheck';

export const onRequestPost = async ({ request, env }: Context): Promise<Response> => {
  if (!isAllowedOrigin(request.headers.get('Origin'), env)) return json({ ok: false }, 403);
  if (!env.ANFRAGEN) return json({ ok: false }, 503);
  if (Number(request.headers.get('Content-Length') ?? 0) > 2_000) return json({ ok: false }, 413);

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 2_000) return json({ ok: false }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ ok: false }, 400);
  }
  const geprueft = pruefeLauf(body);
  if (!geprueft) return json({ ok: false }, 422);
  await speichereLauf(env.ANFRAGEN, geprueft.id, geprueft.lauf);
  return json({ ok: true });
};

export const onRequestGet = async ({ request, env }: Context): Promise<Response> => {
  if (!env.ANFRAGEN) return json({ fehler: 'Speicher nicht verbunden.' }, 503);
  if (!(await getSession(request, env))) return json({ fehler: 'Bitte zuerst einloggen.' }, 401);
  const tage = Math.max(1, Math.min(400, Number(new URL(request.url).searchParams.get('tage')) || 30));
  return json(await statistik(env.ANFRAGEN, tage));
};

export const onRequest = async (): Promise<Response> =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, POST' } });
