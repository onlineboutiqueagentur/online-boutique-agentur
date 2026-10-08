/** GET /api/session – ist jemand eingeloggt? */
import { getSession, json, loginConfigured, type Context } from '../../lib/auth';

export const onRequestGet = async ({ request, env }: Context): Promise<Response> => {
  const s = await getSession(request, env);
  return json({ eingeloggt: Boolean(s), benutzer: s?.u ?? null, eingerichtet: loginConfigured(env) });
};
