/**
 * POST /api/contact – Kontaktformular (Cloudflare Pages Function)
 *
 * Ablauf: Origin-Prüfung → Spam-Schutz (Honeypot, Ausfüllzeit, max. 5/Stunde je Absender)
 * → Validierung → Anfrage in KV speichern (Übersicht unter /admin) → Mail über World4You (SMTP)
 * → JSON (fetch) bzw. Weiterleitung auf /kontakt/danke/ (ohne JavaScript).
 *
 * Die Anfrage geht nie verloren: Auch wenn der Mailversand scheitert, liegt sie im Admin-Bereich.
 *
 * Konfiguration (Cloudflare → Workers & Pages → Projekt → Settings → Variables and Secrets):
 *   SMTP_USER       Postfach bei World4You, z. B. "hello@online-boutique-agentur.at" (Variable in wrangler.toml)
 *   SMTP_PASSWORD   Secret – Passwort dieses Postfachs
 *   SMTP_HOST/PORT  optional (Standard: smtp.world4you.com, 587 = STARTTLS)
 *   MAIL_TO         z. B. "hello@online-boutique-agentur.at" (mehrere mit Komma)
 *   Alternative ohne SMTP: RESEND_API_KEY (+ MAIL_FROM nach Domain-Verifizierung)
 *   KV-Bindung      ANFRAGEN
 *   ALLOWED_ORIGINS optional, kommagetrennt (Standard: Produktions-Domains + *.pages.dev)
 */
import { json, shortHash, type Context, type Env } from '../../lib/auth';
import { speichern, type Anfrage } from '../../lib/anfragen';
import { sendSmtp } from '../../lib/smtp';

const MIN_FILL_MS = 2500; // schneller ausgefüllt = sehr wahrscheinlich ein Bot
const MAX_AGE_MS = 1000 * 60 * 60 * 24; // Formular älter als 24 h → neu laden
const RATE_LIMIT = 5; // Anfragen pro Stunde und Absender
const QUIZ_MAX = 6; // so viele Aussagen hat das Quiz
const LIMITS = { quizAussage: 200, name: 120, firma: 160, webseite: 200, email: 200, telefon: 40, nachricht: 5000, wunschtermin: 200 } as const;
/** Croissant-Einladung: erlaubte Antworten auf „Wo frühstücken wir?“ */
const FORMATE: Record<string, string> = { 'bei-uns': 'Bei euch in Pasching', 'bei-mir': 'Beim Kunden', virtuell: 'Virtuell' };
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const DEFAULT_ORIGINS = ['https://www.online-boutique-agentur.at', 'https://online-boutique-agentur.at'];

function isAllowedOrigin(origin: string | null, env: Env): boolean {
  if (!origin) return true; // manche Browser senden bei Same-Origin-POST ohne JS keinen Origin
  const allowed = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : DEFAULT_ORIGINS;
  if (allowed.includes(origin)) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.pages.dev'); // Preview-Deployments
  } catch {
    return false;
  }
}

function respond(request: Request, ok: boolean, status: number): Response {
  if ((request.headers.get('Accept') ?? '').includes('application/json')) return json({ ok }, status);
  const url = new URL(request.url);
  return Response.redirect(`${url.origin}/kontakt/${ok ? 'danke' : 'fehler'}/`, 303);
}

const designAus = (value: FormDataEntryValue | null): Anfrage['design'] =>
  value === 'louder' || value === 'minimal' ? value : 'unbekannt';

const clean = (value: FormDataEntryValue | null, max: number) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);

async function sendMail(env: Env, a: Anfrage, adminUrl: string): Promise<boolean> {
  const croissant = a.quelle === 'croissant';
  const zeilen = [
    croissant ? '🥐 Frühstücks-Einladung angenommen – über www.online-boutique-agentur.at/croissant' : 'Neue Anfrage über www.online-boutique-agentur.at',
    '',
    `Name: ${a.name}`,
    `Firma: ${a.firma}`,
    a.webseite ? `Website: ${a.webseite}` : null,
    `E-Mail: ${a.email}`,
    a.telefon ? `Tel.: ${a.telefon}` : null,
    croissant ? null : `Design: ${a.design === 'louder' ? 'Louder' : a.design === 'minimal' ? 'Minimal' : 'unbekannt'}`,
    croissant ? `Wann passt es: ${a.wunschtermin || '–'}` : null,
    croissant ? '' : null,
    croissant
      ? a.quiz?.length
        ? `Im Quiz angetippt (${a.quiz.length} von ${QUIZ_MAX}):\n${a.quiz.map((q) => `– ${q}`).join('\n')}`
        : 'Im Quiz angetippt: nichts'
      : null,
    '',
    a.nachricht || '(keine Notizen)',
    '',
    '—',
    `Alle Anfragen: ${adminUrl}`,
    'Auf diese Mail antworten = direkt an die anfragende Person antworten.',
  ].filter((z): z is string => z !== null);

  const to = env.MAIL_TO!.split(',').map((s) => s.trim()).filter(Boolean);
  const subject = croissant ? `🥐 Frühstücks-Einladung: ${a.name} · ${a.firma}` : `Neue Anfrage: ${a.name} · ${a.firma}`;

  // Bevorzugt: Versand über das eigene Postfach bei World4You
  if (env.SMTP_USER && env.SMTP_PASSWORD) {
    try {
      await sendSmtp({
        host: env.SMTP_HOST || 'smtp.world4you.com',
        port: Number(env.SMTP_PORT || 587),
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
        from: env.SMTP_USER,
        fromName: 'Website Online Boutique Agentur',
        to,
        replyTo: a.email,
        subject,
        text: zeilen.join('\n'),
      });
      return true;
    } catch (err) {
      console.error('contact: SMTP-Fehler', (err as Error).message);
      return false;
    }
  }

  // Alternative: Resend
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM || 'Website Online Boutique Agentur <onboarding@resend.dev>',
      to,
      reply_to: a.email,
      subject,
      text: zeilen.join('\n'),
    }),
  });
  if (!res.ok) console.error('contact: Resend-Fehler', res.status);
  return res.ok;
}

export const onRequestPost = async ({ request, env }: Context): Promise<Response> => {
  if (!isAllowedOrigin(request.headers.get('Origin'), env)) return respond(request, false, 403);

  const type = request.headers.get('Content-Type') ?? '';
  if (!type.includes('multipart/form-data') && !type.includes('application/x-www-form-urlencoded')) {
    return respond(request, false, 415);
  }
  if (Number(request.headers.get('Content-Length') ?? 0) > 20_000) return respond(request, false, 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return respond(request, false, 400);
  }

  // Spam-Schutz: Honeypot + Ausfüllzeit. Bots bekommen ein "ok", damit sie nicht nachjustieren.
  const ts = Number(form.get('ts'));
  const age = Date.now() - ts;
  if (clean(form.get('website'), 200) !== '' || !ts || age < MIN_FILL_MS || age > MAX_AGE_MS) {
    return respond(request, true, 200);
  }

  const daten = {
    name: clean(form.get('name'), LIMITS.name),
    firma: clean(form.get('company'), LIMITS.firma),
    webseite: clean(form.get('webseite'), LIMITS.webseite),
    email: clean(form.get('email'), LIMITS.email),
    telefon: clean(form.get('phone'), LIMITS.telefon),
    nachricht: clean(form.get('message'), LIMITS.nachricht),
  };
  if (!daten.name || !daten.firma || !EMAIL_RE.test(daten.email)) return respond(request, false, 422);

  const kv = env.ANFRAGEN;
  const mailBereit = Boolean(env.MAIL_TO && ((env.SMTP_USER && env.SMTP_PASSWORD) || env.RESEND_API_KEY));
  if (!kv && !mailBereit) {
    console.error('contact: weder KV noch Mail konfiguriert');
    return respond(request, false, 503);
  }

  // Max. 5 Anfragen pro Stunde und Absender (IP wird nur gehasht und 1 Stunde gespeichert).
  if (kv) {
    const rk = `rl:${await shortHash(request.headers.get('CF-Connecting-IP') ?? 'unbekannt')}`;
    const anzahl = Number((await kv.get(rk)) ?? 0);
    if (anzahl >= RATE_LIMIT) return respond(request, false, 429);
    await kv.put(rk, String(anzahl + 1), { expirationTtl: 3600 });
  }

  const anfrage: Anfrage = {
    id: crypto.randomUUID(),
    eingang: new Date().toISOString(),
    gelesen: false,
    ...daten,
    design: designAus(form.get('design')),
    ...(form.get('quelle') === 'croissant'
      ? {
          quelle: 'croissant' as const,
          format: FORMATE[String(form.get('format'))] ? String(form.get('format')) : undefined,
          wunschtermin: clean(form.get('when'), LIMITS.wunschtermin),
          quiz: String(form.get('quiz') ?? '')
            .split('\n')
            .map((q) => clean(q, LIMITS.quizAussage))
            .filter(Boolean)
            .slice(0, QUIZ_MAX),
        }
      : { quelle: 'website' as const }),
    mail: 'nicht eingerichtet',
  };

  if (mailBereit) {
    try {
      anfrage.mail = (await sendMail(env, anfrage, `${new URL(request.url).origin}/admin/`)) ? 'gesendet' : 'fehlgeschlagen';
    } catch {
      anfrage.mail = 'fehlgeschlagen';
    }
  }

  if (kv) await speichern(kv, anfrage);

  // Erfolg, sobald die Anfrage sicher angekommen ist (gespeichert oder gemailt).
  const ok = Boolean(kv) || anfrage.mail === 'gesendet';
  return respond(request, ok, ok ? 200 : 502);
};

export const onRequest = async (): Promise<Response> =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
