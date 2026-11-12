/**
 * POST /api/marken-check-mail – „Ergebnis und Website-Check per Mail“ auf der Ergebnisseite des Marken-Checks
 *
 * Body (JSON): { email, vorname?, werte: [10× 1–5], gefuehle: [1–2], ts, website (Honeypot) }
 *
 * Ablauf: Origin-Prüfung → Spam-Schutz (Honeypot, Ausfüllzeit, max. 5/Stunde je Absender,
 * max. 3/Tag je Empfängeradresse) → Ergebnis auf dem Server neu auswerten → Mail an die Person
 * → kurze Info an MAIL_TO → Eintrag in /admin bzw. CRM (quelle markencheck).
 *
 * Der Mailtext entsteht nur aus den Texten in src/content/markencheck.ts und den Antworten (Zahlen).
 * Freier Text von außen landet nie in der Mail (außer einem geprüften Vornamen) – so kann niemand
 * über dieses Formular eigene Inhalte an fremde Adressen verschicken.
 */
import { isAllowedOrigin, json, shortHash, type Context, type Env } from '../../lib/auth';
import { speichern, type Anfrage } from '../../lib/anfragen';
import { ergebnisMail, pruefeMailCheck } from '../../lib/markencheck';
import { sendSmtp } from '../../lib/smtp';

const MIN_FILL_MS = 2500;
const MAX_AGE_MS = 1000 * 60 * 60 * 24;
const RATE_LIMIT_IP = 5; // pro Stunde und Absender
const RATE_LIMIT_EMPFAENGER = 3; // pro Tag und Empfängeradresse
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
/** Nur Buchstaben, Leerzeichen, Bindestrich, Apostroph – sonst wird der Vorname weggelassen */
const VORNAME_RE = /^[\p{L}][\p{L}' -]{0,39}$/u;

interface Mail {
  to: string[];
  replyTo?: string;
  fromName: string;
  subject: string;
  text: string;
}

async function senden(env: Env, mail: Mail): Promise<boolean> {
  if (env.SMTP_USER && env.SMTP_PASSWORD) {
    try {
      await sendSmtp({
        host: env.SMTP_HOST || 'smtp.world4you.com',
        port: Number(env.SMTP_PORT || 587),
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
        from: env.SMTP_USER,
        ...mail,
      });
      return true;
    } catch (err) {
      console.error('marken-check-mail: SMTP-Fehler', (err as Error).message);
      return false;
    }
  }
  if (!env.RESEND_API_KEY) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM || `${mail.fromName} <onboarding@resend.dev>`,
      to: mail.to,
      reply_to: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
    }),
  });
  if (!res.ok) console.error('marken-check-mail: Resend-Fehler', res.status);
  return res.ok;
}

/** Wie senden(), aber wirft nie (z. B. bei Netzwerkfehlern) */
const sicherSenden = (env: Env, mail: Mail) =>
  senden(env, mail).catch((err) => {
    console.error('marken-check-mail: Versand fehlgeschlagen', (err as Error).message);
    return false;
  });

async function zaehlen(kv: Env['ANFRAGEN'], key: string, limit: number, ttl: number): Promise<boolean> {
  if (!kv) return true;
  const anzahl = Number((await kv.get(key)) ?? 0);
  if (anzahl >= limit) return false;
  await kv.put(key, String(anzahl + 1), { expirationTtl: ttl });
  return true;
}

export const onRequestPost = async ({ request, env }: Context): Promise<Response> => {
  if (!isAllowedOrigin(request.headers.get('Origin'), env)) return json({ ok: false }, 403);
  if (Number(request.headers.get('Content-Length') ?? 0) > 4_000) return json({ ok: false }, 413);
  const mailBereit = Boolean((env.SMTP_USER && env.SMTP_PASSWORD) || env.RESEND_API_KEY);
  if (!mailBereit) return json({ ok: false }, 503);

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 4_000) return json({ ok: false }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ ok: false }, 400);
  }

  // Spam-Schutz: Bots bekommen ein „ok“, damit sie nicht nachjustieren
  const age = Date.now() - Number(body.ts);
  if ((typeof body.website === 'string' && body.website !== '') || !Number(body.ts) || age < MIN_FILL_MS || age > MAX_AGE_MS) {
    return json({ ok: true });
  }

  const email = String(body.email ?? '').trim().slice(0, 200);
  const vornameRoh = String(body.vorname ?? '').trim().replace(/\s+/g, ' ');
  const vorname = VORNAME_RE.test(vornameRoh) ? vornameRoh : '';
  const check = pruefeMailCheck(body);
  if (!EMAIL_RE.test(email) || !check) return json({ ok: false }, 422);

  const kv = env.ANFRAGEN;
  const ipOk = await zaehlen(kv, `rl:${await shortHash(request.headers.get('CF-Connecting-IP') ?? 'unbekannt')}`, RATE_LIMIT_IP, 3600);
  const empfaengerOk = ipOk && (await zaehlen(kv, `rlmail:${await shortHash(email.toLowerCase())}`, RATE_LIMIT_EMPFAENGER, 86400));
  if (!ipOk || !empfaengerOk) return json({ ok: false }, 429);

  const m = ergebnisMail(check.werte, check.gefuehle, vorname);
  const anDiePerson = await sicherSenden(env, {
    to: [email],
    replyTo: env.MAIL_TO?.split(',')[0]?.trim() || env.SMTP_USER,
    fromName: 'Nina und Pia · Online Boutique Agentur',
    subject: m.betreff,
    text: m.text,
  });
  if (!anDiePerson) return json({ ok: false }, 502);

  // Für Nina und Pia: Eintrag in /admin bzw. CRM und eine kurze Info-Mail
  const anfrage: Anfrage = {
    id: crypto.randomUUID(),
    eingang: new Date().toISOString(),
    gelesen: false,
    name: vorname || '(ohne Vornamen)',
    firma: '',
    email,
    telefon: '',
    nachricht: `Hat sich das Ergebnis und den Website-Check per Mail schicken lassen (unverbindlich, keine Anfrage).\n\n${m.zusammenfassung}`,
    design: 'unbekannt',
    quelle: 'markencheck',
    ergebnis: `${m.kurz} · per Mail`,
    mail: 'nicht eingerichtet',
  };
  if (env.MAIL_TO) {
    const ok = await sicherSenden(env, {
      to: env.MAIL_TO.split(',').map((s) => s.trim()).filter(Boolean),
      replyTo: email,
      fromName: 'Website Online Boutique Agentur',
      subject: `🥐 Marken-Check per Mail: ${vorname || email} · ${m.kurz}`,
      text: [
        '🥐 Jemand hat sich das Marken-Check-Ergebnis per Mail schicken lassen (unverbindlich, keine Anfrage).',
        '',
        `Vorname: ${vorname || '–'}`,
        `E-Mail: ${email}`,
        '',
        m.zusammenfassung,
        '',
        '—',
        `Alle Anfragen: ${new URL(request.url).origin}/admin/`,
      ].join('\n'),
    });
    anfrage.mail = ok ? 'gesendet' : 'fehlgeschlagen';
  }
  if (kv) await speichern(kv, anfrage).catch((err) => console.error('marken-check-mail: nicht gespeichert', err));

  return json({ ok: true });
};

export const onRequest = async (): Promise<Response> =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
