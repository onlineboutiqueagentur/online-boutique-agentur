/**
 * Einblend-Animationen beim Sichtbarwerden (läuft in allen Browsern).
 * Setzt .anim-ready auf <html> und .is-in auf Elemente, sobald sie in den
 * Viewport kommen. Ohne JavaScript oder bei "Bewegung reduzieren" bleibt alles
 * sofort sichtbar.
 *
 * Bewusst kein IntersectionObserver: Elemente, die per clip-path komplett
 * zugeschnitten starten (.reveal), gelten in aktuellen Chrome-Versionen als
 * „nicht sichtbar“ – sie würden nie eingeblendet und Lazy-Bilder darin nie geladen.
 * Stattdessen wird die Position beim Scrollen (einmal pro Frame) geprüft.
 */

const SELECTOR = '.reveal, .reveal-up, .v-line, .bounce-left, .flash, .croissant-art--draw';

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let pending = [...document.querySelectorAll<HTMLElement>(SELECTOR)];
  let scheduled = false;

  const check = () => {
    scheduled = false;
    const limit = window.innerHeight * 0.9;
    pending = pending.filter((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < limit && rect.bottom > 0) {
        el.classList.add('is-in');
        return false;
      }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    }
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(check);
  };

  // Bereits sichtbare Elemente (z. B. nach Reload mitten auf der Seite) nicht erst verstecken
  check();
  document.documentElement.classList.add('anim-ready');
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}

export {};
