// Copy for the "Ciel du jour" homepage section (FR/EN). Tone matches the
// brand's psychological / Jungian astrology — reflective, never predictive.

type Bi = { fr: string; en: string }

// 8 Moon phases, indexed 0..7 to match skyToday.ts phaseIndex().
export const MOON_PHASES: { name: Bi; text: Bi }[] = [
  {
    name: { fr: 'Nouvelle Lune', en: 'New Moon' },
    text: {
      fr: "Un nouveau cycle s'ouvre. Le moment des intentions — des graines qu'on plante dans le noir avant de les voir pousser.",
      en: 'A new cycle opens. A time for intentions — seeds planted in the dark before they show.',
    },
  },
  {
    name: { fr: 'Premier Croissant', en: 'Waxing Crescent' },
    text: {
      fr: "L'élan des débuts. Ce que tu as initié demande maintenant de la constance.",
      en: "The momentum of beginnings. What you've started now asks for steadiness.",
    },
  },
  {
    name: { fr: 'Premier Quartier', en: 'First Quarter' },
    text: {
      fr: 'Un point de tension fertile : les premiers obstacles testent ton engagement.',
      en: 'A fertile tension point: the first obstacles test your commitment.',
    },
  },
  {
    name: { fr: 'Lune Gibbeuse croissante', en: 'Waxing Gibbous' },
    text: {
      fr: 'On affine, on ajuste. La patience, juste avant la pleine lumière.',
      en: 'Refining and adjusting — patience just before the full light.',
    },
  },
  {
    name: { fr: 'Pleine Lune', en: 'Full Moon' },
    text: {
      fr: 'La culmination. Ce qui était caché se révèle ; les émotions montent à leur sommet.',
      en: 'The culmination. What was hidden surfaces; emotions reach their peak.',
    },
  },
  {
    name: { fr: 'Lune Gibbeuse décroissante', en: 'Waning Gibbous' },
    text: {
      fr: "Le temps de la gratitude et du partage de ce qu'on a récolté.",
      en: "A time for gratitude and for sharing what you've gathered.",
    },
  },
  {
    name: { fr: 'Dernier Quartier', en: 'Last Quarter' },
    text: {
      fr: 'On relâche, on pardonne, on fait le tri avant le prochain cycle.',
      en: 'Releasing, forgiving, sorting before the next cycle.',
    },
  },
  {
    name: { fr: 'Dernier Croissant', en: 'Waning Crescent' },
    text: {
      fr: 'Le repos avant le renouveau. Écoute, rêve, laisse aller.',
      en: 'Rest before renewal. Listen, dream, let go.',
    },
  },
]

// Display names for planets (internal key → localized label).
export const PLANET_LABEL: Record<string, Bi> = {
  Soleil: { fr: 'Soleil', en: 'Sun' },
  Lune: { fr: 'Lune', en: 'Moon' },
  Mercure: { fr: 'Mercure', en: 'Mercury' },
  Venus: { fr: 'Vénus', en: 'Venus' },
  Mars: { fr: 'Mars', en: 'Mars' },
  Jupiter: { fr: 'Jupiter', en: 'Jupiter' },
  Saturne: { fr: 'Saturne', en: 'Saturn' },
  Uranus: { fr: 'Uranus', en: 'Uranus' },
  Neptune: { fr: 'Neptune', en: 'Neptune' },
  Pluton: { fr: 'Pluton', en: 'Pluto' },
}

// Retrograde meaning per planet.
export const RETRO_TEXT: Record<string, Bi> = {
  Mercure: {
    fr: 'Mercure rétrograde brouille communication, contrats et voyages. Relis, ralentis, sauvegarde — et profites-en pour revisiter ce qui mérite un second regard.',
    en: 'Mercury retrograde scrambles communication, contracts and travel. Re-read, slow down, back up — and use it to revisit what deserves a second look.',
  },
  Venus: {
    fr: "Vénus rétrograde rouvre les questions d'amour et de valeur : d'anciennes relations ressurgissent, et tu réévalues ce qui compte vraiment.",
    en: 'Venus retrograde reopens matters of love and worth: old connections resurface, and you reassess what truly matters.',
  },
  Mars: {
    fr: "Mars rétrograde retourne l'énergie vers l'intérieur. L'action directe se grippe ; c'est le moment de revoir ta stratégie plutôt que de foncer.",
    en: 'Mars retrograde turns energy inward. Direct action stalls; rethink your strategy rather than charging ahead.',
  },
  Jupiter: {
    fr: "Jupiter rétrograde déplace la croissance vers l'intérieur : la chance se cultive par la réflexion plutôt que par l'expansion.",
    en: 'Jupiter retrograde moves growth inward: fortune is cultivated through reflection rather than expansion.',
  },
  Saturne: {
    fr: "Saturne rétrograde revisite tes structures et tes responsabilités — l'occasion de consolider des fondations plutôt que d'en bâtir de nouvelles.",
    en: 'Saturn retrograde revisits your structures and responsibilities — a chance to consolidate foundations rather than build new ones.',
  },
  Uranus: {
    fr: "Uranus rétrograde intériorise le besoin de liberté : les révolutions se préparent en silence avant d'éclater.",
    en: 'Uranus retrograde internalizes the urge for freedom: revolutions brew quietly before they break.',
  },
  Neptune: {
    fr: "Neptune rétrograde dissipe le brouillard : l'occasion de distinguer le rêve de l'illusion.",
    en: 'Neptune retrograde lifts the fog: a chance to tell dream from illusion.',
  },
  Pluton: {
    fr: 'Pluton rétrograde plonge la transformation au plus profond : ce qui doit mourir pour renaître remonte à la surface.',
    en: 'Pluto retrograde drives transformation deep: what must die to be reborn rises to the surface.',
  },
}

// Aspect type → localized name + short meaning (framed for transits).
export const ASPECT_INFO: Record<string, { name: Bi; text: Bi }> = {
  Conjonction: {
    name: { fr: 'Conjonction', en: 'Conjunction' },
    text: {
      fr: "deux forces fusionnent et s'amplifient — un même élan.",
      en: 'two forces merge and amplify — a single impulse.',
    },
  },
  Sextile: {
    name: { fr: 'Sextile', en: 'Sextile' },
    text: {
      fr: 'une opportunité fluide, si tu fais le premier pas.',
      en: 'an easy opportunity — if you take the first step.',
    },
  },
  Carre: {
    name: { fr: 'Carré', en: 'Square' },
    text: {
      fr: "une tension qui pousse à l'action et à la croissance.",
      en: 'a friction that pushes toward action and growth.',
    },
  },
  Trigone: {
    name: { fr: 'Trigone', en: 'Trine' },
    text: {
      fr: 'une harmonie naturelle, un talent qui circule sans effort.',
      en: 'a natural harmony, a gift that flows effortlessly.',
    },
  },
  Opposition: {
    name: { fr: 'Opposition', en: 'Opposition' },
    text: {
      fr: "deux pôles à réconcilier — l'équilibre se cherche entre eux.",
      en: 'two poles to reconcile — balance is found between them.',
    },
  },
}
