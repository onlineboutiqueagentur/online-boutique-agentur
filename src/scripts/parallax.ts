/**
 * Scroll-Parallax wie im Original (Avada "Motion Effects", gemessen bei 1440 px):
 *  .parallax-up    wandert von +50 px auf −50 px, während es den Viewport durchquert
 *  .parallax-down  wandert von −50 px auf +50 px
 *  .blur-out       wird unscharf (bis 14 px), sobald die Unterkante über die Bildschirmmitte steigt
 *  .parallax-hero  gleitet beim Wegscrollen bis −100 px nach oben und wird leicht unscharf (3 px)
 *
 * Läuft in allen Browsern, nur ab Tablet-Breite und nicht bei "Bewegung reduzieren".
 * Nutzt die CSS-Eigenschaft `translate` (kollidiert nicht mit Reveal-Animationen).
 */

const DIST = 50;
const BLUR_MAX = 14;
const HERO_DIST = 100;
const HERO_BLUR = 3;

const enabledQuery = window.matchMedia('(min-width: 48rem) and (prefers-reduced-motion: no-preference)');
const items = [...document.querySelectorAll<HTMLElement>('.parallax-up, .parallax-down')];
const heroes = [...document.querySelectorAll<HTMLElement>('.parallax-hero')];
const visible = new Set<HTMLElement>();
let ticking = false;

const clamp = (v: number) => Math.min(1, Math.max(0, v));

function update() {
  ticking = false;
  const vh = window.innerHeight;

  visible.forEach((el) => {
    // Position ohne die bereits angewendete Verschiebung messen
    const rect = el.getBoundingClientRect();
    const applied = Number(el.dataset.dy ?? 0);
    const top = rect.top - applied;
    const progress = clamp((vh - top) / (vh + rect.height));
    const dir = el.classList.contains('parallax-down') ? -1 : 1;
    const dy = dir * (DIST - 2 * DIST * progress);
    el.dataset.dy = String(dy);
    el.style.translate = `0 ${dy.toFixed(1)}px`;

    if (el.classList.contains('blur-out')) {
      const bottom = top + rect.height;
      const blur = clamp((vh / 2 - bottom) / (vh / 2)) * BLUR_MAX;
      el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : '';
    }
  });

  heroes.forEach((el) => {
    const p = clamp(window.scrollY / vh);
    el.style.translate = p ? `0 ${(-HERO_DIST * p).toFixed(1)}px` : '';
    el.style.filter = p > 0.02 ? `blur(${(HERO_BLUR * p).toFixed(2)}px)` : '';
  });
}

function requestUpdate() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const el = entry.target as HTMLElement;
      if (entry.isIntersecting) visible.add(el);
      else visible.delete(el);
    });
    requestUpdate();
  },
  { rootMargin: '100px 0px' },
);

function reset() {
  [...items, ...heroes].forEach((el) => {
    el.style.translate = '';
    el.style.filter = '';
    delete el.dataset.dy;
  });
}

function setEnabled(on: boolean) {
  if (on) {
    items.forEach((el) => observer.observe(el));
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    requestUpdate();
  } else {
    observer.disconnect();
    visible.clear();
    window.removeEventListener('scroll', requestUpdate);
    window.removeEventListener('resize', requestUpdate);
    reset();
  }
}

setEnabled(enabledQuery.matches);
enabledQuery.addEventListener('change', (e) => setEnabled(e.matches));

export {};
