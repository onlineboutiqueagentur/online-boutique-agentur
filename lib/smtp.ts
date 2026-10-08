/**
 * Minimaler SMTP-Versand aus der Cloudflare Function – über den Mailserver von World4You.
 * Verbindung: Port 587 mit STARTTLS (World4You) oder Port 465 mit direktem TLS.
 * Anmeldung per AUTH LOGIN – erst NACH dem Aufbau der Verschlüsselung.
 * Keine fremde Abhängigkeit; nutzt die Cloudflare-Socket-API (cloudflare:sockets).
 *
 * Zugangsdaten nur als Cloudflare-Secret (SMTP_PASSWORD) bzw. Variable (SMTP_USER) – nie im Code.
 */
import { connect, type Socket } from 'cloudflare:sockets';

export interface SmtpMail {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string; // Absenderadresse (muss zum Postfach passen)
  fromName: string;
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
}

const enc = new TextEncoder();
const CRLF = '\r\n';

/** UTF-8 sicher in Base64 (für Betreff, Namen und Text). */
function b64(value: string): string {
  let s = '';
  for (const b of enc.encode(value)) s += String.fromCharCode(b);
  return btoa(s);
}
const encodeWord = (value: string) => (/^[\x20-\x7e]*$/.test(value) ? value : `=?UTF-8?B?${b64(value)}?=`);
const wrap76 = (value: string) => value.replace(/.{1,76}/g, (line) => line + CRLF);
const clean = (value: string) => value.replace(/[\r\n<>]/g, '');

/** Kleine Hülle um einen Socket: zeilenweise lesen, Befehle schreiben. */
function channel(socket: Socket) {
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return {
    /** Liest eine (ggf. mehrzeilige) SMTP-Antwort und prüft den Statuscode. */
    async expect(step: string, ...codes: number[]): Promise<void> {
      for (;;) {
        const lines = buffer.split(CRLF);
        // Letzte Zeile einer Antwort hat ein Leerzeichen nach dem Code ("250 OK")
        const end = lines.findIndex((l, i) => i < lines.length - 1 && /^\d{3} /.test(l));
        if (end >= 0) {
          buffer = lines.slice(end + 1).join(CRLF);
          const code = Number(lines[end].slice(0, 3));
          if (!codes.includes(code)) throw new Error(`${step}: ${code} ${lines[end].slice(4, 120)}`);
          return;
        }
        const { value, done } = await reader.read();
        if (done) throw new Error(`${step}: Verbindung vom Server geschlossen`);
        buffer += decoder.decode(value, { stream: true });
      }
    },
    send: (line: string) => writer.write(enc.encode(line + CRLF)),
    raw: (data: string) => writer.write(enc.encode(data)),
    release() {
      writer.releaseLock();
      reader.releaseLock();
    },
  };
}

export async function sendSmtp(mail: SmtpMail, timeoutMs = 15000): Promise<void> {
  const startTls = mail.port !== 465;
  let socket = connect({ hostname: mail.host, port: mail.port }, { secureTransport: startTls ? 'starttls' : 'on', allowHalfOpen: false });
  const timer = setTimeout(() => socket.close(), timeoutMs);

  try {
    let c = channel(socket);
    await c.expect('Begrüßung', 220);
    await c.send('EHLO online-boutique-agentur.at');
    await c.expect('EHLO', 250);

    if (startTls) {
      await c.send('STARTTLS');
      await c.expect('STARTTLS', 220);
      c.release();
      socket = socket.startTls();
      c = channel(socket);
      await c.send('EHLO online-boutique-agentur.at');
      await c.expect('EHLO (TLS)', 250);
    }

    await c.send('AUTH LOGIN');
    await c.expect('Anmeldung', 334);
    await c.send(b64(mail.user));
    await c.expect('Anmeldung (Benutzer)', 334);
    await c.send(b64(mail.pass));
    await c.expect('Anmeldung (Passwort)', 235);
    await c.send(`MAIL FROM:<${clean(mail.from)}>`);
    await c.expect('Absender', 250);
    for (const rcpt of mail.to) {
      await c.send(`RCPT TO:<${clean(rcpt)}>`);
      await c.expect('Empfänger', 250, 251);
    }
    await c.send('DATA');
    await c.expect('DATA', 354);

    const headers = [
      `From: ${encodeWord(mail.fromName)} <${clean(mail.from)}>`,
      `To: ${mail.to.map(clean).join(', ')}`,
      mail.replyTo ? `Reply-To: <${clean(mail.replyTo)}>` : null,
      `Subject: ${encodeWord(clean(mail.subject))}`,
      `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
      `Message-ID: <${crypto.randomUUID()}@online-boutique-agentur.at>`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: base64',
    ].filter((h): h is string => h !== null);
    // Base64-Body enthält nie eine Zeile, die nur aus "." besteht → kein Dot-Stuffing nötig
    await c.raw(headers.join(CRLF) + CRLF + CRLF + wrap76(b64(mail.text)) + '.' + CRLF);
    await c.expect('Versand', 250);
    await c.send('QUIT');
  } finally {
    clearTimeout(timer);
    try {
      await socket.close();
    } catch {
      /* bereits geschlossen */
    }
  }
}
