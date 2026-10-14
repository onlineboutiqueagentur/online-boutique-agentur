/**
 * Cloudflare Web Analytics (cookielos) – wird nur geladen, wenn der Browser nicht als „intern“
 * markiert ist. So zählen die eigenen Aufrufe von Nina & Pia nicht mit.
 *  - Markieren:   eine beliebige Seite mit ?intern=1 aufrufen (oder im CRM unter /admin anmelden)
 *  - Aufheben:    eine beliebige Seite mit ?intern=0 aufrufen
 * Die Markierung liegt nur lokal im Browser (Local Storage „oba-intern“).
 */

const KEY = 'oba-intern';
const TOKEN = '76c6a5edcc73452c9c749b3280cd4560';

function toast(text: string) {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.textContent = text;
  el.style.cssText =
    'position:fixed;left:50%;bottom:1.5rem;translate:-50% 0;z-index:9999;padding:.75rem 1.1rem;border-radius:999px;background:#111;color:#fff;font:500 .875rem/1.3 system-ui,sans-serif;box-shadow:0 8px 24px rgb(0 0 0 / .25)';
  document.body.append(el);
  setTimeout(() => el.remove(), 4500);
}

let intern = false;
try {
  const params = new URLSearchParams(location.search);
  const flag = params.get('intern');
  if (flag === '1' || flag === '0') {
    if (flag === '1') localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
    params.delete('intern');
    const rest = params.toString();
    history.replaceState(null, '', location.pathname + (rest ? `?${rest}` : '') + location.hash);
    toast(flag === '1' ? 'Interner Modus an: Deine Besuche werden nicht mehr gezählt.' : 'Interner Modus aus: Deine Besuche werden wieder gezählt.');
  }
  intern = localStorage.getItem(KEY) === '1';
} catch {
  // Speicher nicht verfügbar – dann normal zählen
}

if (!intern) {
  const s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.dataset.cfBeacon = JSON.stringify({ token: TOKEN });
  document.head.append(s);
}

export {};
