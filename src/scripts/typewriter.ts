/**
 * Schreibmaschinen-Effekt (wie im Original: 120 ms pro Zeichen, 1,2 s Pause).
 * Markup: <span data-typewriter='[{"prefix":"Unsere","word":"Erfahrung."}, …]'>
 *   <span data-tw-prefix>…</span> <span data-tw-word>…</span>
 * - Für Screenreader/SEO steht der vollständige Text separat (sr-only),
 *   der animierte Teil ist aria-hidden.
 * - Läuft nur, solange das Element sichtbar ist; bei "reduced motion" statisch.
 */

interface Step {
  prefix?: string;
  word: string;
}

const TYPE_MS = 120;
const HOLD_MS = 1200;

function run(el: HTMLElement) {
  const steps: Step[] = JSON.parse(el.dataset.typewriter ?? '[]');
  const prefixEl = el.querySelector<HTMLElement>('[data-tw-prefix]');
  const wordEl = el.querySelector<HTMLElement>('[data-tw-word]');
  if (!wordEl || steps.length === 0) return;

  let index = 0;
  let chars = 0;
  let deleting = false;
  let timer = 0;
  let visible = false;

  const tick = () => {
    const step = steps[index];
    if (prefixEl && step.prefix) prefixEl.textContent = step.prefix;
    let delay = TYPE_MS;

    if (!deleting) {
      chars++;
      if (chars >= step.word.length) {
        deleting = true;
        delay = HOLD_MS;
      }
    } else {
      chars--;
      if (chars <= 0) {
        deleting = false;
        index = (index + 1) % steps.length;
      }
    }
    wordEl.textContent = step.word.slice(0, chars);
    if (visible) timer = window.setTimeout(tick, delay);
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    window.clearTimeout(timer);
    if (visible) timer = window.setTimeout(tick, TYPE_MS);
  }).observe(el);
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll<HTMLElement>('[data-typewriter]').forEach(run);
}

export {};
