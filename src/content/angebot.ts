/**
 * ANGEBOT – persönliche Angebotsseiten unter /angebot/<kunde>/
 * --------------------------------------------------------------
 * Grundlage: „The Onepage Concept“ (ehemals Canva-PDF), überarbeitet ohne Wix.
 *
 * Neues Angebot anlegen: unten in `angebote` einen Eintrag kopieren und anpassen.
 * Der `slug` wird zur Adresse – am besten Kundenname + ein kurzes Kürzel,
 * damit niemand fremde Angebote erraten kann (z. B. 'cafe-mayer-7k2f').
 * Die Seiten sind nicht in der Sitemap und für Suchmaschinen gesperrt.
 *
 * Preise stehen zentral in `preise` und gelten für alle Angebote,
 * außer ein Angebot gibt einen eigenen Wert an.
 */

import heroImg from '../assets/images/entdecken/leistung-webdesign-laptop-schreibtisch.jpg';
import teamImg from '../assets/images/minimal/pia-nina-zwillinge-boutique-agentur-schwarzweiss.jpg';

export const angebotImages = {
  hero: { src: heroImg, alt: 'Laptop auf einem Travertin-Block im Sonnenlicht, darauf eine elegante Website' },
  team: { src: teamImg, alt: 'Pia und Nina, die Zwillingsschwestern hinter der Online Boutique Agentur' },
} as const;

// ---------- Preise (in Euro) ----------
export const preise = {
  onepager: 1480,
  /** je zusätzlicher Inhaltsseite */
  zusatzSeite: 290,
  /** Hosting & Betreuung pro Monat */
  betreuungMonat: 29,
} as const;

/** 1480 → „€ 1.480,–“ (Tausenderpunkt wie im bisherigen Angebot) */
export const euro = (n: number) => `€ ${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')},–`;

// ---------- Ein Angebot pro Kunde ----------
export interface Angebot {
  slug: string;
  /** Wie wir die Person ansprechen: „Hallo Lisa“ */
  anrede: string;
  /** Firmen- oder Markenname (wird ins Formular übernommen) */
  firma: string;
  /** Persönliche Zeilen nach der Begrüßung (HTML erlaubt). Leer = Standardtext. */
  grussHtml?: string;
  /** Anzahl zusätzlicher Inhaltsseiten (0 = reiner Onepager) */
  zusatzSeiten: number;
  /** Optional: Beispiele, wofür die Zusatzseiten gedacht sind */
  zusatzSeitenNotiz?: string;
  /** Toppings, die wir besonders empfehlen (Nummern aus `toppings`, z. B. ['01', '05']) */
  empfohlen?: string[];
  /** Datum im Format JJJJ-MM-TT */
  erstellt: string;
  gueltigBis: string;
  /** Optional: abweichende Preise nur für dieses Angebot */
  preise?: Partial<typeof preise>;
}

export const angebote: Angebot[] = [
  {
    // Musterangebot zum Ansehen und Kopieren
    slug: 'beispiel',
    anrede: 'Lisa',
    firma: 'Studio Beispiel',
    grussHtml:
      'schön, dass wir uns kennenlernen durften! Wie versprochen haben wir dir hier alles zusammengestellt, was dein neuer Webauftritt braucht. <b>Nimm dir einen Kaffee, scroll in Ruhe durch</b> und melde dich, wenn du Fragen hast.',
    zusatzSeiten: 1,
    zusatzSeitenNotiz: 'z. B. eine eigene Seite für deine Leistungen',
    empfohlen: ['01', '03'],
    erstellt: '2026-10-13',
    gueltigBis: '2026-12-31',
  },
];

// ---------- Texte (für alle Angebote gleich) ----------
export const angebot = {
  eyebrow: 'The Onepage Concept',
  gruss: 'schön, dass du da bist! Hier findest du alles, was dein neuer Webauftritt braucht. Scroll in Ruhe durch und melde dich, wenn du Fragen hast.',
  hero: {
    title: 'Dein stylisches Web-Statement,',
    titleSecond: 'das deine Essenz sichtbar macht.',
  },

  why: {
    title: 'Weil weniger <em>oft mehr ist.</em>',
    paragraphs: [
      'Kein Website-Wahnsinn. Kein Textfriedhof. Einfach ein smarter Auftritt, der wirkt. Ein Onepager bringt genau das: <b>Klarheit, Persönlichkeit und alles Wichtige auf einen Blick.</b> Kein Blabla, kein Zuviel – sondern genau das, was deine Kund:innen wirklich interessiert: Wer du bist, was du drauf hast und warum genau du die richtige Wahl für sie bist.',
      'Und wir? Wir sind an deiner Seite. Mit einem offenen Ohr, viel Feingefühl und dem Blick fürs Wesentliche. Wir holen das Beste aus deiner Message raus, bringen Struktur rein und sorgen dafür, dass dein Auftritt nicht nur gut aussieht, sondern sich richtig gut anfühlt.',
    ],
    quote: 'Make your first impression your best one.',
    facts: [
      ['Was ist ein Onepager?', 'Die smarte Lösung für alle, die keinen Roman schreiben, sondern überzeugen wollen. Alles Wichtige auf einer Seite, mit einer Menüführung, die smooth zu allen Bereichen scrollt.'],
      ['Warum ein Onepager?', 'Schnell, klar und auf den ersten Blick überzeugend. Kompakt, modern und userfreundlich – am Handy genauso wie am Desktop.'],
    ],
  },

  ablauf: {
    title: 'So entsteht <em>deine Website.</em>',
    text: 'Acht Schritte vom ersten Gespräch bis zum großen Auftritt. Wir begleiten dich bei jedem davon.',
    steps: [
      ['Kick-off Call', 'Kennenlernen. Ziele besprechen. Bedürfnisse verstehen. Die Basis für deinen Webauftritt.'],
      ['Konzeption & Design', 'Gemeinsam legen wir die passenden Sektionen fest und entwickeln ein stylisches Design, das perfekt zu deiner Marke passt.'],
      ['Content & Text', 'Bilder und Texte kommen nach Absprache und einer gemeinsam definierten Checkliste von dir. Wir integrieren sie ansprechend und passend ins Design.'],
      ['Technische Umsetzung', 'Deine Website wird individuell für dich entwickelt – kein Baukasten, keine Vorlage von der Stange. Blitzschnell, sicher verschlüsselt und optimiert für Handy und Desktop.'],
      ['Aufbau', 'Dein Onepager ist smart aufgebaut – mit einer Menüführung, die smooth zu allen wichtigen Bereichen scrollt. Klar, modern und userfreundlich.'],
      ['SEO-Basics', 'Grundlegende Suchmaschinenoptimierung für bessere Auffindbarkeit: aussagekräftige Seitentitel, Meta-Beschreibungen, Verlinkungen und Headlines.'],
      ['DSGVO-ready', 'Datenschutz inklusive: Cookie-Hinweis, Impressum und Datenschutzerklärung sind selbstverständlich integriert.'],
      ['Go Live & Übergabe Call', 'Der letzte Feinschliff. Gemeinsam checken wir alles durch, klären offene Fragen und machen deine Seite bereit für den großen Auftritt.'],
    ],
  },

  struktur: {
    title: 'So ist dein <em>Onepager aufgebaut.</em>',
    quote: 'One page. All eyes on you.',
    parts: [
      ['Welcome', 'Einladende Headline, Bild oder Video, kurze Einführung'],
      ['About me', 'Vorstellung der Person oder Marke mit Text & Bild'],
      ['Gallery', 'Bildergalerie für Projekte, Produkte oder Moodshots'],
      ['Content', 'Zwei individuelle Inhalts-Sektionen mit Bild und Text'],
      ['Contact', 'Kontaktformular, E-Mail-Verlinkung, auf Wunsch Standort'],
      ['Footer', 'Impressum, Datenschutz, Links und Social Icons'],
    ],
    grow: {
      title: 'Ready to grow!',
      text: 'Dein Onepager wächst mit dir. Jede zusätzliche Inhaltsseite – zum Beispiel für Leistungen, Projekte oder dein Team – gestalten wir im selben Stil.',
    },
  },

  technik: {
    title: 'Behind the scenes. <em>Modern, schnell & sorglos.</em>',
    paragraphs: [
      'Wir bauen deine Website mit modernster Web-Technologie, ohne schwerfälligen Baukasten im Hintergrund. Das heißt für dich: <b>Deine Seite lädt in Sekundenbruchteilen, ist sicher und wird von Google geliebt.</b>',
      'Um Technik, Hosting und Sicherheit musst du dich nicht kümmern – das übernehmen wir. Und wenn sich etwas ändert, schickst du uns einfach eine Nachricht.',
    ],
    domain: {
      title: 'Und deine Domain?',
      text: 'Du hast schon eine? Perfekt, wir verbinden sie mit deiner neuen Website. Noch keine? Dann registrieren wir sie gerne für dich.',
    },
  },

  preis: {
    title: 'Dein Onepager. <em>Mit Style, zum Fixpreis.</em>',
    onepager: 'Onepager inkl. aller angeführten Leistungen',
    zusatz: (n: number) => (n === 1 ? '1 zusätzliche Inhaltsseite' : `${n} zusätzliche Inhaltsseiten`),
    gesamt: 'Dein Fixpreis',
    steuer: 'Keine Umsatzsteuer laut Kleinunternehmerregelung (§ 6 Abs. 1 Z 27 UStG).',
    timing: {
      title: 'Timing.',
      text: 'Dein Onepager ist ca. 2–3 Wochen nach dem Kick-off und der Übermittlung aller Unterlagen bereit für den großen Auftritt.',
    },
    laufend: {
      title: 'Laufende Kosten.',
      betreuung: 'Hosting & Betreuung',
      betreuungText: 'Wir kümmern uns um Hosting, SSL-Verschlüsselung, Sicherheit und technische Updates. Du lehnst dich zurück, deine Website läuft.',
      domain: 'Domain',
      domainText: 'Die laufenden Kosten deiner Domain sind nicht Teil des Angebots und werden separat verrechnet.',
    },
    grow: (preis: string) => `Jede weitere Inhaltsseite: ${preis}`,
  },

  toppings: {
    title: 'Our <em>Toppings.</em>',
    text: 'Diese Extras kannst du ganz einfach dazubuchen – je nach Bedarf.',
    empfohlen: 'Unser Tipp für dich',
    items: [
      { nr: '01', title: 'Wort & Bild', text: 'Professionelle Texte und Bilder, die deine Botschaft emotional und klar transportieren.', preis: 'Auf Stundenbasis à € 85,–' },
      { nr: '02', title: 'Schnittstellen', text: 'Anbindung und Integration von Tools wie Newsletter-Systemen, Buchungsplattformen oder Social Media Feeds.', preis: 'Ab € 170,–' },
      { nr: '03', title: 'Pflege-Paket', text: 'Du möchtest Texte oder Bilder ändern? Schick uns einfach eine Nachricht, wir setzen es um. Zwei Stunden pro Quartal, ohne Stundenzettel.', preis: 'Pauschal € 170,– pro Quartal' },
      { nr: '04', title: 'Online Marketing', text: 'Suchmaschinenwerbung mit strategischen Kampagnen auf Google & Co., um deine Sichtbarkeit gezielt zu pushen.', preis: 'Setup ab € 425,–' },
      { nr: '05', title: 'Content & Updates', text: 'Laufende Anpassungen und Erweiterungen – flexibel und nach Aufwand.', preis: 'Auf Stundenbasis à € 85,–' },
      { nr: '06', title: 'Analytics & Reporting', text: 'Einrichtung von Google Analytics und regelmäßige Auswertung, damit du deine Website-Besucher:innen genau verstehst.', preis: 'Setup ab € 170,–' },
    ],
  },

  team: {
    eyebrow: 'Good to know about us',
    title: 'Wir sind Pia & Nina. <em>Zwei Köpfe. Ein Herz. Eine Online-DNA.</em>',
    paragraphs: [
      'Wir sind Onlinemarketerinnen aus Leidenschaft und ergänzen uns perfekt in dem, was wir lieben: Design, Strategie und Storytelling. Wir kreieren Konzepte mit Seele. Websites, die nicht nur gut aussehen, sondern sich auch gut anfühlen.',
      'Dabei bringen wir jede Menge Know-how aus E-Commerce, Webdesign, Content & Performance Marketing und Social Media mit – dazu jahrelange Agenturerfahrung. Als Gründerinnen unseres eigenen Herzensprojekts wissen wir genau, was Selbstständige und Gründer:innen brauchen: <b>Klarheit, Persönlichkeit und einen stimmigen Auftritt – vom ersten Klick bis zum letzten Scroll.</b>',
    ],
    quote: 'Wir ticken gleich – und denken unterschiedlich. Und genau das macht uns als Team so stark: wie Lois & Clark, Gin & Tonic und Copy & Paste.',
  },

  final: {
    quote: 'Can’t wait to bring your brand into the spotlight together.',
    title: 'Bereit für deinen <em>großen Auftritt?</em>',
    text: 'Sag einfach Ja – wir melden uns mit einem Termin für den Kick-off Call. Noch Fragen? Ruf uns an oder schreib uns, ganz unkompliziert.',
    form: {
      title: 'Angebot annehmen',
      fields: { name: 'Dein Name', company: 'Firma / Marke', email: 'E-Mail', phone: 'Telefon (optional)', message: 'Noch etwas, das wir wissen sollten? (optional)' },
      submit: 'Ja, wir legen los!',
      sending: 'Wird gesendet …',
      success: 'Wie schön – wir freuen uns riesig!\nWir melden uns ganz bald mit einem Termin für den Kick-off.\nPia & Nina',
      error: 'Da ist leider etwas schiefgelaufen. Bitte versuch es nochmal oder schreib uns direkt.',
    },
    alternative: 'Lieber persönlich?',
    signature: 'Pia & Nina',
    gueltig: (datum: string) => `Angebot gültig bis ${datum}`,
    pdf: 'Als PDF speichern',
  },
} as const;
