// Major annual meteor showers — favourable to the Northern hemisphere, i.e.
// visible across North America and Europe (our audience). Peak dates recur on
// nearly the same calendar day each year (±1 day), so a curated table is the
// pragmatic, offline source; the celestial calendar projects each peak into
// the rolling 12-month window and flags Moon interference per year.
//
// "zhr" = Zenithal Hourly Rate (ideal dark-sky rate at the radiant's zenith) —
// real counts are lower, but it ranks the showers. Best-viewing hours assume
// mid-northern latitudes (~40–50°N: Québec, France, etc.).

export interface MeteorShower {
  key: string
  fr: string
  en: string
  peak: { month: number; day: number } // representative peak (UT), 1-based month
  zhr: number
  // Best viewing window (short, for calendar rows).
  whenFr: string
  whenEn: string
  // One-line reading for the blog / tooltip.
  blurbFr: string
  blurbEn: string
}

export const METEOR_SHOWERS: MeteorShower[] = [
  {
    key: 'quadrantides',
    fr: 'Quadrantides', en: 'Quadrantids',
    peak: { month: 1, day: 4 }, zhr: 110,
    whenFr: 'fin de nuit', whenEn: 'pre-dawn',
    blurbFr: "Un pic bref mais intense en plein cœur de l'hiver — vise les toutes dernières heures avant l'aube.",
    blurbEn: 'A brief but intense midwinter peak — aim for the last hours before dawn.',
  },
  {
    key: 'lyrides',
    fr: 'Lyrides', en: 'Lyrids',
    peak: { month: 4, day: 22 }, zhr: 18,
    whenFr: 'après minuit', whenEn: 'after midnight',
    blurbFr: 'Le retour du printemps astronomique — des météores rapides, parfois avec de belles traînées.',
    blurbEn: 'The return of spring meteors — fast, sometimes with bright trails.',
  },
  {
    key: 'eta-aquarides',
    fr: 'Êta Aquarides', en: 'Eta Aquariids',
    peak: { month: 5, day: 6 }, zhr: 50,
    whenFr: "juste avant l'aube", whenEn: 'just before dawn',
    blurbFr: "Des poussières de la comète de Halley. Radiant bas sur l'horizon au nord — mieux vu plus au sud, mais quelques belles filantes rasantes.",
    blurbEn: "Dust from Halley's Comet. The radiant sits low in the north — better further south, but a few lovely grazing meteors.",
  },
  {
    key: 'delta-aquarides',
    fr: 'Delta Aquarides du Sud', en: 'Southern Delta Aquariids',
    peak: { month: 7, day: 30 }, zhr: 25,
    whenFr: 'fin de nuit', whenEn: 'late night',
    blurbFr: "Un plateau discret de fin juillet qui prépare le grand rendez-vous des Perséides.",
    blurbEn: 'A quiet late-July plateau that warms up for the Perseids.',
  },
  {
    key: 'perseides',
    fr: 'Perséides', en: 'Perseids',
    peak: { month: 8, day: 12 }, zhr: 100,
    whenFr: "de minuit à l'aube", whenEn: 'midnight to dawn',
    blurbFr: "La pluie de l'été, la plus populaire de l'hémisphère nord : jusqu'à une centaine de filantes par heure sous un ciel noir, dans la douceur d'août.",
    blurbEn: "Summer's shower and the Northern hemisphere favourite: up to a hundred meteors an hour under a dark sky, in the warmth of August.",
  },
  {
    key: 'draconides',
    fr: 'Draconides', en: 'Draconids',
    peak: { month: 10, day: 8 }, zhr: 10,
    whenFr: 'en début de soirée', whenEn: 'early evening',
    blurbFr: "Rare exception : le radiant est haut dès la tombée de la nuit. Débit imprévisible, parfois des sursauts spectaculaires.",
    blurbEn: 'A rare exception: the radiant is high right after dusk. Unpredictable — occasionally spectacular outbursts.',
  },
  {
    key: 'orionides',
    fr: 'Orionides', en: 'Orionids',
    peak: { month: 10, day: 21 }, zhr: 20,
    whenFr: 'après minuit', whenEn: 'after midnight',
    blurbFr: 'La seconde offrande de la comète de Halley — des météores rapides qui filent depuis Orion.',
    blurbEn: "Halley's second gift — fast meteors streaking from Orion.",
  },
  {
    key: 'taurides-sud',
    fr: 'Taurides du Sud', en: 'Southern Taurids',
    peak: { month: 11, day: 5 }, zhr: 5,
    whenFr: 'milieu de nuit', whenEn: 'middle of the night',
    blurbFr: "Peu nombreuses mais lentes et brillantes : la saison des bolides d'automne, capables d'illuminer tout le ciel.",
    blurbEn: 'Few but slow and bright: the autumn fireball season, capable of lighting up the whole sky.',
  },
  {
    key: 'leonides',
    fr: 'Léonides', en: 'Leonids',
    peak: { month: 11, day: 17 }, zhr: 15,
    whenFr: "avant l'aube", whenEn: 'before dawn',
    blurbFr: 'Les plus rapides du ciel. Débit modeste la plupart des années, mais des tempêtes mémorables tous les 33 ans.',
    blurbEn: 'The fastest of all. Modest most years, but memorable storms every 33 years.',
  },
  {
    key: 'geminides',
    fr: 'Géminides', en: 'Geminids',
    peak: { month: 12, day: 14 }, zhr: 130,
    whenFr: "dès la soirée jusqu'à l'aube", whenEn: 'from evening to dawn',
    blurbFr: "La reine de l'année : abondante, colorée, et déjà active en soirée. Habille-toi chaudement, le spectacle en vaut le froid.",
    blurbEn: 'The queen of the year: abundant, colourful, and active from the evening. Dress warmly — the show is worth the cold.',
  },
  {
    key: 'ursides',
    fr: 'Ursides', en: 'Ursids',
    peak: { month: 12, day: 22 }, zhr: 10,
    whenFr: 'fin de nuit', whenEn: 'late night',
    blurbFr: "Une pluie discrète autour du solstice, pour clore l'année les yeux tournés vers la Petite Ourse.",
    blurbEn: 'A quiet shower around the solstice, closing the year with eyes on the Little Dipper.',
  },
]

export const METEOR_BY_KEY: Record<string, MeteorShower> = Object.fromEntries(
  METEOR_SHOWERS.map((s) => [s.key, s]),
)
