/**
 * MARKEN-CHECK – alle Texte der Seite /marken-check („Du darfst in deine Marke verliebt sein.“)
 *
 * Ablauf: Einstieg → „Bevor wir starten“: Wunschgefühl wählen (1–2) → 10 Fragen mit Croissant-Skala (1–5) → Ergebnis.
 * {gefuehl} in einer Frage wird durch das gewählte Wunschgefühl ersetzt (z. B. „Leichtigkeit und Wärme“).
 *
 * Fragen ändern: einfach Text anpassen. Neue Fragen brauchen einen Bereich (spueren, echt, leben, ankommen).
 * Die Kennung (id) bitte nicht ändern, sobald der Check live ist – sonst passt die Statistik im Admin nicht mehr.
 */

export type BereichId = 'spueren' | 'echt' | 'leben' | 'ankommen';

export interface Frage {
  id: string;
  bereich: BereichId;
  text: string;
  /** Beschriftung links (1 Croissant) und rechts (5 Croissants) */
  von: string;
  bis: string;
}

export const markencheckSeo = {
  title: 'Du darfst in deine Marke verliebt sein – dein Marken-Check | Online Boutique Agentur',
  description:
    'Der 2-Minuten-Check für Einzelunternehmer:innen: Wie sehr spürst und lebst du deine Marke? Ehrlich, anonym und mit einem persönlichen Ergebnis.',
  path: '/marken-check/',
};

export const markencheck = {
  intro: {
    eyebrow: 'Dein Marken-Check',
    /** Titel als Frage: titel + betontes Wort (kursiv) + titelEnde */
    titel: 'Bist du',
    titelBetont: 'verliebt',
    titelEnde: 'in deine Marke?',
    /** Der Slogan als kleine Antwort unter dem Titel */
    slogan: 'Du darfst es nämlich sein.',
    text: 'Eine Marke ist nicht nur Logo und Farben. Man muss sie fühlen können, und du selbst solltest zu 100 % dahinterstehen. Denn was du selbst nicht spürst, kommt auch bei deinen Kund:innen nicht an. In zwei Minuten findest du heraus, wie sehr du deine Marke gerade lebst.',
    /** Drei kleine Kacheln mit Icon (icon: uhr, anonym, sofort) */
    punkte: [
      { icon: 'uhr', titel: '2 Minuten', text: '10 kurze Fragen' },
      { icon: 'anonym', titel: 'Anonym', text: 'ohne Anmeldung' },
      { icon: 'sofort', titel: 'Sofort', text: 'Ergebnis direkt' },
    ],
    start: 'Check starten',
    startUnter: 'Sofort-Ergebnis · ohne Anmeldung',
  },

  gefuehl: {
    /** Kleine Zeile über der Einstiegsfrage (statt „Frage x von y“) */
    vorab: 'Bevor wir starten · eine wichtige Frage',
    titel: 'Welches Gefühl sollen Menschen haben, wenn sie deiner Marke begegnen?',
    hinweis: 'Wähle ein oder zwei Gefühle.',
    optionen: ['Geborgenheit', 'Leichtigkeit', 'Mut', 'Eleganz', 'Vertrauen', 'Lebensfreude', 'Klarheit', 'Wärme', 'Ruhe', 'Begeisterung'],
    weiter: 'Weiter',
  },

  bereiche: {
    spueren: { name: 'Spüren', frage: 'Wie fühlst du dich mit deinem Auftritt?' },
    echt: { name: 'Echt sein', frage: 'Bist das wirklich du?' },
    leben: { name: 'Leben', frage: 'Zeigst du deine Marke mit voller Überzeugung?' },
    ankommen: { name: 'Ankommen', frage: 'Spüren es deine Kund:innen?' },
  } satisfies Record<BereichId, { name: string; frage: string }>,

  fragen: [
    {
      id: 'website-gefuehl',
      bereich: 'spueren',
      text: 'Wenn du deine eigene Website öffnest: Spürst du dort {gefuehl}?',
      von: 'Puh, eher nicht',
      bis: 'Oh ja, mit jeder Körperzelle',
    },
    {
      id: 'herzeigen',
      bereich: 'spueren',
      text: 'Jemand fragt nach deiner Website oder deinem Instagram. Wie gern zeigst du sie her?',
      von: 'Lieber nicht …',
      bis: 'Sofort und mit Stolz',
    },
    {
      id: 'worte',
      bereich: 'echt',
      text: 'Lies deine Website-Texte einmal laut: Klingen sie nach dir, und bringen sie klar und verständlich auf den Punkt, was du anbietest?',
      von: 'Eher kompliziert und fremd',
      bis: 'Klar, auf den Punkt und ganz ich',
    },
    {
      id: 'look',
      bereich: 'echt',
      text: 'Passen Farben, Schriften und Bilder zu deiner Persönlichkeit und nicht nur zu einem Trend?',
      von: 'Passt nicht zu mir',
      bis: 'Wie für mich gemacht',
    },
    {
      id: 'ein-satz',
      bereich: 'echt',
      text: 'Kannst du in einem Satz sagen, was du machst und was deine Kund:innen bei dir erwarten dürfen?',
      von: 'Hm, da muss ich überlegen',
      bis: 'Klar, schieß los!',
    },
    {
      id: 'zeigen',
      bereich: 'leben',
      text: 'Zeigst du dich mit deiner Marke so, wie du bist, ohne dich zu verstecken?',
      von: 'Ich halte mich eher zurück',
      bis: 'Voll und ganz, ohne Filter',
    },
    {
      id: 'ueberall-gleich',
      bereich: 'leben',
      text: 'Fühlt sich deine Marke überall gleich an, von der Website über Instagram bis zur Rechnung?',
      von: 'Überall ein bisschen anders',
      bis: 'Wie aus einem Guss',
    },
    {
      id: 'kunden-spueren',
      bereich: 'ankommen',
      text: 'Spüren deine Kund:innen {gefuehl}, wenn sie mit dir zu tun haben?',
      von: 'Eher nicht',
      bis: 'Ja, das höre ich oft!',
    },
    {
      id: 'richtige-kunden',
      bereich: 'ankommen',
      text: 'Denk an deine Wunschkund:innen, die Menschen, mit denen du am liebsten arbeitest: Fühlen sie sich von deinem Auftritt so angesprochen, dass sie zu dir kommen?',
      von: 'Eher die Falschen',
      bis: 'Genau meine Herzensmenschen',
    },
    {
      id: 'verliebt',
      bereich: 'spueren',
      text: 'Und ganz ehrlich: Wie verliebt bist du gerade in deine Marke?',
      von: 'Es ist gerade schwierig',
      bis: 'Bis über beide Ohren!',
    },
  ] satisfies Frage[],

  navigation: { zurueck: 'Zurück', weiter: 'Weiter', ergebnis: 'Ergebnis anzeigen', frage: 'Frage', von: 'von' },

  /** Ergebnis nach Gesamtwert in Prozent (ab „ab“). Reihenfolge: niedrigster zuerst. */
  ergebnisse: [
    {
      id: 'kompliziert',
      ab: 0,
      symbol: '🥐',
      titel: 'Es ist kompliziert.',
      text: 'Deine Marke fühlt sich (noch) nicht ganz nach dir an. Das ist kein Grund zur Sorge, sondern ein ehrlicher Anfang. In dir steckt mehr, als dein Auftritt gerade zeigt.',
    },
    {
      id: 'knistert',
      ab: 55,
      symbol: '🥐🥐',
      titel: 'Es knistert.',
      text: 'Das Gefühl ist da, und du spürst, wofür deine Marke steht. Es ist nur noch nicht überall sichtbar. Mit ein paar gezielten Schritten wird aus dem Knistern eine große Liebe.',
    },
    {
      id: 'grosse-liebe',
      ab: 80,
      symbol: '🥐🥐🥐',
      titel: 'Große Liebe.',
      text: 'Du lebst deine Marke, und man spürt es. Jetzt geht es ums Pflegen und Weiterwachsen, damit sie mit dir mitwächst.',
    },
  ],

  auswertung: {
    titel: 'So fühlt sich deine Marke gerade an',
    staerke: 'Am stärksten spürt man {gefuehl} bei: {bereich}.',
    potenzial: 'Am meisten Potenzial liegt bei: {bereich}.',
    ausgeglichen: 'Alle Bereiche sind fast gleich stark. Das ist eine schöne Basis.',
    tippTitel: 'Dein nächster Schritt',
    /** Tipp für den schwächsten Bereich */
    tipps: {
      spueren:
        'Nimm dir 10 Minuten und schau deinen Auftritt an, als wärst du eine neue Kundin. Notiere, wo du {gefuehl} spürst und wo nicht. Genau dort fängt die Verliebtheit an.',
      echt: 'Schreib drei Sätze so auf, wie du sie einer Freundin über deine Arbeit erzählen würdest. Vergleiche sie mit deiner Website. Je näher beides beieinanderliegt, desto echter wirkt deine Marke.',
      leben:
        'Leg dir eine kleine Markenliste an: Farben, Schriften, Bildstil und drei Worte, die dich beschreiben. Prüfe damit jeden Post, jede Mail und jede Rechnung.',
      ankommen:
        'Frag drei Lieblingskund:innen, mit welchem Gefühl sie an dich denken. Wenn ihre Antworten zu {gefuehl} passen, bist du auf dem richtigen Weg. Wenn nicht, weißt du jetzt, wo du ansetzen kannst.',
    } satisfies Record<BereichId, string>,
    nochmal: 'Check nochmal machen',
  },

  /** Bonus unter dem Ergebnis: kurze Website-Checkliste zum Abhaken und als PDF zum Mitnehmen */
  bonus: {
    eyebrow: 'Bonus für dich',
    titel: 'Dein schneller Website-Check',
    text: 'Vier Fragen, die du dir in fünf Minuten selbst beantworten kannst. Hak ab, was schon passt.',
    punkte: [
      {
        titel: 'Schnell und handytauglich',
        text: 'Öffne deine Website am Handy. Lädt sie in wenigen Sekunden, ist alles gut lesbar, und steht vorne in der Adresszeile ein kleines Schloss (https)?',
      },
      {
        titel: 'Auf den ersten Blick klar',
        text: 'Versteht jemand Fremdes in fünf Sekunden, was du anbietest und für wen? Sind Texte und Bilder aktuell, und findet man sofort, wie man dich erreicht?',
      },
      {
        titel: 'Rechtlich sauber',
        text: 'Sind Impressum und Datenschutzerklärung auf dem neuesten Stand? Und laden Tools wie Google Analytics erst, nachdem jemand zugestimmt hat?',
      },
      {
        titel: 'Bei Google gut zu finden',
        text: 'Hat jede Seite einen eigenen, aussagekräftigen Titel und eine kurze Beschreibung? Sind deine Überschriften klar gegliedert?',
      },
    ],
    alleOk: 'Alles abgehakt? Großartig, deine Website steht auf einem soliden Fundament.',
    pdf: 'Als PDF speichern',
    pdfHinweis: 'Im Druckfenster „Als PDF sichern“ bzw. „Als PDF speichern“ wählen.',
    fusszeile: 'Online Boutique Agentur · www.online-boutique-agentur.at · Make it boutique.',
  },

  /** Unter der Auswertung: Video von Nina und Pia */
  video: {
    text: 'Das sind wir, Nina und Pia. Wir helfen Einzelunternehmer:innen, sich (wieder) in ihre Marke zu verlieben.',
  },

  kontakt: {
    titel: 'Lass uns gemeinsam hinschauen.',
    text: 'Wenn du magst, schauen wir uns dein Ergebnis gemeinsam an und sagen dir in einem kostenlosen Gespräch ehrlich, was deine Marke noch braucht, damit du dich in sie verliebst.',
    felder: { name: 'Vorname', email: 'E-Mail', firma: 'Marke oder Unternehmen', webseite: 'Website oder Instagram', nachricht: 'Möchtest du uns noch etwas sagen?' },
    absenden: 'Ergebnis besprechen',
    sendet: 'Wird gesendet …',
    meta: 'Kostenlos, unverbindlich, 30 Minuten.',
    erfolg: 'Danke! Dein Ergebnis ist bei uns angekommen. Wir melden uns in den nächsten Tagen persönlich bei dir.',
    fehler: 'Das hat leider nicht geklappt. Bitte versuch es nochmal oder schreib uns an hello@online-boutique-agentur.at.',
  },
};

export type Ergebnis = (typeof markencheck.ergebnisse)[number];
