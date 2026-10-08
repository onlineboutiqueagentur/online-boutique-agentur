/**
 * THE BOUTIQUE CROISSANT – alle Texte der Landingpage /croissant und des Startseiten-Teasers.
 * Tonalität: modern, persönlich, charmant, leicht französisch – nie kitschig.
 * Die Croissant-Metapher sparsam einsetzen.
 */

import cafeImg from '../assets/images/croissant/croissant-cafe-la-vie-est-belle.jpg';
import zutatenImg from '../assets/images/croissant/croissant-zutaten-einer-marke.jpg';
import verpackungImg from '../assets/images/croissant/boutique-croissant-verpackung.jpg';
import fruehstueckImg from '../assets/images/croissant/franzoesisches-fruehstueck-kaffee-croissant.jpg';

/** Bilder der Croissant-Seite (Zwischenlösung aus dem Moodboard – später durch echte Fotos ersetzen). */
export const croissantImages = {
  cafe: {
    src: cafeImg,
    alt: 'Cappuccino und Croissant auf einem Marmortisch in einem Straßencafé, dazu der Schriftzug „la vie est belle“',
  },
  zutaten: {
    src: zutatenImg,
    alt: 'Angeschnittenes Croissant mit beschrifteten Schichten: die Basis – Strategie, die Schichten – Design, die Füllung – Content, die Glasur – Social Media, der letzte Schliff – SEO und Ads',
  },
  verpackung: {
    src: verpackungImg,
    alt: 'Croissant in einer Papierverpackung mit dem Aufdruck „The Boutique Croissant – A little extra for your brand“ und einem QR-Code',
  },
  fruehstueck: {
    src: fruehstueckImg,
    alt: 'Frühstückstisch mit Kaffeetassen, einem Croissant, Blumen und einem Laptop im Morgenlicht',
  },
} as const;

export const croissantSeo = {
  title: 'The Boutique Croissant – ein kleines Extra | Online Boutique Agentur, Linz',
  description:
    'Für ausgewählte Marken bringen Nina & Pia ein Croissant persönlich vorbei – und laden zum Frühstück ein: 30 Minuten Kaffee, Croissant und ein gutes Gespräch über deine Marke. Kostenlos, live oder virtuell.',
  path: '/croissant/',
  ogAlt: 'The Boutique Croissant – eine Einladung der Online Boutique Agentur',
} as const;

/** Startseiten-Teaser – kurz, macht nur neugierig. */
export const croissantTeaser = {
  eyebrow: 'The Boutique Croissant',
  title: 'Manchmal beginnt eine gute Zusammenarbeit mit einem kleinen Extra.',
  textHtml: 'Ein Croissant vielleicht.<br /> Für Marken, bei denen wir das Gefühl haben: <em>Das könnte richtig gut passen.</em>',
  cta: 'The Boutique Croissant',
  href: '/croissant/',
} as const;

export const croissant = {
  eyebrow: 'The Boutique Croissant',

  /** Zwei Einstiege: per QR-Code von der Verpackung (?qr=1) oder über Website/Google/Social Media. */
  hero: {
    qr: {
      title: 'Du hast ein Croissant bekommen.',
      titleSecond: 'Jetzt weißt du auch warum.',
    },
    web: {
      title: 'Hast du Gusto auf ein Croissant bekommen?',
      titleSecond: 'Dann lass uns gemeinsam frühstücken!',
    },
    textHtml: 'Wir laden dich zu einem kostenlosen 30-Minuten-Gespräch ein – ein <em>ganz unkompliziertes, virtuelles Frühstück</em>.',
    tagline: '30 Minuten. Ein paar Fragen. Ein frischer Blick auf deine Marke.',
    steps: [
      'Wir lernen uns kennen.',
      'Du erzählst uns von deiner Marke.',
      'Wir stellen Fragen.',
      'Wir geben dir erste Gedanken mit.',
      'Wir schauen gemeinsam, wo Potenzial steckt.',
    ],
    scroll: 'Warum ein Croissant?',
  },

  /** Einstieg nach dem Hero (Text von Nina & Pia, unverändert). Das 🥐 wird als kleine Zeichnung dargestellt. */
  why1: {
    titleBefore: 'Warum ein',
    titleAfter: 'deinen Unternehmensauftritt verändern kann.',
    titleText: 'Warum ein Croissant deinen Unternehmensauftritt verändern kann.',
    subHtml: 'Über kleine Genussmomente,<br /> große Gefühle und den Unterschied,<br /> den das gewisse Extra ausmacht.',
  },

  story: {
    title: 'The sweet little Extra.',
    paragraphs: [
      'Ein Croissant ist mehr als ein Frühstück. Es ist ein kleines Extra. Ein bisschen Genuss. Ein bisschen Leichtigkeit. Ein bisschen <em>très chic</em>.',
      'Genau das wollen wir auch für deine Marke schaffen: diesen kleinen, aber entscheidenden Unterschied zwischen „passt schon“ und „das fühlt sich richtig gut an.“ Weil die kleinen Dinge oft den Unterschied machen.',
    ],
    statementLead: 'Eine gute Marke erkennt man nicht nur.',
    statementPunch: 'Du fühlst sie.',
  },

  layers: {
    paragraphs: [
      'Eine gute Marke löst etwas aus. Ein Gefühl, eine Erinnerung, eine besondere Stimmung. Eine Vorstellung davon, wofür sie steht.',
      'So wie bei unserem Croissant. Da denkst du vielleicht gleich an den ersten Kaffee am Morgen.<br />An Paris. An ein kleines Café.<br />An Urlaub. Genuss. Leichtigkeit.<br />An etwas Besonderes, das man sich gönnt.<br />Vielleicht sogar an diesen Duft von frisch Gebackenem.',
      'Ein einziges Croissant – und sofort entstehen Bilder, Erinnerungen und Gefühle.<br /><b>Genau das kann eine starke Marke auch.</b>',
    ],
  },

  journey: {
    eyebrow: 'Feel. Flow. Grow. Glow.',
    title: 'Harmonie als Basis für gemeinsamen Erfolg.',
    textHtml:
      'Gute Zusammenarbeit besteht nicht nur aus Zahlen, Fakten und Analysen. Natürlich sind Strategie und Daten wichtig. Aber bevor wirklich etwas Gutes entstehen kann, <em>muss es sich richtig anfühlen.</em>',
    steps: [
      { word: 'feel', text: 'Die Chemie stimmt.' },
      { word: 'flow', text: 'Ideen entstehen.' },
      { word: 'grow', text: 'Deine Marke und dein Business wachsen.' },
      {
        word: 'glow',
        text: 'Am Ende steht eine Marke, die sich nach deinem Unternehmen anfühlt – und bei den richtigen Menschen etwas auslöst.',
      },
    ],
  },

  why: {
    eyebrow: 'Warum gerade du?',
    title: 'Kein Werbegeschenk. Ein Bauchgefühl.',
    paragraphs: [
      'Das Boutique Croissant bringen wir nur ausgewählten Wunschkunden persönlich vorbei. Nicht als Massenaktion. Nicht als Werbegeschenk.',
      'Sondern weil wir bei deiner Marke das Gefühl haben: Da könnte etwas richtig Schönes entstehen.',
      'Wir möchten dich kennenlernen. Deine Geschichte hören. Verstehen, wo du gerade stehst. Und gemeinsam herausfinden, ob wir gut zusammenpassen.',
    ],
    signature: 'Nina & Pia',
  },

  feel: {
    title: 'Sag mal, spürst du das auch?',
    textHtml:
      'Deine Geschichte. Deine Persönlichkeit. Deine Erfahrung. Und das, was du mit Leidenschaft tust. All das sind die Zutaten, die deine Marke besonders machen. <b>Und das soll man auf den ersten Blick spüren.</b>',
    ask: 'Was fühlst du, wenn du an deine Marke denkst?',
    questions: [
      'Du weißt, dass du richtig gut bist – aber irgendwie sieht man das deiner Marke nicht an?',
      'Findest du andere Marken richtig cool – und fragst dich, warum deine nicht so wirkt?',
      'Ist deine Website eigentlich ganz schön – aber irgendwie nicht mehr so richtig du?',
      'Hast du schon hundertmal gedacht: Meine Website müsste ich wirklich mal überarbeiten?',
      'Sitzt du vor Instagram und bist dir einfach unsicher, was du posten sollst?',
      'Wünscht du dir manchmal einfach jemanden, der sagt: Komm, wir machen das jetzt richtig schön?',
    ],
    hint: 'Tipp an, was auf dich zutrifft',
    empty: 'Deine Antwort erscheint hier.',
    /** Antwort je nach Anzahl der angeklickten Fragen (ab … Fragen) */
    answers: [
      { from: 1, text: 'Schon ein kleines Ja zeigt: Da steckt mehr in deiner Marke. Lass uns bei einem Croissant darüber reden, was ihr noch fehlt.' },
      { from: 3, text: 'Du spürst es also auch. Deine Marke kann mehr – und genau dafür sind wir da. Komm auf einen Kaffee vorbei, wir schauen sie uns gemeinsam an.' },
      { from: 5, text: 'Dann wird es Zeit für dein kleines Extra. Komm, wir machen das jetzt richtig schön.' },
    ],
    cta: 'Lass uns frühstücken',
  },
  breakfast: {
    eyebrow: 'Die Einladung',
    title: 'Lust auf ein französisches Frühstück?',
    facts: ['30 Minuten.', 'Kaffee.', 'Croissant.', 'Ein gutes Gespräch über deine Marke.'],
    textHtml: 'Wir laden dich zu einem kostenlosen 30-Minuten-Gespräch ein – <em>bei uns, bei dir oder ganz unkompliziert virtuell.</em>',
    notTitle: 'Kein Verkaufspitch. Keine Verpflichtung. Stattdessen:',
    instead: ['Wir lernen dich kennen.', 'Du erzählst uns von deiner Marke.', 'Wir stellen Fragen.', 'Wir geben dir erste Gedanken mit.', 'Wir schauen gemeinsam, wo Potenzial steckt.'],
  },

  extra: {
    eyebrow: 'The little extra',
    lines: ['Manchmal braucht es gar nicht viel.', 'Ein gutes Gespräch.', 'Eine neue Perspektive.', 'Eine Idee, die plötzlich alles verändert.'],
    last: 'Oder einfach ein Croissant zur richtigen Zeit.',
  },

  final: {
    title: 'Dann lass uns frühstücken.',
    textHtml: 'Vielleicht beginnt eure Zusammenarbeit ja mit einem Croissant.',
  },

  cta: {
    label: 'Einladung annehmen',
    meta: '30 Minuten · kostenlos · live oder virtuell',
  },

  form: {
    title: 'Schön, dass du dabei bist.',
    text: 'Verrate uns kurz, wer du bist und wo wir frühstücken. Wir melden uns mit einem Terminvorschlag.',
    fields: {
      name: 'Dein Name',
      company: 'Marke / Unternehmen',
      email: 'E-Mail',
      phone: 'Telefon (optional)',
      format: 'Wo frühstücken wir?',
      when: 'Wann passt es dir meistens? (optional)',
      whenPlaceholder: 'z. B. vormittags, Di oder Do',
      message: 'Magst du uns schon etwas erzählen? (optional)',
    },
    formats: [
      { value: 'bei-uns', label: 'Bei euch in Pasching' },
      { value: 'bei-mir', label: 'Bei mir' },
      { value: 'virtuell', label: 'Virtuell' },
    ],
    submit: 'Einladung annehmen',
    sending: 'Kaffee wird aufgesetzt …',
    success: 'Wunderbar – wir freuen uns auf dich!\nWir melden uns ganz bald mit einem Terminvorschlag.\nNina & Pia',
    error: 'Ups – da ist etwas schiefgelaufen. Probier es bitte gleich noch einmal oder schreib uns direkt an hello@online-boutique-agentur.at.',
    alternative: 'Lieber direkt?',
  },
} as const;
