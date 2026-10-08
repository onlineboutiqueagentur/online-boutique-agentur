/**
 * Kontaktanfragen – nur für eingeloggte Benutzer.
 * GET    /api/anfragen          → alle Anfragen (neueste zuerst)
 * PUT    /api/anfragen?id=…     → { gelesen: true | false }
 * DELETE /api/anfragen?id=…     → Anfrage endgültig löschen
 */
import { getSession, json, sameOrigin, type Context } from '../../lib/auth';
import { alleLaden, finden, speichern } from '../../lib/anfragen';

const ID_RE = /^[0-9a-f-]{36}$/i;

async function guard({ request, env }: Context): Promise<Response | null> {
  if (!env.ANFRAGEN) return json({ fehler: 'Speicher nicht verbunden.' }, 503);
  if (!(await getSession(request, env))) return json({ fehler: 'Bitte zuerst einloggen.' }, 401);
  if (request.method !== 'GET' && !sameOrigin(request)) return json({ fehler: 'Ungültige Anfrage.' }, 403);
  return null;
}

const idAus = (request: Request) => {
  const id = new URL(request.url).searchParams.get('id') ?? '';
  return ID_RE.test(id) ? id : null;
};

export const onRequestGet = async (ctx: Context): Promise<Response> => {
  const block = await guard(ctx);
  if (block) return block;
  return json({ anfragen: await alleLaden(ctx.env.ANFRAGEN!) });
};

export const onRequestPut = async (ctx: Context): Promise<Response> => {
  const block = await guard(ctx);
  if (block) return block;
  const id = idAus(ctx.request);
  const body = (await ctx.request.json().catch(() => ({}))) as { gelesen?: boolean };
  const treffer = id ? await finden(ctx.env.ANFRAGEN!, id) : null;
  if (!treffer) return json({ fehler: 'Diese Anfrage gibt es nicht mehr.' }, 404);
  treffer.anfrage.gelesen = Boolean(body.gelesen);
  await speichern(ctx.env.ANFRAGEN!, treffer.anfrage);
  return json({ ok: true });
};

export const onRequestDelete = async (ctx: Context): Promise<Response> => {
  const block = await guard(ctx);
  if (block) return block;
  const id = idAus(ctx.request);
  const treffer = id ? await finden(ctx.env.ANFRAGEN!, id) : null;
  if (!treffer) return json({ fehler: 'Diese Anfrage gibt es nicht mehr.' }, 404);
  await ctx.env.ANFRAGEN!.delete(treffer.key);
  return json({ ok: true });
};
