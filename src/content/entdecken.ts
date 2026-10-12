/**
 * ENTDECKEN – alle Texte der Landingpage /entdecken (Ziel für Social-Media-Werbung).
 * Texte von Nina & Pia, unverändert übernommen.
 */

import heroImg from '../assets/images/shared/pia-nina-online-marketing-agentur-oberoesterreich.jpg';
import heroImgMobile from '../assets/images/shared/pia-nina-online-marketing-agentur-oberoesterreich-mobil.jpg';
import worldImg1 from '../assets/images/minimal/grow-weisse-bluete.jpg';
import worldImg2 from '../assets/images/minimal/flow-fliessender-stoff.jpg';
import worldImg3 from '../assets/images/minimal/feel-haende-im-licht.jpg';
import teamImg from '../assets/images/minimal/pia-nina-zwillinge-boutique-agentur-schwarzweiss.jpg';

export const entdeckenImages = {
  hero: { src: heroImg, mobile: heroImgMobile, alt: '' },
  /** Bilder zu den drei Themenwelten (Variante 2) */
  worlds: [worldImg1, worldImg2, worldImg3],
  team: { src: teamImg, alt: 'Pia und Nina, die Zwillingsschwestern hinter der Online Boutique Agentur' },
} as const;

export const entdeckenSeo = {
  title: 'Deine Marke kann mehr. | Online Boutique Agentur, Linz',
  description:
    'Wir machen Marken sichtbar, Websites besonders und Marketing persönlich. Branding, Webdesign, Social Media und Marketingberatung von Nina & Pia aus Linz.',
  path: '/entdecken/',
} as const;

export const entdecken = {
  hero: {
    title: 'Deine Marke kann mehr.',
    titleSecond: 'Zeigen wir es der Welt.',
    text: 'Du liebst, was du tust. Aber zeigt dein Außenauftritt auch, wie viel in deinem Unternehmen steckt? Wir machen Marken sichtbar, Websites besonders und Marketing persönlich.',
    cta: 'Entdecke, was möglich ist.',
  },

  problems: {
    title: 'Hand aufs Herz. <em>Kommt dir das bekannt vor?</em>',
    text: 'Manchmal spürt man einfach, dass da noch mehr geht. Vielleicht erkennst du dich ja wieder.',
    items: [
      ['Deine Website ist online.', 'Aber so richtig stolz bist du nicht darauf.'],
      ['Du möchtest auf Social Media sichtbarer werden.', 'Aber was sollst du eigentlich posten?'],
      ['Dein Unternehmen hat sich weiterentwickelt.', 'Dein Markenauftritt irgendwie nicht.'],
      ['Du machst richtig gute Arbeit.', 'Aber nach außen sieht man davon viel zu wenig.'],
      ['Du hast tausend Ideen im Kopf.', 'Aber keinen roten Faden für dein Marketing.'],
      ['Du weißt, dass du etwas verändern möchtest.', 'Aber nicht so recht, wo du anfangen sollst.'],
    ],
    closing: 'Kommt dir bekannt vor? <em>Dann wird es vielleicht Zeit für ein kleines Extra.</em>',
  },

  solution: {
    title: 'Du kümmerst dich um dein Business. <em>Wir um den Rest.</em>',
    paragraphs: [
      'Du musst nicht alles selbst können. Und schon gar nicht alles alleine machen.',
      'Wir bringen Klarheit in deinen Markenauftritt, frische Ideen in dein Marketing und das gewisse Extra, das dein Unternehmen unverwechselbar macht.',
      'Mit Erfahrung, einem guten Gespür für Marken und ganz viel Liebe fürs Detail.',
    ],
  },

  worlds: [
    {
      no: '01',
      title: 'Endlich ein Auftritt, der sich nach dir anfühlt.',
      text: 'Dein Unternehmen ist einzigartig. Dein Markenauftritt sollte es auch sein. Wir gestalten Websites und Markenwelten, die nicht nur schön aussehen, sondern deine Persönlichkeit sichtbar machen.',
      tags: ['Branding', 'Corporate Design', 'Webdesign'],
    },
    {
      no: '02',
      title: 'Sichtbar werden. Und im Kopf bleiben.',
      text: 'Du hast etwas zu erzählen. Wir helfen dir, die richtigen Worte, Bilder und Kanäle dafür zu finden. Damit aus gelegentlichen Posts ein Marketingauftritt mit Wiedererkennungswert wird.',
      tags: ['Social Media', 'Content', 'Online-Marketing'],
    },
    {
      no: '03',
      title: 'Weniger Fragezeichen. Mehr Klarheit.',
      text: 'Manchmal braucht es einfach jemanden, der von außen draufschaut, mitdenkt und neue Perspektiven eröffnet. Gemeinsam bringen wir Struktur in deine Ideen und entwickeln einen Plan, der zu dir und deinem Unternehmen passt.',
      tags: ['Marketingberatung', 'Strategie', 'Persönliche Begleitung'],
    },
  ],


  croissant: {
    title: 'Vielleicht fehlt deiner Marke nur <em>das gewisse Extra.</em>',
    paragraphs: [
      'Manchmal braucht es gar nicht viel, um aus gut richtig gut zu machen.',
      'Ein frischer Blick. Eine neue Idee. Oder zwei kreative Köpfe, die genau das Potenzial sehen, das in deinem Unternehmen steckt.',
      'Und weil gute Ideen am besten bei einem guten Frühstück entstehen, laden wir dich auf ein Croissant ein.',
    ],
    cta: 'Ein Croissant. Viele Möglichkeiten. Jetzt anfragen!',
    href: '#anfrage',
    principle: 'Was hinter unserem Croissant-Prinzip steckt',
    principleHref: '/croissant/',
  },

  /** Kontaktanfrage: Einladung zum virtuellen Frühstück (Versand wie die Croissant-Einladung, Format „virtuell“) */
  invite: {
    eyebrow: 'Die Einladung',
    title: 'Lass uns gemeinsam frühstücken. <em>Ganz unkompliziert virtuell.</em>',
    facts: ['30 Minuten.', 'Kaffee.', 'Croissant.', 'Ein gutes Gespräch über deine Marke.'],
    textHtml: 'Wir laden dich zu einem kostenlosen 30-Minuten-Frühstück ein, virtuell und von dort, wo du gerade bist. Kein Verkaufspitch. Keine Verpflichtung. Nur ein frischer Blick auf deine Marke.',
    meta: '30 Minuten · kostenlos · virtuell',
    form: {
      title: 'Schön, dass du dabei bist.',
      text: 'Verrate uns kurz, wer du bist. Wir melden uns mit einem Terminvorschlag.',
      fields: {
        name: 'Dein Name',
        company: 'Marke / Unternehmen',
        email: 'E-Mail',
        phone: 'Telefon (optional)',
        when: 'Wann passt es dir meistens? (optional)',
        whenPlaceholder: 'z. B. vormittags, Di oder Do',
        message: 'Magst du uns schon etwas erzählen? (optional)',
      },
      submit: 'Einladung annehmen',
      sending: 'Kaffee wird aufgesetzt …',
      success: 'Wunderbar, wir freuen uns auf dich!\nWir melden uns ganz bald mit einem Terminvorschlag.\nNina & Pia',
      error: 'Ups, da ist etwas schiefgelaufen. Probier es bitte gleich noch einmal oder schreib uns direkt an hello@online-boutique-agentur.at.',
    },
  },
} as const;
