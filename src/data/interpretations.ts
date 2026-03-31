// ═══════════════════════════════════════════════════════════════════
// Corpus d'interprétations — Ciel Natal
// Astrologie occidentale tropicale · Approche psychologique (Jung/Greene)
// Ton : valorisant, non-déterministe, poétique mais ancré
// ═══════════════════════════════════════════════════════════════════

// ─── Planète en Signe ─────────────────────────────────────────────
export const planetInSign: Record<string, Record<string, string>> = {
  Soleil: {
    Belier: "Ton Soleil en Bélier porte l'archétype du pionnier. Tu ressens un besoin viscéral d'initier, de tracer ta propre voie avec une audace qui inspire autant qu'elle déstabilise. Cette flamme intérieure te pousse vers l'avant — le défi étant parfois de tempérer l'impulsion pour laisser mûrir tes projets. Ta vitalité est contagieuse et ton courage, une ressource inépuisable.",
    Taureau: "Ton Soleil en Taureau ancre ta conscience dans le monde tangible. Tu construis avec patience et détermination, trouvant ta force dans la continuité plutôt que dans le changement brusque. Les plaisirs sensoriels — musique, nature, bonne cuisine — ne sont pas des luxes pour toi, mais des nécessités qui nourrissent ton âme. Ta persévérance tranquille est ta plus grande arme.",
    Gemeaux: "Ton Soleil en Gémeaux anime un esprit qui ne se repose jamais. La curiosité est ton carburant — tu as besoin de comprendre, de connecter, de nommer les choses. Ta capacité à jongler avec plusieurs idées simultanément est un talent rare, même si elle peut parfois disperser ton énergie. Le défi est de canaliser cette vivacité sans éteindre ta flamme exploratrice.",
    Cancer: "Ton Soleil en Cancer enracine ton identité dans l'émotionnel et l'intuitif. Tu portes en toi une capacité naturelle à ressentir les atmosphères, à nourrir les liens et à créer des espaces de sécurité pour toi et les tiens. Ta sensibilité n'est pas une fragilité — c'est un radar sophistiqué qui te guide avec une sagesse que la logique seule ne pourrait atteindre.",
    Lion: "Ton Soleil en Lion rayonne d'une chaleur solaire authentique. Tu as besoin de créer, de t'exprimer, de laisser ta marque dans le monde — non par ego, mais parce que la vie te demande de briller. Ta générosité naturelle et ton sens du spectacle inspirent les autres. Le défi est d'apprendre que tu mérites l'amour même quand tu ne performes pas.",
    Vierge: "Ton Soleil en Vierge affûte ta perception du monde avec une précision chirurgicale. Tu vois les détails que les autres manquent, et ton intelligence analytique est un outil puissant de compréhension. Ton désir d'améliorer et d'être utile est noble — veille simplement à t'inclure dans cette bienveillance. La perfection n'est pas le but ; la présence attentive, si.",
    Balance: "Ton Soleil en Balance te place naturellement au carrefour des perspectives. Tu possèdes un sens inné de la justesse, de l'esthétique et de l'harmonie relationnelle. Ta capacité à voir les deux côtés d'une situation est un don diplomatique rare. L'invitation est de ne pas te perdre dans le miroir des autres — ton propre centre mérite autant d'attention.",
    Scorpion: "Ton Soleil en Scorpion plonge ta conscience dans les profondeurs. Tu ne te satisfais jamais des apparences — ta quête de vérité est absolue, parfois dérangeante, toujours transformatrice. Cette intensité est un superpouvoir : tu vois ce que les autres ne veulent pas regarder. Le défi est d'apprendre que la vulnérabilité n'est pas une faiblesse mais un passage vers l'authentique.",
    Sagittaire: "Ton Soleil en Sagittaire élargit constamment les horizons de ta conscience. Tu es animé·e par une soif de sens, de liberté et de vérité qui te pousse au-delà des limites connues. L'aventure — qu'elle soit géographique, intellectuelle ou spirituelle — est ton oxygène. L'invitation est de parfois ralentir pour intégrer la sagesse accumulée en chemin.",
    Capricorne: "Ton Soleil en Capricorne ancre ta volonté dans la durée et la structure. Tu possèdes une maturité naturelle qui te fait prendre les choses au sérieux — parfois même trop tôt dans la vie. Mais avec le temps, tu t'adoucis et découvres que la légèreté aussi est une force. Ta capacité à bâtir dans la durée est admirable et rare.",
    Verseau: "Ton Soleil en Verseau souffle un vent d'originalité sur tout ce que tu touches. Tu penses naturellement au-delà des conventions, questionnant ce que les autres acceptent sans réfléchir. Cette indépendance d'esprit est un cadeau pour le monde — elle ouvre des chemins que personne n'avait imaginés. L'invitation est de rester connecté·e à ton coeur autant qu'à tes idées.",
    Poissons: "Ton Soleil en Poissons dissout les frontières entre toi et le monde. Ta sensibilité est un instrument de perception extraordinaire — tu captes des nuances, des émotions et des réalités invisibles aux autres. Cette porosité est à la fois ton don et ton défi. Apprendre à te protéger sans te fermer est l'art subtil que ta vie t'enseigne.",
  },
  Lune: {
    Belier: "Ta Lune en Bélier révèle un monde émotionnel spontané et combustible. Tes réactions sont vives et directes — tu as besoin d'exprimer ce que tu ressens immédiatement, sans filtre. Tu te ressources dans l'action, le mouvement et les nouveaux départs. L'apprentissage émotionnel consiste à développer la patience sans éteindre cette belle flamme intérieure.",
    Taureau: "Ta Lune en Taureau parle d'un besoin profond de stabilité et de douceur sensorielle. Tu te ressources dans le confort du familier — un bon repas, un espace sûr, le contact avec la nature. Ta fidélité émotionnelle est remarquable. Le défi est de ne pas confondre sécurité et immobilisme — le changement aussi peut nourrir.",
    Gemeaux: "Ta Lune en Gémeaux anime une vie intérieure en perpétuel mouvement. Tu traites tes émotions par les mots et les idées — parler, écrire, analyser est ta manière de digérer ce que tu ressens. Tu as besoin de stimulation mentale pour te sentir en équilibre. L'invitation est de parfois descendre de la tête vers le corps pour ressentir sans nommer.",
    Cancer: "Ta Lune en Cancer amplifie ta sensibilité naturelle et ton intuition. Tu fonctionnes comme un sismographe émotionnel, captant les ambiances et les non-dits avec une acuité remarquable. Ton besoin de nourrir et d'être nourri·e est au coeur de ton équilibre. L'espace domestique est sacré pour toi — c'est là que tu recharges ton énergie vitale.",
    Lion: "Ta Lune en Lion révèle un besoin émotionnel d'être vu·e, reconnu·e et apprécié·e pour qui tu es vraiment. Tu as un coeur généreux qui s'épanouit dans la chaleur des liens et l'expression créative. La reconnaissance sincère te nourrit profondément — non par vanité, mais parce que l'amour est ton langage premier.",
    Vierge: "Ta Lune en Vierge traduit un besoin d'ordre émotionnel et de clarté intérieure. Tu analyses tes sentiments avec finesse et cherches à comprendre avant de ressentir — ou parfois, à la place de ressentir. Tu te ressources dans les routines bien huilées et le sentiment d'être utile. L'invitation est d'accueillir le désordre émotionnel comme une donnée valide.",
    Balance: "Ta Lune en Balance aspire à l'harmonie relationnelle comme à l'oxygène. Tu as besoin de beauté autour de toi, de relations équilibrées et de paix émotionnelle. Les conflits te déstabilisent profondément. L'apprentissage est de réaliser que l'harmonie authentique inclut parfois des vérités inconfortables — et que ton bien-être compte autant que celui des autres.",
    Scorpion: "Ta Lune en Scorpion révèle une vie émotionnelle d'une profondeur remarquable. Tu ne fais rien à moitié quand il s'agit de ressentir — chaque émotion est vécue pleinement, avec une lucidité parfois déstabilisante. La confiance se construit lentement chez toi, parce que tu cherches l'authenticité absolue. Le défi est de distinguer la prudence nécessaire de la garde excessive.",
    Sagittaire: "Ta Lune en Sagittaire colore ta vie émotionnelle d'optimisme et de soif de liberté. Tu as besoin d'espace — intérieur et extérieur — pour te sentir en équilibre. L'aventure et la quête de sens nourrissent ton âme. L'invitation est de reconnaître que les émotions qui t'ancrent — la tristesse, la nostalgie — méritent autant d'attention que celles qui t'élèvent.",
    Capricorne: "Ta Lune en Capricorne confère à tes émotions une maturité et une réserve qui cachent une grande profondeur. Tu ne montres pas facilement ce que tu ressens, non par froideur, mais par dignité. Tu te ressources dans l'accomplissement et la solitude choisie. L'invitation est de t'autoriser la vulnérabilité — elle ne diminue pas ta force, elle la complète.",
    Verseau: "Ta Lune en Verseau donne à ta vie émotionnelle une qualité détachée et originale. Tu as besoin de liberté intérieure et d'espace pour tes idées. Tu traites souvent tes émotions avec la distance d'un observateur — ce qui peut être un atout comme un évitement. L'invitation est de plonger parfois dans ce que tu ressens sans chercher à le comprendre immédiatement.",
    Poissons: "Ta Lune en Poissons ouvre les portes d'une sensibilité sans frontières. Tu absorbes les émotions ambiantes comme une éponge, et ton monde intérieur est riche de rêves, d'images et d'intuitions profondes. Cette perméabilité est un don extraordinaire — à condition d'apprendre à distinguer ce qui t'appartient de ce que tu captes chez les autres.",
  },
  Mercure: {
    Belier: "Ton Mercure en Bélier pense vite, parle direct et n'a pas le temps pour les nuances diplomatiques. Ton esprit est un éclaireur qui va droit au but. L'invitation est de laisser parfois les autres finir leurs phrases — leur perspective pourrait enrichir la tienne.",
    Taureau: "Ton Mercure en Taureau pense avec méthode et profondeur. Tu prends le temps de digérer les informations avant de te prononcer, et tes conclusions sont généralement solides. Ta voix — littérale et métaphorique — porte un poids de conviction naturel.",
    Gemeaux: "Ton Mercure en Gémeaux est dans son élément naturel — vif, polyvalent, infatigablement curieux. Tu fais des connexions que personne d'autre ne voit et tu communiques avec une aisance remarquable. Le défi est de creuser parfois plutôt que de survoler.",
    Cancer: "Ton Mercure en Cancer pense avec le coeur autant qu'avec la tête. Ta mémoire est émotionnelle — tu retiens ce qui t'a touché. Ta communication est intuitive et empathique, ce qui fait de toi un·e confident·e naturel·le.",
    Lion: "Ton Mercure en Lion s'exprime avec autorité et panache. Tu as le don de captiver un auditoire et de donner du poids à tes mots. Ta pensée est créative et généreuse — tu inspires en communiquant.",
    Vierge: "Ton Mercure en Vierge est un instrument de précision analytique. Tu décortiques, organises et optimises l'information avec une efficacité remarquable. L'invitation est de ne pas te perdre dans les détails au point d'oublier la vue d'ensemble.",
    Balance: "Ton Mercure en Balance pèse naturellement le pour et le contre avec élégance. Tu excelles dans la diplomatie et la négociation, et ton sens de l'équité colore toute ta communication. Le défi est de trancher quand la nuance a atteint sa limite.",
    Scorpion: "Ton Mercure en Scorpion est un détective intellectuel. Tu creuses jusqu'à la vérité, tu perçois les non-dits et les motivations cachées. Ta parole est incisive et transformatrice — elle ne laisse personne indifférent.",
    Sagittaire: "Ton Mercure en Sagittaire pense en grand et vise haut. Tu es attiré·e par les grandes questions — philosophie, sens de la vie, cultures lointaines. Ta communication est enthousiaste et inspirante, même si elle peut parfois manquer de nuance.",
    Capricorne: "Ton Mercure en Capricorne pense avec structure et pragmatisme. Tu ne perds pas de temps avec le superficiel — ta communication est concise, efficace et va droit au but. Ta pensée stratégique est un atout puissant dans toute entreprise.",
    Verseau: "Ton Mercure en Verseau est un laboratoire d'idées avant-gardistes. Tu penses de manière non-conventionnelle, et tes insights surprennent autant qu'ils éclairent. Ta communication est originale — parfois trop pour être immédiatement comprise.",
    Poissons: "Ton Mercure en Poissons pense en images, en intuitions et en ressentis. La logique linéaire n'est pas ton premier langage — tu captes les ambiances, les symboles, les courants sous-jacents. Ta communication est poétique et peut toucher des cordes profondes chez les autres.",
  },
  Venus: {
    Belier: "Ta Vénus en Bélier aime avec passion et spontanéité. Tu es attiré·e par l'intensité des débuts, la conquête et l'enthousiasme amoureux. En amitié comme en amour, tu apprécies les gens directs et courageux. L'invitation est de cultiver la flamme au-delà de l'étincelle initiale.",
    Taureau: "Ta Vénus en Taureau est dans sa dignité — elle exprime l'amour avec une profondeur sensorielle et une fidélité rare. Tu aimes dans la durée, avec une présence physique et émotionnelle qui rassure. La beauté tangible te nourrit l'âme.",
    Gemeaux: "Ta Vénus en Gémeaux a besoin de stimulation intellectuelle dans ses relations. La conversation est ton premier langage amoureux — tu tombes amoureux·se des esprits avant des corps. La variété et la légèreté relationnelle te conviennent naturellement.",
    Cancer: "Ta Vénus en Cancer aime en protégeant et en nourrissant. Ton amour est enveloppant, maternel dans le meilleur sens du terme. Tu crées des espaces intimes et sûrs pour ceux que tu aimes. L'invitation est de ne pas t'oublier dans le don de toi-même.",
    Lion: "Ta Vénus en Lion aime avec panache, générosité et théâtralité. Tu as besoin d'admirer et d'être admiré·e dans tes relations. L'amour est pour toi une célébration — grande, chaleureuse, lumineuse. Tu donnes beaucoup et tu mérites qu'on te le rende.",
    Vierge: "Ta Vénus en Vierge exprime l'amour par les gestes concrets et l'attention aux détails. Tu montres que tu aimes en prenant soin, en étant présent·e et fiable. L'invitation est de t'autoriser l'imperfection dans tes relations — elle fait partie de la beauté humaine.",
    Balance: "Ta Vénus en Balance est dans son domicile — elle cherche l'amour beau, harmonieux et équilibré. Tu as un sens esthétique développé qui colore toutes tes relations. La paix relationnelle est essentielle à ton bien-être. L'art de la relation est véritablement ton art.",
    Scorpion: "Ta Vénus en Scorpion ne connaît pas l'amour tiède. Tu aimes avec une intensité et une profondeur qui transforment. Tu cherches la fusion, la vérité nue, l'engagement total. L'invitation est d'accepter que l'amour puisse aussi être léger sans être superficiel.",
    Sagittaire: "Ta Vénus en Sagittaire a besoin de liberté et d'aventure dans l'amour. Tu es attiré·e par les personnes qui élargissent tes horizons — culturellement, intellectuellement, spirituellement. L'amour est pour toi une exploration joyeuse.",
    Capricorne: "Ta Vénus en Capricorne aime avec sérieux et engagement. Tu ne t'investis pas à la légère, mais quand tu le fais, c'est avec une loyauté et une détermination remarquables. L'invitation est de te permettre la tendresse spontanée, sans attendre de l'avoir méritée.",
    Verseau: "Ta Vénus en Verseau a besoin d'espace et d'originalité dans ses relations. Tu aimes les connexions intellectuelles profondes et les liens qui respectent ta liberté. L'amitié est souvent la fondation de tes amours les plus durables.",
    Poissons: "Ta Vénus en Poissons est dans son exaltation — elle aime avec une compassion et une dévotion sans limites. Tu idéalises l'amour et tu es capable d'une empathie romantique rare. L'invitation est de garder un pied sur terre tout en laissant ton coeur nager dans l'infini.",
  },
  Mars: {
    Belier: "Ton Mars en Bélier est dans son domicile — ton énergie d'action est directe, puissante et impatiente. Tu fonces, tu inities, tu n'attends pas la permission. Cette impulsivité est un moteur puissant quand elle est canalisée vers des objectifs qui comptent.",
    Taureau: "Ton Mars en Taureau agit avec une détermination lente mais irrésistible. Tu ne te précipites pas, mais une fois en mouvement, rien ne t'arrête. Ta persévérance est ta plus grande force d'action — tu construis pierre par pierre, solidement.",
    Gemeaux: "Ton Mars en Gémeaux canalise son énergie dans la communication et la multiplicité. Tu agis sur plusieurs fronts à la fois et tu excelles dans les joutes verbales. L'invitation est de concentrer parfois cette énergie dispersée sur un seul objectif.",
    Cancer: "Ton Mars en Cancer agit instinctivement pour protéger ce qui compte. Ton énergie d'action est guidée par l'émotion — quand tu te bats, c'est pour ceux que tu aimes. La colère peut être difficile à exprimer directement ; elle passe souvent par des voies indirectes.",
    Lion: "Ton Mars en Lion agit avec théâtralité, courage et une générosité dans l'effort qui impressionne. Tu as besoin que tes actions aient un sens, une noblesse. Tu excelles quand tu te bats pour une cause plus grande que toi.",
    Vierge: "Ton Mars en Vierge canalise l'énergie dans l'efficacité et la précision. Tu agis méthodiquement, avec un souci du détail qui rend ton travail remarquable. L'invitation est de ne pas te paralyser par le perfectionnisme — l'action imparfaite vaut mieux que l'inaction parfaite.",
    Balance: "Ton Mars en Balance cherche à agir avec justice et diplomatie. Tu préfères la négociation à la confrontation, et tes actions visent souvent à rétablir l'équilibre. Le défi est d'oser la confrontation quand la diplomatie ne suffit plus.",
    Scorpion: "Ton Mars en Scorpion possède une intensité d'action formidable. Tu agis avec une détermination stratégique, une endurance émotionnelle et un instinct de survie qui te rendent redoutable face aux obstacles. Rien ne t'échappe quand tu vises un objectif.",
    Sagittaire: "Ton Mars en Sagittaire agit avec enthousiasme, vision et une foi contagieuse en l'avenir. Tu as besoin de sentir que tes actions servent un but plus grand — la routine et la petitesse t'étouffent. Tu excelles dans les entreprises audacieuses et les aventures.",
    Capricorne: "Ton Mars en Capricorne est exalté — tu agis avec une discipline, une ambition et une patience stratégique remarquables. Tu sais gravir les montagnes une marche à la fois. L'invitation est de ne pas sacrifier le plaisir du chemin pour la seule satisfaction du sommet.",
    Verseau: "Ton Mars en Verseau canalise l'énergie dans l'innovation et les causes collectives. Tu agis pour changer les systèmes, pas seulement les situations. Ta manière non-conventionnelle de résoudre les problèmes surprend et débloque là où d'autres restent coincés.",
    Poissons: "Ton Mars en Poissons agit par intuition et compassion. Ton énergie d'action est fluide, adaptable, parfois insaisissable — y compris pour toi. Tu excelles dans les domaines créatifs et humanitaires. L'invitation est de clarifier tes désirs pour mieux les servir.",
  },
  Jupiter: {
    Belier: "Ton Jupiter en Bélier amplifie ton esprit d'initiative et ta confiance en toi. La chance sourit souvent aux actions courageuses dans ta vie. Tu grandis en osant, en prenant des risques calculés et en faisant confiance à ton instinct pionnier.",
    Taureau: "Ton Jupiter en Taureau invite à la prospérité par la patience et la constance. Les ressources matérielles et le confort tendent à croître naturellement quand tu restes fidèle à tes valeurs. L'abondance est un thème central de ton chemin de croissance.",
    Gemeaux: "Ton Jupiter en Gémeaux multiplie les opportunités par la communication et les connexions sociales. Ta curiosité est un aimant à chances — chaque conversation peut ouvrir une porte inattendue. Le savoir et le partage des idées sont tes voies d'expansion.",
    Cancer: "Ton Jupiter en Cancer est exalté — la famille, le foyer et les liens émotionnels sont tes plus grandes sources de croissance et d'abondance. Tu granddis en nourrissant les autres, et cette générosité émotionnelle te revient multipliée.",
    Lion: "Ton Jupiter en Lion amplifie ta créativité et ton rayonnement personnel. Les opportunités viennent souvent quand tu oses t'exprimer pleinement et avec générosité. La joie de vivre est ta philosophie et elle attire naturellement l'abondance.",
    Vierge: "Ton Jupiter en Vierge trouve la croissance dans le service et l'amélioration continue. Tu grandis en perfectionnant tes compétences et en étant utile. L'invitation est de ne pas limiter ton expansion par un excès de modestie ou d'autocritique.",
    Balance: "Ton Jupiter en Balance t'offre la croissance par les partenariats et les relations. Les alliances justes et harmonieuses multiplient tes opportunités. Ton sens de l'équité et de la beauté est un vecteur naturel d'expansion.",
    Scorpion: "Ton Jupiter en Scorpion invite à la croissance par la transformation profonde. Les crises deviennent des tremplins, les pertes se muent en renouveau. Tu grandis en osant plonger dans les profondeurs que les autres évitent.",
    Sagittaire: "Ton Jupiter en Sagittaire est dans son domicile — ta soif d'expansion est naturelle et puissante. Les voyages, les études, la philosophie et la quête de sens sont tes portes d'abondance. L'optimisme est ta plus grande ressource.",
    Capricorne: "Ton Jupiter en Capricorne canalise l'expansion dans la structure et l'ambition à long terme. Ta croissance est lente mais solide — chaque accomplissement est une marche de plus vers un sommet que tu atteindras avec certitude.",
    Verseau: "Ton Jupiter en Verseau multiplie les opportunités par l'innovation et la pensée collective. Tu grandis en servant des causes plus grandes que toi et en embrassant les idées non-conventionnelles. L'avenir est ton terrain de jeu naturel.",
    Poissons: "Ton Jupiter en Poissons est dans son domicile traditionnel — la compassion, l'imaginaire et la spiritualité sont tes voies royales d'expansion. Tu grandis en laissant la vie te porter avec confiance, et ta générosité spirituelle attire l'abondance de manières inattendues.",
  },
  Saturne: {
    Belier: "Ton Saturne en Bélier t'invite à structurer ton impulsivité. Le défi est d'apprendre la patience dans l'action, le courage réfléchi plutôt que la témérité. Avec la maturité, ta capacité à initier des projets de manière disciplinée devient une force remarquable.",
    Taureau: "Ton Saturne en Taureau structure ton rapport à la sécurité matérielle. Tu peux avoir appris tôt que les ressources sont limitées, ce qui t'a rendu·e prudent·e et responsable. L'invitation est de croire que l'abondance est aussi possible pour toi.",
    Gemeaux: "Ton Saturne en Gémeaux discipline ta pensée et ta communication. Tu peux avoir douté de ton intelligence ou de ta capacité à t'exprimer. Avec le temps, cette même rigueur fait de toi un·e communicateur·rice d'une profondeur et d'une précision exceptionnelles.",
    Cancer: "Ton Saturne en Cancer touche à la structure émotionnelle et familiale. Tu as peut-être appris à contenir tes émotions tôt dans la vie. L'invitation est de démanteler lentement ces murs intérieurs pour laisser entrer la tendresse que tu mérites.",
    Lion: "Ton Saturne en Lion structure ton expression créative et ta confiance en toi. Tu peux avoir eu du mal à te sentir légitime sous les projecteurs. Avec la maturité, tu découvres que ta créativité disciplinée a une profondeur que la spontanéité seule n'atteint pas.",
    Vierge: "Ton Saturne en Vierge intensifie ton sens du devoir et du perfectionnisme. Tu places la barre très haut pour toi-même, parfois douloureusement haut. L'invitation est d'apprendre que l'imperfection assumée est une forme de sagesse, pas un échec.",
    Balance: "Ton Saturne en Balance est exalté — il structure tes relations avec maturité et justice. Tu prends les engagements au sérieux et tu as besoin de réciprocité authentique. Les relations superficielles ne t'intéressent pas ; tu cherches la profondeur dans chaque lien.",
    Scorpion: "Ton Saturne en Scorpion confronte tes peurs les plus profondes avec une intensité structurante. Les thèmes de contrôle, de perte et de transformation sont centraux dans ta maturation. Chaque crise traversée te rend plus solide et plus sage.",
    Sagittaire: "Ton Saturne en Sagittaire discipline ta quête de sens et de liberté. Tu peux avoir ressenti des limitations dans ton expansion — voyages, études, croyances. L'invitation est de construire ta propre philosophie de vie avec patience et rigueur.",
    Capricorne: "Ton Saturne en Capricorne est dans son domicile — ta discipline, ton ambition et ta capacité à endurer sont naturelles et puissantes. Tu comprends instinctivement que les grandes choses prennent du temps. L'invitation est de ne pas confondre devoir et identité.",
    Verseau: "Ton Saturne en Verseau structure ton rapport à la liberté et à l'individualité. Tu peux osciller entre conformisme et rébellion. L'invitation est de trouver une forme de liberté qui inclut la responsabilité — une originalité au service du collectif.",
    Poissons: "Ton Saturne en Poissons structure le monde intangible — l'imaginaire, la spiritualité, la compassion. Tu peux avoir du mal à poser des limites émotionnelles claires. L'invitation est de donner une forme concrète à tes rêves sans les trahir.",
  },
  Uranus: {
    Belier: "Uranus en Bélier dans ta carte marque une génération qui bouscule les conventions avec audace. En toi, cela se traduit par un besoin impérieux d'authenticité et d'innovation personnelle. Tu es un·e pionnier·ère dans l'âme.",
    Taureau: "Uranus en Taureau révolutionne ton rapport aux valeurs, aux ressources et au monde matériel. Ta génération redéfinit la notion de sécurité et d'abondance. En toi, cela peut se manifester par des approches non-conventionnelles de la prospérité.",
    Gemeaux: "Uranus en Gémeaux électrise ta communication et ta manière de penser. Ta génération révolutionne les échanges d'information. En toi, cela se traduit par une intelligence vive et des idées en avance sur leur temps.",
    Cancer: "Uranus en Cancer bouleverse les structures familiales et émotionnelles. Ta génération redéfinit la notion de foyer et d'appartenance. En toi, cela peut créer un tiraillement entre tradition et modernité dans ta vie intime.",
    Lion: "Uranus en Lion révolutionne l'expression créative et l'identité personnelle. Ta génération cherche de nouvelles formes d'expression de soi. En toi, cela se manifeste par une créativité originale et un besoin de briller de manière unique.",
    Vierge: "Uranus en Vierge transforme les méthodes de travail et les approches de la santé. Ta génération innove dans le quotidien et le service. En toi, cela peut se traduire par des solutions ingénieuses aux problèmes pratiques.",
    Balance: "Uranus en Balance bouleverse les codes relationnels et esthétiques. Ta génération redéfinit l'amour, la justice et la beauté. En toi, cela se manifeste par des relations non-conventionnelles et un sens esthétique avant-gardiste.",
    Scorpion: "Uranus en Scorpion intensifie le pouvoir transformateur. Ta génération plonge dans les tabous et les ombres collectives pour les transmuter. En toi, cela se traduit par une capacité de régénération et de lucidité hors du commun.",
    Sagittaire: "Uranus en Sagittaire élargit radicalement les horizons philosophiques et culturels. Ta génération explore de nouvelles formes de liberté et de sens. En toi, cela se manifeste par une soif d'aventure intellectuelle sans compromis.",
    Capricorne: "Uranus en Capricorne ébranle les structures de pouvoir et les institutions. Ta génération reconstruit les systèmes qui ne fonctionnent plus. En toi, cela se traduit par une ambition de changer les règles du jeu.",
    Verseau: "Uranus en Verseau est dans son domicile — c'est une génération de visionnaires et de révolutionnaires. En toi, cela amplifie ton originalité naturelle et ta capacité à imaginer des futurs radicalement différents.",
    Poissons: "Uranus en Poissons dissout les anciennes frontières spirituelles et imaginaires. Ta génération redéfinit la compassion et la connexion universelle. En toi, cela peut se manifester par des intuitions fulgurantes et une sensibilité hors normes.",
  },
  Neptune: {
    Belier: "Neptune en Bélier dissout les illusions autour de l'individualisme. Ta génération rêve d'un héroïsme nouveau, plus inclusif. En toi, cela peut se manifester par une quête spirituelle directe et passionnée.",
    Taureau: "Neptune en Taureau enveloppe les valeurs matérielles d'une brume idéaliste. Ta génération rêve d'une abondance plus juste et plus belle. En toi, cela peut créer un rapport ambigu à l'argent — entre détachement et désir.",
    Gemeaux: "Neptune en Gémeaux idéalise la communication et la pensée. Ta génération rêve d'un langage universel. En toi, cela peut se manifester par un don pour la communication poétique ou symbolique.",
    Cancer: "Neptune en Cancer dissout les frontières familiales et émotionnelles. Ta génération idéalise le foyer et l'appartenance. En toi, cela peut créer une nostalgie profonde pour un « chez soi » mythique ou une empathie familiale sans limites.",
    Lion: "Neptune en Lion enveloppe la créativité et l'expression de soi d'un voile glamour. Ta génération rêve en grand et en couleur. En toi, cela peut se manifester par un talent artistique inspiré et une imagination flamboyante.",
    Vierge: "Neptune en Vierge cherche l'idéal dans le service et le quotidien. Ta génération rêve d'un monde mieux organisé et plus sain. En toi, cela peut créer un tiraillement entre l'analyse rationnelle et l'appel de l'intangible.",
    Balance: "Neptune en Balance idéalise l'amour et l'harmonie. Ta génération rêve de relations parfaites et de paix universelle. En toi, cela se manifeste par un sens esthétique raffiné et un romantisme profond.",
    Scorpion: "Neptune en Scorpion plonge dans les mystères avec une fascination hypnotique. Ta génération explore les profondeurs de la psyché collective. En toi, cela peut se manifester par une intuition psychique remarquable.",
    Sagittaire: "Neptune en Sagittaire élargit la quête spirituelle aux dimensions cosmiques. Ta génération explore des visions du monde multiculturelles et mystiques. En toi, cela peut nourrir une foi profonde en quelque chose de plus grand.",
    Capricorne: "Neptune en Capricorne dissout les structures rigides tout en rêvant d'en construire de meilleures. Ta génération cherche un idéal dans les institutions. En toi, cela peut créer une ambition teintée d'idéalisme.",
    Verseau: "Neptune en Verseau rêve d'un futur utopique et d'une humanité connectée. Ta génération idéalise la technologie et le progrès collectif. En toi, cela peut se manifester par une vision sociale inspirante.",
    Poissons: "Neptune en Poissons est dans son domicile — c'est une génération de mystiques et d'empathes naturels. En toi, cela amplifie considérablement ta sensibilité, ton imagination et ta connexion au tout.",
  },
  Pluton: {
    Belier: "Pluton en Bélier transforme radicalement la notion d'identité et d'action individuelle. Ta génération redéfinit ce que signifie être soi-même. En toi, cela se manifeste par un pouvoir de transformation personnelle intense.",
    Taureau: "Pluton en Taureau bouleverse les fondations matérielles et les valeurs. Ta génération transforme le rapport à la richesse et aux ressources. En toi, cela peut créer des cycles de perte et de reconstruction matérielle qui forment ta résilience.",
    Gemeaux: "Pluton en Gémeaux transforme en profondeur la communication et la pensée. Ta génération révolutionne les médias et les échanges. En toi, cela confère une puissance persuasive et une profondeur intellectuelle remarquable.",
    Cancer: "Pluton en Cancer transforme les structures familiales et émotionnelles en profondeur. Ta génération a traversé des bouleversements dans la notion même de foyer. En toi, cela se traduit par une intensité émotionnelle et une loyauté familiale profonde.",
    Lion: "Pluton en Lion transforme l'expression créative et le pouvoir personnel. Ta génération a redéfini l'individualisme et le leadership. En toi, cela se manifeste par un magnétisme naturel et un désir de laisser une empreinte durable.",
    Vierge: "Pluton en Vierge transforme les systèmes de santé, de travail et de service. Ta génération a révolutionné la médecine et l'efficacité. En toi, cela peut se traduire par une capacité d'analyse qui va jusqu'à la racine des problèmes.",
    Balance: "Pluton en Balance transforme les relations et les notions de justice. Ta génération a redéfini l'amour, le mariage et l'équité. En toi, cela peut se manifester par des relations intenses qui servent de catalyseur de transformation personnelle.",
    Scorpion: "Pluton en Scorpion est dans son domicile — c'est une génération d'une intensité et d'une lucidité psychologique remarquables. En toi, cela amplifie ta capacité de transformation, ta résilience et ton pouvoir de régénération.",
    Sagittaire: "Pluton en Sagittaire transforme les croyances, les religions et les philosophies. Ta génération questionne les dogmes et cherche une vérité plus large. En toi, cela peut se manifester par des convictions profondes et un besoin de sens existentiel.",
    Capricorne: "Pluton en Capricorne transforme les structures de pouvoir, les gouvernements et les institutions. Ta génération reconstruit les systèmes sociaux. En toi, cela se traduit par une ambition de transformation systémique et une détermination à long terme.",
    Verseau: "Pluton en Verseau transforme la société, la technologie et les réseaux humains. Ta génération redéfinit le collectif et la démocratie. En toi, cela peut se manifester par un engagement profond pour la justice sociale et l'innovation.",
    Poissons: "Pluton en Poissons transforme la spiritualité et la compassion collective. Ta génération dissout les anciennes formes pour en créer de nouvelles, plus inclusives. En toi, cela peut se traduire par un pouvoir de guérison et une empathie transformatrice.",
  },
  "Noeud Nord": {
    Belier: "Ton Noeud Nord en Bélier t'invite à développer l'autonomie, le courage et la capacité d'agir seul·e. Ta zone de confort est la diplomatie et le compromis (Noeud Sud en Balance). L'évolution passe par l'affirmation de tes propres désirs.",
    Taureau: "Ton Noeud Nord en Taureau t'invite à cultiver la stabilité, la simplicité et l'ancrage dans le réel. Tu viens d'un espace d'intensité et de transformation (Noeud Sud en Scorpion). L'évolution passe par l'appréciation de ce qui est, ici et maintenant.",
    Gemeaux: "Ton Noeud Nord en Gémeaux t'invite à développer la curiosité, l'écoute et la flexibilité mentale. Tu viens d'un espace de certitudes et de grandes visions (Noeud Sud en Sagittaire). L'évolution passe par l'humilité d'apprendre des détails.",
    Cancer: "Ton Noeud Nord en Cancer t'invite à développer ta sensibilité, ta capacité à nourrir et ton intuition. Tu viens d'un espace de contrôle et d'ambition (Noeud Sud en Capricorne). L'évolution passe par l'ouverture émotionnelle.",
    Lion: "Ton Noeud Nord en Lion t'invite à oser briller, créer et t'exprimer avec authenticité. Tu viens d'un espace communautaire et détaché (Noeud Sud en Verseau). L'évolution passe par le courage d'être au centre de ta propre histoire.",
    Vierge: "Ton Noeud Nord en Vierge t'invite à développer la rigueur, le discernement et le service concret. Tu viens d'un espace de rêve et d'idéalisme (Noeud Sud en Poissons). L'évolution passe par l'ancrage dans le réel et l'utile.",
    Balance: "Ton Noeud Nord en Balance t'invite à développer la diplomatie, la coopération et l'art de la relation. Tu viens d'un espace d'indépendance et d'action solitaire (Noeud Sud en Bélier). L'évolution passe par l'apprentissage du « nous ».",
    Scorpion: "Ton Noeud Nord en Scorpion t'invite à embrasser la transformation, l'intimité et la profondeur. Tu viens d'un espace de confort et de stabilité (Noeud Sud en Taureau). L'évolution passe par le courage de lâcher prise sur ce qui est familier.",
    Sagittaire: "Ton Noeud Nord en Sagittaire t'invite à élargir tes horizons, à viser haut et à chercher le sens. Tu viens d'un espace de détails et de communication (Noeud Sud en Gémeaux). L'évolution passe par la confiance en ta propre vision du monde.",
    Capricorne: "Ton Noeud Nord en Capricorne t'invite à développer la discipline, la responsabilité et la structure. Tu viens d'un espace émotionnel et protecteur (Noeud Sud en Cancer). L'évolution passe par l'engagement dans le monde extérieur.",
    Verseau: "Ton Noeud Nord en Verseau t'invite à servir le collectif, à innover et à penser au-delà de toi-même. Tu viens d'un espace d'expression personnelle et de reconnaissance (Noeud Sud en Lion). L'évolution passe par le détachement de l'ego.",
    Poissons: "Ton Noeud Nord en Poissons t'invite à développer la compassion, la foi et le lâcher-prise. Tu viens d'un espace d'analyse et de contrôle (Noeud Sud en Vierge). L'évolution passe par la confiance dans le flux de la vie et l'invisible.",
  },
};

// ─── Planète en Maison ────────────────────────────────────────────
export const planetInHouse: Record<string, Record<number, string>> = {
  Soleil: {
    1: "Ton Soleil en Maison I illumine ta personnalité d'une présence forte et immédiate. Tu es perçu·e comme quelqu'un de vibrant et d'authentique — ton identité et ton apparence sont naturellement alignées.",
    2: "Ton Soleil en Maison II lie ton identité à tes ressources et tes valeurs. Tu brilles en développant tes talents et en construisant une sécurité matérielle qui reflète qui tu es vraiment.",
    3: "Ton Soleil en Maison III fait de la communication et de l'apprentissage le coeur de ton identité. Tu rayonnes quand tu partages des idées, enseignes ou explores de nouvelles connaissances.",
    4: "Ton Soleil en Maison IV enracine ton identité dans le foyer et la famille. Ton chez-toi est ton sanctuaire — c'est là que tu te ressources et que tu exprimes ta vraie nature.",
    5: "Ton Soleil en Maison V fait de la créativité et du plaisir le coeur de ta vitalité. Tu brilles dans l'expression artistique, la romance et tout ce qui te permet de jouer avec la vie.",
    6: "Ton Soleil en Maison VI trouve sa lumière dans le service et le travail quotidien. Tu t'épanouis en étant utile, en perfectionnant tes compétences et en prenant soin de ta santé et de ton environnement.",
    7: "Ton Soleil en Maison VII place les relations au centre de ton identité. Tu te découvres et tu grandis à travers l'autre — les partenariats amoureux et professionnels sont essentiels à ton épanouissement.",
    8: "Ton Soleil en Maison VIII t'invite à te transformer en profondeur tout au long de ta vie. Tu es attiré·e par les mystères, l'intensité émotionnelle et les expériences qui touchent à l'essentiel.",
    9: "Ton Soleil en Maison IX éclaire ta quête de sens et d'horizons lointains. Tu t'épanouis dans les voyages, les études supérieures, la philosophie et tout ce qui élargit ta vision du monde.",
    10: "Ton Soleil en Maison X place ta vocation et ta carrière au centre de ta vie. Tu as besoin de réaliser quelque chose de significatif dans le monde — ton ambition est noble et profonde.",
    11: "Ton Soleil en Maison XI brille dans les projets collectifs et les amitiés. Tu t'épanouis quand tu contribues à une communauté et quand tes idéaux trouvent une expression concrète avec d'autres.",
    12: "Ton Soleil en Maison XII éclaire les profondeurs de l'inconscient. Tu possèdes une richesse intérieure immense, une sensibilité spirituelle et un besoin de retrait régulier pour te retrouver.",
  },
  Lune: {
    1: "Ta Lune en Maison I rend tes émotions visibles et immédiates. Ton humeur colore ton apparence — les gens lisent facilement ce que tu ressens. Cette transparence émotionnelle est un don d'authenticité.",
    2: "Ta Lune en Maison II lie ton bien-être émotionnel à la sécurité matérielle. Tu as besoin de savoir que tes bases sont solides pour te sentir en paix intérieurement.",
    3: "Ta Lune en Maison III fait de la communication ton refuge émotionnel. Tu traites tes émotions en parlant, en écrivant, en échangeant. Les relations avec la fratrie peuvent être particulièrement chargées émotionnellement.",
    4: "Ta Lune en Maison IV est dans sa maison naturelle — ton monde émotionnel est profondément lié au foyer, à la famille et aux racines. Ton chez-toi est ton cocon sacré.",
    5: "Ta Lune en Maison V a besoin de joie, de créativité et de romance pour se sentir nourrie. L'expression émotionnelle passe par l'art, le jeu et les plaisirs qui font vibrer ton coeur d'enfant.",
    6: "Ta Lune en Maison VI trouve son réconfort dans la routine et le travail bien fait. Ton état émotionnel affecte directement ta santé — prendre soin de ton corps, c'est prendre soin de ton âme.",
    7: "Ta Lune en Maison VII cherche la sécurité émotionnelle dans les relations. Tu as besoin d'un partenaire qui te comprend et te reflète. Les relations sont le miroir de tes besoins les plus profonds.",
    8: "Ta Lune en Maison VIII ressent avec une intensité qui touche aux tabous et aux mystères. Tes émotions sont profondes, parfois volcaniques. La transformation émotionnelle est un thème récurrent de ta vie.",
    9: "Ta Lune en Maison IX se nourrit d'horizons lointains et de sens. Tu as un besoin émotionnel de comprendre le « pourquoi » des choses — la philosophie et les voyages sont des sources de réconfort.",
    10: "Ta Lune en Maison X expose ton monde émotionnel au regard public. Ta carrière et ta vocation sont teintées d'émotion — tu as besoin de sentir un appel intérieur pour t'investir professionnellement.",
    11: "Ta Lune en Maison XI trouve son réconfort dans les amitiés et les projets de groupe. Tu as besoin de te sentir appartenir à une communauté qui partage tes valeurs et tes idéaux.",
    12: "Ta Lune en Maison XII cache un monde émotionnel riche et secret. Tu absorbes les émotions collectives et tu as besoin de solitude pour te régénérer. Tes rêves sont une source d'information précieuse.",
  },
  Mercure: {
    1: "Mercure en Maison I fait de toi un·e communicateur·rice né·e. Ta pensée et ta parole sont au premier plan de ton identité — les gens te remarquent d'abord pour ton esprit.",
    2: "Mercure en Maison II oriente ta pensée vers les questions de valeur et de ressources. Tu as un talent pour identifier les opportunités financières et pour communiquer sur ce qui a de la valeur.",
    3: "Mercure en Maison III est dans sa maison naturelle — ta pensée est agile, ta curiosité insatiable et ta communication fluide. L'écriture, l'enseignement et les échanges d'idées sont tes forces.",
    4: "Mercure en Maison IV ancre ta pensée dans les souvenirs, la famille et les racines. Tu réfléchis souvent à ton passé et aux dynamiques familiales — cette introspection enrichit ta compréhension du monde.",
    5: "Mercure en Maison V insuffle de la créativité dans ta communication. Tu t'exprimes avec flair et originalité — l'écriture créative, le théâtre ou l'enseignement ludique te conviennent naturellement.",
    6: "Mercure en Maison VI rend ta pensée méthodique et orientée vers le service. Tu excelles dans l'analyse des systèmes, la résolution de problèmes pratiques et l'organisation du quotidien.",
    7: "Mercure en Maison VII fait de la communication le pilier de tes relations. Tu as besoin de dialogue stimulant dans tes partenariats — un bon échange intellectuel est aussi important qu'une connexion émotionnelle.",
    8: "Mercure en Maison VIII plonge ta pensée dans les profondeurs. Tu es attiré·e par les mystères, la psychologie et tout ce qui se cache sous la surface. Ta capacité d'investigation est remarquable.",
    9: "Mercure en Maison IX élargit ta pensée aux horizons philosophiques et culturels. Tu as soif de connaissances profondes — les langues, les voyages et les grandes idées nourrissent ton intellect.",
    10: "Mercure en Maison X fait de tes compétences de communication un atout professionnel majeur. Ta carrière pourrait impliquer l'écriture, l'enseignement, les médias ou toute forme d'échange d'information.",
    11: "Mercure en Maison XI oriente ta pensée vers les projets collectifs et les idéaux sociaux. Tu excelles dans les réseaux, les communautés et partout où les idées circulent librement.",
    12: "Mercure en Maison XII donne à ta pensée une qualité intuitive et méditative. Tu captes des informations subtiles — rêves, intuitions, impressions — qui enrichissent ta compréhension du monde invisible.",
  },
  Venus: {
    1: "Vénus en Maison I te dote d'un charme naturel et d'une présence esthétique. Les gens sont attirés par ta douceur et ta grâce — tu incarnes la beauté d'une manière qui te semble naturelle.",
    2: "Vénus en Maison II attire l'abondance et le plaisir dans le domaine matériel. Tu as un goût développé pour les belles choses et un talent pour attirer les ressources qui correspondent à tes valeurs.",
    3: "Vénus en Maison III adoucit ta communication d'une touche de charme et de diplomatie. Tu sais trouver les mots justes et créer des liens harmonieux dans ton entourage proche.",
    4: "Vénus en Maison IV embellit ton foyer et tes racines. Tu as besoin d'un chez-toi beau et harmonieux. Les liens familiaux sont une source d'amour importante dans ta vie.",
    5: "Vénus en Maison V est dans sa joie — l'amour, la créativité et les plaisirs sont au coeur de ta vie. Tu vis la romance avec passion et tu t'exprimes artistiquement avec grâce.",
    6: "Vénus en Maison VI apporte de la beauté et de l'harmonie dans ton quotidien et ton travail. Tu travailles mieux dans un environnement agréable et tu soignes les relations avec tes collègues.",
    7: "Vénus en Maison VII est dans sa maison naturelle — les relations amoureuses et les partenariats sont au centre de ta vie affective. Tu cherches un·e partenaire qui incarne l'harmonie et la beauté.",
    8: "Vénus en Maison VIII donne à tes relations une profondeur et une intensité passionnelle. Tu cherches la fusion émotionnelle et la transformation par l'amour — le superficiel ne t'intéresse pas.",
    9: "Vénus en Maison IX te fait aimer ce qui est lointain et différent. Les voyages, les cultures étrangères et la philosophie sont des sources de plaisir et d'émerveillement pour toi.",
    10: "Vénus en Maison X apporte charme et diplomatie dans ta carrière. Tu réussis dans les domaines qui allient beauté, art et relations publiques. Ta réputation professionnelle est teintée de grâce.",
    11: "Vénus en Maison XI fait des amitiés une source majeure de bonheur. Tu attires des ami·es qui partagent tes valeurs esthétiques et tes idéaux, créant un cercle social harmonieux et stimulant.",
    12: "Vénus en Maison XII confère un amour discret mais profond pour l'invisible. Tu peux avoir des amours secrètes ou une attirance pour la beauté mystique. Ta compassion est immense mais souvent cachée.",
  },
  Mars: {
    1: "Mars en Maison I te confère une énergie d'action directe et visible. Tu es perçu·e comme dynamique, assertif·ve et parfois combatif·ve. Ta présence physique est forte et ton impulsion, immédiate.",
    2: "Mars en Maison II canalise ton énergie vers la construction de ressources. Tu te bats pour ta sécurité matérielle avec une détermination impressionnante et tu as un talent pour générer des revenus.",
    3: "Mars en Maison III électrise ta communication. Tu t'exprimes avec force et conviction — tes mots ont du punch. Les débats intellectuels sont un terrain où tu excelles naturellement.",
    4: "Mars en Maison IV canalise l'énergie dans le foyer et la famille. Tu te bats pour protéger ton chez-toi et tes proches. L'énergie émotionnelle peut être intense dans ta vie privée.",
    5: "Mars en Maison V enflamme ta créativité et tes passions. Tu t'investis dans tes projets créatifs et tes romances avec une intensité vibrante. La compétition sportive ou artistique te stimule.",
    6: "Mars en Maison VI fait de toi un·e travailleur·se infatigable. Tu canalises ton énergie dans l'efficacité, la résolution de problèmes et l'amélioration constante de tes méthodes.",
    7: "Mars en Maison VII apporte de la passion et parfois du conflit dans tes relations. Tu es attiré·e par les partenaires dynamiques et stimulants. L'assertivité dans les relations est un apprentissage clé.",
    8: "Mars en Maison VIII confère une énergie de transformation puissante. Tu affrontes les crises avec courage et ta capacité à renaître de tes cendres est impressionnante.",
    9: "Mars en Maison IX canalise ton énergie dans l'aventure et la quête de sens. Tu te bats pour tes convictions et tu as besoin d'action dans des contextes qui élargissent tes horizons.",
    10: "Mars en Maison X propulse ta carrière avec une ambition et une énergie remarquables. Tu es un·e leader naturel·le dans le monde professionnel et tu ne recules devant aucun défi.",
    11: "Mars en Maison XI canalise ton énergie dans les causes collectives et les projets de groupe. Tu te bats pour tes idéaux avec conviction et tu dynamises chaque communauté que tu rejoins.",
    12: "Mars en Maison XII cache une énergie puissante sous la surface. Tu peux avoir du mal à exprimer directement ta colère ou tes désirs. L'invitation est de trouver des canaux d'expression sains pour cette force intérieure.",
  },
  Jupiter: {
    1: "Jupiter en Maison I t'accorde un optimisme naturel et une présence chaleureuse. Tu inspires confiance et générosité chez les autres — ta simple présence élargit les horizons de ceux qui t'entourent.",
    2: "Jupiter en Maison II favorise l'abondance matérielle. Tu as un talent naturel pour attirer les ressources et une foi optimiste dans ta capacité à prospérer.",
    3: "Jupiter en Maison III amplifie ta curiosité et tes talents de communication. Tu as soif d'apprendre et tu excelles dans l'enseignement et le partage de connaissances.",
    4: "Jupiter en Maison IV bénit ton foyer et ta famille. Tu grandis dans un environnement de générosité et de chaleur, et tu reproduis cette abondance émotionnelle dans ton propre foyer.",
    5: "Jupiter en Maison V amplifie ta joie de vivre et ta créativité. Tu as une capacité naturelle à trouver du plaisir dans la vie et à inspirer la joie chez les autres.",
    6: "Jupiter en Maison VI apporte croissance et optimisme dans ton travail quotidien. Tu trouves l'expansion à travers le service et l'amélioration de tes compétences.",
    7: "Jupiter en Maison VII porte chance dans les relations et les partenariats. Tu attires des partenaires généreux et expansifs, et tes alliances sont souvent bénéfiques.",
    8: "Jupiter en Maison VIII protège dans les crises et favorise la croissance à travers les transformations. Les héritages et les ressources partagées peuvent être une source d'abondance.",
    9: "Jupiter en Maison IX est dans sa maison naturelle — les voyages, la philosophie et l'enseignement supérieur sont tes voies royales d'expansion. Le monde est ton université.",
    10: "Jupiter en Maison X favorise une carrière épanouissante et reconnue. Tu as le potentiel d'atteindre des sommets professionnels grâce à ta vision large et ton optimisme contagieux.",
    11: "Jupiter en Maison XI multiplie les amitiés bienveillantes et les opportunités collectives. Les projets de groupe et les causes humanitaires sont des sources de croissance.",
    12: "Jupiter en Maison XII est un ange gardien silencieux. Une protection invisible semble t'accompagner dans les moments difficiles. Ta vie spirituelle et intérieure est une source de joie profonde.",
  },
  Saturne: {
    1: "Saturne en Maison I confère une maturité précoce et une apparence sérieuse. Tu as appris tôt à te prendre en charge. Avec le temps, cette discipline forge un caractère d'une solidité remarquable.",
    2: "Saturne en Maison II structure ton rapport à l'argent et aux ressources. Tu as peut-être connu des restrictions matérielles qui t'ont appris la valeur de chaque chose. La sécurité se construit lentement mais sûrement.",
    3: "Saturne en Maison III discipline ta pensée et ta communication. Tu réfléchis avant de parler et tes mots portent le poids de la réflexion. L'écriture et l'enseignement structuré sont des forces.",
    4: "Saturne en Maison IV touche aux fondations émotionnelles et familiales. Tu as peut-être eu une enfance qui t'a demandé de grandir vite. L'invitation est de reconstruire un foyer intérieur solide et chaleureux.",
    5: "Saturne en Maison V structure ta créativité et ton rapport au plaisir. L'expression de soi peut avoir été inhibée dans l'enfance. Avec la maturité, ta créativité devient profonde et durable.",
    6: "Saturne en Maison VI renforce ta discipline au travail et ton attention à la santé. Tu es un·e travailleur·se consciencieux·se et fiable, mais veille à ne pas transformer le devoir en fardeau.",
    7: "Saturne en Maison VII structure tes relations avec sérieux et engagement. Tu choisis tes partenaires avec soin et tu investis dans des relations durables. Les engagements légers ne t'intéressent pas.",
    8: "Saturne en Maison VIII confronte les peurs profondes avec une discipline transformatrice. Les thèmes de perte et de renaissance sont structurants dans ta vie — chaque crise te rend plus sage.",
    9: "Saturne en Maison IX discipline ta quête de sens. Tu construis ta philosophie de vie pierre par pierre, avec rigueur et honnêteté intellectuelle. Les études longues et exigeantes te conviennent.",
    10: "Saturne en Maison X est dans sa maison naturelle — ton ambition est structurée et ta carrière se construit avec patience. Tu atteindras tes objectifs professionnels, même si cela prend du temps.",
    11: "Saturne en Maison XI structure tes amitiés et tes projets collectifs. Tu as peu d'amis mais ils sont choisis avec soin et fiables. Les projets de groupe exigent de toi un engagement sérieux.",
    12: "Saturne en Maison XII confronte les peurs inconscientes et les limites invisibles. La solitude choisie et la méditation sont des outils de croissance puissants. L'introspection disciplinée est ta voie de sagesse.",
  },
  Uranus: {
    1: "Uranus en Maison I te rend unique et imprévisible dans ta manière d'être. Tu refuses les moules et les étiquettes — ton authenticité est ta marque de fabrique.",
    2: "Uranus en Maison II bouleverse ton rapport aux possessions et aux valeurs. Tes revenus peuvent être irréguliers mais tes approches non-conventionnelles de la prospérité sont innovantes.",
    3: "Uranus en Maison III électrise ta pensée d'éclairs d'intuition. Tu communiques de manière originale et tes idées sont souvent en avance sur leur temps.",
    4: "Uranus en Maison IV a perturbé tes fondations familiales ou domestiques. Tu as besoin d'un foyer non-conventionnel qui respecte ton besoin de liberté intérieure.",
    5: "Uranus en Maison V libère ta créativité de toute convention. Ton expression artistique est originale et tes romances, non-conventionnelles. Tu aimes différemment, et c'est ta force.",
    6: "Uranus en Maison VI révolutionne ton quotidien et tes méthodes de travail. Tu as besoin de variété et d'innovation dans ta routine — la monotonie te rend malade.",
    7: "Uranus en Maison VII apporte des relations non-conventionnelles et stimulantes. Tu as besoin de liberté dans tes partenariats et tu attires des partenaires originaux et indépendants.",
    8: "Uranus en Maison VIII provoque des transformations soudaines et libératrices. Les crises arrivent sans prévenir mais elles t'éveillent à des niveaux de conscience nouveaux.",
    9: "Uranus en Maison IX révolutionne ta vision du monde. Tu explores des philosophies non-conventionnelles et tes voyages te transforment de manière inattendue.",
    10: "Uranus en Maison X te pousse vers une carrière non-conventionnelle. Tu ne suis pas les chemins tracés — tu crées le tien, souvent dans des domaines innovants ou technologiques.",
    11: "Uranus en Maison XI est dans sa maison naturelle — tu brilles dans les communautés alternatives et les projets visionnaires. Tes amis sont aussi originaux que toi.",
    12: "Uranus en Maison XII éveille l'inconscient avec des intuitions fulgurantes. Tu as accès à des insights soudains qui viennent d'au-delà de la pensée rationnelle.",
  },
  Neptune: {
    1: "Neptune en Maison I enveloppe ta personnalité d'une aura mystérieuse et empathique. Les gens te perçoivent comme insaisissable, doux·ce et profondément sensible.",
    2: "Neptune en Maison II dissout les frontières entre toi et tes possessions. Ton rapport à l'argent peut être flou — l'invitation est de trouver un équilibre entre idéalisme et réalisme financier.",
    3: "Neptune en Maison III donne une qualité poétique et intuitive à ta pensée. Tu communiques par images, métaphores et impressions plutôt que par logique pure.",
    4: "Neptune en Maison IV idéalise le foyer et la famille. Tu cherches un chez-toi qui soit un sanctuaire spirituel — un lieu où les frontières entre réel et imaginaire s'estompent.",
    5: "Neptune en Maison V inspire une créativité sans limites. Ton imagination artistique est vaste et profonde. En amour, tu tends à idéaliser tes partenaires — la nuance est ton apprentissage.",
    6: "Neptune en Maison VI peut rendre le quotidien flou et les limites au travail poreuses. Tu as besoin d'un travail qui a du sens spirituel — le service pur te convient mieux que la routine mécanique.",
    7: "Neptune en Maison VII idéalise les relations et cherche l'âme soeur parfaite. Tu as un don pour percevoir l'essence des gens. L'invitation est de voir les partenaires tels qu'ils sont, pas tels que tu les rêves.",
    8: "Neptune en Maison VIII dissout les frontières entre le visible et l'invisible. Tu as une sensibilité psychique marquée et une fascination pour les mystères de la vie et de la mort.",
    9: "Neptune en Maison IX élargit ta quête spirituelle aux dimensions mystiques. Les voyages intérieurs sont aussi importants pour toi que les voyages physiques. La méditation et la contemplation te nourrissent.",
    10: "Neptune en Maison X enveloppe ta carrière d'un voile idéaliste. Tu es attiré·e par les professions qui servent un idéal — l'art, la guérison, la spiritualité ou l'humanitaire.",
    11: "Neptune en Maison XI idéalise les amitiés et les causes collectives. Tu rêves d'un monde meilleur et tu attires des ami·es qui partagent cette vision — veille simplement à rester ancré·e.",
    12: "Neptune en Maison XII est dans sa maison naturelle — ta vie intérieure est riche, mystique et profondément connectée à l'invisible. La méditation, les rêves et l'art sont tes portails vers le sacré.",
  },
  Pluton: {
    1: "Pluton en Maison I te confère un magnétisme intense et une capacité de transformation personnelle remarquable. Tu traverses des mues profondes qui te rendent plus fort·e à chaque fois.",
    2: "Pluton en Maison II transforme en profondeur ton rapport à la valeur et aux ressources. Tu peux vivre des cycles de perte et de reconstruction matérielle qui forgent ta résilience.",
    3: "Pluton en Maison III donne à ta pensée une profondeur pénétrante. Tes mots ont le pouvoir de transformer — tu communiques avec une intensité qui laisse une empreinte.",
    4: "Pluton en Maison IV transforme les fondations familiales en profondeur. Des secrets ou des dynamiques de pouvoir familiales ont pu marquer ton enfance. La guérison des racines est un thème central.",
    5: "Pluton en Maison V intensifie ta créativité et tes passions. Tu crées avec une profondeur qui touche les gens au coeur. En amour, tu vis des passions transformatrices.",
    6: "Pluton en Maison VI transforme tes méthodes de travail et ton rapport à la santé. Tu as le pouvoir de régénérer ce qui ne fonctionne plus — dans tes routines comme dans ton corps.",
    7: "Pluton en Maison VII transforme les relations en profondeur. Tes partenariats sont des catalyseurs de croissance intense — l'amour et le pouvoir y sont intimement liés.",
    8: "Pluton en Maison VIII est dans sa maison naturelle — ta capacité de transformation, de régénération et de lucidité psychologique est immense. Tu n'as pas peur des profondeurs.",
    9: "Pluton en Maison IX transforme radicalement tes croyances et ta vision du monde. Des voyages ou des expériences philosophiques profondes ont le pouvoir de te faire renaître.",
    10: "Pluton en Maison X confère un pouvoir de transformation dans la carrière et le monde public. Tu es capable d'exercer une influence profonde sur les structures et les institutions.",
    11: "Pluton en Maison XI transforme les dynamiques de groupe et les amitiés. Tu as le pouvoir de catalyser le changement dans les communautés et les projets collectifs.",
    12: "Pluton en Maison XII travaille dans les profondeurs de l'inconscient. Des transformations puissantes se produisent en silence — la méditation et l'introspection sont tes outils de régénération.",
  },
  "Noeud Nord": {
    1: "Le Noeud Nord en Maison I t'invite à développer ton individualité et ton autonomie. Ta voie d'évolution passe par l'affirmation de toi-même.",
    2: "Le Noeud Nord en Maison II t'invite à développer tes propres ressources et ta valeur personnelle. L'autonomie matérielle est un thème d'évolution.",
    3: "Le Noeud Nord en Maison III t'invite à développer la communication et l'apprentissage comme voies de croissance.",
    4: "Le Noeud Nord en Maison IV t'invite à construire des racines émotionnelles solides et un foyer nourrissant.",
    5: "Le Noeud Nord en Maison V t'invite à oser l'expression créative et à embrasser la joie de vivre.",
    6: "Le Noeud Nord en Maison VI t'invite à trouver l'accomplissement dans le service quotidien et l'attention aux détails.",
    7: "Le Noeud Nord en Maison VII t'invite à grandir à travers les partenariats et l'art de la relation.",
    8: "Le Noeud Nord en Maison VIII t'invite à embrasser la transformation et l'intimité profonde comme voies de croissance.",
    9: "Le Noeud Nord en Maison IX t'invite à élargir tes horizons par les voyages, les études et la quête de sens.",
    10: "Le Noeud Nord en Maison X t'invite à assumer ta vocation et ta place dans le monde avec responsabilité.",
    11: "Le Noeud Nord en Maison XI t'invite à contribuer au collectif et à embrasser tes idéaux les plus élevés.",
    12: "Le Noeud Nord en Maison XII t'invite à développer ta vie intérieure, ta spiritualité et ta connexion à l'invisible.",
  },
};

// ─── Aspects ──────────────────────────────────────────────────────
export const aspectInterpretations: Record<string, Record<string, string>> = {
  Conjonction: {
    "Soleil-Lune": "La conjonction Soleil-Lune dans ta carte fusionne ton identité consciente et ton monde émotionnel. Tu agis et tu ressens dans la même direction — une concentration de force qui te rend cohérent·e et entier·ère, même si cette intensité peut parfois manquer de recul.",
    "Soleil-Mars": "La conjonction Soleil-Mars fusionne ta volonté et ton énergie d'action. Tu es un·e fonceur·euse naturel·le — quand tu décides, tu agis immédiatement. Cette énergie brute est un moteur puissant à canaliser vers tes ambitions.",
    "Soleil-Venus": "La conjonction Soleil-Vénus adoucit ton identité d'un charme et d'un sens esthétique naturels. Tu plais facilement et tu as un talent pour créer de l'harmonie autour de toi. L'amour et la beauté sont au coeur de qui tu es.",
    "Lune-Mars": "La conjonction Lune-Mars fusionne émotions et action — tu réagis instinctivement et avec intensité. Cette énergie émotionnelle brute peut être un moteur formidable quand tu apprends à la canaliser plutôt qu'à la subir.",
    "Lune-Venus": "La conjonction Lune-Vénus harmonise tes émotions et ton coeur. Tu as un besoin profond de beauté, de douceur et d'amour dans ta vie quotidienne. Ta sensibilité esthétique et émotionnelle est un cadeau précieux.",
    "Venus-Mars": "La conjonction Vénus-Mars fusionne le désir et l'amour. Ta vie affective est passionnée et magnétique — tu attires et tu es attiré·e avec une intensité vibrante. L'art de l'amour est une de tes voies d'expression les plus puissantes.",
    "Soleil-Jupiter": "La conjonction Soleil-Jupiter amplifie ton optimisme et ta confiance naturelle. Tu as une vision large de la vie et une foi qui t'ouvre des portes. L'excès est ton seul risque — vise grand, mais garde les pieds sur terre.",
    "Soleil-Saturne": "La conjonction Soleil-Saturne donne à ton identité une gravité et une discipline précoces. Tu as peut-être porté des responsabilités tôt. Avec le temps, cette rigueur devient ta plus grande force — tu bâtis des choses durables.",
    "Lune-Jupiter": "La conjonction Lune-Jupiter amplifie ta générosité émotionnelle et ton optimisme intérieur. Tu as une foi naturelle dans la bonté de la vie qui te protège dans les moments difficiles et te rend chaleureux·se avec les autres.",
    "Lune-Saturne": "La conjonction Lune-Saturne impose une discipline émotionnelle qui peut sembler lourde dans la jeunesse. Tu as appris à contenir tes émotions — l'invitation de la maturité est d'adoucir cette retenue sans l'abandonner complètement.",
    "Mercure-Venus": "La conjonction Mercure-Vénus harmonise ta pensée et ton sens esthétique. Tu t'exprimes avec grâce et diplomatie. L'écriture, la poésie et la communication artistique sont des talents naturels.",
    "Mercure-Mars": "La conjonction Mercure-Mars aiguise ta pensée et ta parole. Tu réfléchis vite et t'exprimes avec force. Les débats sont ton terrain de jeu naturel — tes mots peuvent autant construire que provoquer.",
    "Mars-Jupiter": "La conjonction Mars-Jupiter est une alliance d'action et d'expansion. Tu agis avec enthousiasme et ambition — ton énergie est contagieuse et tes entreprises tendent naturellement vers le succès.",
    "Mars-Saturne": "La conjonction Mars-Saturne discipline ton énergie d'action. Tu agis avec méthode et endurance plutôt qu'avec impulsivité. Cette combinaison crée un·e stratège patient·e et efficace.",
    "Jupiter-Saturne": "La conjonction Jupiter-Saturne balance expansion et restriction. Tu construis tes rêves avec réalisme — ni trop optimiste, ni trop pessimiste. Cette combinaison produit des réalisations concrètes et durables.",
    "Venus-Jupiter": "La conjonction Vénus-Jupiter est un des aspects les plus bienveillants du zodiaque. L'amour, la beauté et l'abondance te viennent naturellement. Ta générosité affective attire le bonheur.",
    "Venus-Saturne": "La conjonction Vénus-Saturne donne à l'amour une qualité sérieuse et durable. Tu ne t'investis pas à la légère — mais quand tu le fais, c'est avec une fidélité et une profondeur qui traversent le temps.",
  },
  Trigone: {
    "Soleil-Lune": "Le trigone Soleil-Lune crée un flux harmonieux entre ta volonté consciente et tes émotions. Tu es à l'aise avec toi-même — ce que tu montres et ce que tu ressens sont naturellement alignés. Cette paix intérieure est une ressource précieuse.",
    "Soleil-Mars": "Le trigone Soleil-Mars permet à ton énergie d'action de servir naturellement ta volonté. Tu as un talent pour agir au bon moment avec la bonne intensité — un instinct d'efficacité qui semble sans effort.",
    "Soleil-Venus": "Le trigone Soleil-Vénus adoucit ta vie d'un flux naturel de charme et d'harmonie. Les relations et la beauté viennent à toi avec aisance. Tu possèdes un don social et esthétique naturel.",
    "Lune-Mars": "Le trigone Lune-Mars harmonise tes émotions et ton action. Tu sais instinctivement transformer ce que tu ressens en énergie constructive — tes émotions deviennent un carburant plutôt qu'un obstacle.",
    "Lune-Venus": "Le trigone Lune-Vénus est un aspect de douceur émotionnelle. Tu vis l'amour et la beauté avec une aisance naturelle. Ton monde intérieur est harmonieux et cette paix se reflète dans tes relations.",
    "Venus-Mars": "Le trigone Vénus-Mars harmonise le désir et l'amour. Ta vie affective bénéficie d'un équilibre naturel entre passion et tendresse. Tu attires et tu séduis avec une grâce qui semble sans effort.",
    "Soleil-Jupiter": "Le trigone Soleil-Jupiter est un aspect de chance et d'optimisme. Les opportunités semblent venir naturellement à toi, et ta confiance en la vie attire les circonstances favorables.",
    "Soleil-Saturne": "Le trigone Soleil-Saturne donne une discipline naturelle et une capacité à structurer ta vie avec sagesse. Tu combines ambition et patience — une recette de réussite durable.",
    "Lune-Jupiter": "Le trigone Lune-Jupiter nourrit ton monde émotionnel d'optimisme et de générosité. Tu as une capacité naturelle à rebondir émotionnellement et à voir le bon côté des situations.",
    "Lune-Saturne": "Le trigone Lune-Saturne stabilise tes émotions avec maturité. Tu gères tes sentiments avec sagesse et tu offres aux autres un soutien émotionnel fiable et ancré.",
    "Mercure-Venus": "Le trigone Mercure-Vénus allie pensée et beauté avec grâce. Tu communiques avec élégance et tu as un talent naturel pour les arts de la parole et de l'écriture.",
    "Mercure-Mars": "Le trigone Mercure-Mars aiguise ta pensée d'une énergie vive et constructive. Tu débats avec brio et tes idées se traduisent naturellement en action.",
    "Mars-Jupiter": "Le trigone Mars-Jupiter est un aspect d'action chanceuse. Tes initiatives portent fruit avec une régularité qui semble magique — l'enthousiasme rencontre l'opportunité.",
    "Mars-Saturne": "Le trigone Mars-Saturne combine énergie et discipline. Tu agis avec une efficacité méthodique qui produit des résultats concrets et durables. Ta persévérance est remarquable.",
    "Jupiter-Saturne": "Le trigone Jupiter-Saturne balance optimisme et réalisme. Tu as un talent rare pour rêver grand tout en construisant solidement — tes projets ont à la fois de l'envergure et des fondations.",
    "Venus-Jupiter": "Le trigone Vénus-Jupiter est une bénédiction pour l'amour et l'abondance. Les belles choses de la vie viennent à toi naturellement — profites-en avec gratitude.",
    "Venus-Saturne": "Le trigone Vénus-Saturne donne une profondeur et une durabilité à tes relations. Tu construis des liens qui traversent le temps avec une loyauté et une maturité admirables.",
  },
  Carre: {
    "Soleil-Lune": "Le carré Soleil-Lune crée une tension entre ce que tu montres et ce que tu ressens. Ta volonté consciente et tes besoins émotionnels ne s'alignent pas toujours facilement — ce tiraillement est une invitation à développer une conscience de toi plus complète.",
    "Soleil-Mars": "Le carré Soleil-Mars génère une friction entre ta volonté et ton énergie d'action. L'impatience et la frustration peuvent surgir — mais cette même tension est le carburant d'une détermination féroce quand elle est canalisée.",
    "Soleil-Venus": "Le carré Soleil-Vénus crée une tension entre ton identité et ta vie affective. Tu peux avoir du mal à concilier ce que tu es et ce que tu désires en amour. L'invitation est d'aimer sans te perdre.",
    "Lune-Mars": "Le carré Lune-Mars crée une friction entre tes émotions et ton impulsion d'action. La colère peut surgir de manière inattendue. L'apprentissage est de transformer cette énergie émotionnelle brute en force constructive.",
    "Lune-Venus": "Le carré Lune-Vénus crée une tension entre tes besoins émotionnels et tes désirs affectifs. Ce que tu recherches en amour et ce qui te nourrit émotionnellement ne coïncident pas toujours — l'intégration des deux est ta voie de croissance.",
    "Venus-Mars": "Le carré Vénus-Mars crée une tension entre amour et désir. La passion peut être intense mais tumultueuse. L'invitation est d'intégrer tendresse et feu plutôt que de les opposer.",
    "Soleil-Jupiter": "Le carré Soleil-Jupiter peut amplifier la tendance à l'excès et à la surestimation de soi. L'invitation est de canaliser cet optimisme débordant vers des objectifs réalistes plutôt que de disperser ton énergie.",
    "Soleil-Saturne": "Le carré Soleil-Saturne confronte ta volonté à des limitations et des responsabilités qui semblent injustes. Le doute de soi peut être un compagnon tenace — mais chaque obstacle surmonté forge un caractère d'acier.",
    "Lune-Jupiter": "Le carré Lune-Jupiter peut générer des excès émotionnels et une tendance à fuir dans l'optimisme. L'invitation est de ressentir pleinement sans chercher immédiatement une porte de sortie positive.",
    "Lune-Saturne": "Le carré Lune-Saturne est l'un des aspects les plus exigeants émotionnellement. Tu as peut-être appris à réprimer tes besoins affectifs. L'invitation est de démanteler ces murs avec patience et compassion envers toi-même.",
    "Mercure-Venus": "Le carré Mercure-Vénus crée une friction entre pensée et sentiments. Tu peux avoir du mal à exprimer ce que tu ressens ou à ressentir ce que tu penses. L'intégration tête-coeur est ton chemin.",
    "Mercure-Mars": "Le carré Mercure-Mars peut provoquer des paroles brusques et des débats enflammés. Ta pensée est rapide et combative — l'invitation est de transformer cette fougue en pouvoir de persuasion constructif.",
    "Mars-Jupiter": "Le carré Mars-Jupiter peut pousser à l'action excessive et aux entreprises téméraires. L'invitation est de canaliser cette énergie expansive vers des projets concrets plutôt que de disperser tes forces.",
    "Mars-Saturne": "Le carré Mars-Saturne crée une frustration entre le désir d'agir et les contraintes qui freinent. Cette tension forge une endurance et une détermination exceptionnelles — une fois que tu canalises cette force.",
    "Jupiter-Saturne": "Le carré Jupiter-Saturne crée un tiraillement entre expansion et restriction. Tu oscilles entre optimisme et pessimisme. L'invitation est de trouver le juste milieu — rêver grand, construire petit.",
    "Venus-Jupiter": "Le carré Vénus-Jupiter peut amplifier les excès en amour et les attentes démesurées. L'invitation est d'apprécier ce qui est plutôt que de toujours chercher plus — la gratitude est ta clé.",
    "Venus-Saturne": "Le carré Vénus-Saturne peut créer une retenue en amour et un sentiment de ne pas mériter le bonheur. L'invitation est de démanteler ces croyances limitantes et de t'autoriser la tendresse et le plaisir.",
  },
  Opposition: {
    "Soleil-Lune": "L'opposition Soleil-Lune place ta volonté consciente et tes émotions aux deux extrémités d'un axe. Tu vis un balancement constant entre raison et sentiment. L'intégration de ces deux pôles est le travail d'une vie — et aussi ta plus grande richesse.",
    "Soleil-Mars": "L'opposition Soleil-Mars projette ta combativité sur les autres. Tu peux attirer des conflits extérieurs qui reflètent une tension intérieure. L'invitation est d'intérioriser cette énergie et de l'utiliser pour tes propres projets.",
    "Soleil-Venus": "L'opposition Soleil-Vénus crée un balancement entre ton identité et tes besoins relationnels. Tu te définis à travers l'autre — l'invitation est de trouver l'harmonie entre « moi » et « nous ».",
    "Lune-Mars": "L'opposition Lune-Mars crée un bras de fer entre ta vulnérabilité émotionnelle et ton impulsion d'action. Les émotions fortes se transforment en actes — l'invitation est de choisir consciemment le moment d'agir.",
    "Lune-Venus": "L'opposition Lune-Vénus met en tension tes besoins de sécurité et tes désirs d'amour. Tu peux osciller entre donner et recevoir. L'invitation est de t'autoriser les deux sans culpabilité.",
    "Venus-Mars": "L'opposition Vénus-Mars crée une polarité magnétique entre amour et désir. Tes relations sont passionnées et dynamiques — le défi est de ne pas confondre friction et incompatibilité.",
    "Soleil-Jupiter": "L'opposition Soleil-Jupiter crée un balancement entre confiance en soi et excès. Tu oscilles entre modestie et grandiosité. L'invitation est de trouver une foi en toi-même qui reste ancrée dans le réel.",
    "Soleil-Saturne": "L'opposition Soleil-Saturne projette l'autorité et les limitations sur les figures d'autorité extérieures. Le sentiment de restriction vient souvent de l'extérieur. L'invitation est de devenir ta propre autorité bienveillante.",
    "Lune-Jupiter": "L'opposition Lune-Jupiter crée un balancement entre émotions intimes et vision expansive. Tu oscillles entre le besoin de cocon et l'appel du large. L'invitation est d'honorer les deux sans les opposer.",
    "Lune-Saturne": "L'opposition Lune-Saturne confronte tes émotions à une exigence de contrôle. Les figures d'autorité peuvent avoir inhibé ton expression émotionnelle. L'invitation est de te donner la permission de ressentir pleinement.",
    "Mercure-Venus": "L'opposition Mercure-Vénus crée une oscillation entre logique et sentiments dans ta communication. Tu peux hésiter entre dire ce que tu penses et ce qui fait plaisir. L'intégration des deux est ton apprentissage.",
    "Mercure-Mars": "L'opposition Mercure-Mars peut créer des débats polarisés. Ta pensée est forte et ta parole, percutante — l'invitation est d'écouter autant que tu argumentes.",
    "Mars-Jupiter": "L'opposition Mars-Jupiter crée un balancement entre action impulsive et vision globale. Tes initiatives sont ambitieuses mais parfois mal calibrées. L'invitation est de viser juste plutôt que de viser loin.",
    "Mars-Saturne": "L'opposition Mars-Saturne alterne frustration et discipline. Les obstacles extérieurs semblent constants — mais chacun est une invitation à développer une force intérieure indéfectible.",
    "Jupiter-Saturne": "L'opposition Jupiter-Saturne polarise tes ambitions entre rêve et réalité. Tu oscilles entre la foi et le doute. L'intégration des deux — la vision ancrée dans le concret — est ta voie de sagesse.",
    "Venus-Jupiter": "L'opposition Vénus-Jupiter crée un balancement entre intimité et expansion. Tes relations peuvent souffrir d'excès de promesses ou d'attentes. L'invitation est d'aimer dans le réel, pas dans l'idéal.",
    "Venus-Saturne": "L'opposition Vénus-Saturne confronte l'amour à la peur du rejet. Tu peux maintenir une distance émotionnelle par protection. L'invitation est de risquer la vulnérabilité — c'est le prix de la vraie connexion.",
  },
  Sextile: {
    "Soleil-Lune": "Le sextile Soleil-Lune offre une connexion douce entre ta conscience et tes émotions. Tu as une capacité naturelle à harmoniser ce que tu veux et ce que tu ressens — une ressource à activer consciemment.",
    "Soleil-Mars": "Le sextile Soleil-Mars te donne accès à une énergie d'action constructive quand tu en as besoin. Tu sais mobiliser tes forces avec timing — ce talent est là, il suffit de l'activer.",
    "Soleil-Venus": "Le sextile Soleil-Vénus adoucit tes interactions d'un charme naturel. Les opportunités sociales et affectives se présentent régulièrement — saisis-les avec grâce.",
    "Lune-Mars": "Le sextile Lune-Mars te permet de canaliser tes émotions en action constructive quand tu le choisis. C'est une ressource de résilience émotionnelle — elle est là quand tu en as besoin.",
    "Lune-Venus": "Le sextile Lune-Vénus harmonise tes émotions et ta vie affective. Tu as un talent pour créer du confort et de la beauté autour de toi — un don d'hospitalité naturel.",
    "Venus-Mars": "Le sextile Vénus-Mars offre un équilibre accessible entre tendresse et passion. Quand tu l'actives, tes relations bénéficient d'un mélange naturel de douceur et de feu.",
    "Soleil-Jupiter": "Le sextile Soleil-Jupiter t'offre des opportunités de croissance et d'expansion que tu peux saisir consciemment. L'optimisme est une porte ouverte — il suffit de la franchir.",
    "Soleil-Saturne": "Le sextile Soleil-Saturne te donne accès à une discipline et une maturité constructives. Tu sais quand il est temps de structurer et de persévérer.",
    "Lune-Jupiter": "Le sextile Lune-Jupiter offre un optimisme émotionnel que tu peux cultiver. Dans les moments difficiles, tu as la capacité de trouver la lueur d'espoir — active-la.",
    "Lune-Saturne": "Le sextile Lune-Saturne te donne la capacité de structurer tes émotions avec sagesse quand tu en as besoin. C'est un ancrage disponible en cas de tempête émotionnelle.",
    "Mercure-Venus": "Le sextile Mercure-Vénus offre une communication agréable et diplomatique. Tu sais trouver les mots justes pour créer de l'harmonie quand tu le souhaites.",
    "Mercure-Mars": "Le sextile Mercure-Mars te donne accès à une pensée vive et assertive quand les circonstances l'exigent. Tes idées peuvent se transformer en action efficace.",
    "Mars-Jupiter": "Le sextile Mars-Jupiter offre des opportunités d'action chanceuse. Quand tu prends des initiatives avec confiance, les résultats tendent à être favorables.",
    "Mars-Saturne": "Le sextile Mars-Saturne te donne accès à une discipline d'action que tu peux mobiliser pour les projets qui comptent. La persévérance est ton alliée secrète.",
    "Jupiter-Saturne": "Le sextile Jupiter-Saturne offre un équilibre entre ambition et réalisme. Quand tu combines vision et méthode, tes projets ont toutes les chances de réussir.",
    "Venus-Jupiter": "Le sextile Vénus-Jupiter offre des moments de grâce et d'abondance dans ta vie affective. Les belles rencontres et les opportunités de bonheur se présentent régulièrement.",
    "Venus-Saturne": "Le sextile Vénus-Saturne te permet de construire des relations durables quand tu t'investis avec maturité. La loyauté et la profondeur affective sont tes forces.",
  },
};

// ─── Sign & House descriptions ────────────────────────────────────
export const signDescriptions: Record<string, { element: string; mode: string; ruler: string; description: string }> = {
  Belier: { element: "Feu", mode: "Cardinal", ruler: "Mars", description: "Énergie pionnière, courage, initiative." },
  Taureau: { element: "Terre", mode: "Fixe", ruler: "Vénus", description: "Stabilité, sensualité, persévérance." },
  Gemeaux: { element: "Air", mode: "Mutable", ruler: "Mercure", description: "Curiosité, communication, adaptabilité." },
  Cancer: { element: "Eau", mode: "Cardinal", ruler: "Lune", description: "Sensibilité, intuition, protection." },
  Lion: { element: "Feu", mode: "Fixe", ruler: "Soleil", description: "Créativité, générosité, expression de soi." },
  Vierge: { element: "Terre", mode: "Mutable", ruler: "Mercure", description: "Analyse, service, perfectionnement." },
  Balance: { element: "Air", mode: "Cardinal", ruler: "Vénus", description: "Harmonie, justice, relations." },
  Scorpion: { element: "Eau", mode: "Fixe", ruler: "Pluton", description: "Transformation, profondeur, intensité." },
  Sagittaire: { element: "Feu", mode: "Mutable", ruler: "Jupiter", description: "Expansion, sagesse, aventure." },
  Capricorne: { element: "Terre", mode: "Cardinal", ruler: "Saturne", description: "Structure, ambition, discipline." },
  Verseau: { element: "Air", mode: "Fixe", ruler: "Uranus", description: "Innovation, liberté, humanisme." },
  Poissons: { element: "Eau", mode: "Mutable", ruler: "Neptune", description: "Empathie, imagination, transcendance." },
};

export const houseDescriptions: Record<number, { name: string; domain: string; description: string }> = {
  1: { name: "Maison I", domain: "Identité", description: "Image de soi, apparence, première impression." },
  2: { name: "Maison II", domain: "Ressources", description: "Valeurs, revenus, estime de soi." },
  3: { name: "Maison III", domain: "Communication", description: "Pensée, échanges, fratrie, voisinage." },
  4: { name: "Maison IV", domain: "Foyer", description: "Racines, famille, sécurité intérieure." },
  5: { name: "Maison V", domain: "Créativité", description: "Expression, romance, plaisirs, enfants." },
  6: { name: "Maison VI", domain: "Quotidien", description: "Travail, santé, routines, service." },
  7: { name: "Maison VII", domain: "Partenariats", description: "Relations, contrats, l'autre." },
  8: { name: "Maison VIII", domain: "Transformation", description: "Crises, sexualité, héritage, renaissance." },
  9: { name: "Maison IX", domain: "Horizons", description: "Voyages, philosophie, enseignement supérieur." },
  10: { name: "Maison X", domain: "Vocation", description: "Carrière, statut, ambition, image publique." },
  11: { name: "Maison XI", domain: "Communauté", description: "Amis, projets collectifs, idéaux." },
  12: { name: "Maison XII", domain: "Intériorité", description: "Inconscient, spiritualité, retrait, karma." },
};

// ─── Interpretation assembler with preferences ───────────────────
export function getInterpretation(
  planet: string,
  sign: string,
  house: number | undefined,
  preferences: { tone: number; depth: number; focus: number }
): string {
  const { tone, depth, focus } = preferences;
  let parts: string[] = [];

  // Base planet-in-sign text
  const signText = planetInSign[planet]?.[sign];
  if (signText) {
    if (depth <= 3) {
      // Concise: first 2 sentences only
      const sentences = signText.match(/[^.!]+[.!]+/g) || [signText];
      parts.push(sentences.slice(0, 2).join("").trim());
    } else {
      parts.push(signText);
    }
  }

  // Add house text for depth >= 5
  if (house && depth >= 5) {
    const houseText = planetInHouse[planet]?.[house];
    if (houseText) {
      if (depth <= 6) {
        const sentences = houseText.match(/[^.!]+[.!]+/g) || [houseText];
        parts.push(sentences.slice(0, 2).join("").trim());
      } else {
        parts.push(houseText);
      }
    }
  }

  // Add tone-specific prefix/suffix
  if (tone <= 3 && signText) {
    // Scientific tone: add factual context
    const signInfo = signDescriptions[sign];
    if (signInfo) {
      parts.unshift(`${planet} se trouve dans le signe ${sign} (${signInfo.element}, ${signInfo.mode}), gouverné par ${signInfo.ruler}.`);
    }
  } else if (tone >= 8 && signText) {
    // Esoteric tone: add archetypal language
    const archetypes: Record<string, string> = {
      Soleil: "L'archétype solaire en toi",
      Lune: "La déesse lunaire dans ta carte",
      Mercure: "Le messager ailé de ton thème",
      Venus: "L'énergie d'Aphrodite en toi",
      Mars: "Le guerrier sacré de ta carte",
      Jupiter: "Le grand bienfaiteur cosmique",
      Saturne: "Le sage gardien du temps",
      Uranus: "L'éveilleur cosmique",
      Neptune: "Le rêveur divin",
      Pluton: "Le phénix de ton thème",
      "Noeud Nord": "La boussole karmique de ton âme",
    };
    if (archetypes[planet]) {
      parts.push(archetypes[planet] + " travaille en résonance avec les énergies de " + sign + ", créant un fil conducteur subtil dans ta destinée.");
    }
  }

  // Add focus-specific content
  if (focus <= 3 && signText) {
    // Practical focus: add actionable advice
    const practicalTips: Record<string, string> = {
      Soleil: "Dans ta vie quotidienne, honore cette énergie en t'engageant dans des activités qui correspondent à ce que tu viens de lire — c'est là que tu te sentiras le plus vivant·e.",
      Lune: "Pour ton bien-être émotionnel, crée des rituels quotidiens qui répondent aux besoins décrits ci-dessus — ton équilibre en dépend.",
      Mercure: "Dans ta communication professionnelle et personnelle, appuie-toi sur les forces décrites — c'est ton style naturel d'expression.",
      Venus: "En amour et en amitié, sois conscient·e de ces tendances — elles éclairent ce que tu cherches vraiment dans tes relations.",
      Mars: "Dans tes projets et tes défis, canalise cette énergie d'action vers des objectifs concrets qui t'importent.",
    };
    if (practicalTips[planet]) {
      parts.push(practicalTips[planet]);
    }
  } else if (focus >= 8 && signText) {
    // Introspective focus: add psychological reflection
    parts.push("Prends un moment pour observer comment cette énergie se manifeste dans ta vie intérieure. Quelles émotions, quels schémas récurrents reconnais-tu ? Cette prise de conscience est le premier pas vers une intégration plus profonde de cet aspect de toi-même.");
  }

  return parts.join("\n\n");
}
