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

/** Returns a gendered greeting: "Chère {name}" / "Cher {name}" / "{name}" */
export function getGreeting(prenom: string, genre: Genre): string {
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
export function getCosmicPortraitSun(sign: string): string {
  const t: Record<string, string> = {
    Belier: "illumine une nature audacieuse et pionnière. Tu portes en toi une énergie d'initiation — un besoin viscéral de tracer ta propre voie.",
    Taureau: "révèle une nature profondément ancrée et sensorielle. Tu construis avec patience, tu apprécies la beauté tangible du monde.",
    Gemeaux: "dévoile un esprit vif, curieux et multiple. Tu as soif d'apprendre, de connecter les idées, de communiquer.",
    Cancer: "baigne ta personnalité dans une sensibilité intuitive et protectrice. Tu ressens profondément les émotions — les tiennes et celles des autres.",
    Lion: "rayonne d'une chaleur naturelle et d'une générosité authentique. Tu as besoin de créer, de briller, d'inspirer.",
    Vierge: "affine ton regard sur le monde avec une précision et une intelligence analytique remarquables.",
    Balance: "cherche l'harmonie et la justesse dans chaque interaction. Tu possèdes un sens esthétique développé et une capacité rare à voir les deux côtés.",
    Scorpion: "plonge ta conscience dans les profondeurs de l'expérience humaine. Tu ne te contentes jamais de la surface.",
    Sagittaire: "ouvre grands les horizons de ta conscience. Tu es animé·e par une quête de sens, d'aventure et de vérité.",
    Capricorne: "ancre ta volonté dans la durée et la structure. Tu as une maturité naturelle et une ambition qui se mesure sur le long terme.",
    Verseau: "souffle un vent d'originalité et de vision. Tu penses au-delà des conventions, tu questionnes les normes.",
    Poissons: "dissout les frontières entre toi et le monde avec une empathie et une imagination sans limites.",
  };
  return t[sign] || "colore ta personnalité d'une énergie unique.";
}

export function getCosmicPortraitMoon(sign: string): string {
  const t: Record<string, string> = {
    Belier: "révèle un monde émotionnel spontané et direct. Tes réactions sont vives, ton besoin d'authenticité immédiat.",
    Taureau: "parle d'un besoin profond de stabilité et de douceur. Tu te ressources dans le confort et la sécurité du familier.",
    Gemeaux: "dépeint une vie intérieure animée et changeante. Tu as besoin de stimulation mentale pour te sentir en équilibre.",
    Cancer: "amplifie ta sensibilité naturelle et ton intuition. Tu ressens les ambiances comme un sismographe.",
    Lion: "met en lumière un besoin d'être vu·e et apprécié·e dans ton authenticité. Tu as un coeur généreux.",
    Vierge: "traduit un besoin d'ordre émotionnel et de clarté intérieure. Tu te ressources dans les routines et le sentiment d'utilité.",
    Balance: "aspire à l'harmonie relationnelle avant tout. Tu as besoin de beauté autour de toi et de relations équilibrées.",
    Scorpion: "révèle une vie émotionnelle d'une profondeur remarquable. La confiance se construit lentement chez toi.",
    Sagittaire: "colore ta vie émotionnelle d'optimisme et de soif de liberté. Tu as besoin d'espace pour ton équilibre.",
    Capricorne: "confère à tes émotions une maturité et une réserve qui cachent une grande profondeur.",
    Verseau: "donne à ta vie émotionnelle une qualité détachée et originale. Tu traites tes émotions avec une lucidité inhabituelle.",
    Poissons: "ouvre les portes d'une sensibilité sans frontières. Tu absorbes les émotions ambiantes comme une éponge.",
  };
  return t[sign] || "enrichit ton monde intérieur d'une dimension unique.";
}

export function getCosmicPortraitAsc(sign: string): string {
  const t: Record<string, string> = {
    Belier: "tu arrives dans le monde avec une énergie directe et magnétique.",
    Taureau: "tu te présentes au monde avec une présence calme et rassurante.",
    Gemeaux: "tu projettes une image vive, communicative et adaptable.",
    Cancer: "tu te montres au monde avec une douceur protectrice et intuitive.",
    Lion: "tu entres dans une pièce avec une présence chaude et lumineuse.",
    Vierge: "tu te présentes avec une élégance discrète et une intelligence attentive.",
    Balance: "tu projettes une image d'harmonie et de grâce naturelle.",
    Scorpion: "tu arrives avec une intensité magnétique qui ne passe pas inaperçue.",
    Sagittaire: "tu rayonnes d'un enthousiasme et d'une ouverture d'esprit contagieux.",
    Capricorne: "tu te présentes avec une dignité mature et une aura de compétence.",
    Verseau: "tu projettes une originalité et une indépendance qui te distinguent.",
    Poissons: "tu arrives dans le monde avec une douceur éthérée et une empathie visible.",
  };
  return t[sign] || "tu te présentes au monde avec une énergie unique.";
}

// ─── Life Themes Generator ───────────────────────────────────────
export function getLifeThemes(chart: NatalChart, prenom: string): { icon: string; title: string; text: string }[] {
  const sun = chart.planets[0];
  const moon = chart.planets[1];
  const asc = chart.ascendant;
  const themes: { icon: string; title: string; text: string }[] = [];

  // Element dominance theme
  const elCount: Record<string, number> = { Feu: 0, Terre: 0, Air: 0, Eau: 0 };
  const elMap: Record<string, string> = {
    Belier: "Feu", Taureau: "Terre", Gemeaux: "Air", Cancer: "Eau",
    Lion: "Feu", Vierge: "Terre", Balance: "Air", Scorpion: "Eau",
    Sagittaire: "Feu", Capricorne: "Terre", Verseau: "Air", Poissons: "Eau",
  };
  chart.planets.forEach((p) => { if (elMap[p.sign]) elCount[elMap[p.sign]]++; });
  const dominant = Object.entries(elCount).sort((a, b) => b[1] - a[1])[0];
  const elThemes: Record<string, { title: string; text: string }> = {
    Feu: { title: "L'élan créateur", text: `${prenom}, ton thème est traversé par le Feu — l'énergie de l'action, de l'inspiration et du courage. Tu es fait·e pour initier, oser et rayonner.` },
    Terre: { title: "L'ancrage constructeur", text: `${prenom}, la Terre domine ton ciel — tu construis dans la durée, avec patience et réalisme. Ta force réside dans la capacité à matérialiser tes visions.` },
    Air: { title: "Le souffle des idées", text: `${prenom}, l'Air circule puissamment dans ta carte — pensée, communication, connexion. Tu es un·e tisseur·se de liens et d'idées.` },
    Eau: { title: "La profondeur émotionnelle", text: `${prenom}, l'Eau nourrit ton thème — intuition, empathie, profondeur. Tu perçois ce que d'autres ne voient pas, tu ressens ce que d'autres n'osent pas.` },
  };
  themes.push({ icon: "◆", ...elThemes[dominant[0]] });

  // Sun-Moon dynamic
  const sunEl = elMap[sun.sign] || "";
  const moonEl = elMap[moon.sign] || "";
  if (sunEl === moonEl) {
    themes.push({ icon: "☯", title: "Cohérence intérieure", text: `Ton Soleil et ta Lune partagent le même élément (${sunEl}) — une harmonie rare entre qui tu es et ce que tu ressens. Cette cohérence te donne une assurance naturelle.` });
  } else {
    themes.push({ icon: "☯", title: "La danse intérieure", text: `Ton Soleil en ${sun.sign} et ta Lune en ${moon.sign} créent un dialogue entre ${sunEl} et ${moonEl}. Cette tension est créatrice — elle t'invite à intégrer deux facettes complémentaires de toi-même.` });
  }

  // Ascendant theme
  if (asc) {
    themes.push({ icon: "↑", title: "Ton masque et ta mission", text: `Ton Ascendant ${asc.sign} est la porte par laquelle tu entres dans le monde. Il colore ta première impression et révèle la direction de croissance personnelle que la vie t'invite à explorer.` });
  }

  // Aspect pattern theme
  const squares = chart.aspects.filter((a) => a.type === "Carre").length;
  const trines = chart.aspects.filter((a) => a.type === "Trigone").length;
  if (squares >= 3) {
    themes.push({ icon: "□", title: "Les tensions qui forgent", text: `Ton thème comporte plusieurs carrés — des tensions dynamiques qui sont tes plus grands moteurs de transformation. Ce qui résiste en toi est aussi ce qui te rend fort·e.` });
  } else if (trines >= 3) {
    themes.push({ icon: "△", title: "Les flux naturels", text: `Les trigones abondent dans ta carte — des dons naturels, des facilités. Le défi sera de ne pas te reposer sur ces acquis mais de les mettre activement au service de ta croissance.` });
  } else {
    themes.push({ icon: "✧", title: "L'équilibre des forces", text: `Ton thème mêle harmonies et tensions de façon équilibrée — tu possèdes à la fois des talents naturels et des défis stimulants qui ensemble te poussent vers ta pleine expression.` });
  }

  return themes;
}
