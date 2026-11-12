/**
 * Marken-Check (/marken-check): Ablauf, Auswertung und anonyme Statistik.
 * Texte und Fragen kommen aus src/content/markencheck.ts (als JSON im data-config-Attribut).
 *
 * Statistik: zufällige id pro Durchlauf (nur im Arbeitsspeicher), gesendet per sendBeacon an
 * /api/marken-check beim Start, beim Verlassen/Verstecken der Seite, beim Ergebnis und nach dem
 * Kontaktformular. Kein Cookie, kein Local Storage. Browser im internen Modus („oba-intern“) senden nichts.
 */
import { kampagne } from './kampagne';
import type { BereichId, Ergebnis, Frage, markencheck } from '../content/markencheck';

interface Config {
  fragen: Frage[];
  bereiche: Record<BereichId, { name: string; frage: string }>;
  ergebnisse: Ergebnis[];
  auswertung: (typeof markencheck)['auswertung'];
}

const MAX_GEFUEHLE = 2;

export function starteMarkencheck(root: HTMLElement) {
  const cfg: Config = JSON.parse(root.dataset.config || '{}');
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  const reihenfolge = ['intro', 'gefuehl', ...cfg.fragen.map((_, i) => `frage-${i}`), 'ergebnis'];

  // Alle Fragen bekommen die Höhe der längsten Frage (mit dem längsten Gefühlspaar),
  // damit Croissants, Weiter und Zurück bei jeder Frage an derselben Stelle stehen.
  const fragenHoehe = () => {
    const vorlage = root.querySelector<HTMLElement>('.mc-frage[data-text]');
    if (!vorlage) return;
    const mess = vorlage.cloneNode(false) as HTMLElement;
    mess.removeAttribute('id');
    const st = getComputedStyle(root);
    const breite = root.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight);
    mess.style.cssText = `position:absolute;visibility:hidden;left:0;top:0;min-height:0;width:${breite}px`;
    root.append(mess);
    const laengstesGefuehl = 'Lebensfreude und Begeisterung';
    let max = 0;
    for (const f of cfg.fragen) {
      mess.textContent = f.text.replaceAll('{gefuehl}', laengstesGefuehl);
      max = Math.max(max, mess.getBoundingClientRect().height);
    }
    mess.remove();
    root.style.setProperty('--mc-frage-h', `${Math.ceil(max)}px`);
  };
  fragenHoehe();
  document.fonts?.ready.then(fragenHoehe);
  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(fragenHoehe, 150);
  });
  const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;

  let aktuell = 0;
  let gefuehle: string[] = [];
  let antworten: (number | null)[] = cfg.fragen.map(() => null);
  let lauf: { id: string; schritt: number; gesendet: number; fertig: boolean } | null = null;
  let ergebnisDaten: Record<string, unknown> = {};

  /* ---------- Statistik ---------- */
  const intern = (() => {
    try {
      return localStorage.getItem('oba-intern') === '1';
    } catch {
      return false;
    }
  })();
  const herkunft = (() => {
    const p = new URLSearchParams(location.search);
    // Werbelink (UTM, auch wenn er auf einer anderen Seite dieses Tabs ankam) oder ?von=…
    const von = p.get('von') || kampagne()?.utm_source;
    if (von) return von;
    try {
      const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^(www|l|m|lm)\./, '') : '';
      return ref && ref !== location.hostname.replace(/^www\./, '') ? ref : undefined;
    } catch {
      return undefined;
    }
  })();
  const geraet = matchMedia('(pointer: coarse)').matches ? 'mobil' : 'desktop';

  function senden(extra: Record<string, unknown> = {}) {
    if (!lauf || intern) return;
    lauf.gesendet = lauf.schritt;
    const body = JSON.stringify({ id: lauf.id, schritt: lauf.schritt, fertig: lauf.fertig, gefuehle, herkunft, geraet, ...ergebnisDaten, ...extra });
    try {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon?.('/api/marken-check', blob)) return;
    } catch {
      // weiter mit fetch
    }
    fetch('/api/marken-check', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  }
  const fortschritt = (schritt: number) => {
    if (lauf && schritt > lauf.schritt) lauf.schritt = schritt;
  };
  // Beim Verlassen oder Wegwischen der Seite: festhalten, wie weit es ging
  const beimVerlassen = () => {
    if (lauf && !lauf.fertig && lauf.schritt !== lauf.gesendet) senden();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') beimVerlassen();
  });
  addEventListener('pagehide', beimVerlassen);

  /* ---------- Ablauf ---------- */
  const gefuehlText = () => gefuehle.join(' und ') || 'dein Wunschgefühl';
  const mitGefuehl = (t: string) => t.replaceAll('{gefuehl}', gefuehlText());

  function zeige(index: number) {
    aktuell = index;
    const name = reihenfolge[index];
    screens.forEach((s) => {
      const an = s.dataset.screen === name;
      s.hidden = !an;
      s.classList.toggle('is-active', an);
    });
    const screen = screens.find((s) => s.dataset.screen === name)!;
    // Fragen mit {gefuehl} an das gewählte Gefühl anpassen
    screen.querySelectorAll<HTMLElement>('[data-text]').forEach((el) => (el.textContent = mitGefuehl(el.dataset.text!)));
    const top = root.getBoundingClientRect().top + scrollY - 16;
    if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
    screen.querySelector<HTMLElement>('h1, h2')?.focus({ preventScroll: true });
    // Senkrechter Strich über der Frage wächst bei jeder Frage neu (wie beim Scrollen auf der Website)
    const linie = screen.querySelector<HTMLElement>('.v-line');
    if (linie) {
      linie.classList.remove('is-in');
      requestAnimationFrame(() => requestAnimationFrame(() => linie.classList.add('is-in')));
    }
  }

  $('[data-start]').addEventListener('click', () => {
    if (!lauf) {
      const zufall = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, '0')).join('');
      lauf = { id: `${Date.now()}-${zufall}`, schritt: 0, gesendet: -1, fertig: false };
      senden();
    }
    zeige(1);
  });

  root.querySelectorAll<HTMLElement>('[data-zurueck]').forEach((b) => b.addEventListener('click', () => zeige(Math.max(0, aktuell - 1))));

  // Wunschgefühl: 1–2 auswählen
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-gefuehl]')];
  const weiter = $<HTMLButtonElement>('[data-gefuehl-weiter]');
  const chipsAktualisieren = () => {
    chips.forEach((c) => {
      const an = gefuehle.includes(c.dataset.gefuehl!);
      c.setAttribute('aria-pressed', String(an));
      c.setAttribute('aria-disabled', String(!an && gefuehle.length >= MAX_GEFUEHLE));
    });
    weiter.disabled = gefuehle.length === 0;
  };
  chips.forEach((c) =>
    c.addEventListener('click', () => {
      const g = c.dataset.gefuehl!;
      if (gefuehle.includes(g)) gefuehle = gefuehle.filter((x) => x !== g);
      else if (gefuehle.length < MAX_GEFUEHLE) gefuehle = [...gefuehle, g];
      else gefuehle = [gefuehle[1], g]; // drittes Gefühl ersetzt das älteste
      chipsAktualisieren();
    }),
  );
  weiter.addEventListener('click', () => {
    if (!gefuehle.length) return;
    fortschritt(1);
    zeige(2);
  });

  // Croissant-Skala: antippen, dann „Weiter“
  cfg.fragen.forEach((_, i) => {
    const screen = screens.find((s) => s.dataset.screen === `frage-${i}`)!;
    const herzen = [...screen.querySelectorAll<HTMLButtonElement>('[data-wert]')];
    // Wie beim Einstieg: antippen (und bei Bedarf ändern), dann bewusst „Weiter“ klicken
    const weiterBtn = screen.querySelector<HTMLButtonElement>('[data-frage-weiter]')!;
    weiterBtn.addEventListener('click', () => {
      if (antworten[i] === null) return;
      if (i === cfg.fragen.length - 1) ergebnis();
      else zeige(aktuell + 1);
    });
    herzen.forEach((h) =>
      h.addEventListener('click', () => {
        const wert = Number(h.dataset.wert);
        antworten[i] = wert;
        herzen.forEach((x) => {
          const n = Number(x.dataset.wert);
          x.classList.toggle('is-an', n <= wert);
          x.setAttribute('aria-pressed', String(n === wert));
        });
        fortschritt(2 + i);
        weiterBtn.disabled = false;
      }),
    );
  });

  /* ---------- Auswertung ---------- */
  const pct = (werte: number[]) => (werte.length ? Math.round((werte.reduce((a, v) => a + (v - 1) / 4, 0) / werte.length) * 100) : 0);

  function ergebnis() {
    const werte = antworten.map((a) => a ?? 3);
    const ids = Object.keys(cfg.bereiche) as BereichId[];
    const bereiche = Object.fromEntries(ids.map((b) => [b, pct(werte.filter((_, i) => cfg.fragen[i].bereich === b))])) as Record<BereichId, number>;
    const gesamt = pct(werte);
    let e = cfg.ergebnisse[0];
    for (const x of cfg.ergebnisse) if (gesamt >= x.ab) e = x;
    const sortiert = [...ids].sort((a, b) => bereiche[b] - bereiche[a]);
    const staerkster = sortiert[0];
    const schwaechster = sortiert[sortiert.length - 1];
    const ausgeglichen = bereiche[staerkster] - bereiche[schwaechster] < 10;
    const a = cfg.auswertung;

    // 1–3 gefüllte Croissants je nach Ergebnis
    const stufe = cfg.ergebnisse.indexOf(e) + 1;
    $('[data-e-symbol]').querySelectorAll('.croissant-art').forEach((c, k) => c.classList.toggle('is-an', k < stufe));
    $('[data-e-titel]').textContent = e.titel;
    $('[data-e-text]').textContent = e.text;
    $('[data-e-gefuehl]').textContent = `Dein Wunschgefühl: ${gefuehlText()}`;
    const liste = $('[data-e-balken]');
    liste.replaceChildren(
      ...ids.map((b) => {
        const li = document.createElement('li');
        // Nur die Frage des Bereichs (ohne Bereichsnamen) und der Wert
        li.innerHTML = '<span class="mc-balken__frage"></span><span class="mc-balken__prozent"></span><span class="mc-balken__spur"><span class="mc-balken__wert"></span></span>';
        const [frage, wert] = li.querySelectorAll('span');
        frage.textContent = cfg.bereiche[b].frage;
        wert.textContent = `${bereiche[b]} %`;
        li.querySelector('.mc-balken__spur')!.setAttribute('aria-hidden', 'true');
        requestAnimationFrame(() => requestAnimationFrame(() => (li.querySelector<HTMLElement>('.mc-balken__wert')!.style.width = `${bereiche[b]}%`)));
        return li;
      }),
    );
    const staerke = $('[data-e-staerke]');
    const potenzial = $('[data-e-potenzial]');
    if (ausgeglichen) {
      staerke.textContent = a.ausgeglichen;
      potenzial.hidden = true;
    } else {
      staerke.textContent = mitGefuehl(a.staerke).replace('{frage}', cfg.bereiche[staerkster].frage);
      potenzial.textContent = mitGefuehl(a.potenzial).replace('{frage}', cfg.bereiche[schwaechster].frage);
      potenzial.hidden = false;
    }
    $('[data-e-tipp]').textContent = mitGefuehl(a.tipps[schwaechster]);

    // Für das Kontaktformular (Mail, /admin, CRM): kurze Zusammenfassung + alle Antworten
    const kurz = `${e.symbol} ${e.titel.replace(/\.$/, '')} (${gesamt} %)`;
    $<HTMLInputElement>('[data-ergebnis-feld]').value = kurz;
    $<HTMLInputElement>('[data-check-feld]').value = [
      '— Marken-Check —',
      `Wunschgefühl: ${gefuehlText()}`,
      `Ergebnis: ${kurz}`,
      ids.map((b) => `${cfg.bereiche[b].name} ${bereiche[b]} %`).join(' · '),
      '',
      'Antworten (1–5 Croissants):',
      ...cfg.fragen.map((f, i) => `${i + 1}. ${mitGefuehl(f.text)} → ${'🥐'.repeat(werte[i])} (${werte[i]} von 5)`),
    ].join('\n');

    if (lauf) {
      fortschritt(1 + cfg.fragen.length);
      lauf.fertig = true;
      ergebnisDaten = { ergebnis: e.id, prozent: gesamt, bereiche };
      senden();
    }
    zeige(reihenfolge.length - 1);
    videoStarten();
  }

  // Video von Nina und Pia erst laden, wenn das Ergebnis da ist und es in die Nähe kommt
  function videoStarten() {
    const video = root.querySelector<HTMLVideoElement>('.mc-video__film');
    if (!video || video.src) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    new IntersectionObserver(
      ([entry], obs) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        video.src = video.dataset.src ?? '';
        if (reduced) {
          video.controls = true;
          video.preload = 'metadata';
        } else {
          video.autoplay = true;
          video.play().catch(() => (video.controls = true));
        }
      },
      { rootMargin: '400px' },
    ).observe(video);
  }

  // Bonus-Checkliste: abhaken; „Als PDF speichern“ öffnet die Druckansicht nur mit der Checkliste
  const boxen = [...root.querySelectorAll<HTMLInputElement>('[data-bonus-box]')];
  const alleOk = root.querySelector<HTMLElement>('[data-bonus-ok]');
  boxen.forEach((b) => b.addEventListener('change', () => alleOk && (alleOk.hidden = !boxen.every((x) => x.checked))));
  root.querySelector('[data-bonus-pdf]')?.addEventListener('click', () => {
    const html = document.documentElement;
    html.classList.add('mc-druck');
    const titel = document.title;
    document.title = 'Website-Check – Online Boutique Agentur';
    const fertig = () => {
      html.classList.remove('mc-druck');
      document.title = titel;
      removeEventListener('afterprint', fertig);
    };
    addEventListener('afterprint', fertig);
    print();
  });

  // Kontaktformular abgeschickt → in der Statistik vermerken
  root.querySelector('[data-check-form]')?.addEventListener('formular-gesendet', () => senden({ lead: true }));

  // Nochmal: alles zurücksetzen, neuer anonymer Durchlauf
  $('[data-nochmal]').addEventListener('click', () => {
    lauf = null;
    gefuehle = [];
    antworten = cfg.fragen.map(() => null);
    ergebnisDaten = {};
    chipsAktualisieren();
    boxen.forEach((b) => (b.checked = false));
    if (alleOk) alleOk.hidden = true;
    root.querySelectorAll<HTMLButtonElement>('[data-frage-weiter]').forEach((b) => (b.disabled = true));
    root.querySelectorAll('[data-wert]').forEach((h) => {
      h.classList.remove('is-an');
      h.setAttribute('aria-pressed', 'false');
    });
    zeige(0);
  });
}
