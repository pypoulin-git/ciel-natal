/* ------------------------------------------------------------------ */
/*  Bilingual zodiac sign data (FR / EN)                               */
/*  Source FR : original psychological astrology profiles               */
/*  Source EN : psychological astrology (Jung, Greene, Sasportas)       */
/* ------------------------------------------------------------------ */

export interface SignDataBilingual {
  slug: string;
  nameFr: string;
  nameEn: string;
  glyph: string;
  datesFr: string;
  datesEn: string;
  elementFr: string;
  elementEn: string;
  modalityFr: string;
  modalityEn: string;
  planetFr: string;
  planetEn: string;
  personality: { fr: string[]; en: string[] };
  strengths: { fr: string[]; en: string[] };
  challenges: { fr: string[]; en: string[] };
  love: { fr: string[]; en: string[] };
  work: { fr: string[]; en: string[] };
}

export const signs: Record<string, SignDataBilingual> = {
  /* ================================================================ */
  /*  BELIER / ARIES                                                   */
  /* ================================================================ */
  belier: {
    slug: "belier",
    nameFr: "Bélier",
    nameEn: "Aries",
    glyph: "♈",
    datesFr: "21 mars – 19 avril",
    datesEn: "March 21 – April 19",
    elementFr: "Feu",
    elementEn: "Fire",
    modalityFr: "Cardinal",
    modalityEn: "Cardinal",
    planetFr: "Mars",
    planetEn: "Mars",
    personality: {
      fr: [
        "Le Bélier incarne l\u2019archétype du pionnier, celui qui ouvre la voie dans un territoire encore inexploré. Premier signe du zodiaque, il porte en lui l\u2019énergie brute du commencement — cette pulsion de vie que Jung associait à la force instinctive du Soi cherchant à se manifester dans le monde. Le natif du Bélier ne demande pas la permission : il agit, il initie, il existe avec une intensité qui peut surprendre ou déstabiliser son entourage.",
        "Sur le plan psychologique, le Bélier traverse la vie avec une conscience aiguë de son individualité. Il a besoin de se confronter au monde pour se découvrir, un peu comme le héros mythologique qui ne connaît sa véritable nature qu\u2019au travers de l\u2019épreuve. Cette quête d\u2019affirmation n\u2019est pas de l\u2019arrogance — c\u2019est un processus fondamental d\u2019individuation où le courage et l\u2019authenticité servent de boussole.",
        "Liz Greene souligne que le Bélier porte souvent une colère créatrice, une énergie martienne qui, lorsqu\u2019elle est canalisée consciemment, devient une force de transformation remarquable. Le défi du Bélier est d\u2019apprendre à tempérer son impulsivité sans éteindre sa flamme, de trouver la patience sans renoncer à sa spontanéité vitale."
      ],
      en: [
        "Aries embodies the archetype of the pioneer — the one who blazes a trail into uncharted territory. As the first sign of the zodiac, Aries carries the raw energy of inception, that primal life-force which Jung associated with the instinctive thrust of the Self seeking to manifest in the world. The Aries native does not ask for permission: they act, they initiate, they exist with an intensity that can surprise or unsettle those around them.",
        "Psychologically, Aries moves through life with an acute awareness of their own individuality. They need to confront the world in order to discover themselves, much like the mythological hero who can only learn their true nature through ordeal. This drive toward self-assertion is not arrogance — it is a fundamental process of individuation in which courage and authenticity serve as the compass. Howard Sasportas noted that Mars, the ruling planet, represents the ego's will to separate from the undifferentiated matrix and claim its own existence.",
        "Liz Greene emphasizes that Aries often carries a creative anger, a Martian energy that, when channeled consciously, becomes a remarkable force for transformation. The shadow side of Aries emerges when impulsivity overrides reflection, when the need to act eclipses the wisdom of waiting. The mature Aries learns to temper their fire without extinguishing it — to find patience without surrendering their vital spontaneity."
      ],
    },
    strengths: {
      fr: [
        "Courage instinctif et capacité à agir dans l\u2019urgence",
        "Leadership naturel et force d\u2019initiative",
        "Authenticité désarmante et franchise directe",
        "Capacité de rebond exceptionnelle après un échec",
        "Énergie contagieuse qui entraîne les autres dans l\u2019action"
      ],
      en: [
        "Instinctive courage and the ability to act decisively under pressure",
        "Natural leadership and powerful initiative",
        "Disarming authenticity and direct honesty",
        "Exceptional resilience and capacity to bounce back after failure",
        "Contagious energy that galvanizes others into action"
      ],
    },
    challenges: {
      fr: [
        "Impatience qui peut saboter des projets à long terme",
        "Tendance à l\u2019impulsivité dans les décisions importantes",
        "Difficulté à considérer le point de vue de l\u2019autre dans le feu de l\u2019action",
        "Risque d\u2019épuisement par excès d\u2019engagement simultané"
      ],
      en: [
        "Impatience that can sabotage long-term projects",
        "A tendency toward impulsivity in significant decisions",
        "Difficulty considering others' perspectives in the heat of the moment",
        "Risk of burnout through excessive simultaneous commitments"
      ],
    },
    love: {
      fr: [
        "En amour, le Bélier est un partenaire passionné qui vit ses sentiments avec une intensité absolue. Il tombe amoureux comme il fait tout — entièrement, sans réserve, avec une candeur qui rappelle les premiers émois de l\u2019adolescence. Cette fraîcheur émotionnelle est à la fois sa plus grande force relationnelle et sa plus grande vulnérabilité.",
        "Le Bélier a besoin d\u2019un partenaire qui accepte son besoin d\u2019indépendance sans le vivre comme un rejet. La relation idéale pour lui est celle où deux individus forts cheminent côte à côte, se stimulant mutuellement, plutôt qu\u2019une fusion symbiotique qui étoufferait sa flamme intérieure. Quand il se sent libre d\u2019être lui-même, le Bélier déploie une loyauté et une générosité remarquables."
      ],
      en: [
        "In love, Aries is a passionate partner who experiences feelings with absolute intensity. They fall in love the way they do everything — wholly, without reserve, with a candor reminiscent of first adolescent infatuation. This emotional freshness is both their greatest relational strength and their deepest vulnerability.",
        "Aries needs a partner who accepts their need for independence without experiencing it as rejection. The ideal relationship is one where two strong individuals walk side by side, stimulating each other, rather than a symbiotic fusion that would smother their inner fire. When Aries feels free to be themselves, they reveal a loyalty and generosity that are truly remarkable."
      ],
    },
    work: {
      fr: [
        "Dans le travail, le Bélier excelle dans les rôles qui exigent de l\u2019initiative et une prise de décision rapide. Entrepreneur dans l\u2019âme, il préfère créer ses propres règles plutôt que de suivre celles des autres. Les environnements bureaucratiques et les hiérarchies rigides le dépriment profondément — il a besoin de sentir que son action a un impact direct et immédiat.",
        "Sa force professionnelle réside dans sa capacité à lancer des projets et à galvaniser une équipe autour d\u2019une vision. Son défi est d\u2019apprendre à déléguer la phase de consolidation, car sa nature le pousse déjà vers le prochain défi avant que le précédent ne soit pleinement achevé. Les métiers liés au sport, à la chirurgie, à l\u2019entrepreneuriat ou à la gestion de crise lui conviennent particulièrement."
      ],
      en: [
        "At work, Aries excels in roles that demand initiative and rapid decision-making. An entrepreneur at heart, they prefer to create their own rules rather than follow someone else's. Bureaucratic environments and rigid hierarchies profoundly depress them — they need to feel that their action has a direct and immediate impact.",
        "Their professional strength lies in their ability to launch projects and rally a team around a vision. Their challenge is learning to delegate the consolidation phase, as their nature pushes them toward the next challenge before the previous one is fully complete. Careers in sports, surgery, entrepreneurship, or crisis management suit them particularly well."
      ],
    },
  },

  /* ================================================================ */
  /*  TAUREAU / TAURUS                                                 */
  /* ================================================================ */
  taureau: {
    slug: "taureau",
    nameFr: "Taureau",
    nameEn: "Taurus",
    glyph: "♉",
    datesFr: "20 avril – 20 mai",
    datesEn: "April 20 – May 20",
    elementFr: "Terre",
    elementEn: "Earth",
    modalityFr: "Fixe",
    modalityEn: "Fixed",
    planetFr: "Vénus",
    planetEn: "Venus",
    personality: {
      fr: [
        "Le Taureau représente l\u2019archétype du bâtisseur, celui qui ancre dans la matière ce que le Bélier a initié. Gouverné par Vénus, il possède une relation profonde et sensuelle avec le monde physique — les textures, les saveurs, les sons, les parfums constituent son langage premier. Ce n\u2019est pas du matérialisme superficiel : c\u2019est une forme d\u2019intelligence incarnée, une sagesse du corps que notre culture hyper-cérébrale tend à sous-estimer.",
        "Sur le plan psychologique, le Taureau cherche la sécurité comme condition préalable à l\u2019épanouissement. Jung parlerait ici de la fonction sensation dans son expression la plus aboutie — cette capacité à être pleinement présent dans l\u2019instant, à accueillir la réalité telle qu\u2019elle est plutôt que telle qu\u2019on voudrait qu\u2019elle soit. Le Taureau sait, instinctivement, que les fondations doivent être solides avant de construire plus haut.",
        "Liz Greene observe que la force du Taureau réside dans sa constance, mais que cette même qualité peut se transformer en rigidité lorsqu\u2019elle n\u2019est pas intégrée consciemment. Le Taureau évolué est celui qui a appris à distinguer entre la persévérance légitime et l\u2019entêtement stérile, entre le besoin de stabilité et la peur du changement."
      ],
      en: [
        "Taurus represents the archetype of the builder — the one who grounds in matter what Aries initiated. Ruled by Venus, Taurus possesses a deep and sensual relationship with the physical world: textures, flavors, sounds, and fragrances form their primary language. This is not superficial materialism — it is a form of embodied intelligence, a wisdom of the body that our hyper-cerebral culture tends to undervalue.",
        "Psychologically, Taurus seeks security as a prerequisite for flourishing. Jung would speak here of the sensation function in its most refined expression — the capacity to be fully present in the moment, to receive reality as it is rather than as one might wish it to be. Taurus knows instinctively that foundations must be solid before one builds higher. Howard Sasportas described Venus in its Taurean expression as the psyche's deep need to feel substantiated, to know that existence has weight and worth.",
        "Liz Greene observes that the strength of Taurus lies in constancy, but that this same quality can harden into rigidity when it is not consciously integrated. The evolved Taurus has learned to distinguish between legitimate perseverance and sterile stubbornness, between the genuine need for stability and the fear of change that masquerades as faithfulness."
      ],
    },
    strengths: {
      fr: [
        "Fiabilité et constance qui inspirent la confiance",
        "Sens esthétique raffiné et goût naturel pour la beauté",
        "Patience et endurance dans les projets à long terme",
        "Pragmatisme ancré dans la réalité concrète",
        "Capacité à créer un environnement sécurisant pour les autres"
      ],
      en: [
        "Reliability and steadfastness that inspire trust",
        "Refined aesthetic sense and natural taste for beauty",
        "Patience and endurance in long-term endeavors",
        "Pragmatism firmly rooted in concrete reality",
        "Ability to create a secure and nurturing environment for others"
      ],
    },
    challenges: {
      fr: [
        "Résistance au changement qui peut devenir de l\u2019immobilisme",
        "Possessivité dans les relations affectives et matérielles",
        "Tendance à confondre sécurité et contrôle",
        "Difficulté à lâcher prise quand une situation a atteint son terme"
      ],
      en: [
        "Resistance to change that can calcify into inertia",
        "Possessiveness in emotional and material relationships",
        "A tendency to confuse security with control",
        "Difficulty letting go when a situation has run its course"
      ],
    },
    love: {
      fr: [
        "En amour, le Taureau offre une présence d\u2019une stabilité remarquable. Il aime avec son corps autant qu\u2019avec son cœur — le toucher, la proximité physique, les rituels partagés du quotidien constituent pour lui les preuves tangibles de l\u2019amour. Un dîner préparé avec soin, un cadeau choisi avec attention, un espace de vie aménagé ensemble : voilà son langage amoureux.",
        "Le défi relationnel du Taureau réside dans sa tendance à la possessivité. Quand la peur de perdre prend le dessus sur la confiance, il peut étouffer involontairement l\u2019autre par un excès de besoin fusionnel. Le Taureau en conscience apprend que l\u2019amour véritable n\u2019est pas une possession mais un jardin qui demande à la fois des soins constants et la liberté de croître."
      ],
      en: [
        "In love, Taurus offers a presence of remarkable stability. They love with the body as much as with the heart — touch, physical closeness, and the shared rituals of daily life constitute their tangible proof of love. A carefully prepared dinner, a thoughtfully chosen gift, a living space arranged together: this is their language of devotion.",
        "The relational challenge of Taurus lies in their tendency toward possessiveness. When the fear of loss overpowers trust, they may inadvertently suffocate the other through an excess of merging need. The conscious Taurus learns that true love is not a possession but a garden that requires both constant tending and the freedom to grow."
      ],
    },
    work: {
      fr: [
        "Dans le travail, le Taureau est un pilier de fiabilité. Il construit méthodiquement, pierre après pierre, avec une patience que les signes plus impétueux lui envient secrètement. Les professions liées à la finance, à l\u2019immobilier, à la gastronomie, à l\u2019artisanat d\u2019art ou à la musique résonnent profondément avec sa nature vénusienne.",
        "Sa force professionnelle est sa capacité à transformer une vision abstraite en réalité concrète et durable. Il excelle dans la gestion des ressources et sait instinctivement ce qui a de la valeur. Son défi est d\u2019accepter que parfois il faut détruire pour reconstruire mieux, que l\u2019adaptation n\u2019est pas une trahison mais une forme supérieure de fidélité à ses objectifs."
      ],
      en: [
        "At work, Taurus is a pillar of reliability. They build methodically, stone by stone, with a patience that the more impetuous signs secretly envy. Professions connected to finance, real estate, gastronomy, fine craftsmanship, or music resonate deeply with their Venusian nature.",
        "Their professional strength is the ability to transform an abstract vision into concrete, lasting reality. They excel at resource management and instinctively know what holds true value. Their challenge is accepting that sometimes one must tear down in order to rebuild better — that adaptation is not betrayal but a higher form of faithfulness to one's objectives."
      ],
    },
  },

  /* ================================================================ */
  /*  GEMEAUX / GEMINI                                                 */
  /* ================================================================ */
  gemeaux: {
    slug: "gemeaux",
    nameFr: "Gémeaux",
    nameEn: "Gemini",
    glyph: "♊",
    datesFr: "21 mai – 20 juin",
    datesEn: "May 21 – June 20",
    elementFr: "Air",
    elementEn: "Air",
    modalityFr: "Mutable",
    modalityEn: "Mutable",
    planetFr: "Mercure",
    planetEn: "Mercury",
    personality: {
      fr: [
        "Les Gémeaux incarnent l\u2019archétype du messager, de l\u2019intermédiaire entre les mondes. Gouvernés par Mercure, ils possèdent une intelligence vive et polymorphe qui se nourrit de connexions, de correspondances et de dialogues. Ce signe porte en lui la dualité fondamentale de la psyché humaine — le conscient et l\u2019inconscient, le rationnel et l\u2019intuitif, le moi social et le moi intime.",
        "Jung aurait reconnu dans les Gémeaux l\u2019expression de la fonction pensée dans sa forme la plus agile. Leur esprit ne fonctionne pas de manière linéaire mais par associations, rebonds et synthèses inattendues. Cette agilité mentale est souvent mal comprise comme de la superficialité, alors qu\u2019elle traduit en réalité une curiosité existentielle profonde — le besoin de comprendre le monde sous tous ses angles avant de se fixer.",
        "Liz Greene souligne que le travail psychologique des Gémeaux consiste à intégrer leurs multiples facettes en un tout cohérent, plutôt que de les vivre comme des fragments dispersés. Le Gémeaux évolué ne papillonne pas : il tisse un réseau de connaissances et d\u2019expériences qui forme une tapisserie riche et signifiante."
      ],
      en: [
        "Gemini embodies the archetype of the messenger, the intermediary between worlds. Ruled by Mercury, they possess a quick and polymorphic intelligence that thrives on connections, correspondences, and dialogue. This sign carries within it the fundamental duality of the human psyche — conscious and unconscious, rational and intuitive, the social self and the intimate self.",
        "Jung would have recognized in Gemini the expression of the thinking function in its most agile form. Their mind does not operate linearly but through associations, rebounds, and unexpected syntheses. This mental agility is often misunderstood as superficiality, when it actually reflects a deep existential curiosity — the need to comprehend the world from every angle before settling. Howard Sasportas described Mercury as the psyche's bridge-builder, connecting disparate realms of experience into communicable meaning.",
        "Liz Greene emphasizes that the psychological work of Gemini consists of integrating their multiple facets into a coherent whole, rather than living them as scattered fragments. The evolved Gemini does not flit aimlessly: they weave a network of knowledge and experiences that forms a rich and meaningful tapestry — a living map of the mind's endless terrain."
      ],
    },
    strengths: {
      fr: [
        "Intelligence adaptative et rapidité d\u2019apprentissage",
        "Don pour la communication sous toutes ses formes",
        "Polyvalence et capacité à jongler entre plusieurs projets",
        "Curiosité intellectuelle insatiable",
        "Humour vif et sens de la répartie qui désamorce les tensions"
      ],
      en: [
        "Adaptive intelligence and rapid learning ability",
        "A gift for communication in all its forms",
        "Versatility and the capacity to juggle multiple projects",
        "Insatiable intellectual curiosity",
        "Quick wit and sharp repartee that defuses tension"
      ],
    },
    challenges: {
      fr: [
        "Dispersion de l\u2019énergie entre trop d\u2019intérêts simultanés",
        "Difficulté à approfondir un sujet quand un nouveau apparaît",
        "Nervosité et agitation mentale sous stress",
        "Tendance à intellectualiser les émotions plutôt qu\u2019à les ressentir"
      ],
      en: [
        "Scattering of energy across too many simultaneous interests",
        "Difficulty deepening into a subject when a new one appears",
        "Nervousness and mental restlessness under stress",
        "A tendency to intellectualize emotions rather than feeling them"
      ],
    },
    love: {
      fr: [
        "En amour, les Gémeaux ont besoin avant tout d\u2019une stimulation intellectuelle. La séduction passe par les mots, les idées partagées, les conversations qui s\u2019étirent jusqu\u2019à l\u2019aube. Un partenaire qui les fait rire, qui les surprend, qui les challenge mentalement possède une clé d\u2019accès directe à leur cœur. Sans cette connexion cérébrale, même la plus forte attirance physique finit par s\u2019essouffler.",
        "Le défi amoureux des Gémeaux est d\u2019accepter la profondeur émotionnelle que la relation intime exige. Quand les conversations brillantes cèdent la place aux silences vulnérables, quand l\u2019intimité demande de montrer ses failles plutôt que ses talents, le Gémeaux peut ressentir l\u2019envie de fuir. Son apprentissage est de comprendre que la véritable connexion commence là où le verbe s\u2019arrête."
      ],
      en: [
        "In love, Gemini needs intellectual stimulation above all else. Seduction unfolds through words, shared ideas, and conversations that stretch until dawn. A partner who makes them laugh, who surprises them, who challenges them mentally holds a direct key to their heart. Without this cerebral connection, even the strongest physical attraction eventually runs out of breath.",
        "The romantic challenge of Gemini is accepting the emotional depth that intimate relationship demands. When brilliant conversations give way to vulnerable silences, when intimacy requires showing one's wounds rather than one's talents, Gemini may feel the urge to flee. Their apprenticeship is understanding that true connection begins where words fall silent — in the territory of feeling that Mercury alone cannot map."
      ],
    },
    work: {
      fr: [
        "Professionnellement, les Gémeaux brillent dans les métiers de la communication, du journalisme, de l\u2019enseignement, du commerce et des nouvelles technologies. Leur capacité à comprendre rapidement des domaines variés et à traduire des concepts complexes en langage accessible en fait des médiateurs et des vulgarisateurs hors pair.",
        "Leur force est leur adaptabilité — ils excellent dans les environnements changeants où la polyvalence est une nécessité. Leur défi est de développer la persévérance nécessaire pour mener un projet de bout en bout. Le Gémeaux accompli est celui qui a appris que la maîtrise véritable d\u2019un sujet vient de la profondeur, pas seulement de l\u2019étendue."
      ],
      en: [
        "Professionally, Gemini shines in communication, journalism, teaching, commerce, and new technologies. Their ability to quickly grasp diverse fields and translate complex concepts into accessible language makes them exceptional mediators and communicators.",
        "Their strength is adaptability — they excel in changing environments where versatility is a necessity. Their challenge is developing the perseverance to see a project through from beginning to end. The accomplished Gemini has learned that true mastery of a subject comes from depth, not merely from breadth."
      ],
    },
  },

  /* ================================================================ */
  /*  CANCER                                                           */
  /* ================================================================ */
  cancer: {
    slug: "cancer",
    nameFr: "Cancer",
    nameEn: "Cancer",
    glyph: "♋",
    datesFr: "21 juin – 22 juillet",
    datesEn: "June 21 – July 22",
    elementFr: "Eau",
    elementEn: "Water",
    modalityFr: "Cardinal",
    modalityEn: "Cardinal",
    planetFr: "Lune",
    planetEn: "Moon",
    personality: {
      fr: [
        "Le Cancer incarne l\u2019archétype de la Grande Mère, gardien du foyer intérieur et des mémoires ancestrales. Gouverné par la Lune, il possède une sensibilité émotionnelle d\u2019une profondeur rare, une capacité à percevoir les courants souterrains des relations humaines avec une acuité que les signes plus rationnels peinent à comprendre. Sa carapace n\u2019est pas un mur — c\u2019est une frontière nécessaire qui protège un monde intérieur d\u2019une richesse extraordinaire.",
        "Jung aurait reconnu dans le Cancer l\u2019expression la plus pure de l\u2019inconscient collectif dans sa dimension nourricière. Ce signe porte en lui la mémoire émotionnelle de sa lignée — les joies, les blessures, les schémas familiaux transmis de génération en génération. Le natif du Cancer ne vit pas seulement sa propre vie émotionnelle : il ressent, souvent inconsciemment, celle de tout son arbre généalogique.",
        "Liz Greene observe que le travail psychologique du Cancer consiste à distinguer entre ses propres émotions et celles qu\u2019il absorbe de son environnement. Quand cette différenciation est faite consciemment, le Cancer devient un guérisseur émotionnel d\u2019une puissance remarquable — quelqu\u2019un qui comprend la souffrance humaine de l\u2019intérieur et sait instinctivement comment la consoler."
      ],
      en: [
        "Cancer embodies the archetype of the Great Mother — guardian of the inner hearth and keeper of ancestral memories. Ruled by the Moon, Cancer possesses an emotional sensitivity of rare depth, an ability to perceive the underground currents of human relationships with an acuity that more rational signs struggle to comprehend. Their shell is not a wall — it is a necessary boundary protecting an inner world of extraordinary richness.",
        "Jung would have recognized in Cancer the purest expression of the collective unconscious in its nurturing dimension. This sign carries the emotional memory of their lineage — the joys, the wounds, the family patterns transmitted from generation to generation. The Cancer native does not merely live their own emotional life: they feel, often unconsciously, the emotional inheritance of their entire ancestral tree. Howard Sasportas described the Moon as the psychic container, the vessel that holds and processes experience before consciousness can name it.",
        "Liz Greene observes that the psychological work of Cancer consists of distinguishing between their own emotions and those they absorb from their environment. When this differentiation is made consciously, Cancer becomes an emotional healer of remarkable power — someone who understands human suffering from the inside and instinctively knows how to offer genuine consolation."
      ],
    },
    strengths: {
      fr: [
        "Empathie profonde et intelligence émotionnelle naturelle",
        "Instinct protecteur et capacité à créer un espace sécurisant",
        "Mémoire affective et loyauté indéfectible envers les proches",
        "Intuition remarquable dans la lecture des situations",
        "Créativité nourrie par un monde imaginaire riche"
      ],
      en: [
        "Deep empathy and natural emotional intelligence",
        "Protective instinct and ability to create a safe, nurturing space",
        "Emotional memory and unwavering loyalty toward loved ones",
        "Remarkable intuition in reading situations and unspoken dynamics",
        "Creativity nourished by a rich inner imaginative world"
      ],
    },
    challenges: {
      fr: [
        "Hypersensibilité qui peut mener au repli défensif",
        "Tendance à la rancune quand la blessure n\u2019est pas reconnue",
        "Difficulté à poser des limites claires avec les proches",
        "Attachement au passé qui peut freiner l\u2019évolution personnelle"
      ],
      en: [
        "Hypersensitivity that can lead to defensive withdrawal",
        "A tendency toward resentment when emotional wounds go unacknowledged",
        "Difficulty setting clear boundaries with those closest to them",
        "Attachment to the past that can hinder personal evolution"
      ],
    },
    love: {
      fr: [
        "En amour, le Cancer offre une dévotion d\u2019une profondeur océanique. Il construit le nid, nourrit la relation de petites attentions quotidiennes, se souvient de chaque date importante, de chaque confidence murmurée. Son amour s\u2019exprime par le soin — préparer un repas quand l\u2019autre est fatigué, anticiper un besoin avant qu\u2019il ne soit formulé, créer un cocon de douceur dans un monde perçu comme hostile.",
        "Le défi amoureux du Cancer est de ne pas confondre amour et dépendance. Sa peur profonde de l\u2019abandon peut le conduire à s\u2019accrocher à des relations qui ne le nourrissent plus, ou à utiliser le soin comme un moyen inconscient de rendre l\u2019autre redevable. Le Cancer évolué apprend que le véritable amour inclut la capacité de laisser l\u2019autre être libre, même si cette liberté génère de l\u2019anxiété."
      ],
      en: [
        "In love, Cancer offers a devotion of oceanic depth. They build the nest, nourish the relationship with small daily attentions, remember every important date, every whispered confidence. Their love expresses itself through care — preparing a meal when the other is exhausted, anticipating a need before it is spoken, creating a cocoon of tenderness in a world perceived as hostile.",
        "The romantic challenge of Cancer is not to confuse love with dependence. Their deep fear of abandonment can lead them to cling to relationships that no longer nourish them, or to use caregiving as an unconscious means of making the other indebted. The evolved Cancer learns that true love includes the capacity to let the other be free, even when that freedom generates anxiety."
      ],
    },
    work: {
      fr: [
        "Professionnellement, le Cancer excelle dans les métiers du soin, de l\u2019éducation, de la psychologie, de l\u2019hôtellerie et de l\u2019alimentation. Son instinct nourricier se déploie aussi dans l\u2019immobilier, la décoration intérieure ou toute profession qui consiste à créer des environnements accueillants et sécurisants pour les autres.",
        "Sa force au travail est sa capacité à fédérer une équipe par l\u2019affect — les collaborateurs du Cancer se sentent vus et valorisés. Son défi est de ne pas prendre les conflits professionnels trop personnellement et d\u2019apprendre que les critiques constructives ne sont pas des attaques contre sa personne. Quand il trouve cet équilibre, le Cancer devient un manager profondément humain et efficace."
      ],
      en: [
        "Professionally, Cancer excels in caregiving, education, psychology, hospitality, and food-related fields. Their nurturing instinct also unfolds in real estate, interior design, or any profession that involves creating welcoming, secure environments for others.",
        "Their strength at work is their ability to unite a team through emotional connection — Cancer's colleagues feel seen and valued. Their challenge is not to take professional conflicts too personally and to learn that constructive criticism is not an attack on their person. When they find this balance, Cancer becomes a deeply humane and effective manager."
      ],
    },
  },

  /* ================================================================ */
  /*  LION / LEO                                                       */
  /* ================================================================ */
  lion: {
    slug: "lion",
    nameFr: "Lion",
    nameEn: "Leo",
    glyph: "♌",
    datesFr: "23 juillet – 22 août",
    datesEn: "July 23 – August 22",
    elementFr: "Feu",
    elementEn: "Fire",
    modalityFr: "Fixe",
    modalityEn: "Fixed",
    planetFr: "Soleil",
    planetEn: "Sun",
    personality: {
      fr: [
        "Le Lion incarne l\u2019archétype du souverain intérieur, celui qui a trouvé — ou cherche — la connexion avec son centre vital. Gouverné par le Soleil, il rayonne naturellement, non par narcissisme mais par fidélité à une force créatrice qui demande à s\u2019exprimer. Le Lion vit avec l\u2019intuition profonde que chaque être humain possède une lumière unique et que le véritable courage consiste à la laisser briller sans s\u2019excuser.",
        "Jung verrait dans le Lion l\u2019expression du processus d\u2019individuation dans sa phase solaire — ce moment où le moi conscient s\u2019aligne avec le Soi profond et trouve sa voix authentique. Le natif du Lion ne cherche pas les applaudissements pour eux-mêmes : il a besoin du regard de l\u2019autre comme miroir, comme confirmation que sa lumière intérieure est bien réelle et qu\u2019elle éclaire le monde autour de lui.",
        "Liz Greene note que le Lion porte une blessure secrète : la peur de n\u2019être pas assez. Derrière la générosité apparente et l\u2019assurance solaire se cache parfois un enfant intérieur qui doute de sa valeur fondamentale. Le travail psychologique du Lion est de passer de la recherche d\u2019approbation extérieure à une reconnaissance intérieure de sa propre dignité — un rayonnement qui ne dépend plus de l\u2019applaudimètre."
      ],
      en: [
        "Leo embodies the archetype of the inner sovereign — the one who has found, or seeks, the connection with their vital center. Ruled by the Sun, Leo radiates naturally, not from narcissism but from fidelity to a creative force that demands expression. Leo lives with the deep intuition that every human being possesses a unique light and that true courage consists of letting it shine without apology.",
        "Jung would see in Leo the expression of the individuation process in its solar phase — that moment when the conscious ego aligns with the deeper Self and finds its authentic voice. The Leo native does not seek applause for its own sake: they need the gaze of the other as a mirror, as confirmation that their inner light is truly real and that it illuminates the world around them. As Howard Sasportas noted, the Sun in the chart represents the hero's journey toward becoming who one truly is.",
        "Liz Greene observes that Leo carries a secret wound: the fear of not being enough. Behind the apparent generosity and solar confidence sometimes hides an inner child who doubts their fundamental worth. The psychological work of Leo is to move from the search for external approval to an inner recognition of their own dignity — a radiance that no longer depends on the applause meter."
      ],
    },
    strengths: {
      fr: [
        "Générosité naturelle et grandeur d\u2019âme",
        "Charisme et capacité à inspirer la confiance",
        "Créativité flamboyante et sens du spectacle",
        "Loyauté féroce envers ceux qu\u2019il aime",
        "Courage d\u2019être soi-même dans un monde conformiste"
      ],
      en: [
        "Natural generosity and greatness of spirit",
        "Charisma and the ability to inspire trust",
        "Flamboyant creativity and a flair for the dramatic",
        "Fierce loyalty toward those they love",
        "The courage to be oneself in a conformist world"
      ],
    },
    challenges: {
      fr: [
        "Besoin excessif de reconnaissance et de validation",
        "Orgueil blessé qui peut se transformer en tyrannie",
        "Difficulté à accepter des rôles secondaires quand la situation l\u2019exige",
        "Tendance au drame émotionnel quand il se sent ignoré"
      ],
      en: [
        "An excessive need for recognition and validation",
        "Wounded pride that can turn into tyranny",
        "Difficulty accepting secondary roles when the situation demands it",
        "A tendency toward emotional drama when feeling overlooked"
      ],
    },
    love: {
      fr: [
        "En amour, le Lion est un partenaire d\u2019une générosité spectaculaire. Il aime avec panache — les grandes déclarations, les gestes romantiques, les surprises élaborées font partie de son répertoire naturel. Pour lui, la relation amoureuse est une scène sur laquelle deux êtres se célèbrent mutuellement, un espace où chacun brille de sa lumière propre.",
        "Le défi amoureux du Lion est d\u2019apprendre que l\u2019amour véritable inclut aussi les moments sans éclat — les matins difficiles, les compromis silencieux, les périodes où l\u2019autre a besoin d\u2019attention alors que le Lion traverse sa propre nuit. Quand il accepte que la vulnérabilité est une forme supérieure de courage, le Lion découvre une intimité d\u2019une profondeur qu\u2019il ne soupçonnait pas."
      ],
      en: [
        "In love, Leo is a partner of spectacular generosity. They love with panache — grand declarations, romantic gestures, and elaborate surprises are part of their natural repertoire. For Leo, the romantic relationship is a stage upon which two beings celebrate each other, a space where each shines with their own light.",
        "Leo's romantic challenge is learning that true love also includes the moments without glamour — difficult mornings, silent compromises, periods when the other needs attention while Leo is traversing their own dark night. When they accept that vulnerability is a higher form of courage, Leo discovers an intimacy of a depth they never suspected."
      ],
    },
    work: {
      fr: [
        "Dans le travail, le Lion excelle naturellement dans les positions de leadership, les arts, le spectacle, la direction créative et l\u2019entrepreneuriat. Il a besoin de sentir que son travail compte, qu\u2019il laisse une empreinte. Les rôles anonymes et les tâches routinières l\u2019éteignent aussi sûrement que l\u2019eau éteint le feu.",
        "Sa force professionnelle est sa capacité à mobiliser et à inspirer une équipe autour d\u2019une vision ambitieuse. Son défi est d\u2019apprendre que le vrai leadership inclut l\u2019humilité de reconnaître les contributions des autres et la sagesse de partager le mérite. Le Lion qui a intégré cette leçon devient un leader véritablement solaire — il élève les autres au lieu de simplement briller au-dessus d\u2019eux."
      ],
      en: [
        "At work, Leo naturally excels in leadership positions, the arts, entertainment, creative direction, and entrepreneurship. They need to feel that their work matters, that it leaves a mark. Anonymous roles and routine tasks extinguish them as surely as water extinguishes fire.",
        "Their professional strength is the ability to mobilize and inspire a team around an ambitious vision. Their challenge is learning that true leadership includes the humility to recognize others' contributions and the wisdom to share credit. The Leo who has integrated this lesson becomes a truly solar leader — one who elevates others rather than merely shining above them."
      ],
    },
  },

  /* ================================================================ */
  /*  VIERGE / VIRGO                                                   */
  /* ================================================================ */
  vierge: {
    slug: "vierge",
    nameFr: "Vierge",
    nameEn: "Virgo",
    glyph: "♍",
    datesFr: "23 août – 22 septembre",
    datesEn: "August 23 – September 22",
    elementFr: "Terre",
    elementEn: "Earth",
    modalityFr: "Mutable",
    modalityEn: "Mutable",
    planetFr: "Mercure",
    planetEn: "Mercury",
    personality: {
      fr: [
        "La Vierge incarne l\u2019archétype de l\u2019analyste sacré, celui qui discerne l\u2019ordre dans le chaos et cherche à perfectionner la matière par l\u2019intelligence. Gouvernée par Mercure dans sa fonction analytique, elle possède un regard d\u2019une précision extraordinaire — elle voit ce que les autres ne voient pas, les détails qui font la différence, les failles invisibles dans un système apparemment parfait.",
        "Jung reconnaîtrait dans la Vierge l\u2019expression de la fonction pensée appliquée au concret, cette capacité à discriminer, à trier, à organiser l\u2019expérience en catégories signifiantes. Mais la Vierge est bien plus qu\u2019un esprit analytique : elle porte en elle un idéal de pureté et d\u2019intégrité qui donne à son travail quotidien une dimension quasi rituelle. Chaque tâche accomplie avec soin est un acte de dévotion.",
        "Liz Greene souligne que la blessure centrale de la Vierge est le sentiment de n\u2019être jamais assez — assez compétente, assez ordonnée, assez digne. Cette autocritique impitoyable, quand elle est conscientisée, devient un extraordinaire moteur de croissance personnelle. La Vierge évoluée a appris que la perfection n\u2019est pas un objectif mais un processus, et que l\u2019imperfection elle-même possède une beauté que seul un regard vraiment affiné peut percevoir."
      ],
      en: [
        "Virgo embodies the archetype of the sacred analyst — the one who discerns order within chaos and seeks to refine matter through intelligence. Ruled by Mercury in its analytical function, Virgo possesses an eye of extraordinary precision: they see what others miss, the details that make the difference, the invisible flaws in an apparently perfect system.",
        "Jung would recognize in Virgo the expression of the thinking function applied to the concrete — that capacity to discriminate, to sort, to organize experience into meaningful categories. But Virgo is far more than an analytical mind: they carry within them an ideal of purity and integrity that gives their daily work an almost ritual dimension. Each task carefully completed is an act of devotion. Howard Sasportas described Virgo's Mercury as the craftsman's hand guided by the soul's aspiration toward wholeness.",
        "Liz Greene emphasizes that Virgo's central wound is the feeling of never being enough — competent enough, organized enough, worthy enough. This merciless self-criticism, when brought to consciousness, becomes an extraordinary engine of personal growth. The evolved Virgo has learned that perfection is not a destination but a process, and that imperfection itself possesses a beauty that only a truly refined gaze can perceive."
      ],
    },
    strengths: {
      fr: [
        "Esprit analytique d\u2019une précision remarquable",
        "Fiabilité et sens du service authentique",
        "Humilité et capacité d\u2019amélioration continue",
        "Intelligence pratique et efficacité organisationnelle",
        "Discernement qui distingue l\u2019essentiel du superflu"
      ],
      en: [
        "An analytical mind of remarkable precision",
        "Reliability and a genuine sense of service",
        "Humility and a capacity for continuous self-improvement",
        "Practical intelligence and organizational efficiency",
        "Discernment that separates the essential from the superfluous"
      ],
    },
    challenges: {
      fr: [
        "Perfectionnisme qui peut paralyser l\u2019action",
        "Autocritique excessive et sentiment d\u2019insuffisance chronique",
        "Tendance à se perdre dans les détails au détriment de la vision globale",
        "Difficulté à recevoir de l\u2019aide et à déléguer"
      ],
      en: [
        "Perfectionism that can paralyze action",
        "Excessive self-criticism and a chronic sense of inadequacy",
        "A tendency to lose oneself in details at the expense of the bigger picture",
        "Difficulty receiving help and delegating to others"
      ],
    },
    love: {
      fr: [
        "En amour, la Vierge est un partenaire d\u2019une attention rare. Son amour s\u2019exprime par les gestes concrets du quotidien — réparer ce qui est cassé, anticiper un besoin pratique, se souvenir d\u2019un détail insignifiant qui révèle une écoute profonde. Elle ne fait pas de grandes déclarations romantiques, mais sa présence attentive est un cadeau inestimable pour qui sait le reconnaître.",
        "Le défi amoureux de la Vierge est de désarmer son regard critique dans l\u2019intimité. Quand elle analyse son partenaire avec le même niveau d\u2019exigence qu\u2019elle s\u2019applique à elle-même, la relation peut devenir un espace d\u2019évaluation permanente plutôt qu\u2019un refuge. Son apprentissage est de découvrir que l\u2019amour véritable n\u2019a pas besoin d\u2019être parfait pour être réel — et que la tendresse commence là où le jugement s\u2019arrête."
      ],
      en: [
        "In love, Virgo is a partner of rare attentiveness. Their love expresses itself through the concrete gestures of daily life — fixing what is broken, anticipating a practical need, remembering an insignificant detail that reveals deep listening. They do not make grand romantic declarations, but their attentive presence is a priceless gift for those who know how to recognize it.",
        "Virgo's romantic challenge is to disarm their critical gaze in intimacy. When they analyze their partner with the same level of rigor they apply to themselves, the relationship can become a space of permanent evaluation rather than a refuge. Their apprenticeship is discovering that true love does not need to be perfect to be real — and that tenderness begins where judgment falls silent."
      ],
    },
    work: {
      fr: [
        "Professionnellement, la Vierge excelle dans les métiers qui exigent de la rigueur, de l\u2019analyse et un souci du détail : santé, recherche, édition, comptabilité, artisanat de précision, qualité et audit. Elle est l\u2019architecte invisible des systèmes qui fonctionnent — celle qui s\u2019assure que chaque rouage est à sa place.",
        "Sa force est sa capacité à optimiser n\u2019importe quel processus et à maintenir des standards d\u2019excellence élevés. Son défi est d\u2019apprendre que le « suffisamment bon » existe, et qu\u2019un projet imparfait mais livré vaut toujours mieux qu\u2019un projet parfait mais éternellement en chantier. La Vierge accomplie sait quand le détail compte et quand il faut savoir s\u2019arrêter."
      ],
      en: [
        "Professionally, Virgo excels in fields demanding rigor, analysis, and attention to detail: healthcare, research, editing, accounting, precision craftsmanship, quality assurance, and auditing. They are the invisible architect of systems that work — the one who ensures every cog is in its place.",
        "Their strength is the capacity to optimize any process and maintain high standards of excellence. Their challenge is learning that 'good enough' exists, and that an imperfect but delivered project is always worth more than a perfect one eternally under construction. The accomplished Virgo knows when detail matters and when it is time to stop refining."
      ],
    },
  },

  /* ================================================================ */
  /*  BALANCE / LIBRA                                                  */
  /* ================================================================ */
  balance: {
    slug: "balance",
    nameFr: "Balance",
    nameEn: "Libra",
    glyph: "♎",
    datesFr: "23 septembre – 22 octobre",
    datesEn: "September 23 – October 22",
    elementFr: "Air",
    elementEn: "Air",
    modalityFr: "Cardinal",
    modalityEn: "Cardinal",
    planetFr: "Vénus",
    planetEn: "Venus",
    personality: {
      fr: [
        "La Balance incarne l\u2019archétype du médiateur, de l\u2019artisan de l\u2019harmonie qui cherche l\u2019équilibre entre les polarités. Gouvernée par Vénus dans sa dimension intellectuelle et esthétique, elle perçoit la beauté et la discordance avec une acuité saisissante. Ce n\u2019est pas de la frivolité — c\u2019est une intelligence relationnelle profonde, une conscience aiguë que la qualité de nos liens détermine la qualité de notre existence.",
        "Jung verrait dans la Balance l\u2019expression du processus d\u2019individuation dans sa phase relationnelle — ce moment où le moi ne peut se connaître qu\u2019à travers le miroir de l\u2019autre. Le natif de la Balance ne fuit pas le conflit par lâcheté : il cherche une résolution qui honore les deux parties, une synthèse qui transcende l\u2019opposition. Cette quête d\u2019équilibre est un acte créatif, pas un compromis mou.",
        "Liz Greene observe que la difficulté centrale de la Balance réside dans sa relation avec sa propre agressivité. Éduquée à plaire et à harmoniser, elle peut refouler ses désirs authentiques au profit d\u2019une paix superficielle. Le travail psychologique de la Balance est d\u2019apprendre que le vrai équilibre inclut la capacité de dire non, de déplaire, de choisir un camp — et que cette affirmation, loin de détruire l\u2019harmonie, la rend plus authentique."
      ],
      en: [
        "Libra embodies the archetype of the mediator — the artisan of harmony who seeks equilibrium between polarities. Ruled by Venus in its intellectual and aesthetic dimension, Libra perceives beauty and discord with striking acuity. This is not frivolity — it is a deep relational intelligence, an acute awareness that the quality of our bonds determines the quality of our existence.",
        "Jung would see in Libra the expression of the individuation process in its relational phase — that moment when the ego can only know itself through the mirror of the other. The Libra native does not flee conflict out of cowardice: they seek a resolution that honors both sides, a synthesis that transcends opposition. This quest for balance is a creative act, not a limp compromise. Howard Sasportas described Venus in Libra as the psyche's longing for the divine symmetry it dimly remembers.",
        "Liz Greene observes that Libra's central difficulty lies in their relationship with their own aggression. Trained to please and harmonize, they can repress their authentic desires in favor of a superficial peace. The psychological work of Libra is learning that true balance includes the capacity to say no, to displease, to take a side — and that this assertion, far from destroying harmony, makes it more authentic."
      ],
    },
    strengths: {
      fr: [
        "Intelligence relationnelle et diplomatie naturelle",
        "Sens esthétique raffiné dans tous les domaines de la vie",
        "Capacité à voir les deux côtés d\u2019une situation",
        "Élégance et grâce dans la résolution de conflits",
        "Sens profond de la justice et de l\u2019équité"
      ],
      en: [
        "Relational intelligence and natural diplomacy",
        "Refined aesthetic sense across all domains of life",
        "The ability to see both sides of a situation",
        "Elegance and grace in conflict resolution",
        "A deep sense of justice and fairness"
      ],
    },
    challenges: {
      fr: [
        "Indécision paralysante face aux choix importants",
        "Tendance à sacrifier ses besoins pour maintenir la paix",
        "Difficulté à assumer des positions impopulaires",
        "Dépendance excessive à l\u2019approbation de l\u2019entourage"
      ],
      en: [
        "Paralyzing indecision when facing important choices",
        "A tendency to sacrifice personal needs to maintain peace",
        "Difficulty taking unpopular positions",
        "Excessive dependence on the approval of those around them"
      ],
    },
    love: {
      fr: [
        "En amour, la Balance est le signe le plus fondamentalement relationnel du zodiaque. Elle s\u2019épanouit dans le couple comme une fleur dans la lumière — la présence de l\u2019autre éveille en elle des facettes de sa personnalité qui resteraient dormantes dans la solitude. Elle élève la relation au rang d\u2019art, soignant l\u2019esthétique du quotidien, cultivant les rituels de connexion, créant un espace de beauté partagée.",
        "Le défi amoureux de la Balance est de ne pas se perdre dans l\u2019autre. Sa capacité d\u2019adaptation peut devenir un caméléonisme relationnel où elle adopte les goûts, les opinions et les désirs de son partenaire au détriment des siens. La Balance évoluée comprend que le véritable partenariat exige deux individus complets, et que le plus beau cadeau qu\u2019elle puisse offrir à l\u2019autre est une version pleinement assumée d\u2019elle-même."
      ],
      en: [
        "In love, Libra is the most fundamentally relational sign of the zodiac. They blossom within partnership as a flower in sunlight — the presence of the other awakens facets of their personality that would remain dormant in solitude. They elevate the relationship to the level of art, tending to the aesthetics of everyday life, cultivating rituals of connection, creating a space of shared beauty.",
        "Libra's romantic challenge is not to lose themselves in the other. Their capacity for adaptation can become a relational chameleonism in which they adopt the tastes, opinions, and desires of their partner at the expense of their own. The evolved Libra understands that true partnership requires two complete individuals, and that the most beautiful gift they can offer the other is a fully self-possessed version of themselves."
      ],
    },
    work: {
      fr: [
        "Professionnellement, la Balance excelle dans les métiers liés au droit, à la médiation, à la diplomatie, au design, aux relations publiques et au conseil en image. Partout où il faut créer de l\u2019harmonie entre des éléments disparates, sa présence est précieuse. Elle possède un talent naturel pour transformer les environnements de travail conflictuels en espaces de collaboration productive.",
        "Sa force est sa capacité à maintenir des relations professionnelles de qualité et à négocier des accords qui satisfont toutes les parties. Son défi est de prendre des décisions tranchées quand la situation l\u2019exige et d\u2019accepter que certains conflits sont nécessaires pour avancer. La Balance accomplie sait que la justice véritable n\u2019est pas toujours symétrique."
      ],
      en: [
        "Professionally, Libra excels in fields related to law, mediation, diplomacy, design, public relations, and image consulting. Wherever harmony must be created between disparate elements, their presence is invaluable. They possess a natural talent for transforming conflictual work environments into spaces of productive collaboration.",
        "Their strength is the ability to maintain high-quality professional relationships and negotiate agreements that satisfy all parties. Their challenge is making decisive choices when the situation demands it and accepting that some conflicts are necessary for progress. The accomplished Libra knows that true justice is not always symmetrical."
      ],
    },
  },

  /* ================================================================ */
  /*  SCORPION / SCORPIO                                               */
  /* ================================================================ */
  scorpion: {
    slug: "scorpion",
    nameFr: "Scorpion",
    nameEn: "Scorpio",
    glyph: "♏",
    datesFr: "23 octobre – 21 novembre",
    datesEn: "October 23 – November 21",
    elementFr: "Eau",
    elementEn: "Water",
    modalityFr: "Fixe",
    modalityEn: "Fixed",
    planetFr: "Pluton/Mars",
    planetEn: "Pluto/Mars",
    personality: {
      fr: [
        "Le Scorpion incarne l\u2019archétype de la mort et de la renaissance, du phénix qui doit traverser les ténèbres pour renaître transformé. Gouverné par Pluton et Mars, il possède une intensité psychique qui le conduit naturellement vers les profondeurs — les tabous, les secrets, les vérités que la société préfère enfouir sous le vernis de la politesse. Le Scorpion ne survole pas l\u2019existence : il la pénètre, la démonte, l\u2019interroge jusqu\u2019à l\u2019os.",
        "Jung reconnaîtrait dans le Scorpion l\u2019archétype de la descente dans l\u2019ombre — cette confrontation volontaire avec les aspects refoulés de la psyché qui est au cœur du processus d\u2019individuation. Le natif du Scorpion comprend instinctivement que la lumière sans l\u2019ombre est aveuglante, que la vérité sans la douleur est incomplète. Cette sagesse sombre lui confère une authenticité rare et parfois dérangeante.",
        "Liz Greene observe que le Scorpion vit avec une conscience aiguë du pouvoir — celui qu\u2019il exerce et celui qu\u2019on exerce sur lui. Son travail psychologique central est d\u2019apprendre à utiliser cette puissance transformatrice au service de la guérison plutôt que de la domination. Le Scorpion évolué est un alchimiste de l\u2019âme, capable de transmuter la souffrance en sagesse et la rage en compassion lucide."
      ],
      en: [
        "Scorpio embodies the archetype of death and rebirth — the phoenix that must traverse darkness in order to be reborn transformed. Ruled by Pluto and Mars, Scorpio possesses a psychic intensity that leads them naturally toward the depths: the taboos, the secrets, the truths that society prefers to bury beneath a veneer of politeness. Scorpio does not skim the surface of existence — they penetrate it, dismantle it, interrogate it down to the bone.",
        "Jung would recognize in Scorpio the archetype of the descent into shadow — that voluntary confrontation with the repressed aspects of the psyche that lies at the heart of the individuation process. The Scorpio native instinctively understands that light without shadow is blinding, that truth without pain is incomplete. This dark wisdom grants them a rare and sometimes unsettling authenticity. Howard Sasportas described Pluto as the force that strips away everything inessential until only the irreducible core of the Self remains.",
        "Liz Greene observes that Scorpio lives with an acute awareness of power — the power they wield and the power wielded over them. Their central psychological work is learning to use this transformative potency in service of healing rather than domination. The evolved Scorpio is an alchemist of the soul, capable of transmuting suffering into wisdom and rage into lucid compassion."
      ],
    },
    strengths: {
      fr: [
        "Intensité émotionnelle et capacité de transformation profonde",
        "Courage de regarder la vérité en face, même quand elle fait mal",
        "Loyauté absolue et engagement total dans ce qui compte",
        "Intuition pénétrante qui perçoit les motivations cachées",
        "Résilience exceptionnelle face aux crises et aux épreuves"
      ],
      en: [
        "Emotional intensity and a capacity for profound transformation",
        "The courage to face truth head-on, even when it hurts",
        "Absolute loyalty and total commitment to what matters",
        "Penetrating intuition that perceives hidden motivations",
        "Exceptional resilience in the face of crisis and adversity"
      ],
    },
    challenges: {
      fr: [
        "Tendance au contrôle et à la manipulation dans les moments de vulnérabilité",
        "Rancune tenace qui peut se transformer en désir de vengeance",
        "Jalousie et possessivité dans les relations intimes",
        "Difficulté à faire confiance après une trahison"
      ],
      en: [
        "A tendency toward control and manipulation in moments of vulnerability",
        "Tenacious resentment that can transform into a desire for revenge",
        "Jealousy and possessiveness in intimate relationships",
        "Difficulty trusting again after betrayal"
      ],
    },
    love: {
      fr: [
        "En amour, le Scorpion cherche la fusion totale — une intimité qui va bien au-delà du physique pour toucher les couches les plus profondes de l\u2019être. Il veut connaître l\u2019autre dans ses recoins les plus sombres, ses failles les plus secrètes, ses désirs les plus inavouables. Pour le Scorpion, l\u2019amour superficiel est un oxymore — soit la relation atteint la profondeur, soit elle n\u2019existe pas vraiment.",
        "Le défi amoureux du Scorpion est d\u2019offrir la même transparence qu\u2019il exige de l\u2019autre. Sa peur de la vulnérabilité peut le conduire à tester en permanence la loyauté de son partenaire, créant des dynamiques de pouvoir toxiques. Le Scorpion évolué comprend que le véritable pouvoir dans l\u2019amour réside dans la capacité de se montrer sans armure, et que la confiance ne se conquiert pas — elle se cultive dans la patience et la réciprocité."
      ],
      en: [
        "In love, Scorpio seeks total fusion — an intimacy that goes far beyond the physical to touch the deepest layers of being. They want to know the other in their darkest recesses, their most secret vulnerabilities, their most unspoken desires. For Scorpio, superficial love is an oxymoron — either the relationship reaches depth, or it does not truly exist.",
        "Scorpio's romantic challenge is to offer the same transparency they demand from the other. Their fear of vulnerability can lead them to perpetually test their partner's loyalty, creating toxic power dynamics. The evolved Scorpio understands that true power in love lies in the capacity to show oneself without armor, and that trust is not conquered — it is cultivated through patience and reciprocity."
      ],
    },
    work: {
      fr: [
        "Professionnellement, le Scorpion excelle dans les métiers d\u2019investigation, de recherche, de psychologie, de chirurgie, de finance stratégique et de gestion de crise. Partout où il faut aller au-delà des apparences et travailler avec des réalités complexes ou tabouées, son talent brille. Il est aussi un excellent stratège, capable de voir plusieurs coups d\u2019avance.",
        "Sa force est sa ténacité absolue et sa capacité à rester concentré sur un objectif malgré les obstacles. Son défi est d\u2019apprendre à lâcher prise quand un projet ou une collaboration a atteint son terme, et de ne pas transformer les dynamiques professionnelles en jeux de pouvoir. Le Scorpion accompli utilise son intensité pour transformer les situations plutôt que pour les contrôler."
      ],
      en: [
        "Professionally, Scorpio excels in investigation, research, psychology, surgery, strategic finance, and crisis management. Wherever one must go beyond appearances and work with complex or taboo realities, their talent shines. They are also an excellent strategist, capable of seeing several moves ahead.",
        "Their strength is absolute tenacity and the ability to stay focused on an objective despite obstacles. Their challenge is learning to let go when a project or collaboration has reached its end, and not to transform professional dynamics into power games. The accomplished Scorpio uses their intensity to transform situations rather than to control them."
      ],
    },
  },

  /* ================================================================ */
  /*  SAGITTAIRE / SAGITTARIUS                                         */
  /* ================================================================ */
  sagittaire: {
    slug: "sagittaire",
    nameFr: "Sagittaire",
    nameEn: "Sagittarius",
    glyph: "♐",
    datesFr: "22 novembre – 21 décembre",
    datesEn: "November 22 – December 21",
    elementFr: "Feu",
    elementEn: "Fire",
    modalityFr: "Mutable",
    modalityEn: "Mutable",
    planetFr: "Jupiter",
    planetEn: "Jupiter",
    personality: {
      fr: [
        "Le Sagittaire incarne l\u2019archétype du chercheur de sens, de l\u2019explorateur philosophique qui vise toujours plus loin que l\u2019horizon visible. Gouverné par Jupiter, il possède une soif de compréhension qui dépasse le savoir factuel pour toucher à la sagesse — cette vision panoramique qui relie les fragments de l\u2019expérience humaine en un récit porteur de sens. Le Sagittaire ne veut pas simplement savoir : il veut comprendre pourquoi.",
        "Jung aurait vu dans le Sagittaire l\u2019expression de la quête de totalité, ce mouvement de la psyché vers une synthèse toujours plus large de l\u2019expérience. Le natif du Sagittaire vit avec l\u2019intuition que la vie est un voyage initiatique, que chaque rencontre, chaque culture, chaque système de pensée est une pièce du puzzle cosmique. Cette foi fondamentale dans le sens de l\u2019existence lui confère un optimisme qui peut sembler naïf mais qui est en réalité profondément philosophique.",
        "Liz Greene souligne que le travail psychologique du Sagittaire consiste à réconcilier sa vision idéaliste avec les limites du réel. Sa quête d\u2019absolu peut le conduire à fuir les contraintes du quotidien, les responsabilités concrètes, les engagements qui limitent sa liberté. Le Sagittaire évolué comprend que la liberté véritable ne consiste pas à fuir les limites mais à trouver l\u2019infini à l\u2019intérieur de celles-ci."
      ],
      en: [
        "Sagittarius embodies the archetype of the meaning-seeker — the philosophical explorer who always aims beyond the visible horizon. Ruled by Jupiter, they possess a thirst for understanding that surpasses factual knowledge to touch upon wisdom: that panoramic vision which links the fragments of human experience into a meaningful narrative. Sagittarius does not merely want to know — they want to understand why.",
        "Jung would have seen in Sagittarius the expression of the quest for wholeness, that movement of the psyche toward an ever-broader synthesis of experience. The Sagittarius native lives with the intuition that life is an initiatory journey, that every encounter, every culture, every system of thought is a piece of the cosmic puzzle. This fundamental faith in the meaning of existence grants them an optimism that may seem naive but is in reality deeply philosophical. Howard Sasportas noted that Jupiter represents the psyche's capacity to perceive pattern and purpose where others see only random events.",
        "Liz Greene emphasizes that the psychological work of Sagittarius consists of reconciling their idealistic vision with the limits of the real. Their quest for the absolute can lead them to flee the constraints of daily life, concrete responsibilities, and commitments that limit their freedom. The evolved Sagittarius understands that true freedom does not consist of escaping limits but of finding the infinite within them."
      ],
    },
    strengths: {
      fr: [
        "Vision large et capacité à donner du sens aux événements",
        "Optimisme contagieux et foi dans les possibilités humaines",
        "Honnêteté directe et franc-parler rafraîchissant",
        "Ouverture culturelle et curiosité pour l\u2019altérité",
        "Enthousiasme mobilisateur et énergie d\u2019exploration"
      ],
      en: [
        "Broad vision and the ability to find meaning in events",
        "Contagious optimism and faith in human possibilities",
        "Direct honesty and refreshingly frank speech",
        "Cultural openness and curiosity toward otherness",
        "Mobilizing enthusiasm and an explorer's energy"
      ],
    },
    challenges: {
      fr: [
        "Tendance à l\u2019excès dans tous les domaines de la vie",
        "Difficulté avec les détails et les engagements à long terme",
        "Franc-parler qui peut blesser par manque de tact",
        "Fuite des responsabilités concrètes au profit de projets grandioses"
      ],
      en: [
        "A tendency toward excess in all areas of life",
        "Difficulty with details and long-term commitments",
        "A frankness that can wound through lack of tact",
        "Fleeing concrete responsibilities in favor of grandiose projects"
      ],
    },
    love: {
      fr: [
        "En amour, le Sagittaire cherche un compagnon d\u2019aventure — quelqu\u2019un qui partage sa soif de découverte et son refus de la routine. La relation idéale pour lui est un voyage à deux, une exploration mutuelle qui ne cesse jamais de surprendre. Il a besoin d\u2019un partenaire qui possède sa propre quête, sa propre flamme, et qui ne cherche pas à éteindre la sienne sous prétexte de stabilité.",
        "Le défi amoureux du Sagittaire est d\u2019accepter que l\u2019intimité profonde exige de rester — de rester présent dans les moments difficiles, de rester engagé quand l\u2019herbe semble plus verte ailleurs, de rester vulnérable quand la fuite serait plus confortable. Le Sagittaire évolué découvre que la plus grande aventure n\u2019est pas le tour du monde mais la traversée du cœur humain dans toute sa complexité."
      ],
      en: [
        "In love, Sagittarius seeks a companion for the adventure — someone who shares their thirst for discovery and their refusal of routine. The ideal relationship is a journey undertaken together, a mutual exploration that never ceases to surprise. They need a partner who possesses their own quest, their own flame, and who does not seek to extinguish theirs in the name of stability.",
        "Sagittarius's romantic challenge is accepting that deep intimacy requires staying — staying present through difficult moments, staying committed when the grass seems greener elsewhere, staying vulnerable when flight would be more comfortable. The evolved Sagittarius discovers that the greatest adventure is not a trip around the world but the traversal of the human heart in all its complexity."
      ],
    },
    work: {
      fr: [
        "Professionnellement, le Sagittaire s\u2019épanouit dans l\u2019enseignement supérieur, la philosophie, le droit international, le tourisme, l\u2019édition et les médias. Il excelle dans tout rôle qui lui permet de transmettre une vision, de connecter des idées et des cultures, d\u2019ouvrir des horizons. L\u2019entrepreneuriat l\u2019attire aussi, surtout quand il peut construire quelque chose qui a un impact large.",
        "Sa force professionnelle est sa capacité à inspirer et à motiver par la vision plutôt que par le contrôle. Son défi est de maintenir la rigueur nécessaire dans l\u2019exécution quotidienne et de ne pas abandonner un projet dès que le frisson de la nouveauté s\u2019estompe. Le Sagittaire accompli est celui qui a appris que la vraie expansion inclut la discipline — non pas comme une prison, mais comme l\u2019arc qui permet à la flèche de voler plus loin."
      ],
      en: [
        "Professionally, Sagittarius flourishes in higher education, philosophy, international law, tourism, publishing, and media. They excel in any role that allows them to transmit a vision, connect ideas and cultures, and open horizons. Entrepreneurship also attracts them, especially when they can build something with broad impact.",
        "Their professional strength is the ability to inspire and motivate through vision rather than control. Their challenge is maintaining the rigor necessary in daily execution and not abandoning a project as soon as the thrill of novelty fades. The accomplished Sagittarius has learned that true expansion includes discipline — not as a prison, but as the bow that allows the arrow to fly farther."
      ],
    },
  },

  /* ================================================================ */
  /*  CAPRICORNE / CAPRICORN                                           */
  /* ================================================================ */
  capricorne: {
    slug: "capricorne",
    nameFr: "Capricorne",
    nameEn: "Capricorn",
    glyph: "♑",
    datesFr: "22 décembre – 19 janvier",
    datesEn: "December 22 – January 19",
    elementFr: "Terre",
    elementEn: "Earth",
    modalityFr: "Cardinal",
    modalityEn: "Cardinal",
    planetFr: "Saturne",
    planetEn: "Saturn",
    personality: {
      fr: [
        "Le Capricorne incarne l\u2019archétype du sage ancien, de l\u2019architecte qui construit pour l\u2019éternité. Gouverné par Saturne, il possède une maturité précoce et une conscience aiguë du temps — non pas le temps comme ennemi, mais comme allié de ceux qui savent travailler avec patience et persévérance. Le Capricorne comprend instinctivement que tout ce qui a de la valeur demande du temps, de l\u2019effort et de la discipline.",
        "Jung aurait reconnu dans le Capricorne l\u2019archétype du Senex — le vieux sage qui porte à la fois la sagesse de l\u2019expérience et le poids de la responsabilité. Ce signe traverse souvent une jeunesse vécue comme trop sérieuse, trop chargée de devoirs, avant de connaître un allègement paradoxal avec l\u2019âge. Le Capricorne vieillit à l\u2019envers : il commence grave et finit léger, comme si les années lui apprenaient enfin l\u2019art de la joie.",
        "Liz Greene souligne que la blessure profonde du Capricorne est souvent liée à l\u2019autorité — un père absent, une exigence parentale excessive, ou un sentiment précoce de devoir porter des responsabilités d\u2019adulte. Son travail psychologique est de transformer cette blessure en force : devenir sa propre autorité intérieure, une structure qui soutient plutôt qu\u2019elle n\u2019opprime, un cadre qui libère plutôt qu\u2019il n\u2019emprisonne."
      ],
      en: [
        "Capricorn embodies the archetype of the ancient sage — the architect who builds for eternity. Ruled by Saturn, they possess an early maturity and an acute awareness of time: not time as enemy, but as the ally of those who know how to work with patience and perseverance. Capricorn instinctively understands that everything of true value demands time, effort, and discipline.",
        "Jung would have recognized in Capricorn the archetype of the Senex — the old wise figure who carries both the wisdom of experience and the weight of responsibility. This sign often traverses a youth lived as too serious, too burdened with duties, before experiencing a paradoxical lightening with age. Capricorn ages in reverse: they begin grave and end light, as if the years finally teach them the art of joy. Howard Sasportas described Saturn as the psyche's master builder, the force that compels us to give form to what would otherwise remain mere aspiration.",
        "Liz Greene emphasizes that Capricorn's deep wound is often tied to authority — an absent father, excessive parental demands, or a premature sense of having to shoulder adult responsibilities. Their psychological work is to transform this wound into strength: becoming their own inner authority, a structure that supports rather than oppresses, a framework that liberates rather than imprisons."
      ],
    },
    strengths: {
      fr: [
        "Discipline et persévérance dans les projets à long terme",
        "Sens des responsabilités et fiabilité absolue",
        "Ambition constructive et vision stratégique",
        "Intégrité et sens de l\u2019honneur",
        "Sagesse pratique qui s\u2019enrichit avec l\u2019âge"
      ],
      en: [
        "Discipline and perseverance in long-term endeavors",
        "A profound sense of responsibility and absolute reliability",
        "Constructive ambition and strategic vision",
        "Integrity and a deeply held sense of honor",
        "Practical wisdom that grows richer with age"
      ],
    },
    challenges: {
      fr: [
        "Rigidité émotionnelle et difficulté à exprimer la vulnérabilité",
        "Tendance au pessimisme et à la mélancolie saturnienne",
        "Obsession du contrôle et peur de l\u2019imprévu",
        "Risque de sacrifier le bonheur présent pour un futur hypothétique"
      ],
      en: [
        "Emotional rigidity and difficulty expressing vulnerability",
        "A tendency toward pessimism and Saturnine melancholy",
        "An obsession with control and fear of the unexpected",
        "The risk of sacrificing present happiness for a hypothetical future"
      ],
    },
    love: {
      fr: [
        "En amour, le Capricorne est un partenaire de construction — il bâtit la relation comme il bâtit tout le reste, avec méthode, engagement et une vision à long terme. Sa fidélité n\u2019est pas un automatisme mais un choix renouvelé, une décision consciente de rester et de travailler à la relation même quand l\u2019enthousiasme initial s\u2019est transformé en quelque chose de plus profond et de moins spectaculaire.",
        "Le défi amoureux du Capricorne est de s\u2019autoriser la tendresse spontanée et le lâcher-prise émotionnel. Sa peur de la vulnérabilité peut créer une distance affective qui frustre des partenaires plus expressifs. Quand le Capricorne apprend à baisser ses murs — ne serait-ce que dans l\u2019intimité du couple — il révèle une profondeur affective qui surprend par son intensité ceux qui le croyaient froid."
      ],
      en: [
        "In love, Capricorn is a partner for building — they construct the relationship as they construct everything else, with method, commitment, and a long-term vision. Their fidelity is not automatic but a renewed choice, a conscious decision to stay and work at the relationship even when the initial enthusiasm has transformed into something deeper and less spectacular.",
        "Capricorn's romantic challenge is to allow themselves spontaneous tenderness and emotional surrender. Their fear of vulnerability can create an emotional distance that frustrates more expressive partners. When Capricorn learns to lower their walls — even if only within the intimacy of the couple — they reveal an emotional depth that astonishes with its intensity those who believed them cold."
      ],
    },
    work: {
      fr: [
        "Professionnellement, le Capricorne excelle dans les positions de direction, l\u2019administration, la finance, l\u2019ingénierie, l\u2019architecture et tout domaine qui exige de la rigueur et une vision à long terme. Il gravit les échelons avec une patience qui décourage ses concurrents — non par ruse, mais par la qualité constante et la fiabilité de son travail.",
        "Sa force est sa capacité à transformer une vision ambitieuse en réalité tangible par un travail méthodique et discipliné. Son défi est d\u2019apprendre que le succès professionnel ne justifie pas le sacrifice de tout le reste — la santé, les relations, la joie de vivre. Le Capricorne accompli est celui qui a compris que la vraie réussite est une montagne dont le sommet inclut aussi le bonheur."
      ],
      en: [
        "Professionally, Capricorn excels in executive positions, administration, finance, engineering, architecture, and any domain that demands rigor and a long-term vision. They climb the ranks with a patience that discourages competitors — not through cunning, but through the constant quality and reliability of their work.",
        "Their strength is the ability to transform an ambitious vision into tangible reality through methodical, disciplined effort. Their challenge is learning that professional success does not justify the sacrifice of everything else — health, relationships, the joy of living. The accomplished Capricorn has understood that true success is a mountain whose summit also includes happiness."
      ],
    },
  },

  /* ================================================================ */
  /*  VERSEAU / AQUARIUS                                               */
  /* ================================================================ */
  verseau: {
    slug: "verseau",
    nameFr: "Verseau",
    nameEn: "Aquarius",
    glyph: "♒",
    datesFr: "20 janvier – 18 février",
    datesEn: "January 20 – February 18",
    elementFr: "Air",
    elementEn: "Air",
    modalityFr: "Fixe",
    modalityEn: "Fixed",
    planetFr: "Uranus/Saturne",
    planetEn: "Uranus/Saturn",
    personality: {
      fr: [
        "Le Verseau incarne l\u2019archétype du visionnaire, du porteur d\u2019eau qui verse les idées du futur dans le présent. Gouverné par Uranus et Saturne, il vit dans la tension créatrice entre la tradition et la révolution, entre la structure et la libération. Le Verseau ne rejette pas le passé par caprice — il le transcende par nécessité intérieure, parce qu\u2019il perçoit des possibilités que la majorité ne voit pas encore.",
        "Jung reconnaîtrait dans le Verseau l\u2019expression de l\u2019inconscient collectif dans sa dimension prospective — cette intuition des mouvements sociaux et des idées en gestation qui transformeront le monde demain. Le natif du Verseau pense naturellement en termes de systèmes, de réseaux et de collectifs. Son intelligence n\u2019est pas sentimentale mais structurelle : il voit les patterns, les connexions, les leviers qui permettent de changer un système entier.",
        "Liz Greene observe que le paradoxe central du Verseau est son besoin simultané d\u2019appartenance et d\u2019originalité. Il veut faire partie de la communauté humaine tout en refusant de se fondre dans la masse. Ce tiraillement entre l\u2019universel et l\u2019individuel est la source de sa créativité mais aussi de sa solitude. Le Verseau évolué a appris qu\u2019être unique n\u2019empêche pas d\u2019être intime, et que l\u2019attachement émotionnel n\u2019est pas une prison mais un ancrage."
      ],
      en: [
        "Aquarius embodies the archetype of the visionary — the water-bearer who pours the ideas of the future into the present. Ruled by Uranus and Saturn, they live within the creative tension between tradition and revolution, between structure and liberation. Aquarius does not reject the past on a whim — they transcend it out of inner necessity, because they perceive possibilities that the majority does not yet see.",
        "Jung would recognize in Aquarius the expression of the collective unconscious in its prospective dimension — that intuition of the social movements and gestating ideas that will transform tomorrow's world. The Aquarius native naturally thinks in terms of systems, networks, and collectives. Their intelligence is not sentimental but structural: they see the patterns, the connections, the leverage points that can change an entire system. Howard Sasportas described Uranus as the flash of lightning that shatters crystallized structures so that consciousness may evolve to its next form.",
        "Liz Greene observes that the central paradox of Aquarius is their simultaneous need for belonging and originality. They want to be part of the human community while refusing to dissolve into the crowd. This tension between the universal and the individual is the source of their creativity but also their loneliness. The evolved Aquarius has learned that being unique does not preclude intimacy, and that emotional attachment is not a prison but an anchor."
      ],
    },
    strengths: {
      fr: [
        "Vision innovante et capacité à penser hors des cadres",
        "Idéalisme sincère et engagement pour le bien commun",
        "Indépendance intellectuelle et refus du conformisme",
        "Capacité à fédérer autour d\u2019idées progressistes",
        "Objectivité et recul dans l\u2019analyse des situations"
      ],
      en: [
        "Innovative vision and the ability to think outside established frameworks",
        "Sincere idealism and commitment to the common good",
        "Intellectual independence and refusal of conformism",
        "The ability to unite people around progressive ideas",
        "Objectivity and detachment in situational analysis"
      ],
    },
    challenges: {
      fr: [
        "Détachement émotionnel qui peut être vécu comme de la froideur",
        "Tendance à intellectualiser les relations au détriment de l\u2019intimité",
        "Obstination paradoxale derrière une apparence d\u2019ouverture",
        "Difficulté à gérer les émotions intenses — les siennes et celles des autres"
      ],
      en: [
        "Emotional detachment that can be experienced as coldness",
        "A tendency to intellectualize relationships at the expense of intimacy",
        "A paradoxical stubbornness behind an appearance of openness",
        "Difficulty managing intense emotions — their own and those of others"
      ],
    },
    love: {
      fr: [
        "En amour, le Verseau cherche d\u2019abord une connexion intellectuelle et une amitié profonde. Il est attiré par les esprits originaux, les personnalités atypiques, les êtres qui refusent les rôles préfabriqués. La relation conventionnelle l\u2019ennuie profondément — il a besoin de réinventer les codes du couple, de créer un modèle relationnel qui lui ressemble plutôt que de reproduire celui de ses parents.",
        "Le défi amoureux du Verseau est d\u2019accepter que l\u2019intimité émotionnelle exige un engagement du cœur, pas seulement de l\u2019esprit. Sa tendance à analyser les sentiments plutôt qu\u2019à les vivre peut créer une distance frustrante pour des partenaires plus émotionnels. Le Verseau évolué découvre que les émotions ne sont pas des ennemies de la raison mais des informations précieuses que l\u2019intelligence seule ne peut pas capter."
      ],
      en: [
        "In love, Aquarius first seeks an intellectual connection and a deep friendship. They are drawn to original minds, atypical personalities, beings who refuse prefabricated roles. The conventional relationship bores them profoundly — they need to reinvent the codes of partnership, to create a relational model that reflects who they are rather than reproducing the one their parents had.",
        "Aquarius's romantic challenge is accepting that emotional intimacy demands an engagement of the heart, not just the mind. Their tendency to analyze feelings rather than live them can create a frustrating distance for more emotional partners. The evolved Aquarius discovers that emotions are not enemies of reason but precious information that intelligence alone cannot capture."
      ],
    },
    work: {
      fr: [
        "Professionnellement, le Verseau s\u2019épanouit dans les nouvelles technologies, la recherche scientifique, l\u2019humanitaire, l\u2019innovation sociale et les médias numériques. Il excelle dans les environnements qui valorisent la créativité et la pensée non conventionnelle. Les structures hiérarchiques rigides et les processus routiniers l\u2019étouffent — il a besoin de sentir qu\u2019il contribue à quelque chose de plus grand que son seul avancement personnel.",
        "Sa force est sa capacité à voir des solutions là où les autres voient des impasses et à fédérer des équipes autour de projets innovants. Son défi est de maintenir un engagement concret dans la durée et de ne pas passer d\u2019une idée brillante à l\u2019autre sans jamais les concrétiser. Le Verseau accompli allie la vision du futur à la discipline du présent — il ne se contente pas de rêver le monde de demain, il le construit."
      ],
      en: [
        "Professionally, Aquarius flourishes in new technologies, scientific research, humanitarian work, social innovation, and digital media. They excel in environments that value creativity and unconventional thinking. Rigid hierarchical structures and routine processes suffocate them — they need to feel that they contribute to something larger than their personal advancement alone.",
        "Their strength is the ability to see solutions where others see dead ends and to rally teams around innovative projects. Their challenge is maintaining concrete engagement over time and not leaping from one brilliant idea to the next without ever bringing any to fruition. The accomplished Aquarius marries the vision of the future with the discipline of the present — they do not merely dream tomorrow's world, they build it."
      ],
    },
  },

  /* ================================================================ */
  /*  POISSONS / PISCES                                                */
  /* ================================================================ */
  poissons: {
    slug: "poissons",
    nameFr: "Poissons",
    nameEn: "Pisces",
    glyph: "♓",
    datesFr: "19 février – 20 mars",
    datesEn: "February 19 – March 20",
    elementFr: "Eau",
    elementEn: "Water",
    modalityFr: "Mutable",
    modalityEn: "Mutable",
    planetFr: "Neptune/Jupiter",
    planetEn: "Neptune/Jupiter",
    personality: {
      fr: [
        "Les Poissons incarnent l\u2019archétype du mystique, du rêveur éveillé qui perçoit la réalité invisible derrière les apparences. Gouvernés par Neptune et Jupiter, ils possèdent une perméabilité psychique qui les rend extraordinairement réceptifs aux ambiances, aux émotions collectives et aux courants souterrains de l\u2019inconscient. Dernier signe du zodiaque, les Poissons portent en eux la mémoire de tous les signes qui les précèdent — une sagesse diffuse, parfois accablante, toujours profonde.",
        "Jung aurait reconnu dans les Poissons l\u2019expression la plus directe de l\u2019inconscient collectif dans sa dimension créatrice et spirituelle. Le natif des Poissons navigue entre les mondes — le rationnel et l\u2019imaginaire, le personnel et le transpersonnel, le concret et le symbolique. Cette fluidité psychique est à la fois un don rare et un défi quotidien : comment rester ancré dans la réalité quand on perçoit des dimensions que la plupart des gens ignorent ?",
        "Liz Greene souligne que le travail psychologique des Poissons consiste à trouver un contenant pour leur immensité intérieure. Sans structure — artistique, spirituelle, thérapeutique — leur sensibilité peut les submerger et les conduire vers des formes d\u2019évasion destructrices. Les Poissons évolués ont trouvé comment canaliser leur connexion au transcendant dans une forme terrestre — une œuvre d\u2019art, une pratique de soin, une présence qui guérit simplement par sa qualité d\u2019écoute."
      ],
      en: [
        "Pisces embodies the archetype of the mystic — the waking dreamer who perceives the invisible reality behind appearances. Ruled by Neptune and Jupiter, they possess a psychic permeability that makes them extraordinarily receptive to atmospheres, collective emotions, and the underground currents of the unconscious. As the last sign of the zodiac, Pisces carries within them the memory of all the signs that came before — a diffuse wisdom, sometimes overwhelming, always profound.",
        "Jung would have recognized in Pisces the most direct expression of the collective unconscious in its creative and spiritual dimension. The Pisces native navigates between worlds — the rational and the imaginary, the personal and the transpersonal, the concrete and the symbolic. This psychic fluidity is both a rare gift and a daily challenge: how does one remain anchored in reality when one perceives dimensions that most people ignore? Howard Sasportas described Neptune as the dissolving agent that erases the boundaries between self and other, opening the gates to both ecstasy and confusion.",
        "Liz Greene emphasizes that the psychological work of Pisces consists of finding a container for their inner immensity. Without structure — artistic, spiritual, therapeutic — their sensitivity can overwhelm them and lead them toward destructive forms of escape. The evolved Pisces has found how to channel their connection to the transcendent into an earthly form: a work of art, a healing practice, a presence that heals simply through the quality of its listening."
      ],
    },
    strengths: {
      fr: [
        "Empathie universelle et compassion sans limites",
        "Imagination créatrice et accès à l\u2019inspiration",
        "Intuition quasi médiumnique dans la lecture des situations",
        "Adaptabilité fluide et capacité à se réinventer",
        "Profondeur spirituelle et connexion au transcendant"
      ],
      en: [
        "Universal empathy and boundless compassion",
        "Creative imagination and access to inspiration",
        "Near-mediumistic intuition in reading situations",
        "Fluid adaptability and the capacity for reinvention",
        "Spiritual depth and connection to the transcendent"
      ],
    },
    challenges: {
      fr: [
        "Tendance à l\u2019évasion face aux réalités difficiles",
        "Difficulté à poser des limites et à dire non",
        "Confusion entre ses propres émotions et celles des autres",
        "Risque de se perdre dans des illusions ou des dépendances"
      ],
      en: [
        "A tendency toward escapism when facing difficult realities",
        "Difficulty setting boundaries and saying no",
        "Confusion between their own emotions and those of others",
        "The risk of losing themselves in illusions or dependencies"
      ],
    },
    love: {
      fr: [
        "En amour, les Poissons offrent une connexion d\u2019une qualité quasi spirituelle. Ils aiment avec une empathie totale, une capacité à se mettre dans la peau de l\u2019autre qui rend leur présence extraordinairement réconfortante. Le partenaire des Poissons se sent compris à un niveau qu\u2019il n\u2019a peut-être jamais connu — comme si quelqu\u2019un voyait enfin son âme au-delà de ses masques sociaux.",
        "Le défi amoureux des Poissons est de maintenir leur identité propre dans la fusion relationnelle. Leur tendance à absorber les émotions de l\u2019autre peut les conduire à disparaître dans la relation, perdant le contact avec leurs propres désirs et besoins. Les Poissons évolués apprennent que la compassion authentique inclut la compassion envers soi-même, et que l\u2019amour le plus pur commence par une relation saine avec sa propre intériorité."
      ],
      en: [
        "In love, Pisces offers a connection of near-spiritual quality. They love with total empathy, a capacity to inhabit the other's experience that makes their presence extraordinarily comforting. The partner of Pisces feels understood at a level they may have never known before — as if someone finally sees their soul beyond their social masks.",
        "The romantic challenge of Pisces is maintaining their own identity within relational fusion. Their tendency to absorb the other's emotions can lead them to disappear into the relationship, losing contact with their own desires and needs. The evolved Pisces learns that authentic compassion includes compassion toward oneself, and that the purest love begins with a healthy relationship with one's own interiority."
      ],
    },
    work: {
      fr: [
        "Professionnellement, les Poissons s\u2019épanouissent dans les arts, la musique, le cinéma, la photographie, la thérapie, les métiers du soin et tout domaine où l\u2019imagination et l\u2019empathie sont des atouts. Ils excellent aussi dans la recherche spirituelle, l\u2019accompagnement de fin de vie et les professions qui demandent une écoute profonde plutôt qu\u2019une efficacité mécanique.",
        "Leur force est leur capacité à percevoir des possibilités créatives invisibles aux esprits plus pragmatiques et à toucher les gens au niveau de l\u2019âme. Leur défi est de structurer leur travail suffisamment pour transformer leurs visions en réalisations concrètes. Les Poissons accomplis trouvent un équilibre entre le rêve et la réalité, entre l\u2019inspiration qui les traverse et la discipline qui la matérialise."
      ],
      en: [
        "Professionally, Pisces flourishes in the arts, music, cinema, photography, therapy, caregiving professions, and any domain where imagination and empathy are assets. They also excel in spiritual practice, end-of-life care, and professions that demand deep listening rather than mechanical efficiency.",
        "Their strength is the ability to perceive creative possibilities invisible to more pragmatic minds and to touch people at the level of the soul. Their challenge is structuring their work sufficiently to transform their visions into concrete achievements. The accomplished Pisces finds a balance between dream and reality, between the inspiration that passes through them and the discipline that materializes it."
      ],
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Element color helper                                               */
/* ------------------------------------------------------------------ */

export const elementColor: Record<string, string> = {
  Feu: "#ef4444",
  Fire: "#ef4444",
  Terre: "#22c55e",
  Earth: "#22c55e",
  Air: "#60a5fa",
  Eau: "#a78bfa",
  Water: "#a78bfa",
};
