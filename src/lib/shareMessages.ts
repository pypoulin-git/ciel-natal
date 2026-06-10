/**
 * Email share message builders.
 *
 * Single source of truth for what shows up when the user clicks
 * "Send by email" on any share button across the site. Three contexts
 * are covered: a personal natal chart (own or someone else's), a
 * synastry between two people, and a blog article. Each builder returns
 * the {subject, body} pair the caller will encode into a `mailto:` URL.
 *
 * Tone is deliberately warm and light — like a quick note from a friend.
 * No marketing pitch, no astrology jargon, no PII in the subject
 * (PY's screenshot showed a Gmail "Objet" field filled with the full
 * share URL — embarrassing for the receiver and useless for context).
 */

export interface ShareMessage {
  subject: string;
  body: string;
}

/** Build the mailto URL from a {subject, body} pair. Pre-encoded, safe to set as href. */
export function toMailtoUrl(msg: ShareMessage): string {
  return `mailto:?subject=${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(msg.body)}`;
}

// ─── Personal natal chart ──────────────────────────────────────────────
// Used by the home page "Share this chart" button. We never put the
// person's name in the subject (privacy + the link itself already
// carries the chart data).
export function chartShareMessage(opts: {
  url: string;
  /** Big three summary like "Soleil Gémeaux · Lune Poissons · Ascendant Verseau". */
  bigThree?: string;
  locale: "fr" | "en";
}): ShareMessage {
  if (opts.locale === "en") {
    return {
      subject: "A natal chart to peek at",
      body: [
        "Hi,",
        "",
        "I just used Natalune — a free birth chart calculator with",
        "gentle psychological interpretations (inspired by Jung and Liz",
        "Greene). Not the magazine-horoscope kind. A real self-reflection",
        "tool, no ads, no account needed to try.",
        "",
        opts.bigThree ? `Here's the snapshot: ${opts.bigThree}.` : "",
        "",
        "If you're curious, the link below opens this exact chart — or",
        "you can compute your own from the home page.",
        "",
        opts.url,
        "",
        "See you under the stars,",
      ].filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n"),
    };
  }
  return {
    subject: "Une carte du ciel à découvrir",
    body: [
      "Salut,",
      "",
      "Je viens d'utiliser Natalune — un calculateur de carte du ciel",
      "gratuit avec des interprétations psychologiques douces (inspirées",
      "de Jung et Liz Greene). Pas un horoscope de magazine. Un vrai",
      "outil de réflexion, sans pub, sans compte requis pour essayer.",
      "",
      opts.bigThree ? `Voici l'aperçu : ${opts.bigThree}.` : "",
      "",
      "Si la curiosité te prend, le lien ci-dessous ouvre cette carte —",
      "ou tu peux calculer la tienne depuis l'accueil.",
      "",
      opts.url,
      "",
      "À bientôt sous les étoiles,",
    ].filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n"),
  };
}

// ─── Synastry between two people ───────────────────────────────────────
// Used by the share button inside the synastry result. Tone leans
// slightly more intimate since the recipient is by definition one of
// the two people in the comparison.
export function synastryShareMessage(opts: {
  url: string;
  prenomA: string;
  prenomB: string;
  /** "amour" | "amitie" | "professionnel" | "indetermine" */
  relationType?: string;
  locale: "fr" | "en";
}): ShareMessage {
  const { prenomA, prenomB, relationType = "indetermine", locale } = opts;
  if (locale === "en") {
    const flavor =
      relationType === "amour" ? "what our two skies say about each other"
      : relationType === "amitie" ? "what our friendship reads like in the stars"
      : relationType === "professionnel" ? "what our charts say about working together"
      : "the dynamic between our two charts";
    return {
      subject: `${prenomA} & ${prenomB} — a synastry to read together`,
      body: [
        `Hi ${prenomB},`,
        "",
        `I ran our synastry on Natalune — ${flavor}.`,
        "It's interesting, somewhere between a horoscope and a long",
        "conversation about who we are.",
        "",
        "The link below opens it directly:",
        "",
        opts.url,
        "",
        "Tell me what you think.",
      ].filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n"),
    };
  }
  const flavor =
    relationType === "amour" ? "ce que nos deux ciels disent l'un de l'autre"
    : relationType === "amitie" ? "ce que notre amitié raconte côté étoiles"
    : relationType === "professionnel" ? "ce que nos cartes disent de notre collaboration"
    : "la dynamique entre nos deux cartes";
  return {
    subject: `${prenomA} & ${prenomB} — une synastrie à lire ensemble`,
    body: [
      `Salut ${prenomB},`,
      "",
      `J'ai fait notre synastrie sur Natalune — ${flavor}.`,
      "C'est intéressant, à mi-chemin entre un horoscope et une longue",
      "conversation sur qui on est.",
      "",
      "Le lien ci-dessous ouvre la lecture directement :",
      "",
      opts.url,
      "",
      "Dis-moi ce que tu en penses.",
    ].filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n"),
  };
}

// ─── Blog article ──────────────────────────────────────────────────────
export function blogShareMessage(opts: {
  url: string;
  title: string;
  locale: "fr" | "en";
}): ShareMessage {
  if (opts.locale === "en") {
    return {
      subject: `${opts.title} — Natalune`,
      body: [
        "Hi,",
        "",
        "Found this on Natalune — felt worth sharing:",
        "",
        `« ${opts.title} »`,
        "",
        opts.url,
        "",
        "Quick read, well worth it if psychological astrology is your thing.",
      ].join("\n"),
    };
  }
  return {
    subject: `${opts.title} — Natalune`,
    body: [
      "Salut,",
      "",
      "Trouvé ça sur Natalune — vaut le détour :",
      "",
      `« ${opts.title} »`,
      "",
      opts.url,
      "",
      "Lecture courte, à lire si l'astrologie psychologique t'intrigue.",
    ].join("\n"),
  };
}
