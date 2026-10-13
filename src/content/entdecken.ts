/**
 * /entdecken/ – Landingpage („Deine Marke kann mehr.“), ursprünglich am zweiten Rechner entstanden
 * und am 13.10.2026 1:1 (Texte, Aufbau) in dieses Projekt übernommen.
 * Die Abschnitte sind eigene Bausteine (src/components/entdecken/) und werden auch auf der
 * Test-Startseite /startseite-neu/ verwendet.
 */

import webdesignImg from '../assets/images/entdecken/leistung-webdesign-laptop-schreibtisch.jpg';
import socialImg from '../assets/images/entdecken/leistung-social-media-smartphone-feed.jpg';
import beratungImg from '../assets/images/entdecken/leistung-marketingberatung-notizbuch.jpg';
import twinsImg from '../assets/images/minimal/pia-nina-zwillinge-boutique-agentur-schwarzweiss.jpg';

export const entdeckenSeo = {
  title: 'Deine Marke kann mehr. | Online Boutique Agentur, Linz',
  description:
    'Wir machen Marken sichtbar, Websites besonders und Marketing persönlich. Branding, Webdesign, Social Media und Marketingberatung von Nina & Pia aus Linz.',
  path: '/entdecken/',
} as const;

export const entdecken = {
  hero: {
    titleHtml: 'Deine Marke kann mehr.<br /><em>Zeigen wir es der Welt.</em>',
    sub: 'Du liebst, was du tust. Aber zeigt dein Außenauftritt auch, wie viel in deinem Unternehmen steckt? Wir machen deine Marke sichtbar, deine Website besonders und dein Marketing persönlich.',
    cta: 'Entdecke, was möglich ist.',
  },

  statement: {
    titleHtml: 'Du darfst in deine eigene Marke <em>verliebt</em> sein.',
    textHtml:
      'Und zwar so richtig. In ihren Auftritt. Ihre Geschichte. In jedes kleine Detail. Und vor allem in das Gefühl, das sie auslöst.<br />Weil deine Marke vor allem eines widerspiegeln sollte: dich.',
  },

  problems: {
    titleHtml: 'Hand aufs Herz. <em>Spürst du dieses Kribbeln noch?</em>',
    textHtml:
      'Wenn du an deine Marke denkst, hast du da Schmetterlinge im Bauch oder eher ein kleines Bauchgefühl, dass da noch mehr geht? Vielleicht erkennst du dich hier wieder.',
    items: [
      { icon: 'browser', text: 'Deine Website ist online.', em: 'Aber die ganz große Liebe ist es irgendwie nicht.' },
      { icon: 'sprout', text: 'Dein Unternehmen hat sich weiterentwickelt.', em: 'Dein Markenauftritt irgendwie nicht.' },
      { icon: 'eye', text: 'Du machst richtig gute Arbeit.', em: 'Aber nach außen sieht man davon viel zu wenig.' },
      { icon: 'bulb', text: 'Du hast tausend Ideen im Kopf.', em: 'Aber keinen roten Faden für dein Marketing.' },
      { icon: 'compass', text: 'Du weißt, dass du etwas verändern möchtest.', em: 'Aber nicht so recht, wo du anfangen sollst.' },
    ],
  },

  worlds: {
    titleHtml: 'Keine Sorge.<br />Wir bringen dich (wieder) ins Schwärmen,<br /><em>für deine eigene Marke.</em>',
    textHtml: 'Wir machen aus deiner Marke wieder etwas, das du am liebsten der ganzen Welt zeigen möchtest.',
    rows: [
      {
        no: '01',
        title: 'Endlich ein Auftritt, der sich nach dir anfühlt.',
        text: 'Dein Unternehmen ist einzigartig. Dein Markenauftritt sollte es auch sein. Wir gestalten Websites und Markenwelten, die nicht nur schön aussehen, sondern deine Persönlichkeit sichtbar machen.',
        tags: ['Branding', 'Corporate Design', 'Webdesign'],
        image: webdesignImg,
        alt: 'Laptop auf einem Travertin-Block im Sonnenlicht, darauf eine elegante Website einer Moderatorin',
      },
      {
        no: '02',
        title: 'Sichtbar werden. Und im Kopf bleiben.',
        text: 'Du hast etwas zu erzählen. Wir helfen dir, die richtigen Worte, Bilder und Kanäle dafür zu finden. Damit aus gelegentlichen Posts ein Marketingauftritt mit Wiedererkennungswert wird.',
        tags: ['Social Media', 'Content', 'Online-Marketing'],
        image: socialImg,
        alt: 'Smartphone auf einem Travertin-Ständer mit einem stimmigen Instagram-Feed in warmen Beigetönen',
      },
      {
        no: '03',
        title: 'Weniger Fragezeichen. Mehr Klarheit.',
        text: 'Manchmal braucht es einfach jemanden, der von außen draufschaut, mitdenkt und neue Perspektiven eröffnet. Gemeinsam bringen wir Struktur in deine Ideen und entwickeln einen Plan, der zu dir und deinem Unternehmen passt.',
        tags: ['Marketingberatung', 'Strategie', 'Persönliche Begleitung'],
        image: beratungImg,
        alt: 'Aufgeschlagenes Notizbuch mit einer Marken-Mindmap, goldenem Stift und Fotos auf einem sonnigen Schreibtisch',
      },
    ],
  },

  solution: {
    titleHtml: 'Du kümmerst dich um dein Business.<br /><em>Wir um den Rest.</em>',
    image: twinsImg,
    alt: 'Pia und Nina, die Zwillingsschwestern hinter der Online Boutique Agentur',
    first: 'Du musst nicht alles selbst können. Und schon gar nicht alles alleine machen.',
    textHtml:
      'Wir bringen Klarheit in deinen Markenauftritt, frische Ideen in dein Marketing und das gewisse Extra, das dein Unternehmen unverwechselbar macht. <b>Mit Erfahrung, einem guten Gespür für Marken und ganz viel Liebe fürs Detail.</b>',
    cta: { label: 'Erfahre mehr über uns.', href: '/' },
    link: { label: 'Wofür uns unsere Kunden:innen lieben. →', href: '/#kundenstimmen' },
  },

  /** Abweichender Text für die neue Startseite (/startseite-neu/) */
  solutionHome: {
    // Schreibmaschinen-Headline: „Du musst nicht alles alleine können. / machen.“
    headingStatic: 'Du musst nicht alles alleine können.',
    typewriter: { before: 'Du musst nicht alles', beforeLine2: 'alleine', words: ['können.', 'machen.'] },
    textHtml:
      'Hello, wir sind Pia &amp; Nina. Du musst nicht alles selbst können und schon gar nicht alles alleine machen – dafür hast du uns. Wir bringen Klarheit in deinen Markenauftritt, frische Ideen in dein Marketing und das gewisse Extra, das dein Unternehmen unverwechselbar macht. <b>Mit Erfahrung, einem guten Gespür für Marken und ganz viel Liebe fürs Detail.</b>',
  },

  final: {
    titleHtml: 'Vielleicht fehlt deiner Marke nur <em>das gewisse Extra.</em>',
    paragraphsHtml: [
      'Manchmal braucht es gar nicht viel, um aus gut richtig gut zu machen.',
      'Ein frischer Blick. Eine neue Idee. Oder zwei kreative Köpfe, die genau das Potenzial sehen, das in deinem Unternehmen steckt.',
      '<b>Und was das alles mit einem Croissant zu tun hat?<br />Mehr, als du vielleicht denkst.</b>',
    ],
    cta: 'Ein Croissant. Viele Möglichkeiten.',
    link: 'Was hinter unserem Croissant-Prinzip steckt →',
  },

  invite: {
    title: 'Lass uns gemeinsam frühstücken.',
    text: 'Du spürst, es wird Zeit für ein kleines Extra? Dann lass uns 30 Minuten Zeit für ein virtuelles Frühstück nehmen. Wir lernen uns kennen, deine Marke und alles, was sie besonders macht. Wir stellen Fragen, hören zu und schauen gemeinsam, wo noch ein bisschen mehr drinsteckt. Ganz entspannt und ohne Verpflichtungen. Wir freuen uns auf dich!',
    introHtml: '<strong>Schön, dass du dabei bist.</strong> Verrate uns kurz, wer du bist. Wir melden uns gerne mit einem Terminvorschlag.',
    submit: 'Einladung annehmen',
    sending: 'Kaffee wird aufgesetzt …',
    meta: '30 Minuten · kostenlos · virtuell',
    success: 'Wunderbar – wir freuen uns auf dich!\nWir melden uns ganz bald mit einem Terminvorschlag.\nNina & Pia',
    error: 'Ups – da ist etwas schiefgelaufen. Probier es bitte gleich noch einmal oder schreib uns direkt an hello@online-boutique-agentur.at.',
  },
} as const;
