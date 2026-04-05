import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { SignIcon } from "@/components/AstroIcons";

/* ------------------------------------------------------------------ */
/*  Data for all 12 signs                                              */
/* ------------------------------------------------------------------ */

interface SignData {
  slug: string;
  name: string;
  glyph: string;
  dates: string;
  element: string;
  modality: string;
  planet: string;
  personality: string[];
  strengths: string[];
  challenges: string[];
  love: string[];
  work: string[];
}

const signs: Record<string, SignData> = {
  belier: {
    slug: "belier",
    name: "Bélier",
    glyph: "♈",
    dates: "21 mars – 19 avril",
    element: "Feu",
    modality: "Cardinal",
    planet: "Mars",
    personality: [
      "Le Bélier incarne l\u2019archétype du pionnier, celui qui ouvre la voie dans un territoire encore inexploré. Premier signe du zodiaque, il porte en lui l\u2019énergie brute du commencement — cette pulsion de vie que Jung associait à la force instinctive du Soi cherchant à se manifester dans le monde. Le natif du Bélier ne demande pas la permission : il agit, il initie, il existe avec une intensité qui peut surprendre ou déstabiliser son entourage.",
      "Sur le plan psychologique, le Bélier traverse la vie avec une conscience aiguë de son individualité. Il a besoin de se confronter au monde pour se découvrir, un peu comme le héros mythologique qui ne connaît sa véritable nature qu\u2019au travers de l\u2019épreuve. Cette quête d\u2019affirmation n\u2019est pas de l\u2019arrogance — c\u2019est un processus fondamental d\u2019individuation où le courage et l\u2019authenticité servent de boussole.",
      "Liz Greene souligne que le Bélier porte souvent une colère créatrice, une énergie martienne qui, lorsqu\u2019elle est canalisée consciemment, devient une force de transformation remarquable. Le défi du Bélier est d\u2019apprendre à tempérer son impulsivité sans éteindre sa flamme, de trouver la patience sans renoncer à sa spontanéité vitale."
    ],
    strengths: [
      "Courage instinctif et capacité à agir dans l\u2019urgence",
      "Leadership naturel et force d\u2019initiative",
      "Authenticité désarmante et franchise directe",
      "Capacité de rebond exceptionnelle après un échec",
      "Énergie contagieuse qui entraîne les autres dans l\u2019action"
    ],
    challenges: [
      "Impatience qui peut saboter des projets à long terme",
      "Tendance à l\u2019impulsivité dans les décisions importantes",
      "Difficulté à considérer le point de vue de l\u2019autre dans le feu de l\u2019action",
      "Risque d\u2019épuisement par excès d\u2019engagement simultané"
    ],
    love: [
      "En amour, le Bélier est un partenaire passionné qui vit ses sentiments avec une intensité absolue. Il tombe amoureux comme il fait tout — entièrement, sans réserve, avec une candeur qui rappelle les premiers émois de l\u2019adolescence. Cette fraîcheur émotionnelle est à la fois sa plus grande force relationnelle et sa plus grande vulnérabilité.",
      "Le Bélier a besoin d\u2019un partenaire qui accepte son besoin d\u2019indépendance sans le vivre comme un rejet. La relation idéale pour lui est celle où deux individus forts cheminent côte à côte, se stimulant mutuellement, plutôt qu\u2019une fusion symbiotique qui étoufferait sa flamme intérieure. Quand il se sent libre d\u2019être lui-même, le Bélier déploie une loyauté et une générosité remarquables."
    ],
    work: [
      "Dans le travail, le Bélier excelle dans les rôles qui exigent de l\u2019initiative et une prise de décision rapide. Entrepreneur dans l\u2019âme, il préfère créer ses propres règles plutôt que de suivre celles des autres. Les environnements bureaucratiques et les hiérarchies rigides le dépriment profondément — il a besoin de sentir que son action a un impact direct et immédiat.",
      "Sa force professionnelle réside dans sa capacité à lancer des projets et à galvaniser une équipe autour d\u2019une vision. Son défi est d\u2019apprendre à déléguer la phase de consolidation, car sa nature le pousse déjà vers le prochain défi avant que le précédent ne soit pleinement achevé. Les métiers liés au sport, à la chirurgie, à l\u2019entrepreneuriat ou à la gestion de crise lui conviennent particulièrement."
    ],
  },
  taureau: {
    slug: "taureau",
    name: "Taureau",
    glyph: "♉",
    dates: "20 avril – 20 mai",
    element: "Terre",
    modality: "Fixe",
    planet: "Vénus",
    personality: [
      "Le Taureau représente l\u2019archétype du bâtisseur, celui qui ancre dans la matière ce que le Bélier a initié. Gouverné par Vénus, il possède une relation profonde et sensuelle avec le monde physique — les textures, les saveurs, les sons, les parfums constituent son langage premier. Ce n\u2019est pas du matérialisme superficiel : c\u2019est une forme d\u2019intelligence incarnée, une sagesse du corps que notre culture hyper-cérébrale tend à sous-estimer.",
      "Sur le plan psychologique, le Taureau cherche la sécurité comme condition préalable à l\u2019épanouissement. Jung parlerait ici de la fonction sensation dans son expression la plus aboutie — cette capacité à être pleinement présent dans l\u2019instant, à accueillir la réalité telle qu\u2019elle est plutôt que telle qu\u2019on voudrait qu\u2019elle soit. Le Taureau sait, instinctivement, que les fondations doivent être solides avant de construire plus haut.",
      "Liz Greene observe que la force du Taureau réside dans sa constance, mais que cette même qualité peut se transformer en rigidité lorsqu\u2019elle n\u2019est pas intégrée consciemment. Le Taureau évolué est celui qui a appris à distinguer entre la persévérance légitime et l\u2019entêtement stérile, entre le besoin de stabilité et la peur du changement."
    ],
    strengths: [
      "Fiabilité et constance qui inspirent la confiance",
      "Sens esthétique raffiné et goût naturel pour la beauté",
      "Patience et endurance dans les projets à long terme",
      "Pragmatisme ancré dans la réalité concrète",
      "Capacité à créer un environnement sécurisant pour les autres"
    ],
    challenges: [
      "Résistance au changement qui peut devenir de l\u2019immobilisme",
      "Possessivité dans les relations affectives et matérielles",
      "Tendance à confondre sécurité et contrôle",
      "Difficulté à lâcher prise quand une situation a atteint son terme"
    ],
    love: [
      "En amour, le Taureau offre une présence d\u2019une stabilité remarquable. Il aime avec son corps autant qu\u2019avec son cœur — le toucher, la proximité physique, les rituels partagés du quotidien constituent pour lui les preuves tangibles de l\u2019amour. Un dîner préparé avec soin, un cadeau choisi avec attention, un espace de vie aménagé ensemble : voilà son langage amoureux.",
      "Le défi relationnel du Taureau réside dans sa tendance à la possessivité. Quand la peur de perdre prend le dessus sur la confiance, il peut étouffer involontairement l\u2019autre par un excès de besoin fusionnel. Le Taureau en conscience apprend que l\u2019amour véritable n\u2019est pas une possession mais un jardin qui demande à la fois des soins constants et la liberté de croître."
    ],
    work: [
      "Dans le travail, le Taureau est un pilier de fiabilité. Il construit méthodiquement, pierre après pierre, avec une patience que les signes plus impétueux lui envient secrètement. Les professions liées à la finance, à l\u2019immobilier, à la gastronomie, à l\u2019artisanat d\u2019art ou à la musique résonnent profondément avec sa nature vénusienne.",
      "Sa force professionnelle est sa capacité à transformer une vision abstraite en réalité concrète et durable. Il excelle dans la gestion des ressources et sait instinctivement ce qui a de la valeur. Son défi est d\u2019accepter que parfois il faut détruire pour reconstruire mieux, que l\u2019adaptation n\u2019est pas une trahison mais une forme supérieure de fidélité à ses objectifs."
    ],
  },
  gemeaux: {
    slug: "gemeaux",
    name: "Gémeaux",
    glyph: "♊",
    dates: "21 mai – 20 juin",
    element: "Air",
    modality: "Mutable",
    planet: "Mercure",
    personality: [
      "Les Gémeaux incarnent l\u2019archétype du messager, de l\u2019intermédiaire entre les mondes. Gouvernés par Mercure, ils possèdent une intelligence vive et polymorphe qui se nourrit de connexions, de correspondances et de dialogues. Ce signe porte en lui la dualité fondamentale de la psyché humaine — le conscient et l\u2019inconscient, le rationnel et l\u2019intuitif, le moi social et le moi intime.",
      "Jung aurait reconnu dans les Gémeaux l\u2019expression de la fonction pensée dans sa forme la plus agile. Leur esprit ne fonctionne pas de manière linéaire mais par associations, rebonds et synthèses inattendues. Cette agilité mentale est souvent mal comprise comme de la superficialité, alors qu\u2019elle traduit en réalité une curiosité existentielle profonde — le besoin de comprendre le monde sous tous ses angles avant de se fixer.",
      "Liz Greene souligne que le travail psychologique des Gémeaux consiste à intégrer leurs multiples facettes en un tout cohérent, plutôt que de les vivre comme des fragments dispersés. Le Gémeaux évolué ne papillonne pas : il tisse un réseau de connaissances et d\u2019expériences qui forme une tapisserie riche et signifiante."
    ],
    strengths: [
      "Intelligence adaptative et rapidité d\u2019apprentissage",
      "Don pour la communication sous toutes ses formes",
      "Polyvalence et capacité à jongler entre plusieurs projets",
      "Curiosité intellectuelle insatiable",
      "Humour vif et sens de la répartie qui désamorce les tensions"
    ],
    challenges: [
      "Dispersion de l\u2019énergie entre trop d\u2019intérêts simultanés",
      "Difficulté à approfondir un sujet quand un nouveau apparaît",
      "Nervosité et agitation mentale sous stress",
      "Tendance à intellectualiser les émotions plutôt qu\u2019à les ressentir"
    ],
    love: [
      "En amour, les Gémeaux ont besoin avant tout d\u2019une stimulation intellectuelle. La séduction passe par les mots, les idées partagées, les conversations qui s\u2019étirent jusqu\u2019à l\u2019aube. Un partenaire qui les fait rire, qui les surprend, qui les challenge mentalement possède une clé d\u2019accès directe à leur cœur. Sans cette connexion cérébrale, même la plus forte attirance physique finit par s\u2019essouffler.",
      "Le défi amoureux des Gémeaux est d\u2019accepter la profondeur émotionnelle que la relation intime exige. Quand les conversations brillantes cèdent la place aux silences vulnérables, quand l\u2019intimité demande de montrer ses failles plutôt que ses talents, le Gémeaux peut ressentir l\u2019envie de fuir. Son apprentissage est de comprendre que la véritable connexion commence là où le verbe s\u2019arrête."
    ],
    work: [
      "Professionnellement, les Gémeaux brillent dans les métiers de la communication, du journalisme, de l\u2019enseignement, du commerce et des nouvelles technologies. Leur capacité à comprendre rapidement des domaines variés et à traduire des concepts complexes en langage accessible en fait des médiateurs et des vulgarisateurs hors pair.",
      "Leur force est leur adaptabilité — ils excellent dans les environnements changeants où la polyvalence est une nécessité. Leur défi est de développer la persévérance nécessaire pour mener un projet de bout en bout. Le Gémeaux accompli est celui qui a appris que la maîtrise véritable d\u2019un sujet vient de la profondeur, pas seulement de l\u2019étendue."
    ],
  },
  cancer: {
    slug: "cancer",
    name: "Cancer",
    glyph: "♋",
    dates: "21 juin – 22 juillet",
    element: "Eau",
    modality: "Cardinal",
    planet: "Lune",
    personality: [
      "Le Cancer incarne l\u2019archétype de la Grande Mère, gardien du foyer intérieur et des mémoires ancestrales. Gouverné par la Lune, il possède une sensibilité émotionnelle d\u2019une profondeur rare, une capacité à percevoir les courants souterrains des relations humaines avec une acuité que les signes plus rationnels peinent à comprendre. Sa carapace n\u2019est pas un mur — c\u2019est une frontière nécessaire qui protège un monde intérieur d\u2019une richesse extraordinaire.",
      "Jung aurait reconnu dans le Cancer l\u2019expression la plus pure de l\u2019inconscient collectif dans sa dimension nourricière. Ce signe porte en lui la mémoire émotionnelle de sa lignée — les joies, les blessures, les schémas familiaux transmis de génération en génération. Le natif du Cancer ne vit pas seulement sa propre vie émotionnelle : il ressent, souvent inconsciemment, celle de tout son arbre généalogique.",
      "Liz Greene observe que le travail psychologique du Cancer consiste à distinguer entre ses propres émotions et celles qu\u2019il absorbe de son environnement. Quand cette différenciation est faite consciemment, le Cancer devient un guérisseur émotionnel d\u2019une puissance remarquable — quelqu\u2019un qui comprend la souffrance humaine de l\u2019intérieur et sait instinctivement comment la consoler."
    ],
    strengths: [
      "Empathie profonde et intelligence émotionnelle naturelle",
      "Instinct protecteur et capacité à créer un espace sécurisant",
      "Mémoire affective et loyauté indéfectible envers les proches",
      "Intuition remarquable dans la lecture des situations",
      "Créativité nourrie par un monde imaginaire riche"
    ],
    challenges: [
      "Hypersensibilité qui peut mener au repli défensif",
      "Tendance à la rancune quand la blessure n\u2019est pas reconnue",
      "Difficulté à poser des limites claires avec les proches",
      "Attachement au passé qui peut freiner l\u2019évolution personnelle"
    ],
    love: [
      "En amour, le Cancer offre une dévotion d\u2019une profondeur océanique. Il construit le nid, nourrit la relation de petites attentions quotidiennes, se souvient de chaque date importante, de chaque confidence murmurée. Son amour s\u2019exprime par le soin — préparer un repas quand l\u2019autre est fatigué, anticiper un besoin avant qu\u2019il ne soit formulé, créer un cocon de douceur dans un monde perçu comme hostile.",
      "Le défi amoureux du Cancer est de ne pas confondre amour et dépendance. Sa peur profonde de l\u2019abandon peut le conduire à s\u2019accrocher à des relations qui ne le nourrissent plus, ou à utiliser le soin comme un moyen inconscient de rendre l\u2019autre redevable. Le Cancer évolué apprend que le véritable amour inclut la capacité de laisser l\u2019autre être libre, même si cette liberté génère de l\u2019anxiété."
    ],
    work: [
      "Professionnellement, le Cancer excelle dans les métiers du soin, de l\u2019éducation, de la psychologie, de l\u2019hôtellerie et de l\u2019alimentation. Son instinct nourricier se déploie aussi dans l\u2019immobilier, la décoration intérieure ou toute profession qui consiste à créer des environnements accueillants et sécurisants pour les autres.",
      "Sa force au travail est sa capacité à fédérer une équipe par l\u2019affect — les collaborateurs du Cancer se sentent vus et valorisés. Son défi est de ne pas prendre les conflits professionnels trop personnellement et d\u2019apprendre que les critiques constructives ne sont pas des attaques contre sa personne. Quand il trouve cet équilibre, le Cancer devient un manager profondément humain et efficace."
    ],
  },
  lion: {
    slug: "lion",
    name: "Lion",
    glyph: "♌",
    dates: "23 juillet – 22 août",
    element: "Feu",
    modality: "Fixe",
    planet: "Soleil",
    personality: [
      "Le Lion incarne l\u2019archétype du souverain intérieur, celui qui a trouvé — ou cherche — la connexion avec son centre vital. Gouverné par le Soleil, il rayonne naturellement, non par narcissisme mais par fidélité à une force créatrice qui demande à s\u2019exprimer. Le Lion vit avec l\u2019intuition profonde que chaque être humain possède une lumière unique et que le véritable courage consiste à la laisser briller sans s\u2019excuser.",
      "Jung verrait dans le Lion l\u2019expression du processus d\u2019individuation dans sa phase solaire — ce moment où le moi conscient s\u2019aligne avec le Soi profond et trouve sa voix authentique. Le natif du Lion ne cherche pas les applaudissements pour eux-mêmes : il a besoin du regard de l\u2019autre comme miroir, comme confirmation que sa lumière intérieure est bien réelle et qu\u2019elle éclaire le monde autour de lui.",
      "Liz Greene note que le Lion porte une blessure secrète : la peur de n\u2019être pas assez. Derrière la générosité apparente et l\u2019assurance solaire se cache parfois un enfant intérieur qui doute de sa valeur fondamentale. Le travail psychologique du Lion est de passer de la recherche d\u2019approbation extérieure à une reconnaissance intérieure de sa propre dignité — un rayonnement qui ne dépend plus de l\u2019applaudimètre."
    ],
    strengths: [
      "Générosité naturelle et grandeur d\u2019âme",
      "Charisme et capacité à inspirer la confiance",
      "Créativité flamboyante et sens du spectacle",
      "Loyauté féroce envers ceux qu\u2019il aime",
      "Courage d\u2019être soi-même dans un monde conformiste"
    ],
    challenges: [
      "Besoin excessif de reconnaissance et de validation",
      "Orgueil blessé qui peut se transformer en tyrannie",
      "Difficulté à accepter des rôles secondaires quand la situation l\u2019exige",
      "Tendance au drame émotionnel quand il se sent ignoré"
    ],
    love: [
      "En amour, le Lion est un partenaire d\u2019une générosité spectaculaire. Il aime avec panache — les grandes déclarations, les gestes romantiques, les surprises élaborées font partie de son répertoire naturel. Pour lui, la relation amoureuse est une scène sur laquelle deux êtres se célèbrent mutuellement, un espace où chacun brille de sa lumière propre.",
      "Le défi amoureux du Lion est d\u2019apprendre que l\u2019amour véritable inclut aussi les moments sans éclat — les matins difficiles, les compromis silencieux, les périodes où l\u2019autre a besoin d\u2019attention alors que le Lion traverse sa propre nuit. Quand il accepte que la vulnérabilité est une forme supérieure de courage, le Lion découvre une intimité d\u2019une profondeur qu\u2019il ne soupçonnait pas."
    ],
    work: [
      "Dans le travail, le Lion excelle naturellement dans les positions de leadership, les arts, le spectacle, la direction créative et l\u2019entrepreneuriat. Il a besoin de sentir que son travail compte, qu\u2019il laisse une empreinte. Les rôles anonymes et les tâches routinières l\u2019éteignent aussi sûrement que l\u2019eau éteint le feu.",
      "Sa force professionnelle est sa capacité à mobiliser et à inspirer une équipe autour d\u2019une vision ambitieuse. Son défi est d\u2019apprendre que le vrai leadership inclut l\u2019humilité de reconnaître les contributions des autres et la sagesse de partager le mérite. Le Lion qui a intégré cette leçon devient un leader véritablement solaire — il élève les autres au lieu de simplement briller au-dessus d\u2019eux."
    ],
  },
  vierge: {
    slug: "vierge",
    name: "Vierge",
    glyph: "♍",
    dates: "23 août – 22 septembre",
    element: "Terre",
    modality: "Mutable",
    planet: "Mercure",
    personality: [
      "La Vierge incarne l\u2019archétype de l\u2019analyste sacré, celui qui discerne l\u2019ordre dans le chaos et cherche à perfectionner la matière par l\u2019intelligence. Gouvernée par Mercure dans sa fonction analytique, elle possède un regard d\u2019une précision extraordinaire — elle voit ce que les autres ne voient pas, les détails qui font la différence, les failles invisibles dans un système apparemment parfait.",
      "Jung reconnaîtrait dans la Vierge l\u2019expression de la fonction pensée appliquée au concret, cette capacité à discriminer, à trier, à organiser l\u2019expérience en catégories signifiantes. Mais la Vierge est bien plus qu\u2019un esprit analytique : elle porte en elle un idéal de pureté et d\u2019intégrité qui donne à son travail quotidien une dimension quasi rituelle. Chaque tâche accomplie avec soin est un acte de dévotion.",
      "Liz Greene souligne que la blessure centrale de la Vierge est le sentiment de n\u2019être jamais assez — assez compétente, assez ordonnée, assez digne. Cette autocritique impitoyable, quand elle est conscientisée, devient un extraordinaire moteur de croissance personnelle. La Vierge évoluée a appris que la perfection n\u2019est pas un objectif mais un processus, et que l\u2019imperfection elle-même possède une beauté que seul un regard vraiment affiné peut percevoir."
    ],
    strengths: [
      "Esprit analytique d\u2019une précision remarquable",
      "Fiabilité et sens du service authentique",
      "Humilité et capacité d\u2019amélioration continue",
      "Intelligence pratique et efficacité organisationnelle",
      "Discernement qui distingue l\u2019essentiel du superflu"
    ],
    challenges: [
      "Perfectionnisme qui peut paralyser l\u2019action",
      "Autocritique excessive et sentiment d\u2019insuffisance chronique",
      "Tendance à se perdre dans les détails au détriment de la vision globale",
      "Difficulté à recevoir de l\u2019aide et à déléguer"
    ],
    love: [
      "En amour, la Vierge est un partenaire d\u2019une attention rare. Son amour s\u2019exprime par les gestes concrets du quotidien — réparer ce qui est cassé, anticiper un besoin pratique, se souvenir d\u2019un détail insignifiant qui révèle une écoute profonde. Elle ne fait pas de grandes déclarations romantiques, mais sa présence attentive est un cadeau inestimable pour qui sait le reconnaître.",
      "Le défi amoureux de la Vierge est de désarmer son regard critique dans l\u2019intimité. Quand elle analyse son partenaire avec le même niveau d\u2019exigence qu\u2019elle s\u2019applique à elle-même, la relation peut devenir un espace d\u2019évaluation permanente plutôt qu\u2019un refuge. Son apprentissage est de découvrir que l\u2019amour véritable n\u2019a pas besoin d\u2019être parfait pour être réel — et que la tendresse commence là où le jugement s\u2019arrête."
    ],
    work: [
      "Professionnellement, la Vierge excelle dans les métiers qui exigent de la rigueur, de l\u2019analyse et un souci du détail : santé, recherche, édition, comptabilité, artisanat de précision, qualité et audit. Elle est l\u2019architecte invisible des systèmes qui fonctionnent — celle qui s\u2019assure que chaque rouage est à sa place.",
      "Sa force est sa capacité à optimiser n\u2019importe quel processus et à maintenir des standards d\u2019excellence élevés. Son défi est d\u2019apprendre que le « suffisamment bon » existe, et qu\u2019un projet imparfait mais livré vaut toujours mieux qu\u2019un projet parfait mais éternellement en chantier. La Vierge accomplie sait quand le détail compte et quand il faut savoir s\u2019arrêter."
    ],
  },
  balance: {
    slug: "balance",
    name: "Balance",
    glyph: "♎",
    dates: "23 septembre – 22 octobre",
    element: "Air",
    modality: "Cardinal",
    planet: "Vénus",
    personality: [
      "La Balance incarne l\u2019archétype du médiateur, de l\u2019artisan de l\u2019harmonie qui cherche l\u2019équilibre entre les polarités. Gouvernée par Vénus dans sa dimension intellectuelle et esthétique, elle perçoit la beauté et la discordance avec une acuité saisissante. Ce n\u2019est pas de la frivolité — c\u2019est une intelligence relationnelle profonde, une conscience aiguë que la qualité de nos liens détermine la qualité de notre existence.",
      "Jung verrait dans la Balance l\u2019expression du processus d\u2019individuation dans sa phase relationnelle — ce moment où le moi ne peut se connaître qu\u2019à travers le miroir de l\u2019autre. Le natif de la Balance ne fuit pas le conflit par lâcheté : il cherche une résolution qui honore les deux parties, une synthèse qui transcende l\u2019opposition. Cette quête d\u2019équilibre est un acte créatif, pas un compromis mou.",
      "Liz Greene observe que la difficulté centrale de la Balance réside dans sa relation avec sa propre agressivité. Éduquée à plaire et à harmoniser, elle peut refouler ses désirs authentiques au profit d\u2019une paix superficielle. Le travail psychologique de la Balance est d\u2019apprendre que le vrai équilibre inclut la capacité de dire non, de déplaire, de choisir un camp — et que cette affirmation, loin de détruire l\u2019harmonie, la rend plus authentique."
    ],
    strengths: [
      "Intelligence relationnelle et diplomatie naturelle",
      "Sens esthétique raffiné dans tous les domaines de la vie",
      "Capacité à voir les deux côtés d\u2019une situation",
      "Élégance et grâce dans la résolution de conflits",
      "Sens profond de la justice et de l\u2019équité"
    ],
    challenges: [
      "Indécision paralysante face aux choix importants",
      "Tendance à sacrifier ses besoins pour maintenir la paix",
      "Difficulté à assumer des positions impopulaires",
      "Dépendance excessive à l\u2019approbation de l\u2019entourage"
    ],
    love: [
      "En amour, la Balance est le signe le plus fondamentalement relationnel du zodiaque. Elle s\u2019épanouit dans le couple comme une fleur dans la lumière — la présence de l\u2019autre éveille en elle des facettes de sa personnalité qui resteraient dormantes dans la solitude. Elle élève la relation au rang d\u2019art, soignant l\u2019esthétique du quotidien, cultivant les rituels de connexion, créant un espace de beauté partagée.",
      "Le défi amoureux de la Balance est de ne pas se perdre dans l\u2019autre. Sa capacité d\u2019adaptation peut devenir un caméléonisme relationnel où elle adopte les goûts, les opinions et les désirs de son partenaire au détriment des siens. La Balance évoluée comprend que le véritable partenariat exige deux individus complets, et que le plus beau cadeau qu\u2019elle puisse offrir à l\u2019autre est une version pleinement assumée d\u2019elle-même."
    ],
    work: [
      "Professionnellement, la Balance excelle dans les métiers liés au droit, à la médiation, à la diplomatie, au design, aux relations publiques et au conseil en image. Partout où il faut créer de l\u2019harmonie entre des éléments disparates, sa présence est précieuse. Elle possède un talent naturel pour transformer les environnements de travail conflictuels en espaces de collaboration productive.",
      "Sa force est sa capacité à maintenir des relations professionnelles de qualité et à négocier des accords qui satisfont toutes les parties. Son défi est de prendre des décisions tranchées quand la situation l\u2019exige et d\u2019accepter que certains conflits sont nécessaires pour avancer. La Balance accomplie sait que la justice véritable n\u2019est pas toujours symétrique."
    ],
  },
  scorpion: {
    slug: "scorpion",
    name: "Scorpion",
    glyph: "♏",
    dates: "23 octobre – 21 novembre",
    element: "Eau",
    modality: "Fixe",
    planet: "Pluton/Mars",
    personality: [
      "Le Scorpion incarne l\u2019archétype de la mort et de la renaissance, du phénix qui doit traverser les ténèbres pour renaître transformé. Gouverné par Pluton et Mars, il possède une intensité psychique qui le conduit naturellement vers les profondeurs — les tabous, les secrets, les vérités que la société préfère enfouir sous le vernis de la politesse. Le Scorpion ne survole pas l\u2019existence : il la pénètre, la démonte, l\u2019interroge jusqu\u2019à l\u2019os.",
      "Jung reconnaîtrait dans le Scorpion l\u2019archétype de la descente dans l\u2019ombre — cette confrontation volontaire avec les aspects refoulés de la psyché qui est au cœur du processus d\u2019individuation. Le natif du Scorpion comprend instinctivement que la lumière sans l\u2019ombre est aveuglante, que la vérité sans la douleur est incomplète. Cette sagesse sombre lui confère une authenticité rare et parfois dérangeante.",
      "Liz Greene observe que le Scorpion vit avec une conscience aiguë du pouvoir — celui qu\u2019il exerce et celui qu\u2019on exerce sur lui. Son travail psychologique central est d\u2019apprendre à utiliser cette puissance transformatrice au service de la guérison plutôt que de la domination. Le Scorpion évolué est un alchimiste de l\u2019âme, capable de transmuter la souffrance en sagesse et la rage en compassion lucide."
    ],
    strengths: [
      "Intensité émotionnelle et capacité de transformation profonde",
      "Courage de regarder la vérité en face, même quand elle fait mal",
      "Loyauté absolue et engagement total dans ce qui compte",
      "Intuition pénétrante qui perçoit les motivations cachées",
      "Résilience exceptionnelle face aux crises et aux épreuves"
    ],
    challenges: [
      "Tendance au contrôle et à la manipulation dans les moments de vulnérabilité",
      "Rancune tenace qui peut se transformer en désir de vengeance",
      "Jalousie et possessivité dans les relations intimes",
      "Difficulté à faire confiance après une trahison"
    ],
    love: [
      "En amour, le Scorpion cherche la fusion totale — une intimité qui va bien au-delà du physique pour toucher les couches les plus profondes de l\u2019être. Il veut connaître l\u2019autre dans ses recoins les plus sombres, ses failles les plus secrètes, ses désirs les plus inavouables. Pour le Scorpion, l\u2019amour superficiel est un oxymore — soit la relation atteint la profondeur, soit elle n\u2019existe pas vraiment.",
      "Le défi amoureux du Scorpion est d\u2019offrir la même transparence qu\u2019il exige de l\u2019autre. Sa peur de la vulnérabilité peut le conduire à tester en permanence la loyauté de son partenaire, créant des dynamiques de pouvoir toxiques. Le Scorpion évolué comprend que le véritable pouvoir dans l\u2019amour réside dans la capacité de se montrer sans armure, et que la confiance ne se conquiert pas — elle se cultive dans la patience et la réciprocité."
    ],
    work: [
      "Professionnellement, le Scorpion excelle dans les métiers d\u2019investigation, de recherche, de psychologie, de chirurgie, de finance stratégique et de gestion de crise. Partout où il faut aller au-delà des apparences et travailler avec des réalités complexes ou tabouées, son talent brille. Il est aussi un excellent stratège, capable de voir plusieurs coups d\u2019avance.",
      "Sa force est sa ténacité absolue et sa capacité à rester concentré sur un objectif malgré les obstacles. Son défi est d\u2019apprendre à lâcher prise quand un projet ou une collaboration a atteint son terme, et de ne pas transformer les dynamiques professionnelles en jeux de pouvoir. Le Scorpion accompli utilise son intensité pour transformer les situations plutôt que pour les contrôler."
    ],
  },
  sagittaire: {
    slug: "sagittaire",
    name: "Sagittaire",
    glyph: "♐",
    dates: "22 novembre – 21 décembre",
    element: "Feu",
    modality: "Mutable",
    planet: "Jupiter",
    personality: [
      "Le Sagittaire incarne l\u2019archétype du chercheur de sens, de l\u2019explorateur philosophique qui vise toujours plus loin que l\u2019horizon visible. Gouverné par Jupiter, il possède une soif de compréhension qui dépasse le savoir factuel pour toucher à la sagesse — cette vision panoramique qui relie les fragments de l\u2019expérience humaine en un récit porteur de sens. Le Sagittaire ne veut pas simplement savoir : il veut comprendre pourquoi.",
      "Jung aurait vu dans le Sagittaire l\u2019expression de la quête de totalité, ce mouvement de la psyché vers une synthèse toujours plus large de l\u2019expérience. Le natif du Sagittaire vit avec l\u2019intuition que la vie est un voyage initiatique, que chaque rencontre, chaque culture, chaque système de pensée est une pièce du puzzle cosmique. Cette foi fondamentale dans le sens de l\u2019existence lui confère un optimisme qui peut sembler naïf mais qui est en réalité profondément philosophique.",
      "Liz Greene souligne que le travail psychologique du Sagittaire consiste à réconcilier sa vision idéaliste avec les limites du réel. Sa quête d\u2019absolu peut le conduire à fuir les contraintes du quotidien, les responsabilités concrètes, les engagements qui limitent sa liberté. Le Sagittaire évolué comprend que la liberté véritable ne consiste pas à fuir les limites mais à trouver l\u2019infini à l\u2019intérieur de celles-ci."
    ],
    strengths: [
      "Vision large et capacité à donner du sens aux événements",
      "Optimisme contagieux et foi dans les possibilités humaines",
      "Honnêteté directe et franc-parler rafraîchissant",
      "Ouverture culturelle et curiosité pour l\u2019altérité",
      "Enthousiasme mobilisateur et énergie d\u2019exploration"
    ],
    challenges: [
      "Tendance à l\u2019excès dans tous les domaines de la vie",
      "Difficulté avec les détails et les engagements à long terme",
      "Franc-parler qui peut blesser par manque de tact",
      "Fuite des responsabilités concrètes au profit de projets grandioses"
    ],
    love: [
      "En amour, le Sagittaire cherche un compagnon d\u2019aventure — quelqu\u2019un qui partage sa soif de découverte et son refus de la routine. La relation idéale pour lui est un voyage à deux, une exploration mutuelle qui ne cesse jamais de surprendre. Il a besoin d\u2019un partenaire qui possède sa propre quête, sa propre flamme, et qui ne cherche pas à éteindre la sienne sous prétexte de stabilité.",
      "Le défi amoureux du Sagittaire est d\u2019accepter que l\u2019intimité profonde exige de rester — de rester présent dans les moments difficiles, de rester engagé quand l\u2019herbe semble plus verte ailleurs, de rester vulnérable quand la fuite serait plus confortable. Le Sagittaire évolué découvre que la plus grande aventure n\u2019est pas le tour du monde mais la traversée du cœur humain dans toute sa complexité."
    ],
    work: [
      "Professionnellement, le Sagittaire s\u2019épanouit dans l\u2019enseignement supérieur, la philosophie, le droit international, le tourisme, l\u2019édition et les médias. Il excelle dans tout rôle qui lui permet de transmettre une vision, de connecter des idées et des cultures, d\u2019ouvrir des horizons. L\u2019entrepreneuriat l\u2019attire aussi, surtout quand il peut construire quelque chose qui a un impact large.",
      "Sa force professionnelle est sa capacité à inspirer et à motiver par la vision plutôt que par le contrôle. Son défi est de maintenir la rigueur nécessaire dans l\u2019exécution quotidienne et de ne pas abandonner un projet dès que le frisson de la nouveauté s\u2019estompe. Le Sagittaire accompli est celui qui a appris que la vraie expansion inclut la discipline — non pas comme une prison, mais comme l\u2019arc qui permet à la flèche de voler plus loin."
    ],
  },
  capricorne: {
    slug: "capricorne",
    name: "Capricorne",
    glyph: "♑",
    dates: "22 décembre – 19 janvier",
    element: "Terre",
    modality: "Cardinal",
    planet: "Saturne",
    personality: [
      "Le Capricorne incarne l\u2019archétype du sage ancien, de l\u2019architecte qui construit pour l\u2019éternité. Gouverné par Saturne, il possède une maturité précoce et une conscience aiguë du temps — non pas le temps comme ennemi, mais comme allié de ceux qui savent travailler avec patience et persévérance. Le Capricorne comprend instinctivement que tout ce qui a de la valeur demande du temps, de l\u2019effort et de la discipline.",
      "Jung aurait reconnu dans le Capricorne l\u2019archétype du Senex — le vieux sage qui porte à la fois la sagesse de l\u2019expérience et le poids de la responsabilité. Ce signe traverse souvent une jeunesse vécue comme trop sérieuse, trop chargée de devoirs, avant de connaître un allègement paradoxal avec l\u2019âge. Le Capricorne vieillit à l\u2019envers : il commence grave et finit léger, comme si les années lui apprenaient enfin l\u2019art de la joie.",
      "Liz Greene souligne que la blessure profonde du Capricorne est souvent liée à l\u2019autorité — un père absent, une exigence parentale excessive, ou un sentiment précoce de devoir porter des responsabilités d\u2019adulte. Son travail psychologique est de transformer cette blessure en force : devenir sa propre autorité intérieure, une structure qui soutient plutôt qu\u2019elle n\u2019opprime, un cadre qui libère plutôt qu\u2019il n\u2019emprisonne."
    ],
    strengths: [
      "Discipline et persévérance dans les projets à long terme",
      "Sens des responsabilités et fiabilité absolue",
      "Ambition constructive et vision stratégique",
      "Intégrité et sens de l\u2019honneur",
      "Sagesse pratique qui s\u2019enrichit avec l\u2019âge"
    ],
    challenges: [
      "Rigidité émotionnelle et difficulté à exprimer la vulnérabilité",
      "Tendance au pessimisme et à la mélancolie saturnienne",
      "Obsession du contrôle et peur de l\u2019imprévu",
      "Risque de sacrifier le bonheur présent pour un futur hypothétique"
    ],
    love: [
      "En amour, le Capricorne est un partenaire de construction — il bâtit la relation comme il bâtit tout le reste, avec méthode, engagement et une vision à long terme. Sa fidélité n\u2019est pas un automatisme mais un choix renouvelé, une décision consciente de rester et de travailler à la relation même quand l\u2019enthousiasme initial s\u2019est transformé en quelque chose de plus profond et de moins spectaculaire.",
      "Le défi amoureux du Capricorne est de s\u2019autoriser la tendresse spontanée et le lâcher-prise émotionnel. Sa peur de la vulnérabilité peut créer une distance affective qui frustre des partenaires plus expressifs. Quand le Capricorne apprend à baisser ses murs — ne serait-ce que dans l\u2019intimité du couple — il révèle une profondeur affective qui surprend par son intensité ceux qui le croyaient froid."
    ],
    work: [
      "Professionnellement, le Capricorne excelle dans les positions de direction, l\u2019administration, la finance, l\u2019ingénierie, l\u2019architecture et tout domaine qui exige de la rigueur et une vision à long terme. Il gravit les échelons avec une patience qui décourage ses concurrents — non par ruse, mais par la qualité constante et la fiabilité de son travail.",
      "Sa force est sa capacité à transformer une vision ambitieuse en réalité tangible par un travail méthodique et discipliné. Son défi est d\u2019apprendre que le succès professionnel ne justifie pas le sacrifice de tout le reste — la santé, les relations, la joie de vivre. Le Capricorne accompli est celui qui a compris que la vraie réussite est une montagne dont le sommet inclut aussi le bonheur."
    ],
  },
  verseau: {
    slug: "verseau",
    name: "Verseau",
    glyph: "♒",
    dates: "20 janvier – 18 février",
    element: "Air",
    modality: "Fixe",
    planet: "Uranus/Saturne",
    personality: [
      "Le Verseau incarne l\u2019archétype du visionnaire, du porteur d\u2019eau qui verse les idées du futur dans le présent. Gouverné par Uranus et Saturne, il vit dans la tension créatrice entre la tradition et la révolution, entre la structure et la libération. Le Verseau ne rejette pas le passé par caprice — il le transcende par nécessité intérieure, parce qu\u2019il perçoit des possibilités que la majorité ne voit pas encore.",
      "Jung reconnaîtrait dans le Verseau l\u2019expression de l\u2019inconscient collectif dans sa dimension prospective — cette intuition des mouvements sociaux et des idées en gestation qui transformeront le monde demain. Le natif du Verseau pense naturellement en termes de systèmes, de réseaux et de collectifs. Son intelligence n\u2019est pas sentimentale mais structurelle : il voit les patterns, les connexions, les leviers qui permettent de changer un système entier.",
      "Liz Greene observe que le paradoxe central du Verseau est son besoin simultané d\u2019appartenance et d\u2019originalité. Il veut faire partie de la communauté humaine tout en refusant de se fondre dans la masse. Ce tiraillement entre l\u2019universel et l\u2019individuel est la source de sa créativité mais aussi de sa solitude. Le Verseau évolué a appris qu\u2019être unique n\u2019empêche pas d\u2019être intime, et que l\u2019attachement émotionnel n\u2019est pas une prison mais un ancrage."
    ],
    strengths: [
      "Vision innovante et capacité à penser hors des cadres",
      "Idéalisme sincère et engagement pour le bien commun",
      "Indépendance intellectuelle et refus du conformisme",
      "Capacité à fédérer autour d\u2019idées progressistes",
      "Objectivité et recul dans l\u2019analyse des situations"
    ],
    challenges: [
      "Détachement émotionnel qui peut être vécu comme de la froideur",
      "Tendance à intellectualiser les relations au détriment de l\u2019intimité",
      "Obstination paradoxale derrière une apparence d\u2019ouverture",
      "Difficulté à gérer les émotions intenses — les siennes et celles des autres"
    ],
    love: [
      "En amour, le Verseau cherche d\u2019abord une connexion intellectuelle et une amitié profonde. Il est attiré par les esprits originaux, les personnalités atypiques, les êtres qui refusent les rôles préfabriqués. La relation conventionnelle l\u2019ennuie profondément — il a besoin de réinventer les codes du couple, de créer un modèle relationnel qui lui ressemble plutôt que de reproduire celui de ses parents.",
      "Le défi amoureux du Verseau est d\u2019accepter que l\u2019intimité émotionnelle exige un engagement du cœur, pas seulement de l\u2019esprit. Sa tendance à analyser les sentiments plutôt qu\u2019à les vivre peut créer une distance frustrante pour des partenaires plus émotionnels. Le Verseau évolué découvre que les émotions ne sont pas des ennemies de la raison mais des informations précieuses que l\u2019intelligence seule ne peut pas capter."
    ],
    work: [
      "Professionnellement, le Verseau s\u2019épanouit dans les nouvelles technologies, la recherche scientifique, l\u2019humanitaire, l\u2019innovation sociale et les médias numériques. Il excelle dans les environnements qui valorisent la créativité et la pensée non conventionnelle. Les structures hiérarchiques rigides et les processus routiniers l\u2019étouffent — il a besoin de sentir qu\u2019il contribue à quelque chose de plus grand que son seul avancement personnel.",
      "Sa force est sa capacité à voir des solutions là où les autres voient des impasses et à fédérer des équipes autour de projets innovants. Son défi est de maintenir un engagement concret dans la durée et de ne pas passer d\u2019une idée brillante à l\u2019autre sans jamais les concrétiser. Le Verseau accompli allie la vision du futur à la discipline du présent — il ne se contente pas de rêver le monde de demain, il le construit."
    ],
  },
  poissons: {
    slug: "poissons",
    name: "Poissons",
    glyph: "♓",
    dates: "19 février – 20 mars",
    element: "Eau",
    modality: "Mutable",
    planet: "Neptune/Jupiter",
    personality: [
      "Les Poissons incarnent l\u2019archétype du mystique, du rêveur éveillé qui perçoit la réalité invisible derrière les apparences. Gouvernés par Neptune et Jupiter, ils possèdent une perméabilité psychique qui les rend extraordinairement réceptifs aux ambiances, aux émotions collectives et aux courants souterrains de l\u2019inconscient. Dernier signe du zodiaque, les Poissons portent en eux la mémoire de tous les signes qui les précèdent — une sagesse diffuse, parfois accablante, toujours profonde.",
      "Jung aurait reconnu dans les Poissons l\u2019expression la plus directe de l\u2019inconscient collectif dans sa dimension créatrice et spirituelle. Le natif des Poissons navigue entre les mondes — le rationnel et l\u2019imaginaire, le personnel et le transpersonnel, le concret et le symbolique. Cette fluidité psychique est à la fois un don rare et un défi quotidien : comment rester ancré dans la réalité quand on perçoit des dimensions que la plupart des gens ignorent ?",
      "Liz Greene souligne que le travail psychologique des Poissons consiste à trouver un contenant pour leur immensité intérieure. Sans structure — artistique, spirituelle, thérapeutique — leur sensibilité peut les submerger et les conduire vers des formes d\u2019évasion destructrices. Les Poissons évolués ont trouvé comment canaliser leur connexion au transcendant dans une forme terrestre — une œuvre d\u2019art, une pratique de soin, une présence qui guérit simplement par sa qualité d\u2019écoute."
    ],
    strengths: [
      "Empathie universelle et compassion sans limites",
      "Imagination créatrice et accès à l\u2019inspiration",
      "Intuition quasi médiumnique dans la lecture des situations",
      "Adaptabilité fluide et capacité à se réinventer",
      "Profondeur spirituelle et connexion au transcendant"
    ],
    challenges: [
      "Tendance à l\u2019évasion face aux réalités difficiles",
      "Difficulté à poser des limites et à dire non",
      "Confusion entre ses propres émotions et celles des autres",
      "Risque de se perdre dans des illusions ou des dépendances"
    ],
    love: [
      "En amour, les Poissons offrent une connexion d\u2019une qualité quasi spirituelle. Ils aiment avec une empathie totale, une capacité à se mettre dans la peau de l\u2019autre qui rend leur présence extraordinairement réconfortante. Le partenaire des Poissons se sent compris à un niveau qu\u2019il n\u2019a peut-être jamais connu — comme si quelqu\u2019un voyait enfin son âme au-delà de ses masques sociaux.",
      "Le défi amoureux des Poissons est de maintenir leur identité propre dans la fusion relationnelle. Leur tendance à absorber les émotions de l\u2019autre peut les conduire à disparaître dans la relation, perdant le contact avec leurs propres désirs et besoins. Les Poissons évolués apprennent que la compassion authentique inclut la compassion envers soi-même, et que l\u2019amour le plus pur commence par une relation saine avec sa propre intériorité."
    ],
    work: [
      "Professionnellement, les Poissons s\u2019épanouissent dans les arts, la musique, le cinéma, la photographie, la thérapie, les métiers du soin et tout domaine où l\u2019imagination et l\u2019empathie sont des atouts. Ils excellent aussi dans la recherche spirituelle, l\u2019accompagnement de fin de vie et les professions qui demandent une écoute profonde plutôt qu\u2019une efficacité mécanique.",
      "Leur force est leur capacité à percevoir des possibilités créatives invisibles aux esprits plus pragmatiques et à toucher les gens au niveau de l\u2019âme. Leur défi est de structurer leur travail suffisamment pour transformer leurs visions en réalisations concrètes. Les Poissons accomplis trouvent un équilibre entre le rêve et la réalité, entre l\u2019inspiration qui les traverse et la discipline qui la matérialise."
    ],
  },
};

const elementColor: Record<string, string> = {
  Feu: "#ef4444",
  Terre: "#22c55e",
  Air: "#60a5fa",
  Eau: "#a78bfa",
};

/* ------------------------------------------------------------------ */
/*  Static generation                                                  */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return Object.keys(signs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sign = signs[slug];
  if (!sign) return {};
  return {
    title: `${sign.name} (${sign.glyph}) — Personnalité, amour, travail | Ciel Natal`,
    description: `Découvrez le signe ${sign.name} en astrologie psychologique : personnalité profonde, forces et défis, compatibilité amoureuse et vocation professionnelle. ${sign.dates}.`,
    keywords: [
      sign.name,
      "signe du zodiaque",
      "astrologie",
      `${sign.name} personnalité`,
      `${sign.name} amour`,
      `${sign.name} travail`,
      "thème astral",
      sign.element,
    ],
    openGraph: {
      title: `${sign.glyph} ${sign.name} — Astrologie psychologique | Ciel Natal`,
      description: `Portrait astrologique complet du signe ${sign.name}. ${sign.dates}. Élément ${sign.element}, planète ${sign.planet}.`,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function SignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sign = signs[slug];
  if (!sign) return notFound();

  const elColor = elementColor[sign.element] ?? "#888";

  return (
    <PageShell title={sign.name}>
      {/* Sign icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
          <SignIcon name={sign.name} size={36} color="var(--color-accent-lavender)" glow />
        </div>
      </div>
      {/* ---- Header badges ---- */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <span className="text-xs font-mono px-3 py-1 rounded-full border border-[var(--color-glass-border)] text-[var(--color-text-secondary)]">
          {sign.dates}
        </span>
        <span
          className="text-xs font-mono px-3 py-1 rounded-full"
          style={{ color: elColor, border: `1px solid ${elColor}40` }}
        >
          {sign.element}
        </span>
        <span className="text-xs font-mono px-3 py-1 rounded-full border border-[var(--color-glass-border)] text-[var(--color-text-secondary)]">
          {sign.modality}
        </span>
        <span className="text-xs font-mono px-3 py-1 rounded-full border border-[var(--color-glass-border)] text-[var(--color-text-secondary)]">
          {sign.planet}
        </span>
      </div>

      {/* ---- Personnalité ---- */}
      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          Personnalite
        </h2>
        {sign.personality.map((p, i) => (
          <p key={i} className={i > 0 ? "mt-3" : ""}>
            {p}
          </p>
        ))}
      </section>

      {/* ---- Forces et défis ---- */}
      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          Forces et defis
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-accent-lavender)] mb-2">
              Forces
            </h3>
            <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
              {sign.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-400 mb-2">
              Defis
            </h3>
            <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
              {sign.challenges.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---- En amour ---- */}
      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          En amour
        </h2>
        {sign.love.map((p, i) => (
          <p key={i} className={i > 0 ? "mt-3" : ""}>
            {p}
          </p>
        ))}
      </section>

      {/* ---- Dans le travail ---- */}
      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          Dans le travail
        </h2>
        {sign.work.map((p, i) => (
          <p key={i} className={i > 0 ? "mt-3" : ""}>
            {p}
          </p>
        ))}
      </section>

      {/* ---- CTA ---- */}
      <div className="mt-4 text-center">
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg bg-[var(--color-accent-lavender)] text-white font-cinzel text-sm hover:opacity-90 transition"
        >
          Calcule ta carte du ciel gratuitement
        </Link>
      </div>

      {/* ---- Navigation ---- */}
      <div className="mt-6 text-center">
        <Link
          href="/signe"
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
        >
          Voir tous les signes du zodiaque
        </Link>
      </div>
    </PageShell>
  );
}
