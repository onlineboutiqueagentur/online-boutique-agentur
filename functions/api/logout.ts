/** POST /api/logout */
import { clearSessionCookie, json } from '../../lib/auth';

export const onRequestPost = async (): Promise<Response> => json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
