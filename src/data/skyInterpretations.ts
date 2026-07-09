// Copy for the "Ciel du jour" homepage section (FR/EN). Tone matches the
// brand's psychological / Jungian astrology — reflective, evocative, never
// predictive.

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

// Traditional full-moon name for each month (index 0 = January), with a short
// evocative line. Shown as the colourful headline of the Moon card.
export const MONTHLY_MOON: { name: Bi; poem: Bi }[] = [
  {
    name: { fr: 'Lune du Loup', en: 'Wolf Moon' },
    poem: { fr: 'le cri du loup dans le grand froid', en: 'the howl of the wolf in deep cold' },
  },
  {
    name: { fr: 'Lune des Glaces', en: 'Snow Moon' },
    poem: { fr: "le silence blanc de l'hiver", en: 'the white silence of winter' },
  },
  {
    name: { fr: 'Lune de la Sève', en: 'Worm Moon' },
    poem: { fr: "la sève remonte, la terre s'éveille", en: 'sap rises, the earth awakens' },
  },
  {
    name: { fr: 'Lune Rose', en: 'Pink Moon' },
    poem: { fr: 'les toutes premières floraisons', en: 'the very first blossoms' },
  },
  {
    name: { fr: 'Lune des Fleurs', en: 'Flower Moon' },
    poem: { fr: "l'abondance éclatante du printemps", en: "spring's full, vivid bloom" },
  },
  {
    name: { fr: 'Lune des Fraises', en: 'Strawberry Moon' },
    poem: { fr: 'les fruits mûrissent au soleil', en: 'fruit ripening in the sun' },
  },
  {
    name: { fr: 'Lune du Cerf', en: 'Buck Moon' },
    poem: { fr: 'le bois neuf qui couronne les cerfs', en: 'new antlers crowning the deer' },
  },
  {
    name: { fr: "Lune de l'Esturgeon", en: 'Sturgeon Moon' },
    poem: { fr: 'les rivières pleines et généreuses', en: 'rivers full and generous' },
  },
  {
    name: { fr: 'Lune des Moissons', en: 'Harvest Moon' },
    poem: { fr: "le temps de récolter ce qu'on a semé", en: 'time to gather what was sown' },
  },
  {
    name: { fr: 'Lune du Chasseur', en: "Hunter's Moon" },
    poem: {
      fr: 'la lumière décline, on fait des réserves',
      en: 'the light fades, we gather stores',
    },
  },
  {
    name: { fr: 'Lune du Castor', en: 'Beaver Moon' },
    poem: { fr: "se préparer, à l'abri, pour l'hiver", en: 'sheltering, readying for winter' },
  },
  {
    name: { fr: 'Lune Froide', en: 'Cold Moon' },
    poem: { fr: "la nuit la plus longue de l'année", en: 'the longest night of the year' },
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

// One-line "headline" of each retrograde (shown bold next to the planet) + the
// fuller meaning underneath.
export const RETRO_HEADLINE: Record<string, Bi> = {
  Mercure: {
    fr: 'mots, contrats et trajets se brouillent',
    en: 'words, contracts and travel blur',
  },
  Venus: { fr: "l'amour et la valeur se réexaminent", en: 'love and worth are re-examined' },
  Mars: { fr: "l'énergie se retourne vers l'intérieur", en: 'energy turns inward' },
  Jupiter: { fr: 'la croissance se cultive en dedans', en: 'growth is cultivated within' },
  Saturne: { fr: 'tes structures se revisitent', en: 'your structures are revisited' },
  Uranus: { fr: 'la liberté se prépare en silence', en: 'freedom brews in silence' },
  Neptune: { fr: 'le brouillard se dissipe enfin', en: 'the fog finally lifts' },
  Pluton: { fr: 'la transformation plonge plus profond', en: 'transformation goes deeper' },
}

// Retrograde meaning per planet.
export const RETRO_TEXT: Record<string, Bi> = {
  Mercure: {
    fr: 'Relis, ralentis, sauvegarde — et profites-en pour revisiter ce qui mérite un second regard.',
    en: 'Re-read, slow down, back up — and use it to revisit what deserves a second look.',
  },
  Venus: {
    fr: "D'anciennes relations ressurgissent, et tu réévalues ce qui compte vraiment pour toi.",
    en: 'Old connections resurface, and you reassess what truly matters to you.',
  },
  Mars: {
    fr: "L'action directe se grippe ; c'est le moment de revoir ta stratégie plutôt que de foncer.",
    en: 'Direct action stalls; rethink your strategy rather than charging ahead.',
  },
  Jupiter: {
    fr: "La chance se cultive par la réflexion plutôt que par l'expansion tous azimuts.",
    en: 'Fortune is cultivated through reflection rather than all-out expansion.',
  },
  Saturne: {
    fr: "L'occasion de consolider des fondations plutôt que d'en bâtir de nouvelles.",
    en: 'A chance to consolidate foundations rather than build new ones.',
  },
  Uranus: {
    fr: "Les révolutions intérieures mûrissent avant d'éclater au grand jour.",
    en: 'Inner revolutions ripen before they break into the open.',
  },
  Neptune: {
    fr: "L'occasion de distinguer le rêve de l'illusion, et de retrouver le fil.",
    en: 'A chance to tell dream from illusion, and find the thread again.',
  },
  Pluton: {
    fr: 'Ce qui doit mourir pour renaître remonte lentement à la surface.',
    en: 'What must die to be reborn slowly rises to the surface.',
  },
}

export type AspectNature = 'fusion' | 'harmonie' | 'tension'

// Aspect type → localized name, nature (drives the colour dot) and meaning.
export const ASPECT_INFO: Record<string, { name: Bi; nature: AspectNature; text: Bi }> = {
  Conjonction: {
    name: { fr: 'conjoint·e à', en: 'conjunct' },
    nature: 'fusion',
    text: {
      fr: "deux forces fusionnent et s'amplifient — un même élan.",
      en: 'two forces merge and amplify — a single impulse.',
    },
  },
  Sextile: {
    name: { fr: 'en sextile à', en: 'sextile' },
    nature: 'harmonie',
    text: {
      fr: "une porte qui s'ouvre, si tu fais le premier pas.",
      en: 'a door that opens — if you take the first step.',
    },
  },
  Carre: {
    name: { fr: 'carré·e à', en: 'square' },
    nature: 'tension',
    text: {
      fr: "une friction qui pousse à l'action et à la croissance.",
      en: 'a friction that pushes toward action and growth.',
    },
  },
  Trigone: {
    name: { fr: 'en trigone à', en: 'trine' },
    nature: 'harmonie',
    text: {
      fr: 'une harmonie naturelle, un talent qui circule sans effort.',
      en: 'a natural harmony, a gift that flows effortlessly.',
    },
  },
  Opposition: {
    name: { fr: 'opposé·e à', en: 'opposite' },
    nature: 'tension',
    text: {
      fr: "deux pôles à réconcilier — l'équilibre se cherche entre eux.",
      en: 'two poles to reconcile — balance is found between them.',
    },
  },
}

// Hex per aspect nature, for the coloured indicator.
export const NATURE_COLOR: Record<AspectNature, string> = {
  fusion: '#e0a94e', // gold
  harmonie: '#86d9b9', // teal-green
  tension: '#dba3b8', // rose
}

// Multi-planet configurations.
export const CONFIG_INFO: Record<'stellium' | 'grand-trine' | 't-square', { name: Bi; text: Bi }> =
  {
    stellium: {
      name: { fr: 'Stellium', en: 'Stellium' },
      text: {
        fr: 'une rare concentration de planètes dans un même signe — ce domaine de la vie est sous les projecteurs.',
        en: 'a rare cluster of planets in one sign — this area of life is under the spotlight.',
      },
    },
    'grand-trine': {
      name: { fr: 'Grand Trigone', en: 'Grand Trine' },
      text: {
        fr: "un triangle d'harmonie entre trois planètes : une grâce qui circule presque sans effort.",
        en: 'a triangle of harmony between three planets: a grace that flows almost effortlessly.',
      },
    },
    't-square': {
      name: { fr: 'T-Carré', en: 'T-Square' },
      text: {
        fr: 'une tension à trois pointes : un défi qui forge la volonté et la maîtrise de soi.',
        en: 'a three-pointed tension: a challenge that forges willpower and self-mastery.',
      },
    },
  }

// Plain-language meaning helpers — used to turn raw aspects/stelliums into
// sentences a newcomer understands.

// One concept per planet, composed into alignment readings.
export const PLANET_THEME: Record<string, Bi> = {
  Soleil: { fr: "l'identité", en: 'identity' },
  Mercure: { fr: 'le mental', en: 'the mind' },
  Venus: { fr: "l'amour", en: 'love' },
  Mars: { fr: "l'action", en: 'action' },
  Jupiter: { fr: 'la chance', en: 'luck' },
  Saturne: { fr: 'la discipline', en: 'discipline' },
  Uranus: { fr: 'la liberté', en: 'freedom' },
  Neptune: { fr: "l'intuition", en: 'intuition' },
  Pluton: { fr: 'la transformation', en: 'transformation' },
}

// What each sign is "about" — to explain a stellium in plain words.
export const SIGN_THEME: Record<string, Bi> = {
  Belier: { fr: "l'action et l'affirmation de soi", en: 'action and self-assertion' },
  Taureau: { fr: 'la sécurité et les plaisirs simples', en: 'security and simple pleasures' },
  Gemeaux: { fr: 'les échanges et la curiosité', en: 'exchange and curiosity' },
  Cancer: { fr: 'le foyer, les émotions et les racines', en: 'home, emotions and roots' },
  Lion: { fr: 'la créativité et le rayonnement', en: 'creativity and shining' },
  Vierge: { fr: 'le travail et le soin du détail', en: 'work and attention to detail' },
  Balance: { fr: "les relations et l'équilibre", en: 'relationships and balance' },
  Scorpion: { fr: "l'intensité et la transformation", en: 'intensity and transformation' },
  Sagittaire: { fr: "l'aventure et le sens", en: 'adventure and meaning' },
  Capricorne: { fr: "l'ambition et la structure", en: 'ambition and structure' },
  Verseau: { fr: 'la liberté et les idées neuves', en: 'freedom and new ideas' },
  Poissons: { fr: 'le rêve et la compassion', en: 'dreams and compassion' },
}

// Turns "{theme1} et {theme2} {framing}" into a readable alignment sentence.
export const NATURE_FRAMING: Record<AspectNature, Bi> = {
  fusion: { fr: 'se fondent en une seule force', en: 'merge into a single force' },
  harmonie: { fr: "s'accordent avec fluidité", en: 'flow together easily' },
  tension: { fr: 'se confrontent — un défi à relever', en: 'clash — a challenge to face' },
}

// Short one-liner explaining each concept to a newcomer (card intros).
export const SKY_EXPLAINERS = {
  retro: {
    fr: 'Une planète rétrograde semble reculer dans le ciel : son énergie se tourne vers l’intérieur — on révise, on ralentit, plutôt qu’on fonce.',
    en: 'A retrograde planet appears to move backwards: its energy turns inward — a time to review and slow down rather than push ahead.',
  },
  alignments: {
    fr: 'Quand deux planètes forment un angle précis, leurs énergies dialoguent — en douceur (harmonie) ou en friction (tension).',
    en: 'When two planets form a precise angle, their energies interact — gently (harmony) or with friction (tension).',
  },
  stellium: {
    fr: 'Un stellium, c’est trois planètes ou plus réunies dans le même signe : une concentration d’énergie qui met ce thème en avant.',
    en: 'A stellium is three or more planets gathered in the same sign: a concentration of energy that spotlights that theme.',
  },
}
