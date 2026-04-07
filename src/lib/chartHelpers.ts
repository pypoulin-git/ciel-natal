import { NatalChart } from "@/lib/astro";

// ─── Gender-aware text adaptation ────────────────────────────────
export type Genre = "femme" | "homme" | "nb";

/**
 * Adapts inclusive text (with ·e notation) to the user's gender.
 * Femme: "animé·e" → "animée", "un·e" → "une", "fait·e" → "faite"
 * Homme: "animé·e" → "animé", "un·e" → "un", "fait·e" → "fait"
 * NB: keeps interpunct notation as-is
 */
export function genderize(text: string, genre: Genre): string {
  if (genre === "nb") return text;
  if (genre === "femme") {
    return text
      .replace(/(\w)·e\b/g, "$1e")           // "animé·e" → "animée"
      .replace(/un·e\b/g, "une")              // "un·e" → "une"
      .replace(/\bfait·e\b/g, "faite")
      .replace(/\bfort·e\b/g, "forte")
      .replace(/\bvu·e\b/g, "vue")
      .replace(/\bné·e\b/g, "née")
      .replace(/(\w)eur·se\b/g, "$1euse")     // "tisseur·se" → "tisseuse"
      .replace(/(\w)·ve\b/g, "$1ve");          // "créatif·ve" → "créative"
  }
  // homme
  return text
    .replace(/·e\b/g, "")                     // "animé·e" → "animé"
    .replace(/un·e\b/g, "un")
    .replace(/eur·se\b/g, "eur")              // "tisseur·se" → "tisseur"
    .replace(/·ve\b/g, "");                    // "créatif·ve" → "créatif"
}

/** Returns a gendered greeting, locale-aware */
export function getGreeting(prenom: string, genre: Genre, locale: string = "fr"): string {
  if (locale === "en") return `Dear ${prenom}`;
  if (genre === "femme") return `Chère ${prenom}`;
  if (genre === "homme") return `Cher ${prenom}`;
  return prenom;
}

/** Extracts the first sentence from a portrait text (up to first period or comma). */
export function getIntroSentence(portraitText: string): string {
  const match = portraitText.match(/^[^.]+\./);
  return match ? match[0] : portraitText;
}

// ─── Portrait Helpers ─────────────────────────────────────────────

const SUN_FR: Record<string, string> = {
  Belier: "illumine une nature audacieuse et pionnière. Tu portes en toi une énergie d'initiation — un besoin viscéral de tracer ta propre voie.",
  Taureau: "révèle une nature profondément ancrée et sensorielle. Tu construis avec patience, tu apprécies la beauté tangible du monde.",
  Gemeaux: "dévoile un esprit vif, curieux et multiple. Tu as soif d'apprendre, de connecter les idées, de communiquer.",
  Cancer: "baigne ta personnalité dans une sensibilité intuitive et protectrice. Tu ressens profondément les émotions — les tiennes et celles des autres.",
  Lion: "rayonne d'une chaleur naturelle et d'une générosité authentique. Tu as besoin de créer, de briller, d'inspirer.",
  Vierge: "affine ton regard sur le monde avec une précision et une intelligence analytique remarquables.",
  Balance: "cherche l'harmonie et la justesse dans chaque interaction. Tu possèdes un sens esthétique développé·e et une capacité rare à voir les deux côtés.",
  Scorpion: "plonge ta conscience dans les profondeurs de l'expérience humaine. Tu ne te contentes jamais de la surface.",
  Sagittaire: "ouvre grands les horizons de ta conscience. Tu es animé·e par une quête de sens, d'aventure et de vérité.",
  Capricorne: "ancre ta volonté dans la durée et la structure. Tu as une maturité naturelle et une ambition qui se mesure sur le long terme.",
  Verseau: "souffle un vent d'originalité et de vision. Tu penses au-delà des conventions, tu questionnes les normes.",
  Poissons: "dissout les frontières entre toi et le monde avec une empathie et une imagination sans limites.",
};

const SUN_EN: Record<string, string> = {
  Belier: "illuminates a bold, pioneering nature. You carry an energy of initiation — a visceral need to forge your own path.",
  Taureau: "reveals a deeply grounded, sensorial nature. You build with patience, you appreciate the tangible beauty of the world.",
  Gemeaux: "unveils a quick, curious, multifaceted mind. You thirst for learning, connecting ideas, communicating.",
  Cancer: "bathes your personality in intuitive, protective sensitivity. You feel emotions deeply — yours and those of others.",
  Lion: "radiates a natural warmth and authentic generosity. You need to create, to shine, to inspire.",
  Vierge: "sharpens your view of the world with remarkable precision and analytical intelligence.",
  Balance: "seeks harmony and rightness in every interaction. You have a refined aesthetic sense and a rare ability to see both sides.",
  Scorpion: "plunges your consciousness into the depths of human experience. You never settle for the surface.",
  Sagittaire: "opens wide the horizons of your consciousness. You are driven by a quest for meaning, adventure and truth.",
  Capricorne: "anchors your will in duration and structure. You have a natural maturity and an ambition that measures itself over the long term.",
  Verseau: "blows a wind of originality and vision. You think beyond conventions, you question norms.",
  Poissons: "dissolves the boundaries between you and the world with boundless empathy and imagination.",
};

const MOON_FR: Record<string, string> = {
  Belier: "révèle un monde émotionnel spontané et direct. Tes réactions sont vives, ton besoin d'authenticité immédiat.",
  Taureau: "parle d'un besoin profond de stabilité et de douceur. Tu te ressources dans le confort et la sécurité du familier.",
  Gemeaux: "dépeint une vie intérieure animée et changeante. Tu as besoin de stimulation mentale pour te sentir en équilibre.",
  Cancer: "amplifie ta sensibilité naturelle et ton intuition. Tu ressens les ambiances comme un sismographe.",
  Lion: "met en lumière un besoin d'être vu·e et apprécié·e dans ton authenticité. Tu as un cœur généreux.",
  Vierge: "traduit un besoin d'ordre émotionnel et de clarté intérieure. Tu te ressources dans les routines et le sentiment d'utilité.",
  Balance: "aspire à l'harmonie relationnelle avant tout. Tu as besoin de beauté autour de toi et de relations équilibrées.",
  Scorpion: "révèle une vie émotionnelle d'une profondeur remarquable. La confiance se construit lentement chez toi.",
  Sagittaire: "colore ta vie émotionnelle d'optimisme et de soif de liberté. Tu as besoin d'espace pour ton équilibre.",
  Capricorne: "confère à tes émotions une maturité et une réserve qui cachent une grande profondeur.",
  Verseau: "donne à ta vie émotionnelle une qualité détachée et originale. Tu traites tes émotions avec une lucidité inhabituelle.",
  Poissons: "ouvre les portes d'une sensibilité sans frontières. Tu absorbes les émotions ambiantes comme une éponge.",
};

const MOON_EN: Record<string, string> = {
  Belier: "reveals a spontaneous and direct emotional world. Your reactions are swift, your need for authenticity immediate.",
  Taureau: "speaks of a deep need for stability and gentleness. You recharge through comfort and the safety of the familiar.",
  Gemeaux: "depicts a lively, changeable inner life. You need mental stimulation to feel balanced.",
  Cancer: "amplifies your natural sensitivity and intuition. You sense atmospheres like a seismograph.",
  Lion: "highlights a need to be seen and appreciated in your authenticity. You have a generous heart.",
  Vierge: "translates a need for emotional order and inner clarity. You recharge through routines and the feeling of usefulness.",
  Balance: "aspires to relational harmony above all. You need beauty around you and balanced relationships.",
  Scorpion: "reveals an emotional life of remarkable depth. Trust builds slowly within you.",
  Sagittaire: "colours your emotional life with optimism and a thirst for freedom. You need space for your balance.",
  Capricorne: "gives your emotions a maturity and reserve that conceal great depth.",
  Verseau: "lends your emotional life a detached, original quality. You process your emotions with unusual clarity.",
  Poissons: "opens the doors to a sensitivity without borders. You absorb surrounding emotions like a sponge.",
};

const ASC_FR: Record<string, string> = {
  Belier: "tu arrives dans le monde avec une énergie directe et magnétique.",
  Taureau: "tu te présentes au monde avec une présence calme et rassurante.",
  Gemeaux: "tu projettes une image vive, communicatif·ve et adaptable.",
  Cancer: "tu te montres au monde avec une douceur protectrice et intuitif·ve.",
  Lion: "tu entres dans une pièce avec une présence chaude et lumineux·se.",
  Vierge: "tu te présentes avec une élégance discrète et une intelligence attentif·ve.",
  Balance: "tu projettes une image d'harmonie et de grâce naturelle.",
  Scorpion: "tu arrives avec une intensité magnétique qui ne passe pas inaperçu·e.",
  Sagittaire: "tu rayonnes d'un enthousiasme et d'une ouverture d'esprit contagieux·se.",
  Capricorne: "tu te présentes avec une dignité mature et une aura de compétence.",
  Verseau: "tu projettes une originalité et une indépendance qui te distinguent.",
  Poissons: "tu arrives dans le monde avec une douceur éthérée et une empathie visible.",
};

const ASC_EN: Record<string, string> = {
  Belier: "you arrive in the world with a direct, magnetic energy.",
  Taureau: "you present yourself with a calm, reassuring presence.",
  Gemeaux: "you project a lively, communicative and adaptable image.",
  Cancer: "you show yourself to the world with a protective, intuitive gentleness.",
  Lion: "you enter a room with a warm, luminous presence.",
  Vierge: "you present yourself with a discreet elegance and attentive intelligence.",
  Balance: "you project an image of harmony and natural grace.",
  Scorpion: "you arrive with a magnetic intensity that doesn't go unnoticed.",
  Sagittaire: "you radiate enthusiasm and a contagious open-mindedness.",
  Capricorne: "you present yourself with a mature dignity and an aura of competence.",
  Verseau: "you project an originality and independence that set you apart.",
  Poissons: "you arrive in the world with an ethereal gentleness and visible empathy.",
};

export function getCosmicPortraitSun(sign: string, locale: string = "fr"): string {
  const dict = locale === "en" ? SUN_EN : SUN_FR;
  const fallback = locale === "en" ? "colours your personality with a unique energy." : "colore ta personnalité d'une énergie unique.";
  return dict[sign] || fallback;
}

export function getCosmicPortraitMoon(sign: string, locale: string = "fr"): string {
  const dict = locale === "en" ? MOON_EN : MOON_FR;
  const fallback = locale === "en" ? "enriches your inner world with a unique dimension." : "enrichit ton monde intérieur d'une dimension unique.";
  return dict[sign] || fallback;
}

export function getCosmicPortraitAsc(sign: string, locale: string = "fr"): string {
  const dict = locale === "en" ? ASC_EN : ASC_FR;
  const fallback = locale === "en" ? "you present yourself to the world with a unique energy." : "tu te présentes au monde avec une énergie unique.";
  return dict[sign] || fallback;
}

// ─── Life Themes Generator ───────────────────────────────────────
export function getLifeThemes(chart: NatalChart, prenom: string, locale: string = "fr"): { icon: string; title: string; text: string }[] {
  const sun = chart.planets[0];
  const moon = chart.planets[1];
  const asc = chart.ascendant;
  const themes: { icon: string; title: string; text: string }[] = [];
  const isFr = locale === "fr";

  // Element dominance theme
  const elCount: Record<string, number> = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
  const elMap: Record<string, string> = {
    Belier: "Feu", Taureau: "Terre", Gemeaux: "Air", Cancer: "Eau",
    Lion: "Feu", Vierge: "Terre", Balance: "Air", Scorpion: "Eau",
    Sagittaire: "Feu", Capricorne: "Terre", Verseau: "Air", Poissons: "Eau",
  };
  const elNameEN: Record<string, string> = { Feu: "Fire", Terre: "Earth", Air: "Air", Eau: "Water" };
  chart.planets.forEach((p) => { if (elMap[p.sign]) elCount[elMap[p.sign]]++; });
  const dominant = Object.entries(elCount).sort((a, b) => b[1] - a[1])[0];

  const elThemesFR: Record<string, { title: string; text: string }> = {
    Feu: { title: "L'élan créateur", text: `${prenom}, ton thème est traversé par le Feu — l'énergie de l'action, de l'inspiration et du courage. Tu es fait·e pour initier, oser et rayonner.` },
    Terre: { title: "L'ancrage constructeur", text: `${prenom}, la Terre domine ton ciel — tu construis dans la durée, avec patience et réalisme. Ta force réside dans la capacité à matérialiser tes visions.` },
    Air: { title: "Le souffle des idées", text: `${prenom}, l'Air circule puissamment dans ta carte — pensée, communication, connexion. Tu es un·e tisseur·se de liens et d'idées.` },
    Eau: { title: "La profondeur émotionnelle", text: `${prenom}, l'Eau nourrit ton thème — intuition, empathie, profondeur. Tu perçois ce que d'autres ne voient pas, tu ressens ce que d'autres n'osent pas.` },
  };
  const elThemesEN: Record<string, { title: string; text: string }> = {
    Feu: { title: "The creative impulse", text: `${prenom}, your chart is infused with Fire — the energy of action, inspiration and courage. You are made to initiate, dare and shine.` },
    Terre: { title: "The grounding builder", text: `${prenom}, Earth dominates your sky — you build with patience and realism. Your strength lies in your ability to bring visions into reality.` },
    Air: { title: "The breath of ideas", text: `${prenom}, Air flows powerfully through your chart — thought, communication, connection. You are a weaver of links and ideas.` },
    Eau: { title: "Emotional depth", text: `${prenom}, Water nourishes your chart — intuition, empathy, depth. You perceive what others cannot see, you feel what others dare not.` },
  };
  const elThemes = isFr ? elThemesFR : elThemesEN;
  themes.push({ icon: "◆", ...elThemes[dominant[0]] });

  // Sun-Moon dynamic
  const sunEl = elMap[sun.sign] || "";
  const moonEl = elMap[moon.sign] || "";
  if (sunEl === moonEl) {
    themes.push({
      icon: "☯",
      title: isFr ? "Cohérence intérieure" : "Inner coherence",
      text: isFr
        ? `Ton Soleil et ta Lune partagent le même élément (${sunEl}) — une harmonie rare entre qui tu es et ce que tu ressens. Cette cohérence te donne une assurance naturelle.`
        : `Your Sun and Moon share the same element (${elNameEN[sunEl] || sunEl}) — a rare harmony between who you are and what you feel. This coherence gives you a natural confidence.`,
    });
  } else {
    themes.push({
      icon: "☯",
      title: isFr ? "La danse intérieure" : "The inner dance",
      text: isFr
        ? `Ton Soleil en ${sun.sign} et ta Lune en ${moon.sign} créent un dialogue entre ${sunEl} et ${moonEl}. Cette tension est créatrice — elle t'invite à intégrer deux facettes complémentaires de toi-même.`
        : `Your Sun in ${sun.sign} and your Moon in ${moon.sign} create a dialogue between ${elNameEN[sunEl] || sunEl} and ${elNameEN[moonEl] || moonEl}. This tension is creative — it invites you to integrate two complementary facets of yourself.`,
    });
  }

  // Ascendant theme
  if (asc) {
    themes.push({
      icon: "↑",
      title: isFr ? "Ton masque et ta mission" : "Your mask and your mission",
      text: isFr
        ? `Ton Ascendant ${asc.sign} est la porte par laquelle tu entres dans le monde. Il colore ta première impression et révèle la direction de croissance personnelle que la vie t'invite à explorer.`
        : `Your ${asc.sign} Ascendant is the door through which you enter the world. It colours your first impression and reveals the direction of personal growth that life invites you to explore.`,
    });
  }

  // Aspect pattern theme
  const squares = chart.aspects.filter((a) => a.type === "Carre").length;
  const trines = chart.aspects.filter((a) => a.type === "Trigone").length;
  if (squares >= 3) {
    themes.push({
      icon: "□",
      title: isFr ? "Les tensions qui forgent" : "Tensions that forge",
      text: isFr
        ? `Ton thème comporte plusieurs carrés — des tensions dynamiques qui sont tes plus grands moteurs de transformation. Ce qui résiste en toi est aussi ce qui te rend fort·e.`
        : `Your chart contains several squares — dynamic tensions that are your greatest engines of transformation. What resists within you is also what makes you strong.`,
    });
  } else if (trines >= 3) {
    themes.push({
      icon: "△",
      title: isFr ? "Les flux naturels" : "Natural flows",
      text: isFr
        ? `Les trigones abondent dans ta carte — des dons naturels, des facilités. Le défi sera de ne pas te reposer sur ces acquis mais de les mettre activement au service de ta croissance.`
        : `Trines abound in your chart — natural gifts, innate ease. The challenge will be not to rest on these strengths but to actively put them at the service of your growth.`,
    });
  } else {
    themes.push({
      icon: "✧",
      title: isFr ? "L'équilibre des forces" : "Balance of forces",
      text: isFr
        ? `Ton thème mêle harmonies et tensions de façon équilibrée — tu possèdes à la fois des talents naturels et des défis stimulants qui ensemble te poussent vers ta pleine expression.`
        : `Your chart blends harmonies and tensions in a balanced way — you possess both natural talents and stimulating challenges that together push you towards your full expression.`,
    });
  }

  return themes;
}

// ─── AI Chat Serialization ──────────────────────────────────────
export function serializeChartForAI(
  chart: NatalChart,
  form: { prenom: string; genre: Genre; jour: number; mois: number; annee: number; heure: number; minute: number; hasTime: boolean; lieu: string }
): string {
  const sun = chart.planets[0];
  const moon = chart.planets[1];
  const asc = chart.ascendant;

  const elMap: Record<string, string> = {
    Belier: "Feu", Taureau: "Terre", Gemeaux: "Air", Cancer: "Eau",
    Lion: "Feu", Vierge: "Terre", Balance: "Air", Scorpion: "Eau",
    Sagittaire: "Feu", Capricorne: "Terre", Verseau: "Air", Poissons: "Eau",
  };
  const elCount: Record<string, number> = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
  chart.planets.forEach((p) => { if (elMap[p.sign]) elCount[elMap[p.sign]]++; });
  const dominantEl = Object.entries(elCount).sort((a, b) => b[1] - a[1])[0][0];

  const lines = [
    `Prénom: ${form.prenom}`,
    `Genre: ${form.genre === "femme" ? "Femme" : form.genre === "homme" ? "Homme" : "Non-binaire"}`,
    `Naissance: ${form.jour}/${form.mois}/${form.annee}${form.hasTime ? ` à ${String(form.heure).padStart(2, "0")}h${String(form.minute).padStart(2, "0")}` : " (heure inconnue)"}`,
    `Lieu: ${form.lieu}`,
    ``,
    `Soleil: ${sun.sign} ${sun.degree}°${sun.house ? ` (Maison ${sun.house})` : ""}`,
    `Lune: ${moon.sign} ${moon.degree}°${moon.house ? ` (Maison ${moon.house})` : ""}`,
    ...(asc ? [`Ascendant: ${asc.sign} ${asc.degree}°`] : []),
    ``,
    `Planètes:`,
    ...chart.planets.slice(2).map((p) => `  ${p.name}: ${p.sign} ${p.degree}°${p.house ? ` (Maison ${p.house})` : ""}`),
    ``,
    `Élément dominant: ${dominantEl} (${elCount[dominantEl]} planètes)`,
    ``,
    `Aspects majeurs:`,
    ...chart.aspects.slice(0, 15).map((a) => `  ${a.planet1} ${a.type} ${a.planet2} (orbe ${a.orb}°)`),
  ];

  return lines.join("\n");
}
