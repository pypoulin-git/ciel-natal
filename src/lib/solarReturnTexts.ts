// Copy for the solar return page. Short, forward-looking, year-scoped:
// « ton année », never « ta vie ». Opportunity and season, not fate.

type L = { fr: string; en: string };

/** What each house stands for, in a solar-return (one-year) reading. */
export const HOUSE_THEME: Record<number, { label: L; year: L }> = {
  1: {
    label: { fr: "Soi et élan", en: "Self & drive" },
    year: { fr: "L'année te remet au centre : ton corps, ton allure, ta façon de démarrer.", en: "The year puts you at the centre: your body, your presence, how you start things." },
  },
  2: {
    label: { fr: "Ressources", en: "Resources" },
    year: { fr: "L'argent, ce que tu vaux, ce sur quoi tu peux compter : ça se construit cette année.", en: "Money, self-worth, what you can rely on: this is the year to build it." },
  },
  3: {
    label: { fr: "Échanges", en: "Exchange" },
    year: { fr: "Conversations, écriture, apprentissages, petits trajets : ton année passe par les mots.", en: "Conversations, writing, learning, short trips: your year runs on words." },
  },
  4: {
    label: { fr: "Racines", en: "Roots" },
    year: { fr: "Le foyer, la famille, le lieu où tu te poses : l'année se joue à la maison.", en: "Home, family, where you settle: the year plays out close to home." },
  },
  5: {
    label: { fr: "Création et plaisir", en: "Creation & joy" },
    year: { fr: "Créer, aimer, jouer, oser te montrer : l'année veut de la joie.", en: "Creating, loving, playing, daring to be seen: the year wants joy." },
  },
  6: {
    label: { fr: "Quotidien", en: "Daily life" },
    year: { fr: "Tes routines, ta santé, ton travail au jour le jour : c'est là que ça bouge.", en: "Routines, health, day-to-day work: that's where things shift." },
  },
  7: {
    label: { fr: "Relations", en: "Partnership" },
    year: { fr: "Le couple, les associations, l'autre en face : l'année se vit à deux.", en: "Partners, alliances, the person across the table: a year lived in pairs." },
  },
  8: {
    label: { fr: "Transformation", en: "Transformation" },
    year: { fr: "Ce qu'on partage, ce qu'on laisse mourir pour renaître : une année de mue.", en: "What's shared, what you let go of to begin again: a year of shedding skin." },
  },
  9: {
    label: { fr: "Horizons", en: "Horizons" },
    year: { fr: "Voyages, études, quête de sens : l'année t'emmène plus loin.", en: "Travel, study, the search for meaning: the year takes you further." },
  },
  10: {
    label: { fr: "Vocation", en: "Vocation" },
    year: { fr: "Ta carrière, ta place dans le monde, ce que tu montres : l'année se voit.", en: "Career, your place in the world, what you put out there: a visible year." },
  },
  11: {
    label: { fr: "Cercles et projets", en: "Circles & plans" },
    year: { fr: "Amitiés, collectifs, projets d'avenir : l'année se tisse avec les autres.", en: "Friends, groups, plans for the future: a year woven with others." },
  },
  12: {
    label: { fr: "Retrait", en: "Retreat" },
    year: { fr: "Repos, intériorité, ce qui se prépare en coulisse : une année qui recharge.", en: "Rest, inner life, what's being prepared backstage: a year that recharges." },
  },
};

/** The return Ascendant: the tone the year opens with. */
export const ASC_YEAR: Record<string, L> = {
  Belier: { fr: "Une année qui démarre au quart de tour. Tu as envie d'agir, de trancher, d'ouvrir des portes plutôt que d'attendre qu'on te les ouvre.", en: "A year that starts at full speed. You want to act, decide, open doors instead of waiting for them to open." },
  Taureau: { fr: "Une année pour poser des bases solides. Le rythme ralentit, et c'est une force : ce que tu construis maintenant tiendra.", en: "A year for solid foundations. The pace slows, and that's a strength: what you build now will last." },
  Gemeaux: { fr: "Une année curieuse et mobile. Rencontres, idées, messages : tout circule plus vite, et toi avec.", en: "A curious, restless year. People, ideas, messages: everything moves faster, and so do you." },
  Cancer: { fr: "Une année tournée vers l'intime. Tu cherches un nid, des gens sûrs, un endroit où te sentir chez toi.", en: "A year turned inward. You're looking for a nest, safe people, somewhere that feels like home." },
  Lion: { fr: "Une année pour rayonner. Tu as moins envie de te cacher : ce que tu crées mérite d'être vu.", en: "A year to shine. You feel less like hiding: what you make deserves to be seen." },
  Vierge: { fr: "Une année pour mettre de l'ordre. Tu affines, tu répares, tu prends soin, et les détails comptent.", en: "A year to sort things out. You refine, repair, take care, and the details matter." },
  Balance: { fr: "Une année d'équilibre et de liens. Les relations prennent le devant de la scène, et l'harmonie devient un projet.", en: "A year of balance and bonds. Relationships take centre stage, and harmony becomes a project." },
  Scorpion: { fr: "Une année intense, qui va au fond des choses. Moins de surface, plus de vérité, quitte à remuer.", en: "An intense year that goes deep. Less surface, more truth, even if it stirs things up." },
  Sagittaire: { fr: "Une année qui ouvre l'horizon. Tu as soif d'espace, de sens, de départs, au propre comme au figuré.", en: "A year that widens the horizon. You crave space, meaning and departures, literal or not." },
  Capricorne: { fr: "Une année de structure et d'ambition. Les efforts patients paient, et tu prends ta place.", en: "A year of structure and ambition. Patient effort pays off, and you claim your place." },
  Verseau: { fr: "Une année de liberté et d'idées neuves. Tu sors des cases, tu changes d'angle, tu te trouves des alliés.", en: "A year of freedom and fresh ideas. You step out of boxes, change angles, find allies." },
  Poissons: { fr: "Une année sensible et inspirée. L'intuition guide mieux que les plans : laisse-lui de la place.", en: "A sensitive, inspired year. Intuition guides better than plans: give it room." },
};

export const ANGLE_LABEL: Record<"asc" | "mc" | "dsc" | "ic", L> = {
  asc: { fr: "sur l'Ascendant", en: "on the Ascendant" },
  mc: { fr: "au Milieu du Ciel", en: "on the Midheaven" },
  dsc: { fr: "au Descendant", en: "on the Descendant" },
  ic: { fr: "au Fond du Ciel", en: "on the IC" },
};

/** What an angular planet brings to the year — one clause each. */
export const PLANET_YEAR: Record<string, L> = {
  Soleil: { fr: "met ta vitalité au premier plan", en: "puts your vitality front and centre" },
  Lune: { fr: "rend l'année plus émotive, plus mouvante", en: "makes the year more emotional, more fluid" },
  Mercure: { fr: "accélère les échanges et les décisions", en: "speeds up conversations and decisions" },
  Venus: { fr: "adoucit l'année, ouvre au plaisir et aux liens", en: "softens the year, opens it to pleasure and bonds" },
  Mars: { fr: "donne de l'énergie, et parfois de la friction", en: "brings energy, and sometimes friction" },
  Jupiter: { fr: "élargit, protège, donne de l'élan", en: "expands, protects, adds momentum" },
  Saturne: { fr: "demande de la rigueur, et récompense la constance", en: "asks for rigour, and rewards steadiness" },
  Uranus: { fr: "apporte l'imprévu et l'envie de liberté", en: "brings the unexpected and a hunger for freedom" },
  Neptune: { fr: "brouille les contours, nourrit l'imaginaire", en: "blurs the edges, feeds the imagination" },
  Pluton: { fr: "pousse à une transformation en profondeur", en: "pushes for deep transformation" },
};
