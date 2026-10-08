/**
 * Design-Switch (minimal ↔ louder)
 *
 * - Zustand: Attribut data-design auf <html> (CSS-Variablen + Theme-Klassen)
 * - Speicherung: localStorage "oba-design" (kein Cookie nötig; reine
 *   Nutzer-Präferenz, wird nie an einen Server übertragen)
 * - Der initiale Zustand wird bereits im <head> gesetzt (kein Flackern),
 *   siehe DesignInit.astro.
 * - Übergang: View Transitions API mit kreisförmiger Enthüllung ab dem
 *   Klickpunkt; ohne API-Support oder bei "reduced motion" sofortiger Wechsel.
 */

type Design = 'minimal' | 'louder';
const KEY = 'oba-design';
const root = document.documentElement;
const statusEl = document.getElementById('design-status');

const current = (): Design => (root.dataset.design === 'louder' ? 'louder' : 'minimal');

function sync(design: Design) {
  document.querySelectorAll<HTMLButtonElement>('[data-design-set]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.designSet === design));
  });
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = design === 'louder' ? '#cecbc8' : '#f6f4f2';
}

function setDesign(next: Design, origin?: { x: number; y: number }, anchor?: HTMLElement | null) {
  if (next === current()) return;

  const update = () => {
    // Die beiden Welten sind unterschiedlich hoch (z. B. größere Überschriften in louder).
    // Damit die Ansicht nicht springt, bleibt das angeklickte Element an derselben Bildschirmposition.
    const before = anchor?.getBoundingClientRect().top;
    root.dataset.design = next;
    if (anchor && before !== undefined) {
      const delta = anchor.getBoundingClientRect().top - before;
      if (Math.abs(delta) > 0.5) window.scrollBy({ top: delta, behavior: 'instant' });
    }
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* Privater Modus o. Ä. – Wechsel funktioniert trotzdem */
    }
    sync(next);
    if (statusEl) statusEl.textContent = statusEl.dataset[next] ?? '';
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduced || document.hidden) {
    update();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.style.setProperty('--vt-x', `${x}px`);
  root.style.setProperty('--vt-y', `${y}px`);
  root.style.setProperty('--vt-r', `${Math.ceil(r)}px`);
  const transition = document.startViewTransition(update);
  // Abgebrochene Animation (z. B. Tab im Hintergrund) ist unkritisch – der Wechsel passiert trotzdem.
  transition.ready.catch(() => {});
  transition.finished.catch(() => {});
}

/** Bezugspunkt fürs Stehenbleiben: die umgebende Sektion (das geklickte Element selbst kann nach dem Wechsel unsichtbar sein). */
const anchorOf = (el: HTMLElement) => el.closest<HTMLElement>('section, footer, header') ?? el;

function originOf(event: MouseEvent, el: HTMLElement) {
  // Tastatur-Klick (detail === 0) → Mittelpunkt des Buttons
  if (event.detail > 0) return { x: event.clientX, y: event.clientY };
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  const toggle = target?.closest<HTMLElement>('[data-design-toggle]');
  const setter = target?.closest<HTMLElement>('[data-design-set]');
  if (toggle) {
    setDesign(current() === 'louder' ? 'minimal' : 'louder', originOf(event, toggle), anchorOf(toggle));
  } else if (setter) {
    setDesign(setter.dataset.designSet === 'louder' ? 'louder' : 'minimal', originOf(event, setter), anchorOf(setter));
  }
});

// Änderungen in einem anderen Tab übernehmen
window.addEventListener('storage', (event) => {
  if (event.key === KEY && (event.newValue === 'minimal' || event.newValue === 'louder')) {
    root.dataset.design = event.newValue;
    sync(event.newValue);
  }
});

sync(current());

export {};
