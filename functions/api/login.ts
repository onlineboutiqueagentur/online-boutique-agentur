/** POST /api/login { benutzer, passwort } → setzt ein signiertes Sitzungs-Cookie (8 Stunden). */
import { createSessionCookie, json, loginConfigured, safeEqual, sameOrigin, shortHash, type Context } from '../../lib/auth';

const MAX_VERSUCHE = 5; // pro 15 Minuten und IP

export const onRequestPost = async ({ request, env }: Context): Promise<Response> => {
  if (!loginConfigured(env)) {
    return json({ fehler: 'Der Login ist noch nicht eingerichtet. Bitte die Cloudflare-Secrets und die KV-Bindung prüfen.' }, 503);
  }
  if (!sameOrigin(request)) return json({ fehler: 'Ungültige Anfrage.' }, 403);

  // Fehlversuche begrenzen (IP nur gehasht)
  const rk = `login:${await shortHash(request.headers.get('CF-Connecting-IP') ?? 'unbekannt')}`;
  const versuche = Number((await env.ANFRAGEN!.get(rk)) ?? 0);
  if (versuche >= MAX_VERSUCHE) {
    return json({ fehler: 'Zu viele Versuche. Bitte in 15 Minuten erneut probieren.' }, 429);
  }

  let body: { benutzer?: string; passwort?: string };
  try {
    body = await request.json();
  } catch {
    return json({ fehler: 'Ungültige Anfrage.' }, 400);
  }

  const userOk = await safeEqual(String(body.benutzer ?? ''), env.ADMIN_USER!);
  const passOk = await safeEqual(String(body.passwort ?? ''), env.ADMIN_PASSWORD!);
  if (!(userOk && passOk)) {
    await env.ANFRAGEN!.put(rk, String(versuche + 1), { expirationTtl: 900 });
    await new Promise((r) => setTimeout(r, 800)); // bremst Durchprobieren
    return json({ fehler: 'Benutzername oder Passwort stimmt nicht.' }, 401);
  }

  await env.ANFRAGEN!.delete(rk);
  return json({ ok: true }, 200, { 'set-cookie': await createSessionCookie(env, env.ADMIN_USER!) });
};
