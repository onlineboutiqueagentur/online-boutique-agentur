/**
 * ZENTRALE CONTENT-BASIS
 * ----------------------
 * Alle Inhalte der Website werden ausschließlich hier gepflegt.
 * Beide Designwelten (minimal + louder) rendern exakt diese Inhalte.
 *
 * Texte mit HTML (<b>, <em>, <br>) werden 1:1 ausgegeben – nur eigene,
 * vertrauenswürdige Inhalte eintragen.
 *
 * Wo sich die Designwelten im Wortlaut unterscheiden (z. B. "Loved by our
 * clients." vs. "client love"), gibt es ein Objekt { minimal, louder }.
 * Ein einfacher String gilt für beide Designs.
 *
 * Texte wurden unverändert von der bisherigen Website übernommen.
 * Verbesserungsvorschläge stehen separat in docs/CONTENT-NOTIZEN.md.
 */

import type { ImageMetadata } from 'astro';

// ---------- Bilder ----------
import heroImg from '../assets/images/shared/pia-nina-gruenderinnen-online-boutique-agentur-linz.jpg';
import introMinimal from '../assets/images/minimal/pia-nina-zwillinge-boutique-agentur-schwarzweiss.jpg';
import introLouder from '../assets/images/louder/pia-nina-zwillinge-boutique-agentur-animiert.gif';
import feelMinimal from '../assets/images/minimal/feel-haende-im-licht.jpg';
import flowMinimal from '../assets/images/minimal/flow-fliessender-stoff.jpg';
import growMinimal from '../assets/images/minimal/grow-weisse-bluete.jpg';
import glowMinimal from '../assets/images/minimal/glow-lachende-frau.jpg';
import feelLouder from '../assets/images/louder/feel-haende-im-licht.jpg';
import flowLouder from '../assets/images/louder/flow-fliessender-stoff.jpg';
import growLouder from '../assets/images/louder/grow-weisse-bluete.jpg';
import glowLouder from '../assets/images/louder/glow-lachende-frau.jpg';
import iconWebsites from '../assets/images/icons/websites.png';
import iconEcommerce from '../assets/images/icons/ecommerce.png';
import iconContent from '../assets/images/icons/content-management.png';
import iconSeaSeo from '../assets/images/icons/sea-seo.png';
import iconAnalyse from '../assets/images/icons/webanalyse.png';
import iconSocial from '../assets/images/icons/social-media.png';
import iconNewsletter from '../assets/images/icons/newsletter-marketing.png';
import iconBrand from '../assets/images/icons/brand-design-ci.png';
import iconKi from '../assets/images/icons/ki-kompetenz.png';
import logoFh from '../assets/images/logos/logo-fh-oberoesterreich.png';
import logoAgenturen from '../assets/images/logos/logos-reichlundpartner-smec.png';
import logoUnternehmen from '../assets/images/logos/logos-ooenachrichten-ewe.png';
import logoEternalFlame from '../assets/images/logos/logo-eternal-flame.png';
import logoBfi from '../assets/images/logos/logo-bfi-oberoesterreich.png';
import tNinaKraft from '../assets/images/shared/kundenstimme-nina-kraft-moderatorin.jpg';
import tManuelaKalupar from '../assets/images/shared/kundenstimme-manuela-kalupar-unternehmerin.jpg';
import tSandraSchier from '../assets/images/shared/kundenstimme-sandra-schier-evented.jpg';
import insightsImg from '../assets/images/shared/pia-nina-online-marketing-agentur-oberoesterreich.jpg';
import insightsImgMobile from '../assets/images/shared/pia-nina-online-marketing-agentur-oberoesterreich-mobil.jpg';

export type Design = 'minimal' | 'louder';
export const DESIGNS: readonly Design[] = ['minimal', 'louder'] as const;
export const DEFAULT_DESIGN: Design = 'minimal';

/** Text, der je Designwelt unterschiedlich lauten darf. */
export type Variant = string | { minimal: string; louder: string };

/** Bild, das je Designwelt unterschiedlich sein darf (Inhalt/ALT bleibt gleich). */
export interface ThemedImage {
  alt: string;
  minimal: ImageMetadata;
  louder: ImageMetadata;
}

// ---------- Agentur / Kontakt (auch Basis für strukturierte Daten) ----------
export const agency = {
  name: 'Online Boutique Agentur',
  url: 'https://www.online-boutique-agentur.at',
  email: 'hello@online-boutique-agentur.at',
  phone: '+43 677 625 772 42',
  phoneE164: '+4367762577242',
  whatsapp: 'https://wa.me/4367762577242',
  owner: 'Nina Altmanninger',
  founders: [
    // Nachname von Pia ist auf der bisherigen Website nicht angegeben → bewusst weggelassen.
    { givenName: 'Pia', familyName: '' },
    { givenName: 'Nina', familyName: 'Altmanninger' },
  ],
  address: {
    street: 'Pasching Point 3',
    zip: '4061',
    city: 'Pasching',
    region: 'Oberösterreich',
    country: 'AT',
    countryName: 'Österreich',
  },
  areaServed: ['Linz', 'Oberösterreich', 'Österreich'],
  photography: 'Manuela Kalupar',
} as const;

// ---------- SEO ----------
export const seo = {
  title: 'Online Werbeagentur Linz | Websites, Content, SEO, Google Ads & Online Marketing Oberösterreich',
  description:
    'Online Marketing aus Linz: Websites, Webshop, Content, SEO, Google Ads. Strategische Beratung und Umsetzung für Unternehmen in Oberösterreich.',
  locale: 'de_AT',
  ogImageAlt: 'Pia und Nina, Gründerinnen der Online Boutique Agentur',
} as const;

// ---------- Navigation ----------
export const navigation = [
  { label: 'Online Boutique Agentur', href: '#boutiqueagentur' },
  { label: 'Leistungen', href: '#leistungen' },
  { label: 'Erfahrungen', href: '#erfahrungen' },
  { label: 'Kundenstimmen', href: '#kundenstimmen' },
  { label: 'Kontakt', href: '#kontakt' },
] as const;

// ---------- Hero ----------
export const hero = {
  // "²" = Zwillinge – wird visuell hochgestellt, für Screenreader ausgeblendet.
  // Louder: jedes Wort in eigener Zeile (per CSS über .w)
  titleHtml: '<span class="w">Online</span> <em class="w">Boutique</em> <span class="w">Agentur</span>',
  subtitleHtml: 'Online Marketing für Einzel-, Klein– oder<br class="only-louder"> mittelständische Unternehmen',
  // Hochformat für Smartphones (wie im Original)
  imageMobile: insightsImgMobile,
  image: { src: heroImg, alt: 'Pia und Nina, die Zwillingsschwestern hinter der Online Boutique Agentur, in hellen Anzügen vor einem Leinenvorhang' },
} as const;

// ---------- Intro: "Wir lieben Boutique Agentur." ----------
export const intro = {
  // Schreibmaschinen-Animation: das erste Wort ist der statische Text für Screenreader/SEO.
  headingStatic: 'Wir lieben Boutique Agentur.',
  typewriter: { before: 'Wir', words: ['leben', 'lieben'], after: 'Boutique Agentur.' },
  textHtml:
    'Hello, wir sind Pia &amp; Nina. Wir begleiten dich im Online Marketing von der ersten Idee und Strategie bis zur erfolgreichen Umsetzung. Als Zwillinge bringen wir <b>doppelte Expertise</b>, <b>doppelte Kreativität &amp; noch vielmehr Herz</b> in dein Online-Projekt. Als kleine <b>Boutique-Agentur</b> lieben wir’s persönlich – kreativ – exklusiv. Individuell statt Standard. Direkt statt Umwege. Gespräche statt Tickets. <b>Modern. Smart. Stylish. Boutique eben.</b>',
  cta: { label: 'Lass uns reden', href: '#kontakt' },
  image: {
    alt: 'Pia und Nina, Zwillinge und Gründerinnen der Online Boutique Agentur, in Schwarzweiß',
    minimal: introMinimal,
    louder: introLouder,
  } satisfies ThemedImage,
} as const;

// ---------- Harmonie / Kopf & Herz ----------
export const harmony = {
  titleHtml: '<em>Harmonie</em> als Basis für <em>gemeinsamen</em> <b>Erfolg</b><span class="only-minimal">.</span>',
  textHtml:
    'Im Online-Business sind Zahlen, Fakten und Analysen unverzichtbar – sie sind das Fundament, auf dem alles wächst. Aber bevor wirklich Gutes entstehen kann, zählt für uns das richtige Feeling: <b>Sympathie</b>, <b>Harmonie</b> und ein <b>stimmiges Gesamtbild</b>. Erst wenn wir hier harmonieren, sich für beide Seiten alles stimmig anfühlt, werden wir diesen wunderbare Flow gemeinsam erleben, in dem <b>Erfolg entsteht</b>.',
} as const;

export const flowImages: ThemedImage[] = [
  { alt: 'feel – zwei Hände, die sich im Licht berühren', minimal: feelMinimal, louder: feelLouder },
  { alt: 'flow – ein fließendes, transparentes Tuch im Wind', minimal: flowMinimal, louder: flowLouder },
  { alt: 'grow – eine weiße Blüte in Bewegung', minimal: growMinimal, louder: growLouder },
  { alt: 'glow – eine lachende Frau mit hellem, offenem Haar', minimal: glowMinimal, louder: glowLouder },
];

export const headHeart = {
  titleHtml: 'Wenn <em>Kopf</em> und <em>Herz</em><br class="only-louder"> im Einklang sind.',
  textHtml:
    'Du führst ein <b>Einzel</b>-, <b>Klein</b>– oder <b>mittelständisches Unternehmen</b> und willst sichtbar werden &amp; auf deine ganz persönliche Weise wachsen? Dann bist du genau richtig bei uns! Wenn du spürst, dass es sich richtig anfühlt, vertraue dem Flow und lass uns dein Business boosten. Feel – flow – grow – glow: weil Erfolg dann entsteht, wenn Kopf und Herz im Einklang sind.',
} as const;

// ---------- Leistungen ----------
export const services = {
  titleHtml: 'Unsere<br class="only-louder"> <em>Leistungen<span class="only-minimal">.</span></em>',
  textHtml:
    'Bei uns bekommst du keine große Agentur-Maschinerie. Kein Großkonzern, keine Umwege. Just the two of us. Wir sind <b>persönlich für dich da</b>, <b>treffen schnelle Entscheidungen</b> und <b>entwickeln kreative Konzepte</b> die genau zu dir passen. Wir sehen dich und hören genau zu – denn Marketing darf sich leicht anfühlen und Freude bringen.',
  // Neue Leistung hinzufügen: Eintrag ergänzen + Icon (PNG/SVG, ca. 300×200) in src/assets/images/icons/ ablegen.
  items: [
    { name: 'Websites', icon: iconWebsites },
    { name: 'Ecommerce', icon: iconEcommerce },
    { name: 'Content Management', icon: iconContent },
    { name: 'SEA/SEO', icon: iconSeaSeo },
    { name: 'Webanalyse', icon: iconAnalyse },
    { name: 'Social Media', icon: iconSocial },
    { name: 'Newsletter Marketing', icon: iconNewsletter },
    { name: 'Brand Design & CI', icon: iconBrand },
    { name: 'KI-Kompetenz', icon: iconKi },
  ],
} as const;

// ---------- Erfahrung ----------
export const experience = {
  headingStatic: 'Unsere Erfahrung.',
  // Schreibmaschine: "Unsere" bzw. "Unser" (bei Know-how) + Wort
  typewriter: [
    { prefix: 'Unsere', word: 'Erfahrung.' },
    { prefix: 'Unsere', word: 'Expertise.' },
    { prefix: 'Unser', word: 'Know-how.' },
  ],
  lead: 'Unsere Erfahrungen, Learnings und Know-how der letzten Jahre – gebündeltes Wissen für dich.',
  items: [
    { title: 'Digital Business Managment', textHtml: 'Studium FH Steyr &amp; JKU Linz Berufsbegleitend', logo: logoFh, logoAlt: 'Logo FH Oberösterreich' },
    { title: '+ 10 Jahre Agenturerfahrung', textHtml: 'bei namhaften Digital-Agenturen des Landes', logo: logoAgenturen, logoAlt: 'Logos Reichlundpartner Digital und smec' },
    { title: '+ 10 Jahre Online Marketing', textHtml: 'in renomierten mittelständischen Unternehmen', logo: logoUnternehmen, logoAlt: 'Logos OÖNachrichten und ewe' },
    {
      title: 'Gründung &amp; Geschäftsführung',
      textHtml: 'Erfolgreicher Webshop <a href="https://www.eternalflame.at" target="_blank" rel="noopener">www.eternalflame.at</a>',
      logo: logoEternalFlame,
      logoAlt: 'Logo Eternal Flame Wedding Candles',
    },
    { title: 'Expertise als Weiterbildung', textHtml: 'Markting Vorträge für Erwachsenenbildung', logo: logoBfi, logoAlt: 'Logo Berufsförderungsinstitut OÖ (bfi)' },
  ],
  cta: { label: 'Jetzt anfragen', href: '#kontakt' },
} as const;

// ---------- Design-Typ (Switch-Sektion) ----------
export const designType = {
  title: 'Welcher Design-Typ bist du?',
  claim: 'Twins-Look: Gleiche DNA. Zwei Perspektiven.',
  paragraphs: [
    'Unser Webdesign lebt ganz Twins-like: Gleiche Basis – zwei Designwelten. Aus derselben Idee geboren, doch auf eine individuelle Art umgesetzt.',
    'Ruhig, klar, minimalistisch – oder etwas lauter, bunter und voller Bewegung. Du entscheidest, in welcher Welt du dich wohler fühlst.',
  ],
  // Vorschau der jeweils ANDEREN Welt (minimal zeigt louder und umgekehrt) – als verkleinerter,
  // live gerenderter Hero mit dem Original-Foto: gestochen scharf und immer aktuell.
  preview: {
    minimal: { shows: 'louder', alt: 'Vorschau der Website im lauten, farbigen Louder-Design' },
    louder: { shows: 'minimal', alt: 'Vorschau der Website im ruhigen, minimalistischen Design' },
  },
  previewCta: 'switch to design',
} as const;

/** Wording des Design-Switches – abgeleitet aus der bestehenden Website-Sprache. */
export const designSwitch = {
  badge: 'switch to twin design',
  groupLabel: 'Design-Typ',
  names: { minimal: 'minimal', louder: 'louder' },
  // Accessible Names (deutsch, eindeutig)
  a11y: {
    toMinimal: 'Zum ruhigen, minimalistischen Design wechseln',
    toLouder: 'Zum lauten, farbigen Louder-Design wechseln',
  },
  announce: { minimal: 'Minimal-Design aktiv', louder: 'Louder-Design aktiv' },
} as const;

// ---------- Kundenstimmen ----------
export const testimonials = {
  titleHtml: { minimal: 'Loved by our <em>clients</em>.', louder: 'client love' },
  items: [
    {
      name: 'Nina Kraft',
      role: 'Moderatorin, Journalistin & Coachin',
      quote:
        'Ich schätze ihren Stil. Was ihr gefällt, gefällt auch mir. Sie hat ein ganz besonderes Auge für Ästhetik, Farben und Formen. Was sie verspricht, hält sie ein. Egal ob Deadlines oder Budgets. Ihre Arbeit wirkt immer modern und zeitgemäß. Ihr Vorname. Ein Garant für Qualität.',
      quoteStyle: 'curly',
      links: ['https://www.kraftmediaminds.com/', 'https://www.ninakraft.com/'],
      note: '',
      image: tNinaKraft,
    },
    {
      name: 'Manuela Kalupar',
      role: 'Unternehmerin, Coachin',
      quote:
        'Das Wichtigste bei einer Zusammenarbeit ist für mich Sympathie – und ein Mensch, der meinen Stil wirklich spürt.\nJemand, der mitdenkt, wo ich es nicht kann.\nDer versteht, wie emotional, stärkend und sensibel der Raum einer Onlinesichtbarkeit für eine Einzelunternehmerin ist.\nGenau das habe ich gefunden:\nHerz und Kopf.\nFreude und Professionalität.\nDas Gefühl, jemanden an meiner Seite zu haben, der seinen Job mit purer Freude macht –\nist das Größte Geschenk für mein Business.',
      quoteStyle: 'curly',
      links: ['https://www.aurea-circle.com/', 'https://www.aurea-stock.com/'],
      note: '',
      image: tManuelaKalupar,
    },
    {
      name: 'Sandra Schier',
      // Tippfehler "Geschätftsführerin" der Minimal-Version korrigiert (Louder-Version war bereits korrekt).
      role: 'Geschäftsführerin evented GmbH',
      quote:
        'Die Zusammenarbeit mit Nina war richtig klasse. Gemeinsam haben wir die Website SEO-optimiert aufgebaut. Sie hat ein super Gespür für Design, Stil und das gewisse Etwas. Das Ergebnis wirkt modern, klar und auf den Punkt – absolute Empfehlung!',
      quoteStyle: 'german',
      links: [],
      note: 'Eventmanagement',
      image: tSandraSchier,
    },
  ],
} as const;

// ---------- Insights / Zahlen ----------
export const insights = {
  titleHtml: 'Some insights.',
  image: { src: insightsImg, srcMobile: insightsImgMobile },
  items: [
    { value: 2, prefix: '', suffix: '', label: 'kreative Köpfe mit doppelter Expertise' },
    { value: 10, prefix: '+', suffix: '²', label: 'Jahre Erfahrung im Online Marketing' },
    { value: 999, prefix: '+', suffix: '', label: 'Stunden kreative Umsetzung' },
    { value: 100, prefix: '', suffix: '%', label: 'Persönliche Betreuung' },
  ],
} as const;

// ---------- Kontakt ----------
export const contact = {
  titleHtml: 'Erzähl uns von dir.',
  text: 'Wenn du dich hier wohl fühlst und du unser Match spüren kannst, dann schreib uns gerne. Erzähl uns von dir, deinen Ideen oder dem, was dich gerade bewegt. Wir freuen uns darauf, dich kennenzulernen und gemeinsam etwas Schönes entstehen zu lassen.',
  video: {
    src: '/media/online-boutique-agentur-websites-content-social-media.mp4',
    label: 'Kurzes Video: Einblicke in die Arbeit der Online Boutique Agentur',
  },
  form: {
    fields: {
      name: 'Name',
      company: 'Firma',
      email: 'E-Mail',
      phone: 'Tel.',
      message: 'Notizen',
    },
    submit: 'Abschicken',
    sending: 'Wird gesendet …',
    success: 'Hey, vielen Dank! Deine Nachricht wurde an uns abgeschickt. Wir melden uns ganz bald bei dir!\nLiebe Grüße Nina & Pia',
    error: 'Ups - da ist wohl ein technischer Fehler passiert. Bitte probier es in ein paar Minuten noch einmal.',
    privacyHtml: 'Mit dem Absenden werden deine Angaben zur Bearbeitung deiner Anfrage verwendet. Mehr dazu in der <a href="/datenschutz/">Datenschutzerklärung</a>.',
  },
} as const;

export const footer = {
  whatsappLabel: 'WhatsApp Live Chat',
  copyright: `© ${new Date().getFullYear()} Online Boutique Agentur`,
} as const;

/**
 * Optionales Tracking. Leer = kein Tracking, kein Cookie-Banner.
 * Erst wenn hier eine ID eingetragen wird, erscheint das Consent-Banner
 * und das Script wird ausschließlich nach Einwilligung geladen.
 */
export const tracking = {
  ga4MeasurementId: '', // z. B. 'G-XXXXXXXXXX'
} as const;
