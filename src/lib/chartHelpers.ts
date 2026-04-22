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
  // Broader letter class covering accented Latin characters (é, è, à, î, ï…)
  // so that "animé·e" matches the pattern (\w does NOT match "é").
  const L = "[a-zA-ZÀ-ÖØ-öø-ÿ]";
  if (genre === "femme") {
    return text
      .replace(/eur·se\b/g, "euse")                             // "tisseur·se" → "tisseuse"
      .replace(/f·ve\b/g, "ve")                                 // "créatif·ve" → "créative"
      .replace(/un·e\b/g, "une")                                // "un·e" → "une"
      .replace(/\bfait·e\b/g, "faite")
      .replace(/\bfort·e\b/g, "forte")
      .replace(/\bvu·e\b/g, "vue")
      .replace(/\bné·e\b/g, "née")
      .replace(new RegExp(`(${L})·e\\b`, "g"), "$1e");          // "animé·e" → "animée"
  }
  // homme
  return text
    .replace(/un·e\b/g, "un")
    .replace(/eur·se\b/g, "eur")              // "tisseur·se" → "tisseur"
    .replace(/·ve\b/g, "")                    // "créatif·ve" → "créatif"
    .replace(/·e\b/g, "");                    // "animé·e" → "animé"
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
  Belier: "t'a donné un feu qui ne demande pas la permission. Tu sais, toi, quand il faut bouger — tu le sais dans le ventre avant de le savoir dans la tête. Ta grande question n'est pas *que faire* mais *comment ne pas te trahir quand tu ralentis*.",
  Taureau: "ancre ta présence dans le palpable. Tu as besoin de toucher, d'éprouver, de goûter avant de croire. Ce qui ressemble à de la lenteur chez toi est en fait une forme de fidélité au réel. Tu refuses ce qui se dépose trop vite.",
  Gemeaux: "te donne plusieurs voix à la fois. Tu passes d'une idée à l'autre comme on respire, et ça épuise les gens qui voudraient te fixer quelque part. Tu n'es pas dispersé·e — tu es en conversation avec le monde, tout le temps.",
  Cancer: "loge ton centre dans ta mémoire et ton ventre. Tu reconnais les lieux, les voix, les humeurs avant de les comprendre. Ton grand défi : savoir protéger ce que tu aimes sans te refermer dessus.",
  Lion: "te demande d'exister pleinement et d'être vu·e pour ce que tu es vraiment. Ce n'est pas de l'orgueil — c'est un besoin vital de laisser sortir la lumière qui pulse en toi. Quand tu te caches, tu tombes malade à l'intérieur.",
  Vierge: "aiguise ton regard jusqu'au détail qui compte. Tu vois ce que les autres ratent — la fissure, l'écart, l'usure. Ta tentation : croire qu'en corrigeant tout, enfin tu pourras te reposer. Tu ne le pourras pas. Apprends à poser l'outil.",
  Balance: "te place entre les deux — toujours entre deux personnes, deux options, deux vérités. Tu cherches l'accord, pas le compromis. Tu supportes mal les ambiances fausses. Ta difficulté : décider sans trahir un des camps.",
  Scorpion: "te descend dans ce que les autres préfèrent ignorer. Tu ne crois pas aux sourires qui cachent. Ce qui te libère, c'est de nommer — même ce qui fait peur, surtout ce qui fait peur. La surface te fatigue.",
  Sagittaire: "te tire vers plus grand que toi. Tu as besoin de sens, d'horizon, de quelque chose à viser. L'ennui t'est insupportable. Ta pente : t'enfuir quand ce qui est ici commence à peser trop.",
  Capricorne: "te donne une maturité précoce qui t'a sans doute coûté quelque chose d'enfance. Tu construis pour durer, tu ne brûles pas à vide. Mais attention : la réussite ne remplace pas la tendresse que tu ne t'accordes pas.",
  Verseau: "te met légèrement à côté, et c'est là ta force. Tu vois le collectif là où les autres voient leur propre histoire. Tu te méfies des chaleurs qui endorment. Tu préfères la lucidité, même quand elle coûte.",
  Poissons: "dissout les contours. Tu absorbes ce qui flotte autour de toi — les émotions, les atmosphères, les non-dits. Ton talent est aussi ton risque : savoir ce qui est à toi et ce qui vient d'ailleurs.",
};

const SUN_EN: Record<string, string> = {
  Belier: "gave you a fire that doesn't ask permission. You know, in your gut, when it's time to move — you know it before your head does. Your real question isn't *what to do* but *how to stay true to yourself when you slow down*.",
  Taureau: "anchors your presence in what can be touched. You need to handle, taste, weigh before you believe. What looks like slowness in you is actually fidelity to the real. You refuse what settles too fast.",
  Gemeaux: "gives you several voices at once. You move from one idea to the next the way others breathe, and it exhausts people who want to pin you down. You're not scattered — you're in conversation with the world, all the time.",
  Cancer: "sets your center in your memory and your belly. You recognize places, voices, moods before you understand them. Your real challenge: protecting what you love without closing around it.",
  Lion: "asks you to exist fully and to be seen for who you truly are. It's not vanity — it's a vital need to let out the light pulsing in you. When you hide, you get sick on the inside.",
  Vierge: "sharpens your eye to the detail that matters. You see what others miss — the crack, the gap, the wear. Your temptation: believing that if you fix everything, finally you'll be able to rest. You won't. Learn to put the tool down.",
  Balance: "places you between — always between two people, two options, two truths. You seek agreement, not compromise. You can't stand false atmospheres. Your difficulty: deciding without betraying one of the sides.",
  Scorpion: "takes you down into what others prefer to ignore. You don't trust smiles that cover. What frees you is naming — even what scares you, especially what scares you. Surface tires you out.",
  Sagittaire: "pulls you toward something larger than yourself. You need meaning, horizon, something to aim for. Boredom is unbearable to you. Your slope: fleeing when what's here starts weighing too much.",
  Capricorne: "gives you an early maturity that probably cost you some childhood. You build to last, you don't burn for nothing. But watch out: success doesn't replace the tenderness you don't grant yourself.",
  Verseau: "places you slightly off to the side, and that's your strength. You see the collective where others see their own story. You distrust warmths that lull. You prefer lucidity, even when it costs.",
  Poissons: "dissolves edges. You absorb what floats around you — emotions, atmospheres, unspokens. Your gift is also your risk: knowing what's yours and what came from elsewhere.",
};

const MOON_FR: Record<string, string> = {
  Belier: "t'a donné des émotions qui arrivent en premier, fortes, claires — et qui partent aussi vite. Tu ne rumines pas longtemps, tu agis ton émotion plus que tu ne la digères. Apprendre à rester dans le ressenti, même quand ça brûle, c'est ton travail.",
  Taureau: "a besoin de lenteur et de certitudes sensorielles. Tu te rassures par la chaleur d'une pièce, la voix de quelqu'un·e, un parfum connu. Le changement brusque te fait mal comme un courant d'air sur la peau.",
  Gemeaux: "a besoin de parler pour sentir. Ce que tu ne mets pas en mots reste flou pour toi — presque pas arrivé. Tu peux sembler froid·e parce que tu analyses en même temps que tu ressens. Tu n'es pas détaché·e, tu es en traduction permanente.",
  Cancer: "te fait absorber les humeurs des autres comme un buvard. Tu sais qui va mal en entrant dans la pièce. Tu as besoin d'un refuge — un lieu, une personne, un rituel — sinon tu t'épuises à contenir tout ce qui flotte.",
  Lion: "a besoin d'être vue. Pas flattée — vue. Quand quelqu'un·e te reconnaît vraiment, tu renais. Quand on passe à côté de toi, tu te mets à douter de ton existence même. C'est fort, mais c'est comme ça.",
  Vierge: "se rassure par l'utile. Tu aimes mieux avoir quelque chose à faire pour les autres qu'à recevoir pour toi. Ton angoisse intime : ne pas être à la hauteur de ce qui t'est confié. Apprends à poser, à déléguer, à imperfectionner.",
  Balance: "a besoin d'harmonie autour d'elle pour trouver la sienne. Les conflits te coûtent physiquement, tu les absorbes dans le corps. Ton défi : accepter d'être en désaccord sans croire que la relation va casser.",
  Scorpion: "descend vite dans le profond. Tu ne fais pas d'émotion à moitié. Tu aimes fort, tu en veux fort, tu pardonnes lentement. Ce qui te blesse va loin. Ce qui te nourrit aussi.",
  Sagittaire: "a besoin d'air et d'horizons pour respirer. Tu supportes mal les huis-clos émotionnels. L'humour te protège, mais attention à ne pas t'en servir pour fuir ce qui te touche vraiment.",
  Capricorne: "tient ses émotions à distance pour les gérer. Tu es souvent l'adulte de ta propre enfance. Quand tu cesses de tout tenir, tu découvres qu'on peut t'aimer aussi quand tu ne performes pas.",
  Verseau: "observe tes émotions comme quelqu'un·e d'un peu extérieur·e. Tu peux te trouver étrange — ressentir et analyser en même temps. Ce n'est pas un défaut. Tu as juste besoin de comprendre pour sentir en sécurité.",
  Poissons: "n'a pas de frontière claire. Tu ressens ce que les autres ressentent, parfois avant eux. Ta fatigue vient souvent de là — pas de toi, des autres que tu portes. Apprendre à décanter, c'est ta survie.",
};

const MOON_EN: Record<string, string> = {
  Belier: "gave you emotions that arrive first, strong, clear — and leave just as fast. You don't brood long, you act your emotion more than you digest it. Learning to stay in the feeling, even when it burns, is your work.",
  Taureau: "needs slowness and sensory certainty. You reassure yourself through the warmth of a room, someone's voice, a familiar scent. Sudden change hurts you like a draft on bare skin.",
  Gemeaux: "needs to speak to feel. What you don't put into words stays blurry — almost hasn't happened. You can seem cool because you analyze while you feel. You're not detached, you're in constant translation.",
  Cancer: "makes you absorb other people's moods like blotting paper. You know who's not well when you walk in. You need a refuge — a place, a person, a ritual — otherwise you exhaust yourself containing what floats around.",
  Lion: "needs to be seen. Not flattered — seen. When someone truly recognizes you, you come back to life. When you're passed over, you start doubting your own existence. It's strong, but it's how it is.",
  Vierge: "reassures itself through usefulness. You prefer having something to do for others over receiving for yourself. Your intimate fear: not being enough for what's entrusted to you. Learn to set down, to delegate, to un-perfect.",
  Balance: "needs harmony around to find its own. Conflicts cost you physically, you absorb them in the body. Your challenge: accepting disagreement without thinking the relationship will break.",
  Scorpion: "descends fast into the deep. You don't do emotion by halves. You love hard, you resent hard, you forgive slowly. What hurts you goes far. What feeds you too.",
  Sagittaire: "needs air and horizons to breathe. You handle emotional confinement badly. Humor protects you, but watch out not to use it to flee what actually touches you.",
  Capricorne: "keeps emotions at arm's length to manage them. You were often the adult of your own childhood. When you stop holding everything, you discover people can love you even when you don't perform.",
  Verseau: "observes your emotions a little from outside. You can find yourself strange — feeling and analyzing at once. It's not a flaw. You just need to understand to feel safe.",
  Poissons: "has no clear border. You feel what others feel, sometimes before they do. Your exhaustion often comes from there — not from you, from the others you carry. Learning to settle what's yours is your survival.",
};

const ASC_FR: Record<string, string> = {
  Belier: "tu entres dans une pièce comme si tu venais d'avoir une bonne idée. Les gens te remarquent, même sans que tu cherches. Ta difficulté : ralentir assez pour laisser les autres t'approcher.",
  Taureau: "tu apaises juste en arrivant. On te fait confiance avant même que tu aies parlé. Mais attention : cette présence calme peut attirer celleux qui cherchent à se poser sur toi sans te rencontrer vraiment.",
  Gemeaux: "tu parles avec les yeux, les mains, tout le corps. Tu attrapes l'ambiance d'une pièce en trois secondes. Les autres te trouvent vif·ve — certain·es pensent que tu ne t'arrêtes jamais. Iels se trompent : tu te poses, mais dans la parole.",
  Cancer: "tu arrives avec une douceur qui rassure et qui fait parler. Les gens te racontent leur vie au bout de cinq minutes. Garde ton énergie : tu n'es pas le dépotoir émotionnel de tout le monde.",
  Lion: "tu occupes l'espace sans le vouloir. Ton entrée se remarque. Tu souris en ouvrant les portes. Ce qu'on ne voit pas, c'est combien tu as besoin d'un vrai retour — pas des applaudissements, un vrai regard.",
  Vierge: "tu arrives discret·ète, observateur·trice, les détails en mémoire. On te prend parfois pour timide. Tu es juste en train d'évaluer. Ta grâce : une élégance qui ne cherche pas à être vue.",
  Balance: "tu arrives avec le réflexe de l'accord. Tu lis la pièce, tu ajustes ton ton, tu cherches l'équilibre. Ton risque : disparaître dans le miroir que tu offres aux autres. Apprends à exister en présence de leur désaccord.",
  Scorpion: "tu arrives et quelque chose se densifie autour de toi. Tu ne dis pas tout, et c'est ça qui intrigue. Les gens te sentent avant de te comprendre. Tu n'as pas besoin de te forcer pour avoir de la présence.",
  Sagittaire: "tu arrives avec un rire, une question, une histoire. Tu élargis l'espace pour les autres. On te suit volontiers. Attention juste : ton enthousiasme peut voiler que tu fuis parfois le silence.",
  Capricorne: "tu arrives avec une dignité qui impressionne — même les plus jeunes parmi vous. On te prend au sérieux. Ton travail à long terme : autoriser aussi la légèreté, sans y voir une perte de tenue.",
  Verseau: "tu arrives différemment. Il y a toujours un détail qui te distingue — un angle, un geste, une manière de répondre à côté. Tu attires celleux qui ont soif d'air, tu refroidis celleux qui cherchent du conforme.",
  Poissons: "tu arrives avec une présence floue, presque sans bords, et ça désarme. Les gens se laissent aller près de toi. Ton travail : rester tenu·e dans ton propre contour quand l'autre t'appelle à fondre.",
};

const ASC_EN: Record<string, string> = {
  Belier: "you enter a room like you just had a good idea. People notice, even when you don't try. Your difficulty: slowing down enough to let others approach.",
  Taureau: "you calm things just by arriving. People trust you before you've spoken. But careful — this still presence can attract those who want to lean on you without really meeting you.",
  Gemeaux: "you speak with your eyes, your hands, your whole body. You catch the mood of a room in three seconds. People find you quick — some think you never stop. They're wrong: you do rest, but in speech.",
  Cancer: "you arrive with a gentleness that reassures and makes people talk. They'll tell you their life in five minutes. Mind your energy: you're not everyone's emotional bin.",
  Lion: "you occupy space without meaning to. Your entrance shows. You smile through doors. What's not seen is how much you need real response — not applause, a real gaze.",
  Vierge: "you arrive discreet, observant, details in mind. People sometimes take you for shy. You're just assessing. Your grace: an elegance that doesn't ask to be seen.",
  Balance: "you arrive with the reflex of agreement. You read the room, adjust your tone, seek balance. Your risk: disappearing into the mirror you offer others. Learn to exist in the presence of their disagreement.",
  Scorpion: "you arrive and something densifies around you. You don't say everything, and that's what intrigues. People feel you before they understand you. You don't need to try for presence.",
  Sagittaire: "you arrive with a laugh, a question, a story. You widen the space for others. People follow you gladly. Just be careful: your enthusiasm can veil that you sometimes flee silence.",
  Capricorne: "you arrive with a dignity that impresses — even the younger ones among you. People take you seriously. Your long work: allowing yourself lightness too, without seeing it as lost composure.",
  Verseau: "you arrive differently. There's always a detail that sets you apart — an angle, a gesture, a sideways answer. You attract those hungry for air, you cool those who want the conforming.",
  Poissons: "you arrive with a blurred, almost borderless presence, and it disarms. People let go near you. Your work: staying held in your own outline when the other calls you to dissolve.",
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
