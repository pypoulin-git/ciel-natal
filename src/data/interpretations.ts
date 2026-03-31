// interpretations.ts — Ciel Natal
// Textes d'interprétation astrologique en français
// Langage non-déterministe, empowering, inspiré de Liz Greene et Jung

// ─── PLANÈTE EN SIGNE ────────────────────────────────────────────────

export const planetInSign: Record<string, Record<string, string>> = {
  Soleil: {
    Belier:
      "Le Soleil en Bélier invite à embrasser l'élan pionnier qui habite l'être. Cette position suggère une vitalité brute, un besoin viscéral d'initier et de tracer sa propre route. L'identité se forge dans l'action spontanée, dans le courage d'être le premier à franchir le seuil. Le défi consiste à transmuter l'impatience en audace créatrice, à canaliser le feu intérieur sans consumer l'entourage.",
    Taureau:
      "Le Soleil en Taureau tend vers une quête d'enracinement profond et de présence sensorielle au monde. L'identité s'épanouit dans la patience, la constance et l'art de cultiver ce qui a de la valeur. Cette position invite à honorer le rythme naturel des choses, à bâtir pierre par pierre un édifice durable. La richesse intérieure se révèle lorsque la résistance au changement se transforme en fidélité consciente à ses valeurs essentielles.",
    Gemeaux:
      "Le Soleil en Gémeaux suggère un esprit en perpétuel mouvement, animé par la curiosité et le plaisir de tisser des liens entre les idées. L'identité se construit dans l'échange, la parole vive et l'exploration de multiples perspectives. Cette position invite à célébrer la versatilité comme une forme d'intelligence plutôt qu'une dispersion. Le défi lumineux réside dans l'art de trouver un fil conducteur au milieu de la multiplicité.",
    Cancer:
      "Le Soleil en Cancer invite à puiser sa force dans les racines émotionnelles et la mémoire du coeur. L'identité se nourrit du lien intime, de la capacité à protéger et à créer un espace de sécurité pour soi et les autres. Cette position tend vers une sensibilité profonde qui perçoit les courants invisibles des relations. La puissance solaire s'exprime pleinement lorsque la vulnérabilité est accueillie comme une sagesse plutôt qu'une faiblesse.",
    Lion:
      "Le Soleil en Lion rayonne dans sa demeure naturelle, invitant l'être à assumer pleinement sa lumière créatrice. Cette position suggère un besoin fondamental de s'exprimer avec générosité, de donner forme à une vision personnelle qui inspire les autres. L'identité s'affirme dans la joie de créer, de jouer et d'aimer avec grandeur. Le véritable éclat naît lorsque le désir de reconnaissance se transforme en don authentique de soi.",
    Vierge:
      "Le Soleil en Vierge invite à trouver sa lumière dans le service attentif et l'art du discernement. L'identité se révèle dans la capacité à percevoir l'essentiel au coeur du détail, à affiner et perfectionner ce qui existe. Cette position suggère une intelligence pratique qui aspire à rendre le monde plus cohérent et fonctionnel. La plénitude s'atteint lorsque l'exigence envers soi-même devient un acte d'amour plutôt qu'une quête impossible de perfection.",
    Balance:
      "Le Soleil en Balance tend vers une quête d'harmonie et de beauté dans les relations humaines. L'identité s'épanouit dans le dialogue, la diplomatie et l'art de créer des ponts entre les êtres. Cette position invite à cultiver le sens esthétique et la justice comme expressions naturelles de soi. Le défi consiste à ne pas se perdre dans le miroir de l'autre, à oser affirmer sa propre note dans le concert relationnel.",
    Scorpion:
      "Le Soleil en Scorpion suggère une intensité existentielle qui plonge au coeur des mystères de la vie. L'identité se forge dans les profondeurs, à travers les crises et les renaissances successives. Cette position invite à embrasser le pouvoir de la transformation, à ne pas craindre les zones d'ombre qui recèlent les trésors les plus précieux. La véritable puissance émerge lorsque le contrôle cède la place à une confiance radicale dans le processus de métamorphose.",
    Sagittaire:
      "Le Soleil en Sagittaire invite à déployer les ailes de la vision et de la quête de sens. L'identité se nourrit de l'exploration, qu'elle soit géographique, intellectuelle ou spirituelle. Cette position tend vers un optimisme naturel et un besoin de comprendre le grand récit qui relie toutes choses. La sagesse s'approfondit lorsque l'enthousiasme débordant s'ancre dans l'humilité de reconnaître que la vérité a de multiples visages.",
    Capricorne:
      "Le Soleil en Capricorne suggère une maturité intérieure qui aspire à construire quelque chose de durable et de signifiant. L'identité se révèle dans la persévérance, la responsabilité assumée et la capacité à gravir patiemment sa propre montagne. Cette position invite à honorer l'ambition comme un service rendu au monde. La chaleur solaire s'exprime pleinement lorsque la rigueur s'accompagne de tendresse envers soi-même et les étapes du chemin.",
    Verseau:
      "Le Soleil en Verseau tend vers une identité qui se définit par sa singularité et sa vision du collectif. Cette position invite à oser être différent, à porter un regard novateur sur les structures établies. L'être s'épanouit dans la fraternité des idées, la liberté de pensée et l'aspiration à un monde plus juste. Le défi lumineux consiste à rester connecté au coeur humain tout en embrassant la perspective universelle.",
    Poissons:
      "Le Soleil en Poissons invite à une identité fluide, perméable aux courants invisibles de l'existence. Cette position suggère une sensibilité artistique et spirituelle profonde, un don naturel pour percevoir l'unité derrière la diversité. L'être se nourrit de compassion, d'imagination et de moments de dissolution créatrice. La plénitude s'atteint lorsque la tendance à se fondre dans l'autre se transforme en offrande consciente de sa lumière intérieure.",
  },

  Lune: {
    Belier:
      "La Lune en Bélier suggère un monde émotionnel vif et spontané, où les sentiments s'expriment avec une franchise désarmante. Les besoins affectifs se manifestent dans l'immédiateté, l'indépendance et le besoin de se sentir vivant. Cette position invite à honorer l'enfant intérieur qui a besoin d'action et de nouveauté pour se sentir en sécurité. L'apprentissage émotionnel passe par la patience et la capacité à rester présent après l'élan initial.",
    Taureau:
      "La Lune en Taureau, en exaltation, tend vers un monde émotionnel d'une grande stabilité sensorielle. Les besoins de confort, de beauté tangible et de rythmes prévisibles nourrissent profondément l'âme. Cette position invite à cultiver un rapport intime avec la nature et les plaisirs simples comme ancrage émotionnel. La sécurité intérieure se renforce lorsque l'attachement aux formes connues s'ouvre progressivement à la richesse du changement.",
    Gemeaux:
      "La Lune en Gémeaux suggère un paysage émotionnel animé par le mouvement des mots et des idées. Le bien-être intérieur se nourrit de communication, de variété et de connections intellectuelles stimulantes. Cette position invite à reconnaître que nommer ses émotions est déjà une forme de guérison. Le défi consiste à descendre parfois en dessous du mental agile pour toucher les couches plus profondes du ressenti.",
    Cancer:
      "La Lune en Cancer, dans sa demeure, déploie toute sa puissance réceptive et nourricière. Le monde émotionnel est riche, profond et intimement lié à la mémoire familiale et aux racines. Cette position invite à honorer la sensibilité comme un don précieux, une antenne qui capte les besoins invisibles des êtres. La plénitude émotionnelle s'atteint lorsque le besoin de protéger évolue vers la capacité à laisser aller avec amour.",
    Lion:
      "La Lune en Lion tend vers un besoin émotionnel de chaleur, de reconnaissance et d'expression créatrice. L'enfant intérieur aspire à être vu, célébré et aimé pour sa singularité lumineuse. Cette position invite à nourrir la joie et la générosité du coeur comme sources premières de sécurité émotionnelle. L'épanouissement se déploie lorsque le besoin d'admiration se transforme en capacité à rayonner sans attendre de retour.",
    Vierge:
      "La Lune en Vierge suggère un monde émotionnel qui trouve son apaisement dans l'ordre, l'utilité et le soin attentif au quotidien. Les besoins affectifs se manifestent à travers des gestes concrets de service et d'attention aux détails. Cette position invite à reconnaître que prendre soin du corps et de l'environnement est une forme d'amour envers soi-même. La sérénité intérieure grandit lorsque l'autocritique cède la place à la bienveillance pratique.",
    Balance:
      "La Lune en Balance invite à un monde émotionnel qui respire au rythme des relations harmonieuses. Le bien-être intérieur se nourrit de beauté, d'équilibre et du sentiment d'être en accord avec l'autre. Cette position tend vers une sensibilité esthétique raffinée et un besoin profond de paix relationnelle. L'apprentissage émotionnel passe par la capacité à accueillir le conflit comme une opportunité de croissance plutôt qu'une menace.",
    Scorpion:
      "La Lune en Scorpion, en chute, suggère un monde émotionnel d'une intensité magnétique qui plonge dans les profondeurs de l'âme. Les besoins affectifs sont puissants, absolus, et cherchent une connexion qui touche l'essentiel. Cette position invite à apprivoiser les émotions les plus intenses comme des alliées de transformation. La sécurité intérieure se révèle lorsque le besoin de contrôle émotionnel se mue en confiance dans la capacité à renaître.",
    Sagittaire:
      "La Lune en Sagittaire tend vers un paysage émotionnel expansif, nourri par la quête de sens et l'aventure. Le bien-être intérieur se construit dans la liberté, l'exploration et le sentiment d'appartenir à quelque chose de plus vaste. Cette position invite à honorer le besoin d'espace émotionnel et de vision comme un droit fondamental de l'âme. L'ancrage se renforce paradoxalement lorsque la permission de partir est pleinement accordée.",
    Capricorne:
      "La Lune en Capricorne, en détriment, suggère un monde émotionnel structuré, où la maturité et la responsabilité servent de refuge. Les besoins affectifs se manifestent avec retenue, gravité et un sens profond du devoir. Cette position invite à reconnaître que la vulnérabilité n'est pas une faiblesse mais le terreau de la véritable force intérieure. L'épanouissement émotionnel s'ouvre lorsque les murs protecteurs deviennent des fondations solides pour accueillir la tendresse.",
    Verseau:
      "La Lune en Verseau invite à un monde émotionnel qui pulse au rythme de l'originalité et de la fraternité. Le bien-être intérieur se nourrit de liberté, d'amitié authentique et du sentiment de contribuer à un idéal. Cette position tend vers une intelligence émotionnelle qui observe les sentiments avec un certain recul lucide. L'ancrage affectif se renforce lorsque la distance protectrice s'ouvre à l'intimité sans perdre son espace vital.",
    Poissons:
      "La Lune en Poissons suggère un océan émotionnel sans frontières, une empathie qui absorbe les courants de l'environnement. Les besoins affectifs sont nourris par la beauté, la musique, la connexion spirituelle et les moments de dissolution bienheureux. Cette position invite à cultiver des rituels de protection émotionnelle pour ne pas se noyer dans la mer des sentiments d'autrui. La plénitude naît lorsque la perméabilité devient compassion éclairée plutôt qu'absorption aveugle.",
  },

  Mercure: {
    Belier:
      "Mercure en Bélier tend vers une pensée rapide, directe et pionnière, qui préfère ouvrir un chemin plutôt que suivre celui des autres. La communication s'exprime avec franchise et spontanéité, parfois avant même que la réflexion soit achevée. Cette position invite à canaliser l'intelligence combative dans le débat constructif et l'innovation. La puissance mentale se déploie pleinement lorsque l'impatience intellectuelle se transforme en audace visionnaire.",
    Taureau:
      "Mercure en Taureau suggère une pensée lente, solide et profondément ancrée dans le concret. L'esprit prend le temps de mûrir ses idées, de les tourner et retourner comme un artisan polit son oeuvre. Cette position invite à faire confiance à cette intelligence sensorielle qui pense avec le corps autant qu'avec le mental. La communication gagne en puissance lorsque la lenteur assumée devient synonyme de profondeur.",
    Gemeaux:
      "Mercure en Gémeaux, dans sa demeure, déploie toute sa vivacité intellectuelle et sa capacité à tisser des connections entre les domaines. L'esprit est un papillon curieux qui se nourrit de la diversité des savoirs et des échanges. Cette position invite à célébrer la versatilité mentale comme un don rare de mise en relation. Le défi consiste à approfondir certains sujets suffisamment pour que la brillance devienne substance.",
    Cancer:
      "Mercure en Cancer tend vers une intelligence imprégnée d'émotion, où la mémoire affective colore chaque pensée. L'esprit pense en images, en souvenirs et en résonances intimes, avec une intuition remarquable pour les non-dits. Cette position invite à reconnaître que l'intelligence émotionnelle est une forme de pensée aussi valide que la logique pure. La communication s'enrichit lorsque la subjectivité assumée devient un pont vers l'universel.",
    Lion:
      "Mercure en Lion suggère une pensée dramatique et créatrice, qui cherche à donner forme et éclat aux idées. L'esprit communique avec chaleur, conviction et un sens naturel de la narration qui captive l'auditoire. Cette position invite à mettre l'intelligence au service de la vision créatrice et de l'inspiration des autres. La parole gagne en profondeur lorsque le besoin de briller intellectuellement se transforme en générosité du partage.",
    Vierge:
      "Mercure en Vierge, dans son second domicile et exaltation, aiguise le mental jusqu'au fil du rasoir analytique. L'esprit excelle dans le tri, la classification et la capacité à percevoir ce qui dysfonctionne pour le réparer. Cette position invite à mettre cette intelligence pratique au service d'une vision plus large, sans se perdre dans les détails. La communication atteint sa pleine puissance lorsque la précision s'allie à la bienveillance.",
    Balance:
      "Mercure en Balance tend vers une pensée équilibrée, diplomatique et naturellement orientée vers la compréhension de l'autre. L'esprit pèse le pour et le contre avec élégance, cherchant la formulation juste et harmonieuse. Cette position invite à utiliser cette intelligence relationnelle pour créer du consensus et de la beauté par les mots. Le défi consiste à oser trancher parfois, à ne pas laisser l'indécision diluer la force de la pensée.",
    Scorpion:
      "Mercure en Scorpion suggère une pensée pénétrante qui va droit à l'essentiel, perçant les apparences pour atteindre la vérité cachée. L'esprit fonctionne comme un détective de l'âme, attiré par les mystères et les tabous. Cette position invite à utiliser cette intelligence incisive pour transformer et guérir plutôt que pour manipuler. La communication acquiert une puissance magnétique lorsque l'intensité mentale se met au service de l'authenticité.",
    Sagittaire:
      "Mercure en Sagittaire, en détriment, tend vers une pensée expansive qui cherche le sens global plutôt que le détail précis. L'esprit fonctionne comme un archer visant la cible lointaine de la compréhension philosophique. Cette position invite à embrasser cette vision panoramique tout en cultivant la rigueur nécessaire à la transmission fidèle des idées. La parole s'enrichit lorsque l'enthousiasme visionnaire s'accompagne d'écoute attentive.",
    Capricorne:
      "Mercure en Capricorne suggère une pensée structurée, stratégique et orientée vers des résultats concrets à long terme. L'esprit construit ses raisonnements comme un architecte, avec méthode et rigueur. Cette position invite à faire confiance à cette intelligence patiente qui préfère la solidité à l'éclat éphémère. La communication gagne en impact lorsque l'autorité naturelle du propos s'adoucit d'une touche d'humour et d'humanité.",
    Verseau:
      "Mercure en Verseau tend vers une pensée originale, intuitive et capable de percevoir les paradigmes du futur. L'esprit fonctionne par éclairs de compréhension, reliant des concepts que d'autres jugent incompatibles. Cette position invite à cultiver cette intelligence novatrice tout en restant accessible dans sa communication. La brillance mentale s'accomplit lorsque l'originalité de la pensée se met au service du bien commun.",
    Poissons:
      "Mercure en Poissons, en chute et détriment, suggère une pensée poétique et intuitive qui appréhende le monde par osmose. L'esprit pense en images, en symboles et en résonances, avec une capacité rare à percevoir l'invisible. Cette position invite à reconnaître cette intelligence imaginale comme un trésor, même si elle ne se conforme pas aux normes logiques. La communication s'illumine lorsque la parole devient un pont entre le monde visible et les profondeurs de l'imaginaire.",
  },

  Venus: {
    Belier:
      "Vénus en Bélier, en détriment, invite à un amour ardent et spontané, qui se consume dans l'instant présent avec une intensité désarmante. L'attraction se vit comme une conquête, un feu qui jaillit sans prévenir. Cette position suggère d'apprendre à maintenir la flamme au-delà de l'étincelle initiale, à découvrir que la passion peut coexister avec la durée. La beauté se révèle dans le courage d'aimer sans calcul ni retenue.",
    Taureau:
      "Vénus en Taureau, dans sa demeure, déploie une sensualité profonde et un amour qui s'épanouit dans la durée. L'attirance se nourrit de présence physique, de beauté tangible et de plaisirs partagés avec lenteur. Cette position invite à honorer ce besoin de stabilité affective comme une sagesse du coeur. La relation s'enrichit lorsque la possessivité naturelle se transforme en fidélité généreuse et en don sensoriel.",
    Gemeaux:
      "Vénus en Gémeaux tend vers un amour léger, curieux et intellectuellement stimulant. L'attraction naît dans l'échange des mots, le jeu des esprits et la fraîcheur du renouvellement. Cette position invite à célébrer cette légèreté comme une qualité relationnelle précieuse plutôt qu'un manque de profondeur. L'amour se révèle pleinement lorsque la diversité des connections nourrit une complicité qui mûrit avec le temps.",
    Cancer:
      "Vénus en Cancer suggère un amour nourricier et protecteur, où le coeur s'ouvre dans l'intimité du foyer et du lien familial. L'attraction se vit comme un retour à la maison, un sentiment de reconnaissance profonde et de sécurité partagée. Cette position invite à laisser la tendresse maternelle irriguer toutes les formes de relation. La plénitude affective grandit lorsque le besoin de protection se mue en capacité à créer un refuge pour l'être aimé.",
    Lion:
      "Vénus en Lion tend vers un amour grandiose, théâtral et profondément généreux, qui cherche à célébrer l'autre comme un roi célèbre son royaume. L'attraction se nourrit d'admiration mutuelle, de joie partagée et de gestes éclatants. Cette position invite à laisser le coeur s'exprimer avec magnificence sans attendre une ovation en retour. L'amour atteint sa pleine mesure lorsque la fierté relationnelle devient un acte de générosité créatrice.",
    Vierge:
      "Vénus en Vierge, en chute, suggère un amour discret qui s'exprime à travers les gestes quotidiens d'attention et de soin. L'attraction se tisse dans le dévouement pratique, la fiabilité et la capacité à percevoir les besoins concrets de l'autre. Cette position invite à reconnaître cette forme d'amour modeste comme une expression profonde de la beauté. La relation s'épanouit lorsque l'exigence perfectionniste cède la place à l'acceptation tendre de l'imparfait.",
    Balance:
      "Vénus en Balance, dans son second domicile, déploie son art naturel de la relation, de l'harmonie et de la beauté partagée. L'attraction se vit comme une danse, un équilibre subtil entre donner et recevoir. Cette position invite à cultiver l'esthétique relationnelle tout en osant traverser les moments de dissonance nécessaires à la croissance. L'amour s'approfondit lorsque le désir de paix extérieure se nourrit d'une paix intérieure authentique.",
    Scorpion:
      "Vénus en Scorpion, en détriment, tend vers un amour intense, transformateur et sans compromis, qui cherche la fusion absolue avec l'autre. L'attraction est magnétique, presque fatale, et plonge directement dans les eaux profondes de l'intimité. Cette position invite à apprivoiser cette puissance émotionnelle comme un catalyseur de transformation mutuelle. La beauté se révèle dans la capacité à aimer au-delà de la peur de la perte et de la trahison.",
    Sagittaire:
      "Vénus en Sagittaire suggère un amour libre, aventurier et philosophique, qui s'épanouit dans le partage de visions et d'horizons. L'attraction naît de la stimulation intellectuelle, de l'humour et du sentiment d'explorer ensemble un territoire inconnu. Cette position invite à célébrer cette soif de liberté comme un ingrédient essentiel de l'amour authentique. La relation mûrit lorsque l'enthousiasme du départ se prolonge en compagnonnage fidèle.",
    Capricorne:
      "Vénus en Capricorne tend vers un amour mature, patient et constructif, qui privilégie la solidité du lien à l'effervescence passagère. L'attraction se développe lentement, fondée sur le respect mutuel, la fiabilité et la vision à long terme. Cette position invite à faire confiance à cette capacité d'aimer qui s'approfondit avec le temps. La chaleur affective se révèle pleinement lorsque les barrières protectrices s'ouvrent à l'intimité vulnérable.",
    Verseau:
      "Vénus en Verseau suggère un amour original, fraternel et intellectuellement libre, qui redéfinit les codes relationnels. L'attraction se nourrit de singularité, de partage d'idéaux et du respect inconditionnel de la liberté de chacun. Cette position invite à explorer des formes de relation authentiques qui transcendent les conventions. L'amour s'enrichit lorsque le détachement protecteur s'adoucit d'une tendresse qui ose la proximité émotionnelle.",
    Poissons:
      "Vénus en Poissons, en exaltation, déploie un amour océanique, compassionnel et mystiquement profond. L'attraction se vit comme une reconnaissance d'âme, un sentiment de fusion qui transcende les frontières du moi. Cette position invite à canaliser cette immense capacité d'amour sans se perdre dans le sacrifice ou l'idéalisation. La beauté atteint sa pleine expression lorsque la dévotion se nourrit de discernement et de respect de soi.",
  },

  Mars: {
    Belier:
      "Mars en Bélier, dans sa demeure, déploie une énergie d'action pure, directe et instinctive. La force de volonté s'exprime dans l'initiative, le courage physique et la capacité à foncer sans hésiter. Cette position invite à canaliser cette puissance brute dans des projets qui méritent l'ardeur du guerrier intérieur. L'efficacité s'accroît lorsque l'impulsivité se transforme en audace stratégique.",
    Taureau:
      "Mars en Taureau, en détriment, suggère une force d'action lente mais implacable, comme un fleuve qui creuse la roche par sa seule persévérance. L'énergie se mobilise pour construire, accumuler et défendre ce qui a de la valeur. Cette position invite à faire confiance à cette endurance remarquable plutôt qu'à forcer la vitesse. La puissance se révèle pleinement dans la patience stratégique et la détermination inébranlable.",
    Gemeaux:
      "Mars en Gémeaux tend vers une énergie dispersée entre mille pistes, animée par la curiosité et le besoin de stimulation mentale. La force de volonté s'exprime dans le verbe, la polémique constructive et la capacité à mener plusieurs batailles simultanément. Cette position invite à focaliser cette énergie mentale sur des objectifs clairs pour éviter l'éparpillement. L'action devient puissante lorsque l'agilité de l'esprit guide un corps engagé.",
    Cancer:
      "Mars en Cancer, en chute, suggère une énergie d'action profondément liée aux émotions et au besoin de protéger ses proches. La force se mobilise par vagues, au gré des marées émotionnelles, avec une puissance parfois surprenante. Cette position invite à reconnaître que la motivation par le coeur est une forme légitime de courage. L'action gagne en efficacité lorsque la sensibilité devient un radar plutôt qu'un frein.",
    Lion:
      "Mars en Lion déploie une énergie théâtrale et créatrice, qui aspire à accomplir des actes mémorables et inspirants. La volonté s'affirme avec noblesse, chaleur et un sens dramatique de la mission personnelle. Cette position invite à canaliser cette flamme dans des projets qui célèbrent la vie et élèvent les autres. La force atteint sa pleine mesure lorsque l'orgueil du guerrier se met au service d'une cause plus grande que lui.",
    Vierge:
      "Mars en Vierge tend vers une énergie méthodique et précise, qui excelle dans l'exécution minutieuse et l'amélioration continue. La force d'action se déploie dans le service, la résolution de problèmes et le perfectionnement des processus. Cette position invite à utiliser cette efficacité pratique sans se perdre dans les détails qui paralysent. L'action devient puissante lorsque la critique constructive se transforme en capacité à réparer le monde, un geste à la fois.",
    Balance:
      "Mars en Balance, en détriment, suggère une énergie d'action qui cherche naturellement la coopération et l'équilibre. La force de volonté s'exprime dans la négociation, la diplomatie et la capacité à agir de concert avec l'autre. Cette position invite à reconnaître que l'action juste est parfois celle qui prend le temps de la concertation. Le défi consiste à ne pas laisser l'indécision devenir paralysie, à oser l'action imparfaite quand la perfection relationnelle est hors de portée.",
    Scorpion:
      "Mars en Scorpion, dans son second domicile, déploie une énergie d'une intensité magnétique, capable de soulever des montagnes invisibles. La volonté s'exprime dans les profondeurs, avec une détermination qui ne recule devant aucun obstacle psychologique. Cette position invite à utiliser cette puissance transformatrice pour des causes qui en valent la peine. L'action atteint son apogée lorsque l'instinct de survie se transmute en force régénératrice.",
    Sagittaire:
      "Mars en Sagittaire tend vers une énergie expansive, enthousiaste et orientée vers des objectifs lointains et inspirants. La force de volonté se déploie dans l'exploration, la compétition sportive et la défense de convictions élevées. Cette position invite à canaliser cet élan dans une direction suffisamment vaste pour contenir toute l'énergie disponible. L'action gagne en sagesse lorsque l'enthousiasme guerrier s'accompagne de discernement éthique.",
    Capricorne:
      "Mars en Capricorne, en exaltation, déploie une énergie d'action disciplinée, stratégique et remarquablement efficace. La volonté se concentre sur des objectifs à long terme avec une détermination froide et une endurance remarquable. Cette position invite à mettre cette capacité d'exécution exceptionnelle au service d'ambitions qui ont du sens. La puissance s'exprime pleinement lorsque la maîtrise de soi s'accompagne d'une vision qui dépasse l'intérêt personnel.",
    Verseau:
      "Mars en Verseau suggère une énergie d'action originale et collective, qui se mobilise pour des causes qui dépassent l'individu. La force de volonté s'exprime dans l'innovation, la réforme et la capacité à briser les moules obsolètes. Cette position invite à canaliser cette énergie rebelle dans des actions concrètes qui construisent le futur désiré. L'action devient révolutionnaire lorsque l'indépendance radicale se met au service de la fraternité.",
    Poissons:
      "Mars en Poissons tend vers une énergie d'action fluide, intuitive et guidée par la compassion. La force de volonté se manifeste de manière indirecte, portée par l'inspiration, la créativité et le désir de soulager la souffrance. Cette position invite à reconnaître que l'action poétique et spirituelle est aussi une forme de courage. La puissance se révèle lorsque la sensibilité au courant de la vie devient un guide d'action plutôt qu'un motif de passivité.",
  },

  Jupiter: {
    Belier:
      "Jupiter en Bélier invite à une expansion par l'initiative audacieuse et le leadership pionnier. La croissance personnelle se nourrit de défis relevés avec enthousiasme et d'une confiance instinctive en sa capacité à ouvrir des voies nouvelles. Cette position suggère que la chance accompagne ceux qui osent être les premiers, les déclencheurs. L'abondance se manifeste lorsque le courage d'entreprendre se conjugue avec la générosité de partager ses découvertes.",
    Taureau:
      "Jupiter en Taureau tend vers une expansion par l'accumulation patiente et la jouissance pleine des richesses de la vie. La croissance se déploie dans le domaine matériel, sensoriel et artistique, avec un sens naturel de la prospérité. Cette position invite à cultiver la gratitude pour ce qui est déjà présent comme porte vers l'abondance. La fortune sourit lorsque la générosité matérielle s'allie à la sagesse de la mesure.",
    Gemeaux:
      "Jupiter en Gémeaux, en détriment, suggère une expansion par la multiplicité des savoirs, des échanges et des connexions intellectuelles. La croissance se nourrit de curiosité insatiable, de voyages mentaux et de rencontres stimulantes. Cette position invite à transformer cette encyclopédie vivante en sagesse communicable et partageable. L'abondance se déploie lorsque la diversité des intérêts trouve un fil conducteur porteur de sens.",
    Cancer:
      "Jupiter en Cancer, en exaltation, déploie une expansion nourricière et émotionnellement riche. La croissance se vit dans l'approfondissement des liens familiaux, la création d'un foyer chaleureux et la générosité du coeur. Cette position invite à honorer l'instinct protecteur comme une source de sagesse et de rayonnement. L'abondance se manifeste naturellement lorsque la capacité à nourrir les autres se nourrit elle-même d'une source intérieure inépuisable.",
    Lion:
      "Jupiter en Lion tend vers une expansion créatrice et théâtrale, où la joie de vivre devient contagieuse. La croissance se déploie dans l'expression artistique, le jeu et la capacité à inspirer les autres par son propre enthousiasme. Cette position invite à laisser la générosité naturelle du coeur rayonner sans compter. L'abondance se manifeste lorsque la confiance en soi devient un cadeau offert au monde plutôt qu'une demande d'admiration.",
    Vierge:
      "Jupiter en Vierge, en détriment, suggère une expansion par le service méticuleux et l'amélioration continue des systèmes. La croissance se construit dans l'humilité du quotidien, l'attention aux détails et la capacité à rendre le monde plus fonctionnel. Cette position invite à reconnaître que la grandeur peut résider dans la perfection des petites choses. L'abondance se révèle lorsque l'exigence de qualité se détend suffisamment pour accueillir la grâce.",
    Balance:
      "Jupiter en Balance tend vers une expansion par l'art de la relation, la justice et la beauté partagée. La croissance se nourrit de partenariats féconds, de créations esthétiques et d'un sens naturel de l'équilibre social. Cette position invite à utiliser le don diplomatique au service d'une harmonie qui inclut plutôt qu'exclut. L'abondance se déploie lorsque la quête de justice devient un acte d'amour envers la communauté.",
    Scorpion:
      "Jupiter en Scorpion invite à une expansion par la plongée dans les profondeurs de l'existence et la transformation radicale. La croissance se nourrit de crises traversées, de tabous explorés et de ressources psychiques insoupçonnées. Cette position suggère que les plus grands trésors se cachent dans les zones d'ombre que la plupart évitent. L'abondance se manifeste lorsque le courage d'affronter l'obscurité se transforme en sagesse régénératrice.",
    Sagittaire:
      "Jupiter en Sagittaire, dans sa demeure, déploie toute sa puissance d'expansion, de vision et de quête de sens. La croissance est naturellement orientée vers l'exploration philosophique, les voyages et l'enseignement inspirant. Cette position invite à embrasser cette soif d'absolu tout en gardant les pieds sur terre. L'abondance se manifeste lorsque la foi en la vie s'accompagne d'un engagement concret au service de la vérité.",
    Capricorne:
      "Jupiter en Capricorne, en chute, suggère une expansion disciplinée qui construit la grandeur par l'effort patient et la persévérance. La croissance se manifeste dans le domaine professionnel, les structures durables et la maîtrise progressive de son domaine. Cette position invite à faire confiance au temps comme allié de l'ambition légitime. L'abondance se révèle lorsque la rigueur s'accompagne de la capacité à voir le sens profond de l'ascension.",
    Verseau:
      "Jupiter en Verseau tend vers une expansion par l'innovation sociale, la pensée futuriste et l'engagement collectif. La croissance se nourrit d'amitiés inspirantes, de projets humanitaires et de la capacité à imaginer un monde meilleur. Cette position invite à transformer les visions utopiques en actions concrètes qui servent le bien commun. L'abondance se déploie lorsque l'originalité de la pensée trouve un écho dans la communauté.",
    Poissons:
      "Jupiter en Poissons, dans son second domicile, déploie une expansion spirituelle, artistique et compassionnelle d'une grande profondeur. La croissance se vit dans la dissolution des frontières du moi, la connexion mystique et l'immersion dans la beauté universelle. Cette position invite à canaliser cette immense ouverture dans des oeuvres qui touchent l'âme collective. L'abondance se manifeste lorsque la foi en l'invisible se conjugue avec le discernement pratique.",
  },

  Saturne: {
    Belier:
      "Saturne en Bélier, en chute, invite à confronter la tension entre le besoin d'agir et la peur de l'initiative. Cette position suggère un apprentissage profond autour de l'affirmation de soi, où chaque acte de courage est une victoire sur le doute intérieur. Le maître du temps dans le signe du feu enseigne que la vraie bravoure naît de la patience. La maturité s'atteint lorsque l'hésitation se transforme en action réfléchie plutôt qu'en paralysie.",
    Taureau:
      "Saturne en Taureau tend vers un rapport exigeant avec la matière, les ressources et la sécurité financière. Cette position suggère que la relation à l'abondance se construit lentement, à travers des leçons de simplicité et de valeur authentique. Le maître du temps dans le signe de la terre invite à distinguer l'essentiel du superflu. La sagesse mûrit lorsque la peur du manque se transforme en art de vivre avec ce qui compte vraiment.",
    Gemeaux:
      "Saturne en Gémeaux invite à structurer l'intelligence et à discipliner la communication avec rigueur et profondeur. Cette position suggère un rapport sérieux au savoir, où la légèreté intellectuelle cède progressivement la place à la maîtrise du verbe. Le maître du temps dans le signe de l'air enseigne que les mots ont un poids et une responsabilité. La maturité mentale s'épanouit lorsque la précision de la pensée se met au service d'un message porteur de sens.",
    Cancer:
      "Saturne en Cancer, en détriment, suggère un apprentissage exigeant autour de la vulnérabilité, de la famille et des racines émotionnelles. Cette position tend vers une retenue affective qui protège un coeur profondément sensible derrière des murs de responsabilité. Le maître du temps invite à construire une sécurité intérieure qui ne dépend pas de l'approbation extérieure. L'épanouissement se déploie lorsque la carapace protectrice devient un foyer intérieur habitable et chaleureux.",
    Lion:
      "Saturne en Lion, en détriment, tend vers une tension entre le besoin de s'exprimer et la peur d'être vu. Cette position suggère un apprentissage profond autour de la créativité, de l'autorité et de la joie de vivre. Le maître du temps dans le signe du coeur invite à prendre la scène avec humilité plutôt qu'avec grandiose. La maturité créatrice s'atteint lorsque le besoin de reconnaissance se transforme en capacité à créer pour la beauté du geste.",
    Vierge:
      "Saturne en Vierge invite à une discipline du quotidien, du corps et du service qui peut atteindre des sommets de compétence. Cette position suggère un perfectionnisme qui, au lieu de paralyser, peut devenir un art de l'excellence pratique. Le maître du temps dans le signe de la méthode enseigne la valeur de la rigueur bienveillante. La sagesse s'accomplit lorsque l'exigence envers soi-même se teinte de compassion pour les imperfections de la condition humaine.",
    Balance:
      "Saturne en Balance, en exaltation, déploie sa sagesse dans le domaine des relations, de la justice et de l'engagement. Cette position tend vers un sens profond de la responsabilité relationnelle et du contrat social. Le maître du temps dans le signe de l'harmonie enseigne que les liens durables se construisent sur la justice et le respect mutuel. La maturité relationnelle s'atteint lorsque le compromis devient un art plutôt qu'un sacrifice.",
    Scorpion:
      "Saturne en Scorpion invite à confronter les peurs les plus profondes avec une rigueur transformatrice. Cette position suggère un rapport exigeant avec le pouvoir, la mort symbolique et les ressources partagées. Le maître du temps dans le signe de la transformation enseigne que les crises sont des portails. La sagesse se révèle lorsque la résistance à lâcher prise se mue en capacité à traverser les ténèbres avec discipline et courage.",
    Sagittaire:
      "Saturne en Sagittaire tend vers une structuration de la quête de sens et une discipline de la vision philosophique. Cette position invite à bâtir un système de croyances solide, testé par l'expérience plutôt que fondé sur l'enthousiasme seul. Le maître du temps dans le signe de l'archer enseigne que la sagesse se mérite par l'humilité. La maturité spirituelle s'accomplit lorsque le dogmatisme cède la place à une foi éprouvée et nuancée.",
    Capricorne:
      "Saturne en Capricorne, dans sa demeure, déploie sa pleine puissance structurante, ambitieuse et magistrale. Cette position tend vers une capacité remarquable à construire des édifices durables dans le monde, avec patience et détermination. Le maître du temps chez lui invite à assumer pleinement son autorité intérieure et son rôle dans la communauté. La sagesse s'accomplit lorsque le succès extérieur reflète une intégrité intérieure inébranlable.",
    Verseau:
      "Saturne en Verseau, dans son second domicile, structure la vision collective et l'innovation sociale avec méthode et persévérance. Cette position invite à donner forme concrète aux idéaux, à transformer les utopies en systèmes fonctionnels. Le maître du temps dans le signe du futur enseigne que le progrès durable se construit brique par brique. La maturité sociale s'atteint lorsque la rébellion se mue en réforme patiente et architecturale.",
    Poissons:
      "Saturne en Poissons invite à donner forme et structure à l'informe, à ancrer la spiritualité dans la pratique quotidienne. Cette position suggère un apprentissage exigeant autour de la foi, de la compassion et des limites entre soi et le collectif. Le maître du temps dans le signe de l'océan enseigne l'art de nager avec discipline dans les eaux de l'inconscient. La sagesse mûrit lorsque la dissolution mystique se conjugue avec un ancrage terrestre solide.",
  },

  Uranus: {
    Belier:
      "Uranus en Bélier tend vers des éclairs d'innovation radicale et un besoin impérieux de liberté individuelle. Cette position générationnelle invite à explorer de nouvelles formes d'identité et d'action, à briser les moules avec audace. L'énergie révolutionnaire se déploie dans le courage d'être un pionnier du changement. La sagesse uranienne s'exprime lorsque la rébellion instinctive se transforme en vision créatrice pour l'ensemble.",
    Taureau:
      "Uranus en Taureau suggère une révolution dans le rapport aux valeurs, aux ressources et au monde matériel. Cette position générationnelle invite à repenser fondamentalement la notion de richesse et de sécurité. L'innovation se déploie dans les domaines de l'économie, de l'écologie et de la relation au corps. La sagesse s'exprime lorsque le bouleversement des acquis ouvre la voie à une prospérité plus authentique et durable.",
    Gemeaux:
      "Uranus en Gémeaux tend vers une révolution de la pensée et de la communication, ouvrant des voies intellectuelles radicalement nouvelles. Cette position générationnelle invite à réinventer les modes d'échange et d'apprentissage. L'éclaireur du zodiaque dans le signe du mental promet des percées conceptuelles qui remodèlent la vision du monde. L'innovation atteint sa plénitude lorsque la brillance intellectuelle se met au service de la compréhension mutuelle.",
    Cancer:
      "Uranus en Cancer suggère une transformation profonde des structures familiales, des racines et du sentiment d'appartenance. Cette position générationnelle invite à redéfinir la notion de foyer et de sécurité émotionnelle. L'innovation se déploie dans les formes de vie communautaire et les liens transgénérationnels. La sagesse uranienne s'exprime lorsque la rupture avec le passé ouvre la porte à des formes d'attachement plus libres et conscientes.",
    Lion:
      "Uranus en Lion tend vers une révolution de l'expression créatrice et de l'identité personnelle. Cette position générationnelle invite à réinventer les formes d'art, de spectacle et d'affirmation de soi. L'énergie de l'éveilleur dans le signe du coeur promet des explosions de créativité qui bousculent les normes esthétiques. L'innovation s'accomplit pleinement lorsque l'originalité individuelle inspire le collectif plutôt que de le choquer.",
    Vierge:
      "Uranus en Vierge suggère une révolution dans les domaines de la santé, du travail et des méthodes quotidiennes. Cette position générationnelle invite à repenser fondamentalement l'efficacité, le service et le rapport au corps. L'innovation se déploie dans les technologies pratiques et les approches alternatives du bien-être. La sagesse s'exprime lorsque la réforme des systèmes quotidiens améliore concrètement la vie de chacun.",
    Balance:
      "Uranus en Balance tend vers une révolution des relations humaines, de la justice et de l'art du vivre-ensemble. Cette position générationnelle invite à redéfinir les codes du couple, de l'association et de l'harmonie sociale. L'innovation se manifeste dans de nouvelles formes de partenariat et d'engagement. La sagesse uranienne s'accomplit lorsque la liberté relationnelle s'enrichit d'une responsabilité envers l'équilibre collectif.",
    Scorpion:
      "Uranus en Scorpion invite à une révolution dans les profondeurs de la psyché, des tabous et des structures de pouvoir invisibles. Cette position générationnelle tend vers une transformation radicale du rapport à la mort, à la sexualité et aux ressources partagées. L'éveilleur dans le signe de la transformation promet des percées dans la compréhension des forces inconscientes. L'innovation s'accomplit lorsque la mise à nu des secrets libère plutôt qu'elle ne détruit.",
    Sagittaire:
      "Uranus en Sagittaire suggère une révolution dans les croyances, la philosophie et l'expansion de la conscience. Cette position générationnelle invite à repenser les systèmes éducatifs, religieux et culturels. L'innovation se déploie dans l'exploration de paradigmes inédits et de synthèses spirituelles audacieuses. La sagesse s'exprime lorsque la liberté de pensée ouvre des horizons sans refermer ceux qui précèdent.",
    Capricorne:
      "Uranus en Capricorne tend vers une révolution des structures institutionnelles, de l'autorité et des systèmes de gouvernance. Cette position générationnelle invite à reconstruire les fondations sociales sur des bases plus justes et innovantes. L'éveilleur dans le signe de la structure promet des bouleversements qui redéfinissent la notion même d'ordre. L'innovation atteint sa plénitude lorsque la déconstruction des vieilles formes se double d'une architecture nouvelle.",
    Verseau:
      "Uranus en Verseau, dans sa demeure, déploie sa pleine puissance d'innovation et de vision futuriste. Cette position générationnelle invite à incarner pleinement l'idéal d'une humanité libérée, connectée et inventive. L'énergie révolutionnaire se manifeste dans les technologies, les réseaux et les utopies concrètes. La sagesse s'accomplit lorsque la vision du futur s'enracine dans une compassion authentique pour le présent.",
    Poissons:
      "Uranus en Poissons suggère une révolution spirituelle et artistique qui dissout les frontières entre le rationnel et l'invisible. Cette position générationnelle invite à explorer des formes inédites de conscience, d'art et de compassion universelle. L'innovation se déploie dans la fusion du scientifique et du mystique. La sagesse uranienne s'exprime lorsque l'intuition visionnaire se met au service de la guérison collective.",
  },

  Neptune: {
    Belier:
      "Neptune en Bélier tend vers une dissolution des anciennes formes d'identité et l'émergence de nouvelles visions de l'individualité. Cette position générationnelle invite à rêver de nouveaux modes d'action, à imaginer un héroïsme fondé sur la compassion. Le voile neptunien dans le signe du guerrier promet une spiritualisation de l'instinct combatif. La sagesse se déploie lorsque le rêve de liberté individuelle s'inscrit dans une vision qui embrasse le tout.",
    Taureau:
      "Neptune en Taureau suggère une dissolution des repères matériels et l'émergence d'une nouvelle relation à la beauté et aux valeurs. Cette position générationnelle invite à transcender l'attachement au tangible pour découvrir une richesse plus subtile. L'imaginaire neptunien dans le signe de la terre promet une fusion entre art et nature d'une rare profondeur. La sagesse s'exprime lorsque la quête spirituelle s'incarne dans une esthétique du quotidien.",
    Gemeaux:
      "Neptune en Gémeaux tend vers une dissolution des certitudes intellectuelles et l'émergence de formes de communication inspirées. Cette position générationnelle invite à explorer les langages de l'âme au-delà du mental rationnel. Le rêve neptunien dans le signe de la parole promet une poétique de la pensée qui touche l'universel. La sagesse se révèle lorsque la confusion mentale se transforme en ouverture à des modes de connaissance intuitifs.",
    Cancer:
      "Neptune en Cancer suggère une idéalisation profonde de la famille, du foyer et des racines émotionnelles. Cette position générationnelle invite à transcender la nostalgie pour créer un sentiment d'appartenance universel. Le voile neptunien dans le signe de la mère promet une compassion maternelle qui embrasse l'humanité entière. La sagesse s'accomplit lorsque le rêve du paradis perdu se transforme en capacité à créer un refuge intérieur lumineux.",
    Lion:
      "Neptune en Lion tend vers une idéalisation de l'expression créatrice et du pouvoir de l'amour. Cette position générationnelle invite à rêver de nouvelles formes d'art et de rayonnement personnel. Le voile neptunien dans le signe du coeur promet une dissolution des frontières entre le créateur et sa création. La sagesse se révèle lorsque le glamour cède la place à une authenticité créatrice touchante et désarmante.",
    Vierge:
      "Neptune en Vierge, en détriment, suggère une tension entre l'idéal de perfection et l'acceptation de la réalité imparfaite. Cette position générationnelle invite à intégrer la dimension spirituelle dans le quotidien et le service. Le voile neptunien dans le signe de l'analyse promet une guérison qui passe par la réconciliation du rationnel et de l'intuitif. La sagesse s'accomplit lorsque le discernement pratique se nourrit de compassion mystique.",
    Balance:
      "Neptune en Balance tend vers une idéalisation des relations humaines et de l'harmonie sociale. Cette position générationnelle invite à rêver de formes de partenariat transcendantes et d'une justice empreinte de compassion. Le voile neptunien dans le signe de l'équilibre promet une vision de la beauté relationnelle qui dépasse le conventionnel. La sagesse se révèle lorsque l'idéal amoureux se nourrit de réalisme tendre et d'acceptation mutuelle.",
    Scorpion:
      "Neptune en Scorpion suggère une plongée collective dans les profondeurs de la psyché et la dissolution des tabous les plus enracinés. Cette position générationnelle invite à explorer l'occulte, la mort symbolique et les dimensions cachées de l'existence. Le voile neptunien dans le signe de la transformation promet des percées dans la compréhension de l'inconscient collectif. La sagesse s'accomplit lorsque la fascination pour l'obscur se transmue en lumière thérapeutique.",
    Sagittaire:
      "Neptune en Sagittaire tend vers une expansion de la conscience spirituelle et une quête de sens universelle. Cette position générationnelle invite à explorer de nouvelles synthèses entre les traditions et à rêver d'une humanité unie dans sa diversité. Le voile neptunien dans le signe de l'archer promet des visions qui transcendent les frontières culturelles. La sagesse se révèle lorsque l'idéalisme philosophique trouve son ancrage dans l'expérience vécue.",
    Capricorne:
      "Neptune en Capricorne suggère une dissolution progressive des structures rigides et l'émergence de nouvelles formes d'autorité empreintes de compassion. Cette position générationnelle invite à rêver d'institutions qui servent l'âme autant que la société. Le voile neptunien dans le signe de la structure promet une transformation subtile des systèmes de pouvoir. La sagesse s'accomplit lorsque la vision mystique infuse les fondations du monde concret.",
    Verseau:
      "Neptune en Verseau tend vers une idéalisation de la fraternité universelle et de l'innovation sociale inspirée. Cette position générationnelle invite à rêver d'une humanité connectée par la compassion autant que par la technologie. Le voile neptunien dans le signe du futur promet des visions utopiques d'une puissance mobilisatrice. La sagesse se révèle lorsque l'idéal collectif se nourrit d'une connexion authentique à la souffrance du monde.",
    Poissons:
      "Neptune en Poissons, dans sa demeure, déploie toute sa puissance mystique, artistique et dissolvante. Cette position générationnelle invite à une immersion totale dans l'océan de la conscience universelle. Le voile neptunien chez lui promet une renaissance spirituelle collective d'une profondeur inédite. La sagesse s'accomplit lorsque la dissolution des frontières du moi se conjugue avec un discernement qui protège l'intégrité de l'être.",
  },

  Pluton: {
    Belier:
      "Pluton en Bélier invite à une transformation radicale de l'identité individuelle et des formes du courage. Cette position générationnelle suggère une régénération de l'instinct vital, une mort et une renaissance de la notion même de volonté personnelle. La puissance plutonienne dans le signe du guerrier promet une refonte profonde de la relation au pouvoir individuel. La sagesse se déploie lorsque la destruction de l'ancien soi ouvre la voie à une authenticité plus brute et plus vraie.",
    Taureau:
      "Pluton en Taureau tend vers une transformation profonde des systèmes de valeur et des structures économiques. Cette position générationnelle invite à confronter l'ombre collective liée à la possession, à la matière et à la sécurité. La puissance plutonienne dans le signe de la terre promet un bouleversement des fondations matérielles de la civilisation. La sagesse s'accomplit lorsque la mort des anciennes richesses fait place à une prospérité régénérée.",
    Gemeaux:
      "Pluton en Gémeaux suggère une transformation radicale des modes de communication, de pensée et d'échange d'information. Cette position générationnelle invite à plonger dans les profondeurs du langage pour en extraire un pouvoir de vérité renouvelé. La puissance plutonienne dans le signe du mental promet une alchimie de la parole qui révèle ce qui était caché. La sagesse se révèle lorsque le pouvoir de l'information se met au service de la conscience collective.",
    Cancer:
      "Pluton en Cancer tend vers une transformation profonde des racines familiales et du sentiment d'appartenance. Cette position générationnelle invite à confronter l'ombre du clan, les secrets transgénérationnels et les schémas émotionnels hérités. La puissance plutonienne dans le signe de la mère promet une régénération de la notion même de foyer et de sécurité. La sagesse s'accomplit lorsque la mort des vieilles structures familiales donne naissance à des liens plus authentiques.",
    Lion:
      "Pluton en Lion suggère une transformation radicale de l'expression créatrice, de l'ego et des formes du pouvoir personnel. Cette position générationnelle invite à confronter l'ombre du narcissisme et à transmuter l'orgueil en rayonnement authentique. La puissance plutonienne dans le signe du coeur promet une renaissance de la joie de vivre après la traversée des ténèbres de l'ego. La sagesse se déploie lorsque la volonté de puissance se mue en puissance de la volonté créatrice.",
    Vierge:
      "Pluton en Vierge tend vers une transformation profonde des systèmes de santé, de travail et de service. Cette position générationnelle invite à confronter l'ombre du perfectionnisme et à régénérer le rapport au corps et au quotidien. La puissance plutonienne dans le signe de l'analyse promet une révolution dans la compréhension des mécanismes subtils de la guérison. La sagesse s'accomplit lorsque la critique impitoyable se mue en discernement transformateur.",
    Balance:
      "Pluton en Balance suggère une transformation radicale des relations humaines, de la justice et de l'art du compromis. Cette position générationnelle invite à confronter les jeux de pouvoir invisibles dans les partenariats et les structures sociales. La puissance plutonienne dans le signe de l'harmonie promet une régénération profonde de la notion d'engagement. La sagesse se révèle lorsque la destruction des illusions relationnelles ouvre la voie à des liens d'une authenticité transformatrice.",
    Scorpion:
      "Pluton en Scorpion, dans sa demeure, déploie toute sa puissance de transformation, de mort et de renaissance. Cette position générationnelle invite à plonger sans compromis dans les abysses de la psyché collective. La force plutonienne chez elle promet une confrontation avec les tabous les plus profonds de l'humanité. La sagesse s'accomplit lorsque la fascination pour la destruction se transmue en pouvoir de régénération collective.",
    Sagittaire:
      "Pluton en Sagittaire tend vers une transformation radicale des croyances, des religions et des systèmes philosophiques. Cette position générationnelle invite à confronter l'ombre du fanatisme et à régénérer la quête de sens. La puissance plutonienne dans le signe de l'archer promet une mort et une renaissance des grands récits collectifs. La sagesse se déploie lorsque la destruction des certitudes ouvre la voie à une foi plus authentique et inclusive.",
    Capricorne:
      "Pluton en Capricorne suggère une transformation profonde des structures de pouvoir, des institutions et des formes d'autorité. Cette position générationnelle invite à confronter l'ombre du système et à régénérer les fondations de la société. La puissance plutonienne dans le signe de la structure promet un effondrement et une reconstruction des piliers du monde organisé. La sagesse s'accomplit lorsque la destruction des formes obsolètes de pouvoir ouvre la voie à une gouvernance plus authentique.",
    Verseau:
      "Pluton en Verseau tend vers une transformation radicale de la technologie, des réseaux sociaux et de la notion même d'humanité. Cette position générationnelle invite à confronter l'ombre du collectif et à régénérer les liens entre l'individu et la communauté. La puissance plutonienne dans le signe du futur promet une révolution qui repense les fondements de la civilisation. La sagesse se révèle lorsque le pouvoir technologique se met au service de l'évolution de la conscience humaine.",
    Poissons:
      "Pluton en Poissons suggère une transformation mystique et spirituelle d'une profondeur océanique. Cette position générationnelle invite à confronter l'ombre de l'illusion collective et à régénérer la connexion entre l'humanité et le sacré. La puissance plutonienne dans le signe de l'infini promet une dissolution et une renaissance des formes de la spiritualité. La sagesse s'accomplit lorsque la mort des vieilles croyances ouvre la voie à une compassion universelle renouvelée.",
  },

  "Noeud Nord": {
    Belier:
      "Le Noeud Nord en Bélier invite à un voyage d'âme vers l'affirmation de soi et le courage d'initier. Venant d'un passé marqué par la dépendance relationnelle et le compromis excessif, cette position suggère d'apprendre à se tenir debout seul. La croissance passe par l'audace d'agir selon ses propres impulsions, même au risque de déplaire. L'accomplissement se révèle lorsque l'indépendance conquise nourrit des relations plus authentiques.",
    Taureau:
      "Le Noeud Nord en Taureau tend vers un apprentissage de la simplicité, de l'ancrage et de la valeur intrinsèque des choses. Venant d'un passé marqué par l'intensité et les crises, cette position invite à découvrir la paix dans la stabilité. La croissance passe par la capacité à apprécier ce qui est, à construire patiemment plutôt qu'à transformer compulsivement. L'accomplissement se déploie dans l'art de vivre pleinement au présent.",
    Gemeaux:
      "Le Noeud Nord en Gémeaux invite à un voyage vers la curiosité, l'écoute et la légèreté intellectuelle. Venant d'un passé marqué par les certitudes philosophiques, cette position suggère d'apprendre la valeur de la question plutôt que de la réponse. La croissance passe par la capacité à dialoguer sans prêcher, à explorer sans conclure. L'accomplissement se révèle dans la joie de l'échange qui enrichit toutes les parties.",
    Cancer:
      "Le Noeud Nord en Cancer tend vers un apprentissage de la vulnérabilité, du lien intime et de la nourriture émotionnelle. Venant d'un passé marqué par le contrôle et l'ambition, cette position invite à descendre de la montagne pour entrer dans le jardin du coeur. La croissance passe par la capacité à accueillir ses émotions sans les juger ni les gérer. L'accomplissement se déploie dans la création d'un foyer intérieur chaleureux.",
    Lion:
      "Le Noeud Nord en Lion invite à un voyage vers l'expression créatrice, la joie et la générosité du coeur. Venant d'un passé marqué par le détachement et la pensée collective, cette position suggère d'apprendre à briller par son unicité. La croissance passe par le courage de créer, de jouer et d'aimer avec une sincérité désarmante. L'accomplissement se révèle lorsque la lumière personnelle inspire sans exiger d'être suivie.",
    Vierge:
      "Le Noeud Nord en Vierge tend vers un apprentissage de l'humilité, du service concret et du discernement pratique. Venant d'un passé marqué par la fusion mystique et l'évasion, cette position invite à incarner la spiritualité dans le quotidien. La croissance passe par la capacité à être utile, à perfectionner et à prendre soin des détails. L'accomplissement se déploie dans la beauté du travail bien fait au service des autres.",
    Balance:
      "Le Noeud Nord en Balance invite à un voyage vers l'art de la relation, du compromis éclairé et de l'harmonie. Venant d'un passé marqué par l'individualisme impulsif, cette position suggère d'apprendre la danse du nous. La croissance passe par la capacité à écouter l'autre, à coopérer et à trouver la beauté dans l'accord. L'accomplissement se révèle lorsque la diplomatie devient une expression naturelle de la sagesse intérieure.",
    Scorpion:
      "Le Noeud Nord en Scorpion tend vers un apprentissage de la profondeur, de la transformation et du lâcher-prise émotionnel. Venant d'un passé marqué par l'attachement aux formes stables, cette position invite à embrasser le processus alchimique du changement. La croissance passe par la capacité à affronter ses peurs, à plonger dans l'inconnu et à renaître. L'accomplissement se déploie dans la puissance de la vulnérabilité assumée.",
    Sagittaire:
      "Le Noeud Nord en Sagittaire invite à un voyage vers la quête de sens, l'expansion de la vision et la confiance en la vie. Venant d'un passé marqué par la dispersion mentale, cette position suggère d'apprendre à viser plus haut et plus loin. La croissance passe par la capacité à synthétiser, à enseigner et à inspirer par sa propre quête de vérité. L'accomplissement se révèle dans la sagesse qui naît de l'aventure vécue.",
    Capricorne:
      "Le Noeud Nord en Capricorne tend vers un apprentissage de la maturité, de la responsabilité et de la construction patiente. Venant d'un passé marqué par la dépendance émotionnelle, cette position invite à gravir sa propre montagne avec discipline. La croissance passe par la capacité à structurer sa vie, à assumer son autorité et à contribuer au monde. L'accomplissement se déploie dans la maîtrise qui inspire par l'exemple.",
    Verseau:
      "Le Noeud Nord en Verseau invite à un voyage vers la conscience collective, l'innovation et la fraternité universelle. Venant d'un passé marqué par le besoin de reconnaissance personnelle, cette position suggère d'apprendre à briller pour le groupe. La croissance passe par la capacité à dépasser l'ego créateur pour servir une vision plus vaste. L'accomplissement se révèle dans la contribution originale au bien commun.",
    Poissons:
      "Le Noeud Nord en Poissons tend vers un apprentissage de la dissolution, de la compassion et de la connexion spirituelle. Venant d'un passé marqué par le contrôle analytique, cette position invite à lâcher prise dans les eaux de l'infini. La croissance passe par la capacité à faire confiance à l'invisible, à servir sans compter et à accueillir le mystère. L'accomplissement se déploie dans la paix qui naît de la reddition consciente à plus grand que soi.",
  },
};

// ─── PLANÈTE EN MAISON ───────────────────────────────────────────────

export const planetInHouse: Record<string, Record<number, string>> = {
  Soleil: {
    1: "Le Soleil en maison I invite à rayonner par sa seule présence, à incarner pleinement son identité dans le monde visible. Cette position suggère une personnalité solaire qui se définit par l'action, l'apparence et la manière dont elle se projette. L'identité est intimement liée au corps et à l'image que l'on offre aux autres. L'épanouissement se déploie lorsque l'authenticité de l'être transcende le souci de l'apparence.",
    2: "Le Soleil en maison II tend vers une identité qui se construit à travers les valeurs, les ressources et le rapport à la matière. Cette position invite à explorer la question fondamentale de ce qui a vraiment de la valeur dans la vie. Le sens de soi se nourrit de la capacité à créer, accumuler et partager la richesse sous toutes ses formes. L'épanouissement se révèle lorsque la sécurité matérielle reflète une estime de soi enracinée.",
    3: "Le Soleil en maison III invite à une identité qui s'exprime par la communication, l'apprentissage et les échanges proches. Cette position suggère un besoin vital de nommer, de comprendre et de transmettre. La personnalité se déploie dans le mouvement des idées, la relation aux frères et soeurs et l'environnement immédiat. L'épanouissement naît lorsque la parole devient un acte de lumière qui éclaire et connecte.",
    4: "Le Soleil en maison IV tend vers une identité profondément enracinée dans la famille, le foyer et la mémoire intime. Cette position invite à explorer les fondations psychiques héritées pour y trouver la source de son éclat personnel. La quête de soi passe par la réconciliation avec les origines et la création d'un espace intérieur lumineux. L'épanouissement se déploie lorsque les racines deviennent un tremplin plutôt qu'une ancre.",
    5: "Le Soleil en maison V déploie sa lumière dans le domaine de la création, du jeu et de l'amour. Cette position invite à placer l'expression joyeuse de soi au centre de la vie, à créer comme un artiste célèbre son art. L'identité se nourrit de la capacité à donner naissance à des oeuvres, des projets et des relations passionnées. L'épanouissement se révèle dans le courage de jouer sa vie comme un acte d'amour créateur.",
    6: "Le Soleil en maison VI tend vers une identité qui se réalise par le service quotidien, le soin du corps et l'utilité concrète. Cette position invite à trouver sa lumière dans l'humble perfection des tâches bien accomplies. Le sens de soi se construit dans la discipline, la santé et la capacité à améliorer le fonctionnement du monde. L'épanouissement naît lorsque le service devient une expression naturelle de la vitalité plutôt qu'un devoir.",
    7: "Le Soleil en maison VII invite à une identité qui se révèle et se complète dans le miroir de la relation. Cette position suggère que l'autre est un catalyseur essentiel de la conscience de soi. Le sens de la vie s'approfondit dans le partenariat, la collaboration et l'art de l'engagement. L'épanouissement se déploie lorsque la quête du partenaire idéal se transforme en capacité à être pleinement soi dans la relation.",
    8: "Le Soleil en maison VIII tend vers une identité qui se forge dans les crises, les transformations et le rapport aux profondeurs de l'existence. Cette position invite à trouver sa lumière dans l'exploration des mystères de la vie, de la mort et de la régénération. Le sens de soi se construit dans la capacité à traverser les épreuves et à renaître. L'épanouissement se révèle dans le pouvoir de transformer l'obscurité en or psychique.",
    9: "Le Soleil en maison IX invite à une identité qui se déploie dans la quête de sens, l'exploration et l'élargissement des horizons. Cette position suggère un besoin vital de voyager, d'enseigner et de comprendre le grand récit de l'existence. La personnalité rayonne dans la transmission de la sagesse acquise par l'expérience directe. L'épanouissement naît lorsque la vision philosophique se nourrit d'humilité et de curiosité permanente.",
    10: "Le Soleil en maison X tend vers une identité qui aspire à laisser une empreinte visible dans le monde, à assumer une mission publique. Cette position invite à incarner sa lumière au sommet de sa vocation, avec intégrité et autorité. Le sens de soi se construit dans la responsabilité sociale et la capacité à servir de modèle. L'épanouissement se déploie lorsque l'ambition devient l'expression naturelle d'un appel intérieur authentique.",
    11: "Le Soleil en maison XI invite à une identité qui se réalise au sein du groupe, des projets collectifs et des amitiés inspirantes. Cette position suggère un besoin de contribuer à une vision du futur et de trouver sa place dans le réseau social. La personnalité rayonne dans la capacité à fédérer, à innover et à partager ses idéaux. L'épanouissement naît lorsque la singularité individuelle enrichit la communauté plutôt que de s'y dissoudre.",
    12: "Le Soleil en maison XII tend vers une identité qui se découvre dans la solitude, le silence et la connexion avec l'invisible. Cette position invite à explorer les dimensions cachées de l'être, à trouver sa lumière dans le retrait conscient du monde. Le sens de soi se nourrit de la méditation, de la créativité solitaire et du service désintéressé. L'épanouissement se révèle dans la capacité à briller sans être vu, à illuminer de l'intérieur.",
  },

  Lune: {
    1: "La Lune en maison I suggère une sensibilité à fleur de peau qui colore toute la personnalité visible. Les émotions se lisent sur le visage, le corps réagit aux ambiances et le monde intérieur déborde constamment dans l'expression extérieure. Cette position invite à apprivoiser cette transparence émotionnelle comme un don de connexion authentique. La sécurité intérieure se renforce lorsque la vulnérabilité visible est accueillie avec bienveillance.",
    2: "La Lune en maison II tend vers un monde émotionnel intimement lié au sentiment de sécurité matérielle et aux possessions. Le confort affectif passe par la stabilité financière, les objets familiers et les plaisirs sensoriels. Cette position invite à explorer le lien profond entre valeur personnelle et bien-être émotionnel. La sérénité intérieure grandit lorsque la richesse du coeur ne dépend plus exclusivement de l'abondance extérieure.",
    3: "La Lune en maison III invite à un monde émotionnel qui s'exprime et se régule par la parole, l'écriture et les échanges quotidiens. Le bien-être se nourrit de conversations nourrissantes et d'un environnement intellectuellement stimulant. Cette position suggère un lien émotionnel fort avec les frères, soeurs et voisins. La sécurité intérieure se renforce lorsque les mots deviennent des alliés de l'intelligence du coeur.",
    4: "La Lune en maison IV, dans sa demeure naturelle, déploie toute sa puissance dans l'intimité du foyer et des racines familiales. Le monde émotionnel est profondément lié à la maison, à la mère et aux souvenirs d'enfance. Cette position invite à créer un sanctuaire intérieur qui nourrit l'âme en toutes circonstances. La sécurité émotionnelle s'approfondit lorsque le passé est honoré sans devenir une prison.",
    5: "La Lune en maison V tend vers un bien-être émotionnel qui se nourrit de créativité, de jeu et de plaisirs expressifs. Le monde intérieur s'illumine dans la relation aux enfants, les passions artistiques et les aventures amoureuses. Cette position invite à laisser l'enfant intérieur guider la vie émotionnelle avec joie et spontanéité. La sécurité affective se renforce dans la permission de créer et d'aimer sans calcul.",
    6: "La Lune en maison VI suggère un monde émotionnel qui trouve son équilibre dans la routine, le service et le soin du corps. Le bien-être est intimement lié aux habitudes quotidiennes et à la capacité à se sentir utile. Cette position invite à reconnaître que prendre soin des détails est une forme d'amour envers soi. La sérénité intérieure grandit lorsque les rituels quotidiens deviennent des ancres de présence et de tendresse.",
    7: "La Lune en maison VII tend vers un monde émotionnel qui respire au rythme des partenariats et des relations proches. Le bien-être intérieur se nourrit de la présence de l'autre, du sentiment d'être choisi et accompagné. Cette position invite à développer une sécurité émotionnelle qui enrichit la relation sans en dépendre. La plénitude se déploie lorsque l'art de l'écoute empathique nourrit un lien de réciprocité.",
    8: "La Lune en maison VIII suggère un monde émotionnel intense qui se nourrit des expériences de transformation et d'intimité profonde. Les besoins affectifs sont puissants, secrets et orientés vers la fusion émotionnelle. Cette position invite à apprivoiser les marées intérieures sans se laisser submerger par leur force. La sécurité émotionnelle se révèle dans la capacité à traverser les crises en y puisant une force régénératrice.",
    9: "La Lune en maison IX tend vers un monde émotionnel nourri par l'exploration, la quête de sens et les horizons lointains. Le bien-être se déploie dans le voyage, l'apprentissage philosophique et le contact avec d'autres cultures. Cette position invite à reconnaître le besoin d'espace et de sens comme une faim légitime de l'âme. La sécurité intérieure grandit lorsque la foi en quelque chose de plus grand apaise les inquiétudes du coeur.",
    10: "La Lune en maison X suggère un monde émotionnel profondément lié à la vocation, à la reconnaissance publique et au rôle social. Le bien-être se nourrit du sentiment d'accomplir sa mission dans le monde avec compétence et authenticité. Cette position invite à intégrer la sensibilité dans l'exercice de l'autorité. La sécurité émotionnelle se renforce lorsque la carrière reflète les valeurs profondes du coeur.",
    11: "La Lune en maison XI tend vers un monde émotionnel qui s'épanouit dans l'amitié, les groupes et les idéaux partagés. Le bien-être se nourrit du sentiment d'appartenance à une communauté de coeur et d'esprit. Cette position invite à tisser des liens fraternels qui nourrissent l'âme sans sacrifier l'authenticité émotionnelle. La sécurité intérieure grandit dans la confiance que le collectif peut être un refuge aussi doux que le foyer.",
    12: "La Lune en maison XII suggère un monde émotionnel vaste, perméable et connecté aux courants de l'inconscient collectif. Les besoins affectifs se nourrissent de solitude créatrice, de spiritualité et de moments de retrait réparateurs. Cette position invite à honorer la sensibilité mystique comme un trésor qui demande une protection consciente. La sécurité émotionnelle se révèle dans la capacité à accueillir les émotions sans nom qui traversent l'âme.",
  },

  Mercure: {
    1: "Mercure en maison I invite à une intelligence qui se manifeste directement dans la personnalité, la parole et l'image projetée. L'esprit est vif, curieux et constamment en mouvement, donnant une apparence jeune et communicative. Cette position suggère un besoin vital d'exprimer ses pensées et de se définir par ses idées. La communication devient un outil puissant de construction identitaire.",
    2: "Mercure en maison II tend vers une intelligence pratique orientée vers la gestion des ressources et l'évaluation de la valeur. L'esprit excelle dans les domaines financiers, commerciaux et dans tout ce qui demande de calculer le rapport entre investissement et rendement. Cette position invite à utiliser le mental au service de la prospérité. La sagesse s'approfondit lorsque l'intelligence financière se nourrit de valeurs profondes.",
    3: "Mercure en maison III, dans sa demeure naturelle, déploie toute sa vivacité communicative et sa curiosité intellectuelle. L'esprit brille dans l'échange quotidien, l'écriture, l'enseignement de proximité et les connections multiples. Cette position invite à cultiver cette agilité mentale comme un don précieux de mise en relation des idées et des êtres. La communication atteint son apogée lorsque la diversité des intérêts nourrit une pensée intégrative.",
    4: "Mercure en maison IV suggère une intelligence profondément connectée aux racines, à la mémoire familiale et au monde intérieur. L'esprit pense en termes d'héritage, de tradition et de fondations psychologiques. Cette position invite à explorer les conversations intimes avec soi-même et les histoires familiales comme sources de compréhension. La pensée s'enrichit lorsque les racines nourrissent une réflexion sur l'identité profonde.",
    5: "Mercure en maison V tend vers une intelligence créatrice et ludique qui trouve sa joie dans l'expression artistique et le jeu des idées. L'esprit brille dans la narration, le théâtre et toute forme de communication qui divertit et inspire. Cette position invite à laisser la pensée devenir un terrain de jeu où l'inventivité se déploie librement. La communication s'illumine lorsque la créativité mentale touche le coeur des autres.",
    6: "Mercure en maison VI invite à une intelligence analytique et pratique qui excelle dans l'organisation, la méthode et la résolution de problèmes concrets. L'esprit trouve son utilité dans le service, la santé et l'optimisation des processus quotidiens. Cette position suggère un talent naturel pour la technique, l'artisanat et la communication au travail. La pensée gagne en puissance lorsque la rigueur se met au service du bien-être collectif.",
    7: "Mercure en maison VII tend vers une intelligence qui s'épanouit dans le dialogue, la négociation et la compréhension de l'autre. L'esprit cherche naturellement le point de vue complémentaire et excelle dans la médiation. Cette position invite à cultiver l'art de la communication relationnelle comme une forme d'intelligence supérieure. La pensée s'enrichit lorsque l'échange avec l'autre devient un miroir de sa propre compréhension.",
    8: "Mercure en maison VIII suggère une intelligence pénétrante qui creuse sous les apparences pour atteindre la vérité cachée. L'esprit est attiré par les mystères, la psychologie profonde et les enquêtes qui révèlent ce que d'autres préfèrent ignorer. Cette position invite à utiliser ce don d'investigation au service de la compréhension et de la guérison. La pensée gagne en puissance lorsque la profondeur analytique se conjugue avec la compassion.",
    9: "Mercure en maison IX invite à une intelligence qui se déploie dans les grands espaces de la philosophie, du voyage et de la quête de sens. L'esprit est orienté vers la synthèse, l'enseignement et la transmission de visions inspirantes. Cette position suggère un don naturel pour les langues, les cultures et les systèmes de pensée étrangers. La communication atteint sa plénitude lorsque la profondeur de la réflexion enrichit l'étendue de la vision.",
    10: "Mercure en maison X tend vers une intelligence stratégique au service de la vocation et de la place dans le monde. L'esprit excelle dans la communication professionnelle, la planification de carrière et la capacité à transmettre une expertise. Cette position invite à faire de l'intelligence un instrument de contribution visible à la société. La pensée s'accomplit lorsque la compétence mentale se met au service d'une mission qui dépasse l'intérêt personnel.",
    11: "Mercure en maison XI suggère une intelligence connectée aux réseaux, aux idéaux et aux projets collectifs. L'esprit brille dans l'innovation, la communication de groupe et la capacité à fédérer autour d'idées avant-gardistes. Cette position invite à cultiver la pensée collaborative comme un levier de transformation sociale. La communication gagne en impact lorsque l'originalité intellectuelle se met au service de la communauté.",
    12: "Mercure en maison XII invite à une intelligence intuitive et méditative qui perçoit les réalités subtiles au-delà des mots. L'esprit pense en images, en symboles et en rêves, avec une capacité rare à capter les courants de l'inconscient. Cette position suggère un talent pour l'écriture inspirée, la poésie et la communication avec les dimensions invisibles. La pensée s'illumine lorsque le silence intérieur devient la source de la compréhension la plus profonde.",
  },

  Venus: {
    1: "Vénus en maison I invite à incarner la beauté, le charme et l'harmonie dans sa propre personne. Cette position tend vers une grâce naturelle qui attire les regards et les sympathies, une présence qui apaise et embellit l'espace. L'amour de soi s'exprime dans le soin de l'apparence et le plaisir d'être un vecteur de beauté. L'épanouissement se déploie lorsque le charme extérieur reflète une paix intérieure authentique.",
    2: "Vénus en maison II tend vers un amour profond pour les belles choses, le confort et la prospérité sensorielle. L'attraction se vit à travers les valeurs partagées et la capacité à créer un environnement de beauté et d'abondance. Cette position invite à cultiver un rapport sain à la richesse comme expression de l'estime de soi. L'harmonie financière se déploie lorsque la générosité s'équilibre avec le respect de ses propres besoins.",
    3: "Vénus en maison III invite à une communication empreinte de grâce, de diplomatie et de charme intellectuel. L'amour s'exprime par les mots, les lettres et les échanges quotidiens teintés de tendresse. Cette position suggère des relations harmonieuses avec les proches et un talent pour les arts de la parole. L'épanouissement se déploie lorsque la beauté du langage crée des ponts d'affection entre les êtres.",
    4: "Vénus en maison IV tend vers un amour profond du foyer, de la famille et de l'harmonie domestique. Le bien-être affectif se nourrit d'un intérieur beau et chaleureux, d'un cocon familial empreint de douceur. Cette position invite à créer un sanctuaire de beauté et de paix comme fondation de toute la vie relationnelle. L'amour s'approfondit lorsque les racines émotionnelles sont cultivées avec tendresse.",
    5: "Vénus en maison V déploie tout son pouvoir d'attraction dans le domaine de la création, du plaisir et de l'amour romantique. Le coeur s'épanouit dans la passion amoureuse, les arts et la joie de vivre partagée. Cette position invite à célébrer l'amour comme une oeuvre d'art vivante, généreuse et ludique. L'harmonie se révèle lorsque la créativité du coeur se donne sans calcul ni retenue.",
    6: "Vénus en maison VI invite à trouver la beauté et l'harmonie dans le quotidien, le travail et le soin du corps. L'amour s'exprime par les gestes attentifs, les rituels de bien-être et le service dévoué. Cette position tend vers des relations professionnelles harmonieuses et un souci esthétique dans le travail. L'épanouissement se déploie lorsque la grâce habite les tâches les plus simples du quotidien.",
    7: "Vénus en maison VII, dans sa demeure naturelle, déploie tout son art de la relation, du partenariat et de l'engagement. L'amour est central dans la vie et se vit à travers des liens profonds, équilibrés et esthétiquement satisfaisants. Cette position invite à cultiver l'harmonie relationnelle comme une oeuvre de toute une vie. L'épanouissement se révèle dans la capacité à aimer l'autre tout en restant fidèle à soi-même.",
    8: "Vénus en maison VIII tend vers un amour intense, transformateur et profondément intime. L'attraction se vit dans les eaux profondes de la passion, de la fusion émotionnelle et du partage total. Cette position invite à explorer les dimensions les plus mystérieuses de l'amour sans se perdre dans l'obsession. L'harmonie affective se révèle lorsque l'intensité du lien nourrit la croissance mutuelle plutôt que la dépendance.",
    9: "Vénus en maison IX invite à un amour expansif, aventurier et nourri par le partage de visions et d'horizons. L'attraction naît de la stimulation intellectuelle, culturelle et spirituelle. Cette position tend vers des relations qui élargissent la perspective et enrichissent la compréhension du monde. L'harmonie se déploie lorsque la liberté de l'exploration se conjugue avec la fidélité du coeur.",
    10: "Vénus en maison X tend vers une expression de l'amour et de la beauté à travers la vocation et la position sociale. Le charme naturel contribue au succès professionnel et les relations publiques sont empreintes de grâce. Cette position invite à incarner l'harmonie dans son rôle social et sa mission de vie. L'épanouissement se révèle lorsque la carrière reflète les valeurs profondes du coeur.",
    11: "Vénus en maison XI invite à un amour fraternel, idéaliste et orienté vers la communauté et les amitiés de coeur. L'harmonie se déploie dans les groupes, les associations et les projets collectifs animés par des valeurs partagées. Cette position tend vers des amitiés durables et des engagements sociaux empreints de beauté. L'épanouissement se révèle dans la capacité à aimer l'humanité tout en chérissant les individus.",
    12: "Vénus en maison XII tend vers un amour mystique, compassionnel et parfois secret, qui se vit dans les coulisses de l'âme. L'harmonie se nourrit de solitude créatrice, de beauté spirituelle et d'une connexion avec l'universel. Cette position invite à explorer les dimensions transcendantes de l'amour sans se perdre dans le sacrifice. L'épanouissement se déploie lorsque la dévotion intérieure rayonne silencieusement dans le monde.",
  },

  Mars: {
    1: "Mars en maison I invite à une énergie d'action directe, physique et combative qui marque la personnalité de manière indélébile. La volonté s'exprime avec franchise et dynamisme, donnant une présence assertive et magnétique. Cette position suggère un besoin vital de mouvement, de compétition et d'affirmation de soi. La puissance se déploie pleinement lorsque l'énergie brute se canalise dans des initiatives constructives.",
    2: "Mars en maison II tend vers une énergie mobilisée pour acquérir, défendre et accroître les ressources personnelles. La volonté s'investit dans la conquête matérielle et la protection de ce qui a de la valeur. Cette position invite à transformer l'agressivité financière en entrepreneuriat courageux. La force s'exprime pleinement lorsque l'action matérielle est guidée par des valeurs profondes.",
    3: "Mars en maison III invite à une communication directe, parfois tranchante, qui ne mâche pas ses mots. L'énergie se déploie dans le débat, la polémique constructive et la défense de ses idées avec passion. Cette position suggère un esprit combatif dans les échanges quotidiens et les apprentissages. La puissance de la parole s'accomplit lorsque la franchise se teinte de respect et de précision.",
    4: "Mars en maison IV tend vers une énergie profondément liée aux fondations familiales et au foyer intérieur. La volonté se mobilise pour construire, rénover et défendre l'espace domestique et les racines. Cette position invite à transformer les tensions familiales en force de construction d'un foyer vibrant. L'énergie s'accomplit lorsque la colère ancestrale se transmue en pouvoir de bâtir un nouveau nid.",
    5: "Mars en maison V déploie son énergie dans la création, le jeu, la compétition sportive et la passion amoureuse. La volonté s'exprime avec flamme dans tout ce qui touche au plaisir, à l'expression de soi et aux enfants. Cette position invite à canaliser l'ardeur créatrice dans des oeuvres qui inspirent. La puissance s'accomplit lorsque la passion de vivre se transforme en générosité du coeur.",
    6: "Mars en maison VI tend vers une énergie de travail intense, méthodique et orientée vers l'efficacité quotidienne. La volonté se mobilise dans le service, la résolution de problèmes concrets et le souci de la santé. Cette position invite à canaliser la combativité dans l'amélioration continue des systèmes et du bien-être. La force s'exprime pleinement lorsque l'énergie au travail est soutenue par un soin attentif du corps.",
    7: "Mars en maison VII invite à une énergie d'action qui se déploie principalement dans les relations et les partenariats. La volonté cherche l'autre comme un partenaire de combat, un miroir de sa propre force. Cette position tend vers des relations passionnées et parfois conflictuelles qui sont autant de terrains de croissance. La puissance relationnelle s'accomplit lorsque la confrontation devient une danse de croissance mutuelle.",
    8: "Mars en maison VIII déploie une énergie transformatrice d'une intensité magnétique, plongeant dans les profondeurs de l'existence. La volonté se mobilise dans les crises, les situations de pouvoir et les territoires tabous. Cette position invite à utiliser cette puissance régénératrice pour traverser les épreuves et en ressortir plus fort. La force s'accomplit lorsque l'instinct de survie se transmute en capacité à renaître.",
    9: "Mars en maison IX tend vers une énergie d'exploration, de conquête intellectuelle et de défense des convictions. La volonté se déploie dans le voyage, l'enseignement passionné et le combat pour ses croyances. Cette position invite à canaliser l'ardeur philosophique dans des quêtes qui élèvent la conscience. La puissance s'accomplit lorsque le zèle missionnaire se teinte de tolérance et d'ouverture.",
    10: "Mars en maison X invite à une énergie ambitieuse et déterminée qui vise les sommets de la réussite professionnelle. La volonté se mobilise pour conquérir une position de pouvoir et laisser une marque dans le monde. Cette position tend vers un leadership fort, dynamique et parfois controversé. La force s'accomplit lorsque l'ambition se met au service d'une mission qui dépasse l'ego.",
    11: "Mars en maison XI déploie son énergie dans les projets collectifs, les combats sociaux et la défense d'idéaux. La volonté se mobilise pour changer le monde, fédérer des groupes et porter des causes qui dépassent l'individu. Cette position invite à canaliser la combativité dans des actions de solidarité et d'innovation. La puissance s'accomplit lorsque l'énergie révolutionnaire construit autant qu'elle bouscule.",
    12: "Mars en maison XII tend vers une énergie d'action intérieure, parfois souterraine, qui oeuvre dans l'invisible. La volonté se manifeste dans la solitude, le travail secret et la lutte contre les ennemis intérieurs. Cette position invite à transformer la frustration d'une énergie qui ne trouve pas son exutoire en force spirituelle. La puissance se révèle lorsque l'action invisible au service des autres devient la forme la plus haute du courage.",
  },

  Jupiter: {
    1: "Jupiter en maison I invite à une personnalité expansive, optimiste et naturellement chanceuse. La présence physique est généreuse, le sourire large et l'allure confiante inspire la confiance. Cette position tend vers une vie marquée par les opportunités qui se présentent grâce à l'enthousiasme rayonnant. L'abondance se déploie lorsque la confiance en soi se nourrit de gratitude plutôt que d'excès.",
    2: "Jupiter en maison II tend vers une expansion naturelle des ressources et un sens inné de la prospérité. La fortune sourit dans les domaines financiers, avec un talent pour attirer l'abondance et la faire fructifier. Cette position invite à cultiver la générosité matérielle comme une expression de la foi en l'abondance universelle. La richesse s'accomplit lorsque les valeurs profondes guident les choix financiers.",
    3: "Jupiter en maison III invite à une intelligence expansive, un talent naturel pour la communication inspirante et les échanges enrichissants. L'esprit est ouvert, curieux et capable de transformer chaque conversation en une aventure intellectuelle. Cette position suggère des relations avec les proches marquées par la joie et la stimulation mutuelle. La sagesse se déploie lorsque la facilité de parole se met au service de la transmission.",
    4: "Jupiter en maison IV tend vers un foyer marqué par la générosité, la chaleur et l'abondance émotionnelle. Les racines familiales offrent une base solide et expansive, un sentiment de sécurité qui nourrit toute la vie. Cette position invite à créer un espace domestique qui soit un lieu de joie, de culture et d'ouverture. L'épanouissement se déploie lorsque la fortune du coeur rayonne dans toute la structure de vie.",
    5: "Jupiter en maison V déploie une expansion joyeuse dans la création, le jeu et les plaisirs de la vie. La chance accompagne les entreprises créatives, les amours et la relation avec les enfants. Cette position invite à embrasser la vie comme un festin généreux où la joie est un devoir sacré. L'abondance se révèle dans la capacité à donner sans compter et à jouer sans retenue.",
    6: "Jupiter en maison VI invite à une expansion par le service quotidien et une approche optimiste de la santé et du travail. La chance favorise les projets pratiques et la capacité à améliorer les systèmes avec générosité. Cette position tend vers un travail épanouissant et des habitudes de vie bénéfiques. L'abondance se déploie lorsque l'utilité quotidienne est vécue comme une source de joie et de croissance.",
    7: "Jupiter en maison VII tend vers des partenariats expansifs, enrichissants et porteurs de croissance mutuelle. La chance accompagne les associations, les mariages et toute forme de collaboration. Cette position invite à voir dans l'autre un catalyseur d'expansion et de sagesse. L'abondance relationnelle se révèle lorsque la générosité du coeur s'accompagne de discernement dans le choix des alliances.",
    8: "Jupiter en maison VIII invite à une expansion par la transformation, les crises traversées et la gestion des ressources partagées. La chance accompagne les héritages, les investissements et les moments de renaissance psychique. Cette position suggère une capacité naturelle à transmuter les épreuves en sagesse. L'abondance se déploie dans les profondeurs, lorsque le courage de plonger est récompensé par des trésors cachés.",
    9: "Jupiter en maison IX, dans sa demeure naturelle, déploie toute sa puissance d'expansion philosophique et exploratoire. La chance accompagne les voyages, les études supérieures et la quête de sens. Cette position invite à embrasser la vie comme un vaste territoire d'apprentissage et de transmission. L'abondance se révèle dans la sagesse acquise par l'expérience directe des cultures et des systèmes de pensée.",
    10: "Jupiter en maison X tend vers une expansion professionnelle remarquable et une reconnaissance publique naturelle. La chance accompagne la carrière, les positions d'autorité et la capacité à inspirer par l'exemple. Cette position invite à assumer un rôle de guide ou de protecteur dans la sphère sociale. L'abondance se déploie lorsque le succès extérieur reflète une intégrité et une générosité authentiques.",
    11: "Jupiter en maison XI invite à une expansion par les amitiés, les réseaux et les projets collectifs porteurs de sens. La chance accompagne les engagements sociaux, les associations et les visions du futur. Cette position tend vers une capacité naturelle à fédérer et à inspirer des communautés. L'abondance se révèle dans la richesse des liens fraternels et la joie de contribuer au bien commun.",
    12: "Jupiter en maison XII tend vers une expansion intérieure, spirituelle et compassionnelle d'une grande profondeur. La chance accompagne les retraites, les oeuvres de charité et les quêtes mystiques. Cette position invite à découvrir l'abondance dans le silence, la méditation et le service désintéressé. La sagesse se déploie lorsque la grâce opère dans l'invisible et nourrit l'âme en secret.",
  },

  Saturne: {
    1: "Saturne en maison I invite à une personnalité qui porte le poids de la responsabilité et de la maturité dès le plus jeune âge. La présence est grave, structurée et parfois intimidante, reflétant une profondeur intérieure remarquable. Cette position suggère un parcours où la confiance en soi se construit lentement mais solidement. La sagesse s'accomplit lorsque la rigueur extérieure s'adoucit avec l'âge et l'expérience.",
    2: "Saturne en maison II tend vers un rapport exigeant avec la matière, les finances et la valeur personnelle. Les leçons autour de l'argent et de la sécurité matérielle se présentent tôt et demandent de la discipline. Cette position invite à bâtir une prospérité durable fondée sur l'effort patient et la frugalité sage. La richesse se révèle lorsque la peur du manque se transforme en art de la gestion responsable.",
    3: "Saturne en maison III invite à un rapport sérieux et structuré avec la communication, l'apprentissage et l'entourage proche. L'esprit est méthodique, parfois inhibé dans l'expression, mais capable d'une profondeur remarquable. Cette position suggère des leçons importantes autour de la relation aux frères et soeurs et à l'environnement immédiat. La parole gagne en autorité lorsque la prudence se transforme en maîtrise du verbe.",
    4: "Saturne en maison IV tend vers des fondations familiales marquées par la rigueur, la discipline ou certaines privations émotionnelles. Les racines portent le poids d'un héritage qui demande d'être consciemment transformé. Cette position invite à construire son propre foyer avec patience et intention, en guérissant les blessures transgénérationnelles. La sagesse se déploie lorsque le poids du passé devient la pierre angulaire d'une nouvelle fondation.",
    5: "Saturne en maison V invite à un rapport exigeant avec la créativité, le plaisir et l'expression de soi. La joie de vivre se construit lentement, à travers une discipline créatrice qui mûrit avec le temps. Cette position suggère des leçons autour de la paternité, de l'amour et de la capacité à jouer librement. L'épanouissement créatif s'accomplit lorsque la peur du jugement cède la place à l'expression authentique.",
    6: "Saturne en maison VI tend vers une discipline quotidienne rigoureuse et un sens profond du devoir dans le travail et la santé. Les routines sont structurées, parfois pesantes, mais construisent une compétence remarquable. Cette position invite à trouver la signification profonde du service sans s'y consumer. La maîtrise professionnelle se révèle lorsque l'exigence se teinte de compassion envers soi-même.",
    7: "Saturne en maison VII invite à des leçons profondes dans le domaine des relations et des engagements. Les partenariats se construisent lentement, demandent de la maturité et portent souvent une dimension karmique. Cette position suggère que les relations les plus significatives arrivent avec le temps et la patience. La sagesse relationnelle s'accomplit lorsque la peur de l'engagement se transforme en capacité à bâtir des liens durables.",
    8: "Saturne en maison VIII tend vers une confrontation structurée avec les thèmes de la transformation, de la mort symbolique et du pouvoir. Les crises sont traversées avec discipline et endurance, chaque épreuve renforçant la structure intérieure. Cette position invite à apprivoiser les peurs profondes avec méthode et courage. La maîtrise se révèle dans la capacité à gérer les ressources partagées et les transitions majeures avec sagesse.",
    9: "Saturne en maison IX invite à une quête de sens rigoureuse et une approche structurée de la philosophie et de l'éducation supérieure. Les croyances se construisent lentement, testées par l'expérience et la réflexion critique. Cette position suggère un rapport sérieux avec les voyages, l'enseignement et les systèmes de pensée. La sagesse s'accomplit lorsque les convictions éprouvées deviennent un phare pour les autres.",
    10: "Saturne en maison X, dans sa demeure naturelle, déploie sa pleine puissance dans le domaine de la carrière et de la vocation. L'ambition est patiente, structurée et orientée vers des accomplissements durables. Cette position tend vers un succès qui vient avec le temps, la persévérance et l'intégrité. La maîtrise s'accomplit lorsque l'autorité naturelle se met au service d'une mission qui transcende l'ego.",
    11: "Saturne en maison XI tend vers un rapport structuré et exigeant avec les amitiés, les groupes et les idéaux collectifs. Les liens se tissent lentement mais sont remarquablement durables, portés par des valeurs partagées. Cette position invite à prendre au sérieux le rôle que l'on joue dans la communauté. La sagesse sociale s'accomplit lorsque la prudence relationnelle se transforme en engagement loyal envers des causes qui comptent.",
    12: "Saturne en maison XII invite à une confrontation structurée avec l'inconscient, les peurs cachées et les dimensions invisibles de l'existence. Les épreuves se vivent dans la solitude et le silence, forgeant une résistance intérieure remarquable. Cette position suggère un travail profond d'intégration de l'ombre qui porte ses fruits avec le temps. La sagesse se révèle lorsque les limites acceptées deviennent des portes d'accès au monde intérieur.",
  },

  Uranus: {
    1: "Uranus en maison I invite à une personnalité atypique, électrique et résolument originale. L'apparence et le comportement portent la marque de l'inattendu, de la rébellion créatrice et du besoin de liberté absolue. Cette position tend vers une vie jalonnée de changements brusques et de réinventions identitaires. L'authenticité se déploie lorsque l'originalité devient un choix conscient plutôt qu'une réaction.",
    2: "Uranus en maison II tend vers un rapport inhabituel et changeant avec les finances et les valeurs matérielles. Les revenus connaissent des fluctuations imprévisibles mais aussi des opportunités inattendues. Cette position invite à développer une relation innovante avec la notion de richesse et de sécurité. La liberté financière se construit lorsque la créativité remplace la conventionalité dans la gestion des ressources.",
    3: "Uranus en maison III invite à une communication originale, parfois provocante, qui bouscule les idées reçues. L'esprit fonctionne par éclairs d'intuition et fait des connections que d'autres ne voient pas. Cette position tend vers des relations avec l'entourage marquées par l'imprévisibilité et la stimulation intellectuelle. La pensée s'accomplit lorsque l'originalité du propos trouve un langage accessible à tous.",
    4: "Uranus en maison IV tend vers un foyer et des racines familiales marqués par l'inattendu, les ruptures et la non-conformité. Le rapport à la maison est atypique, avec un besoin de liberté qui peut se manifester par des déménagements fréquents. Cette position invite à créer un espace de vie qui reflète la singularité de l'être. La sécurité intérieure se renforce lorsque l'instabilité est accueillie comme un chemin vers l'authenticité.",
    5: "Uranus en maison V invite à une créativité radicalement originale et des amours non conventionnelles. L'expression de soi se fait par des voies inattendues et les plaisirs cherchent la stimulation de la nouveauté. Cette position tend vers des relations amoureuses libres et des formes d'art avant-gardistes. La joie de vivre s'accomplit lorsque l'originalité créatrice touche l'universel.",
    6: "Uranus en maison VI tend vers une approche innovante du travail, de la santé et de la routine quotidienne. Les méthodes de travail sont atypiques et le besoin de liberté dans l'organisation du quotidien est fondamental. Cette position invite à révolutionner les habitudes et à explorer des approches alternatives du bien-être. L'efficacité se déploie lorsque l'innovation pratique améliore concrètement la vie quotidienne.",
    7: "Uranus en maison VII invite à des relations et des partenariats marqués par la liberté, l'originalité et parfois l'imprévisibilité. L'engagement se redéfinit en dehors des codes conventionnels, cherchant une forme d'union qui respecte l'indépendance de chacun. Cette position tend vers des rencontres coup de foudre et des formes de couple atypiques. L'harmonie relationnelle se révèle lorsque la liberté partagée renforce le lien plutôt que de le diluer.",
    8: "Uranus en maison VIII tend vers des transformations soudaines et des révélations fulgurantes dans les domaines de l'intimité et du pouvoir. Les crises sont des tournants brusques qui accélèrent l'évolution intérieure. Cette position invite à embrasser les changements radicaux comme des catalyseurs d'éveil. La puissance se révèle dans la capacité à accueillir l'inattendu des profondeurs avec curiosité plutôt qu'avec crainte.",
    9: "Uranus en maison IX invite à une philosophie de vie non conventionnelle et des explorations intellectuelles avant-gardistes. Les croyances se forment par éclairs d'intuition et le rapport à l'étranger est marqué par l'inattendu. Cette position tend vers un enseignement original et des voyages qui bouleversent la vision du monde. La sagesse s'accomplit lorsque la pensée révolutionnaire se met au service de l'élévation collective.",
    10: "Uranus en maison X tend vers une carrière atypique, jalonnée de changements brusques et d'innovations qui marquent le paysage professionnel. Le destin social est imprévisible mais potentiellement révolutionnaire. Cette position invite à assumer sa singularité dans le monde professionnel sans craindre de bousculer l'ordre établi. L'accomplissement se déploie lorsque l'originalité professionnelle contribue au progrès collectif.",
    11: "Uranus en maison XI, dans sa demeure naturelle, déploie sa puissance d'innovation et de vision futuriste dans le domaine des amitiés et des idéaux. Les relations sont électriques, stimulantes et orientées vers des projets qui changent le monde. Cette position invite à être un catalyseur de changement au sein des groupes et des communautés. L'accomplissement se révèle dans la capacité à fédérer des esprits libres autour d'une vision commune.",
    12: "Uranus en maison XII tend vers des révélations soudaines provenant de l'inconscient et des dimensions cachées de l'existence. L'intuition fonctionne par éclairs qui percent le voile de la réalité ordinaire. Cette position invite à explorer les frontières de la conscience avec audace et discernement. La libération intérieure se déploie lorsque les prisons invisibles de l'inconscient sont traversées par la lumière de l'éveil.",
  },

  Neptune: {
    1: "Neptune en maison I invite à une personnalité perméable, insaisissable et porteuse d'une aura mystérieuse. L'apparence reflète les rêves, les humeurs et les courants invisibles de l'environnement. Cette position tend vers un charme magnétique et une sensibilité artistique qui se manifestent dans l'être même. L'identité s'accomplit lorsque la fluidité devient une force créatrice plutôt qu'une source de confusion.",
    2: "Neptune en maison II tend vers un rapport flou et idéaliste avec les finances et les valeurs matérielles. Les ressources fluctuent au gré de l'inspiration et de la générosité, parfois excessive. Cette position invite à développer un rapport spirituel avec l'abondance sans perdre le sens pratique. La richesse se révèle lorsque la créativité et l'intuition guident les choix financiers avec discernement.",
    3: "Neptune en maison III invite à une communication poétique, intuitive et parfois nébuleuse. L'esprit pense en images et en métaphores, avec une capacité rare à capter l'atmosphère émotionnelle des échanges. Cette position suggère un don pour l'écriture inspirée et les arts de la parole. La communication s'accomplit lorsque la clarté s'allie à la beauté du langage imaginaire.",
    4: "Neptune en maison IV tend vers un foyer baigné d'une atmosphère rêveuse, parfois confuse mais profondément nourricière pour l'âme. Les racines familiales portent des secrets, des idéaux et une dimension mystique. Cette position invite à distinguer les illusions familiales de la richesse spirituelle héritée. La paix intérieure se déploie lorsque le sanctuaire intérieur est nettoyé des brumes de l'idéalisation.",
    5: "Neptune en maison V invite à une créativité profondément inspirée, un amour romantique idéaliste et une connexion magique avec les enfants. L'expression de soi puise dans des sources invisibles d'inspiration et de beauté. Cette position tend vers des amours de rêve et des créations qui touchent l'âme collective. L'art s'accomplit lorsque l'imagination se met au service d'une vision qui transcende le personnel.",
    6: "Neptune en maison VI tend vers un rapport sensible et parfois flou avec la santé, le travail et les routines quotidiennes. Le corps est un récepteur subtil qui manifeste les déséquilibres émotionnels et environnementaux. Cette position invite à intégrer des pratiques de soin holistiques et à trouver un travail qui nourrit l'âme. L'équilibre se déploie lorsque le service devient une expression de la compassion plutôt qu'un sacrifice.",
    7: "Neptune en maison VII invite à des relations empreintes d'idéalisme, de romantisme et parfois d'illusion. Le partenaire est idéalisé ou perçu à travers un voile qui embellit et déforme. Cette position tend vers des liens d'une profondeur spirituelle remarquable lorsque la lucidité accompagne l'amour. L'harmonie relationnelle se révèle lorsque la compassion pour l'autre s'accompagne d'un discernement bienveillant.",
    8: "Neptune en maison VIII tend vers une dissolution des frontières entre soi et l'autre dans le domaine de l'intimité et de la transformation. Les expériences de mort et de renaissance se vivent comme des voyages mystiques. Cette position invite à explorer les profondeurs de la psyché avec une sensibilité artistique et spirituelle. La puissance se déploie lorsque la perméabilité aux forces inconscientes est accompagnée de conscience.",
    9: "Neptune en maison IX invite à une quête spirituelle profonde et une connexion intuitive avec les sagesses universelles. Les voyages, physiques ou intérieurs, ont une dimension mystique et transformatrice. Cette position tend vers une philosophie de vie empreinte de compassion et d'idéalisme universel. La sagesse s'accomplit lorsque l'aspiration à l'infini s'ancre dans une éthique concrète et pratique.",
    10: "Neptune en maison X tend vers une vocation marquée par l'inspiration, la créativité et parfois l'incertitude. Le destin professionnel se déploie dans des domaines artistiques, humanitaires ou spirituels. Cette position invite à mettre sa sensibilité au service d'une mission qui dépasse l'ambition personnelle. L'accomplissement se révèle lorsque la vocation devient un canal pour la beauté et la compassion dans le monde.",
    11: "Neptune en maison XI invite à des amitiés et des idéaux empreints de compassion, d'idéalisme et de rêves partagés. Les groupes et les communautés attirent par leur dimension spirituelle et artistique. Cette position tend vers un engagement social nourri par la vision d'un monde plus beau et plus juste. La sagesse se déploie lorsque l'utopie collective se nourrit de discernement et d'action concrète.",
    12: "Neptune en maison XII, dans sa demeure naturelle, déploie toute sa puissance mystique dans l'océan de l'inconscient. La connexion avec le numineux est directe, profonde et parfois accablante par son intensité. Cette position invite à cultiver des pratiques spirituelles et artistiques qui canalisent cette immense ouverture intérieure. La sagesse s'accomplit lorsque la dissolution dans l'infini se conjugue avec la capacité à revenir dans le monde avec grâce.",
  },

  Pluton: {
    1: "Pluton en maison I invite à une personnalité intense, magnétique et porteuse d'une puissance de transformation qui se lit dans le regard. La présence est pénétrante, parfois intimidante, et porte la marque de multiples renaissances. Cette position suggère une vie où l'identité se reconstruit plusieurs fois à travers des crises profondes. Le pouvoir s'accomplit lorsque l'intensité personnelle se met au service de la vérité.",
    2: "Pluton en maison II tend vers un rapport intense et transformateur avec les ressources, les valeurs et la notion de possession. Les finances connaissent des morts et des renaissances, des pertes suivies de régénérations. Cette position invite à confronter l'ombre liée à l'argent et au pouvoir matériel pour découvrir la vraie richesse. La puissance financière se révèle lorsque le lâcher-prise précède l'abondance.",
    3: "Pluton en maison III invite à une communication d'une intensité pénétrante qui va droit au coeur des choses. La parole a le pouvoir de transformer, de guérir ou de détruire, et les échanges quotidiens ont une profondeur inhabituelle. Cette position suggère des relations avec l'entourage marquées par des dynamiques de pouvoir à conscientiser. L'intelligence s'accomplit lorsque la capacité à percevoir le caché se met au service de la vérité bienveillante.",
    4: "Pluton en maison IV tend vers des fondations familiales marquées par l'intensité, les secrets et les dynamiques de pouvoir transgénérationnelles. Les racines portent des ombres à transmuter et des forces à libérer. Cette position invite à un travail profond de guérison familiale qui peut transformer toute la lignée. La puissance intérieure se révèle lorsque les fantômes du passé sont affrontés avec courage et compassion.",
    5: "Pluton en maison V invite à une créativité intense et transformatrice, des amours passionnées et un rapport profond avec les enfants. L'expression de soi passe par des actes de création qui touchent aux zones les plus profondes de l'être. Cette position tend vers des passions dévorantes qui sont autant de terrains de renaissance. Le pouvoir créatif s'accomplit lorsque l'intensité du coeur se canalise dans des oeuvres qui transforment.",
    6: "Pluton en maison VI tend vers une transformation profonde du rapport au travail, à la santé et aux routines quotidiennes. Les crises de santé ou professionnelles sont des catalyseurs d'une régénération totale du mode de vie. Cette position invite à utiliser la puissance plutonienne pour transformer les habitudes limitantes en rituels de guérison. L'efficacité se révèle lorsque le travail quotidien devient un acte de transformation consciente.",
    7: "Pluton en maison VII invite à des relations intenses, transformatrices et profondément marquantes qui touchent au noyau de l'être. Les partenariats sont des creusets alchimiques où le pouvoir, la passion et la vulnérabilité se rencontrent. Cette position tend vers des liens qui exigent une authenticité totale et une confrontation avec ses propres ombres. La puissance relationnelle s'accomplit lorsque le contrôle cède la place à la confiance transformatrice.",
    8: "Pluton en maison VIII, dans sa demeure naturelle, déploie toute sa puissance dans les domaines de la transformation, de la mort symbolique et de la régénération. L'intensité des expériences de vie atteint des sommets, avec des crises qui sont autant de portails d'évolution. Cette position invite à plonger sans crainte dans les abysses pour en rapporter des trésors de sagesse. Le pouvoir s'accomplit dans la capacité à mourir et renaître avec conscience.",
    9: "Pluton en maison IX tend vers une transformation radicale des croyances, de la philosophie de vie et du rapport à la vérité. Les voyages, physiques ou intérieurs, provoquent des morts et des renaissances dans la vision du monde. Cette position invite à confronter les dogmes avec la puissance de l'expérience directe. La sagesse se révèle lorsque la destruction des certitudes ouvre la voie à une compréhension plus profonde et plus vraie.",
    10: "Pluton en maison X invite à une transformation profonde de la vocation, de l'ambition et de la place dans le monde. La carrière est marquée par des bouleversements, des chutes et des ascensions qui forgent un destin puissant. Cette position tend vers un leadership transformateur qui ne craint pas les zones d'ombre du pouvoir. L'accomplissement se déploie lorsque l'autorité personnelle se met au service d'une régénération collective.",
    11: "Pluton en maison XI tend vers une transformation profonde des amitiés, des idéaux et de l'engagement collectif. Les groupes et les communautés sont des lieux d'intensité où les dynamiques de pouvoir doivent être conscientisées. Cette position invite à utiliser sa puissance de transformation au service de causes qui dépassent l'ego. L'accomplissement social se révèle lorsque l'influence se met au service de la régénération du tissu collectif.",
    12: "Pluton en maison XII invite à une plongée radicale dans les profondeurs de l'inconscient, là où les forces les plus puissantes de la psyché attendent d'être transformées. Les peurs les plus profondes et les schémas les plus anciens demandent à être confrontés dans le silence. Cette position tend vers une capacité rare à transformer l'ombre en lumière dans les coulisses de l'âme. Le pouvoir suprême se révèle dans la capacité à guérir l'invisible.",
  },

  "Noeud Nord": {
    1: "Le Noeud Nord en maison I invite à un voyage d'âme vers l'affirmation de son identité propre et le courage d'exister pleinement. Le chemin de croissance passe par l'apprentissage de l'autonomie après des vies marquées par la dépendance relationnelle. Cette position suggère que la mission de vie est d'oser être soi, simplement et totalement. L'accomplissement se révèle dans le courage d'incarner sa différence.",
    2: "Le Noeud Nord en maison II tend vers un apprentissage de l'ancrage matériel, de la valeur personnelle et de l'autonomie financière. Le chemin de croissance passe par la construction d'une sécurité propre après des vies marquées par la dépendance aux ressources des autres. Cette position invite à découvrir sa propre valeur à travers ce que l'on construit concrètement. L'accomplissement se déploie dans la simplicité d'être à la source de sa propre abondance.",
    3: "Le Noeud Nord en maison III invite à un voyage vers la communication, l'apprentissage continu et les échanges de proximité. Le chemin de croissance passe par l'écoute, la curiosité et la connexion avec l'environnement immédiat. Cette position suggère d'apprendre la valeur de la question plutôt que de la grande théorie. L'accomplissement se révèle dans la joie simple de l'échange quotidien qui enrichit et connecte.",
    4: "Le Noeud Nord en maison IV tend vers un voyage d'âme vers les racines, le foyer et la sécurité émotionnelle. Le chemin de croissance passe par l'apprentissage de la vulnérabilité et de l'intimité après des vies marquées par l'ambition publique. Cette position invite à construire un sanctuaire intérieur qui nourrit toutes les dimensions de la vie. L'accomplissement se déploie dans la paix de savoir d'où l'on vient et ce qui nous nourrit vraiment.",
    5: "Le Noeud Nord en maison V invite à un voyage vers la créativité, la joie de vivre et l'expression authentique du coeur. Le chemin de croissance passe par le courage de créer, de jouer et d'aimer sans se cacher derrière le groupe. Cette position suggère que la mission de vie est de rayonner par sa singularité créatrice. L'accomplissement se révèle dans la générosité du coeur qui ose briller.",
    6: "Le Noeud Nord en maison VI tend vers un apprentissage du service quotidien, de la santé et de l'humilité pratique. Le chemin de croissance passe par l'ancrage dans le concret après des vies marquées par l'évasion et la dissolution. Cette position invite à trouver le sacré dans les tâches les plus simples de la vie quotidienne. L'accomplissement se déploie dans la beauté du travail bien fait au service du vivant.",
    7: "Le Noeud Nord en maison VII invite à un voyage d'âme vers la relation, le partenariat et l'art du compromis éclairé. Le chemin de croissance passe par l'ouverture à l'autre après des vies marquées par l'individualisme. Cette position suggère que la mission de vie est d'apprendre la danse du nous sans perdre le je. L'accomplissement se révèle dans la sagesse relationnelle qui enrichit toutes les dimensions de l'existence.",
    8: "Le Noeud Nord en maison VIII tend vers un apprentissage de la transformation, du lâcher-prise et de l'intimité profonde. Le chemin de croissance passe par le courage de plonger dans les eaux profondes de l'existence. Cette position invite à confronter les peurs et les tabous pour y découvrir des trésors cachés. L'accomplissement se déploie dans la puissance de renaître après chaque crise traversée avec conscience.",
    9: "Le Noeud Nord en maison IX invite à un voyage vers l'expansion philosophique, l'aventure et la quête de sens. Le chemin de croissance passe par l'élargissement des horizons après des vies marquées par la proximité et le quotidien. Cette position suggère que la mission de vie est de synthétiser, d'enseigner et d'inspirer. L'accomplissement se révèle dans la sagesse acquise par l'exploration courageuse de l'inconnu.",
    10: "Le Noeud Nord en maison X tend vers un voyage d'âme vers la maturité professionnelle, la responsabilité et la contribution au monde. Le chemin de croissance passe par l'assomption de son autorité et de sa vocation après des vies tournées vers le foyer. Cette position invite à gravir sa montagne avec discipline et intégrité. L'accomplissement se déploie dans le service public qui reflète une maturité intérieure authentique.",
    11: "Le Noeud Nord en maison XI invite à un voyage vers la conscience collective, l'amitié et les projets qui dépassent l'individu. Le chemin de croissance passe par l'engagement au service du groupe après des vies marquées par le besoin de briller personnellement. Cette position suggère que la mission de vie est de contribuer au futur avec originalité et fraternité. L'accomplissement se révèle dans la joie de faire partie de quelque chose de plus grand.",
    12: "Le Noeud Nord en maison XII tend vers un voyage d'âme vers la dissolution, la spiritualité et le lâcher-prise total. Le chemin de croissance passe par l'abandon du contrôle et l'ouverture à l'invisible après des vies marquées par l'analyse et la maîtrise. Cette position invite à trouver la paix dans la reddition consciente à plus grand que soi. L'accomplissement se déploie dans la grâce qui naît quand l'ego se met humblement au service de l'universel.",
  },
};

// ─── ASPECTS ─────────────────────────────────────────────────────────

export const aspectInterpretations: Record<
  string,
  Record<string, string>
> = {
  Conjonction: {
    "Soleil-Lune":
      "La conjonction Soleil-Lune, symbolisant la Nouvelle Lune intérieure, invite à une fusion profonde entre la volonté consciente et les besoins émotionnels. L'identité et le monde intérieur tendent à vibrer à l'unisson, créant une cohérence naturelle entre ce que l'on est et ce que l'on ressent. Cette unité peut être une force remarquable lorsqu'elle est consciente, mais peut aussi créer un angle mort émotionnel. La croissance passe par la capacité à percevoir les nuances là où tout semble unifié.",
    "Soleil-Mars":
      "La conjonction Soleil-Mars invite à une identité profondément marquée par l'énergie d'action, le courage et la combativité. La volonté et la force de frappe se conjuguent en une présence dynamique et affirmée. Cette position tend vers un leadership naturel et une capacité remarquable à initier des projets. La sagesse s'exprime lorsque la puissance brute est canalisée par une intention claire et constructive.",
    "Soleil-Venus":
      "La conjonction Soleil-Vénus tend vers une identité naturellement empreinte de charme, d'harmonie et de sens esthétique. La personnalité rayonne par sa capacité à créer de la beauté et à attirer l'amour dans sa vie. Cette fusion invite à placer les valeurs vénusiennes de paix et de plaisir au coeur de l'expression de soi. L'épanouissement se déploie lorsque l'amour de soi nourrit authentiquement la relation à l'autre.",
    "Lune-Mars":
      "La conjonction Lune-Mars suggère une fusion passionnée entre le monde émotionnel et l'énergie d'action. Les émotions se vivent avec intensité et déclenchent des réactions immédiates et parfois impulsives. Cette position invite à reconnaître la puissance de cette alliance entre sensibilité et combativité. La maturité se déploie lorsque la réactivité émotionnelle se transforme en courage de protéger ce qui compte.",
    "Lune-Venus":
      "La conjonction Lune-Vénus invite à une douceur naturelle, un sens inné de la beauté et une capacité d'aimer empreinte de tendresse. Le monde émotionnel est intimement lié au besoin d'harmonie, de confort et de relations gracieuses. Cette position suggère un don pour créer des espaces de beauté et de chaleur. L'épanouissement se révèle dans la capacité à recevoir l'amour aussi généreusement qu'on le donne.",
    "Venus-Mars":
      "La conjonction Vénus-Mars tend vers une fusion magnétique entre le désir et l'attraction, la passion et la douceur. La vie affective et la sexualité sont marquées par une intensité qui cherche à unir les polarités. Cette position invite à embrasser pleinement cette énergie créatrice qui naît de la rencontre du masculin et du féminin intérieurs. L'harmonie se déploie lorsque la passion et la tendresse dansent ensemble.",
    "Soleil-Jupiter":
      "La conjonction Soleil-Jupiter invite à une identité expansive, optimiste et naturellement confiante. La personnalité rayonne de générosité, d'enthousiasme et d'une foi contagieuse en la vie. Cette position tend vers des opportunités remarquables et un sentiment de protection cosmique. La sagesse s'exprime lorsque l'excès de confiance se tempère d'humilité et de gratitude.",
    "Soleil-Saturne":
      "La conjonction Soleil-Saturne suggère une identité profondément marquée par le sens du devoir, de la responsabilité et de la maturité. La personnalité porte un sérieux qui inspire le respect mais peut aussi peser sur la joie de vivre. Cette position invite à reconnaître que la structure saturnienne est le cadre qui permet à la lumière solaire de se concentrer. L'épanouissement naît lorsque la discipline devient un acte d'amour envers son propre destin.",
    "Lune-Jupiter":
      "La conjonction Lune-Jupiter invite à un monde émotionnel expansif, généreux et naturellement optimiste. Le bien-être se nourrit d'abondance, de chaleur humaine et de moments de célébration partagée. Cette position tend vers une capacité naturelle à nourrir les autres avec générosité et enthousiasme. La sagesse émotionnelle se déploie lorsque l'excès de bienveillance se conjugue avec des limites saines.",
    "Lune-Saturne":
      "La conjonction Lune-Saturne suggère un monde émotionnel structuré, parfois austère, où la maturité s'est imposée tôt. Les besoins affectifs sont teintés de gravité et le confort se trouve dans la fiabilité plutôt que dans l'effusion. Cette position invite à reconnaître que la retenue émotionnelle protège un coeur d'une grande profondeur. La sérénité se révèle lorsque les murs deviennent des fondations solides pour accueillir la tendresse.",
    "Mercure-Venus":
      "La conjonction Mercure-Vénus tend vers une intelligence gracieuse et une communication empreinte de charme et de diplomatie. L'esprit est naturellement orienté vers l'esthétique, la négociation et l'art de dire les choses avec beauté. Cette position invite à cultiver ce don de la parole harmonieuse au service de la paix et de la création. La pensée s'accomplit lorsque l'élégance du verbe se nourrit de vérité profonde.",
    "Mercure-Mars":
      "La conjonction Mercure-Mars invite à une pensée combative, rapide et tranchante qui ne recule devant aucun débat. L'esprit est un guerrier des idées, capable de défendre ses positions avec vigueur et conviction. Cette position tend vers une communication directe qui bouscule et stimule l'entourage. La puissance mentale s'accomplit lorsque l'agressivité intellectuelle se transforme en clarté assertive.",
    "Mars-Jupiter":
      "La conjonction Mars-Jupiter invite à une énergie d'action amplifiée par l'optimisme, la foi et le goût de l'aventure. La volonté se déploie avec enthousiasme et une confiance en sa bonne étoile qui peut déplacer des montagnes. Cette position tend vers des entreprises audacieuses et des prises de risque inspirées. La sagesse se déploie lorsque l'élan conquérant s'accompagne de discernement éthique.",
    "Mars-Saturne":
      "La conjonction Mars-Saturne suggère une fusion exigeante entre l'énergie d'action et la discipline de la structure. La volonté est endurante, stratégique et capable d'efforts prolongés remarquables. Cette position peut créer une tension entre le besoin d'agir et la peur de l'erreur. La puissance s'accomplit lorsque la patience de Saturne canalise le feu de Mars dans des réalisations durables.",
    "Jupiter-Saturne":
      "La conjonction Jupiter-Saturne invite à une synthèse entre expansion et structure, optimisme et réalisme. Ces deux forces apparemment contraires fusionnent en une capacité rare à rêver grand tout en construisant solidement. Cette position tend vers des réalisations qui conjuguent vision ambitieuse et exécution patiente. La sagesse se déploie lorsque la foi en l'avenir se nourrit de la discipline du présent.",
    "Venus-Jupiter":
      "La conjonction Vénus-Jupiter tend vers une générosité affective remarquable et un sens naturel de l'abondance dans les relations. L'amour se vit avec largesse, optimisme et une capacité à célébrer la beauté sous toutes ses formes. Cette position invite à partager la joie et la fortune avec une grâce naturelle. L'harmonie se déploie lorsque la générosité du coeur se conjugue avec la sagesse de la mesure.",
    "Venus-Saturne":
      "La conjonction Vénus-Saturne suggère un rapport à l'amour et à la beauté marqué par la maturité, la fidélité et parfois la retenue. Les sentiments se développent lentement mais atteignent une profondeur et une solidité remarquables. Cette position invite à reconnaître que la patience en amour construit les liens les plus durables. L'harmonie se révèle lorsque la gravité émotionnelle s'adoucit d'une tendresse conquise sur la pudeur.",
  },

  Sextile: {
    "Soleil-Lune":
      "Le sextile Soleil-Lune invite à une collaboration harmonieuse entre la volonté consciente et le monde émotionnel. La communication entre ce que l'on veut et ce que l'on ressent circule avec fluidité, créant un équilibre intérieur naturel. Cette position tend vers une adaptabilité qui tire le meilleur des situations. Le potentiel se réalise lorsque cette facilité naturelle est consciemment cultivée plutôt que tenue pour acquise.",
    "Soleil-Mars":
      "Le sextile Soleil-Mars tend vers une synergie positive entre l'identité et l'énergie d'action. Le courage vient naturellement au service des projets personnels, avec une aisance qui inspire confiance. Cette position invite à saisir les opportunités d'action qui renforcent le sentiment de soi. La puissance se déploie lorsque les talents sont activement mis au service d'initiatives concrètes.",
    "Soleil-Venus":
      "Le sextile Soleil-Vénus invite à une harmonie naturelle entre l'identité et la vie affective, le charme et la confiance. La capacité à plaire et à créer de la beauté vient soutenir l'expression de soi avec grâce. Cette position tend vers des relations sociales aisées et un sens esthétique qui enrichit le quotidien. L'épanouissement se déploie lorsque les talents relationnels sont consciemment cultivés.",
    "Lune-Mars":
      "Le sextile Lune-Mars suggère une collaboration féconde entre la sensibilité émotionnelle et l'énergie d'action. Les émotions stimulent l'action plutôt que de la paralyser, et l'action nourrit le bien-être émotionnel. Cette position invite à utiliser cette synergie pour avancer avec courage tout en restant connecté à son coeur. La force se déploie lorsque l'instinct protecteur se met en mouvement avec confiance.",
    "Lune-Venus":
      "Le sextile Lune-Vénus tend vers une douceur émotionnelle naturelle et un talent pour créer de l'harmonie dans les relations. Le monde intérieur et le monde affectif collaborent avec grâce, créant une atmosphère de bien-être autour de soi. Cette position invite à cultiver consciemment cette capacité à embellir le quotidien et les liens. L'épanouissement se révèle dans les petits gestes de tendresse qui nourrissent le coeur.",
    "Venus-Mars":
      "Le sextile Vénus-Mars invite à une collaboration créative entre le désir et la douceur, l'action et la réceptivité. La vie affective et la sexualité bénéficient d'un équilibre naturel entre passion et tendresse. Cette position tend vers une capacité à initier les relations avec charme et confiance. L'harmonie s'enrichit lorsque le courage d'aimer se conjugue avec la grâce de recevoir.",
    "Soleil-Jupiter":
      "Le sextile Soleil-Jupiter tend vers une ouverture naturelle aux opportunités de croissance et d'expansion personnelle. La confiance en soi est nourrie par un optimisme réaliste et une capacité à voir le meilleur dans chaque situation. Cette position invite à saisir les occasions de s'élargir sans attendre qu'elles frappent à la porte. La sagesse se déploie lorsque la chance naturelle est activement cultivée par l'effort.",
    "Soleil-Saturne":
      "Le sextile Soleil-Saturne invite à une collaboration féconde entre l'expression de soi et la discipline nécessaire à la réalisation. L'ambition est soutenue par la patience et la volonté est structurée par le sens des responsabilités. Cette position tend vers une maturité naturelle qui inspire la confiance de l'entourage. L'accomplissement se déploie lorsque la persévérance sert un but authentique.",
    "Lune-Jupiter":
      "Le sextile Lune-Jupiter suggère un bien-être émotionnel nourri par l'optimisme, la générosité et une foi naturelle en la bonté de la vie. Les opportunités d'expansion se présentent souvent par le biais de connexions émotionnelles et familiales. Cette position invite à partager cette chaleur intérieure avec ceux qui en ont besoin. La sagesse émotionnelle se déploie dans la gratitude active pour les bénédictions du coeur.",
    "Lune-Saturne":
      "Le sextile Lune-Saturne tend vers une maturité émotionnelle naturelle qui combine sensibilité et sens pratique. Les émotions sont vécues avec profondeur tout en restant gérables et constructives. Cette position invite à utiliser cette stabilité intérieure comme une ressource au service des autres. La sérénité se renforce lorsque la structure émotionnelle soutient plutôt qu'elle ne contraint.",
    "Mercure-Venus":
      "Le sextile Mercure-Vénus invite à une aisance naturelle dans l'art de communiquer avec grâce et charme. L'intelligence est au service de la beauté et la beauté inspire la pensée. Cette position tend vers un talent pour la diplomatie, l'écriture élégante et les arts du langage. La communication s'accomplit lorsque la clarté mentale se pare de la douceur vénusienne.",
    "Mercure-Mars":
      "Le sextile Mercure-Mars tend vers une intelligence vive et réactive qui sait défendre ses idées avec conviction et efficacité. L'esprit et l'action collaborent de manière fluide, permettant de passer rapidement de la pensée à la réalisation. Cette position invite à utiliser cette agilité mentale pour résoudre les problèmes avec créativité. La puissance de la pensée se déploie lorsque la combativité sert la clarté.",
    "Mars-Jupiter":
      "Le sextile Mars-Jupiter invite à une synergie féconde entre l'énergie d'action et l'expansion optimiste. Les entreprises bénéficient d'un élan enthousiaste et d'une chance naturelle qui favorise la réussite. Cette position tend vers un courage inspiré par la confiance en des possibilités plus vastes. La sagesse se déploie lorsque l'audace est guidée par une vision éthique.",
    "Mars-Saturne":
      "Le sextile Mars-Saturne suggère une collaboration efficace entre l'énergie d'action et la patience stratégique. La combativité est soutenue par la discipline et l'endurance, créant une force de réalisation remarquable. Cette position invite à tirer parti de cette capacité à allier courage et prudence. La puissance s'accomplit dans la persévérance qui transforme les obstacles en étapes de progression.",
    "Jupiter-Saturne":
      "Le sextile Jupiter-Saturne tend vers un équilibre naturel entre optimisme et réalisme, expansion et structure. Les ambitions sont à la fois grandes et réalisables, soutenues par une foi qui ne perd pas de vue le concret. Cette position invite à construire des projets qui conjuguent vision et solidité. La sagesse se déploie dans la capacité à rêver avec les pieds sur terre.",
    "Venus-Jupiter":
      "Le sextile Vénus-Jupiter invite à une grâce sociale naturelle et une générosité affective qui attirent l'abondance. Les relations et les plaisirs bénéficient d'une expansion harmonieuse et d'une chance qui sourit aux coeurs ouverts. Cette position tend vers des moments de joie partagée qui enrichissent la vie. L'harmonie se déploie lorsque le plaisir de donner multiplie la joie de recevoir.",
    "Venus-Saturne":
      "Le sextile Vénus-Saturne tend vers une maturité affective naturelle qui construit des liens solides et durables. L'amour se vit avec fidélité et le sens esthétique se conjugue avec la rigueur artisanale. Cette position invite à apprécier la beauté qui se bonifie avec le temps. L'harmonie se révèle dans la patience qui transforme les sentiments en engagements nourrissants.",
  },

  Carre: {
    "Soleil-Lune":
      "Le carré Soleil-Lune invite à confronter une tension créatrice entre la volonté consciente et les besoins émotionnels. Ce que l'on veut et ce que l'on ressent semblent souvent en conflit, créant une dynamique intérieure stimulante mais exigeante. Cette position suggère un apprentissage profond de l'intégration entre le masculin et le féminin intérieurs. La maturité se déploie lorsque la tension devient un moteur de croissance plutôt qu'une source de frustration.",
    "Soleil-Mars":
      "Le carré Soleil-Mars tend vers une tension entre l'identité et l'énergie d'action qui peut se manifester par de l'impatience ou de la colère. La volonté est puissante mais parfois en conflit avec les circonstances, créant des frictions qui stimulent la croissance. Cette position invite à transformer l'agressivité en assertivité et la frustration en combustible créatif. La force s'accomplit lorsque le feu intérieur est apprivoisé sans être éteint.",
    "Soleil-Venus":
      "Le carré Soleil-Vénus invite à confronter une tension entre l'identité et les valeurs affectives, entre ce que l'on est et ce que l'on désire. La relation à l'amour et à la beauté peut être source de conflits intérieurs et d'insatisfactions. Cette position suggère un apprentissage autour de l'estime de soi et de la capacité à s'aimer tel que l'on est. L'harmonie se révèle lorsque le besoin d'être aimé se transforme en capacité à aimer authentiquement.",
    "Lune-Mars":
      "Le carré Lune-Mars suggère une tension vive entre la sensibilité émotionnelle et l'énergie d'action. Les émotions s'enflamment facilement et les réactions peuvent être disproportionnées ou impulsives. Cette position invite à transformer cette réactivité en force émotionnelle constructive. La maturité se déploie lorsque la colère est reconnue comme un signal légitime plutôt qu'un ennemi à combattre.",
    "Lune-Venus":
      "Le carré Lune-Vénus tend vers une tension entre les besoins émotionnels profonds et les désirs affectifs ou esthétiques. Le confort intérieur et l'harmonie relationnelle peuvent sembler en conflit, créant de l'insatisfaction. Cette position invite à explorer ce que l'on veut vraiment en amour versus ce qui rassure. L'épanouissement se révèle lorsque les compromis entre sécurité et plaisir deviennent des choix conscients.",
    "Venus-Mars":
      "Le carré Vénus-Mars invite à confronter une tension magnétique entre le désir et la tendresse, l'action et la réceptivité. La vie affective et sexuelle peut être marquée par des frictions stimulantes mais parfois épuisantes. Cette position suggère un apprentissage de l'intégration entre les polarités du désir. L'harmonie se déploie lorsque la passion et la douceur apprennent à danser ensemble plutôt qu'à se combattre.",
    "Soleil-Jupiter":
      "Le carré Soleil-Jupiter tend vers une tension entre l'identité et le besoin d'expansion qui peut se manifester par de l'excès ou de la présomption. L'optimisme naturel peut mener à des promesses non tenues ou à une surestimation de ses capacités. Cette position invite à canaliser cette énergie expansive sans la brider. La sagesse se déploie lorsque l'ambition démesurée se transforme en vision réaliste mais inspirante.",
    "Soleil-Saturne":
      "Le carré Soleil-Saturne suggère une tension profonde entre l'expression de soi et les limitations, entre le désir de briller et la peur du rejet. L'autorité intérieure se construit à travers des épreuves qui testent la persévérance et la foi en soi. Cette position invite à transformer les obstacles en tremplins de maturité. L'accomplissement se révèle lorsque la discipline cesse d'être une punition pour devenir un choix souverain.",
    "Lune-Jupiter":
      "Le carré Lune-Jupiter invite à confronter une tension entre le besoin de sécurité émotionnelle et le désir d'expansion. Les excès émotionnels, la surprotection ou la suralimentation peuvent être des manifestations de ce déséquilibre. Cette position suggère un apprentissage de la juste mesure dans l'expression des sentiments. La sagesse se déploie lorsque la générosité émotionnelle se conjugue avec des limites saines.",
    "Lune-Saturne":
      "Le carré Lune-Saturne tend vers une tension exigeante entre les besoins émotionnels et les exigences de la réalité. La sensibilité se heurte à la froideur du monde, créant un sentiment de privation affective ou de solitude intérieure. Cette position invite à construire sa propre sécurité émotionnelle sans attendre qu'elle vienne de l'extérieur. La maturité se révèle lorsque la vulnérabilité est accueillie comme une force plutôt qu'une faiblesse à combattre.",
    "Mercure-Venus":
      "Le carré Mercure-Vénus invite à confronter une tension entre la pensée rationnelle et les valeurs esthétiques ou affectives. La communication peut être troublée par le désir de plaire ou par des compromis intellectuels. Cette position suggère un apprentissage de l'authenticité dans l'expression de ses goûts et de ses opinions. La clarté se déploie lorsque la vérité et la beauté trouvent un terrain commun.",
    "Mercure-Mars":
      "Le carré Mercure-Mars tend vers une pensée combative qui peut basculer dans l'agressivité verbale ou la polémique stérile. L'esprit est rapide et tranchant mais peut couper avant de comprendre. Cette position invite à canaliser cette énergie mentale dans le débat constructif plutôt que dans la dispute. La puissance de la parole s'accomplit lorsque la franchise se tempère de considération pour l'autre.",
    "Mars-Jupiter":
      "Le carré Mars-Jupiter invite à confronter une tension entre l'action et l'excès, le courage et la témérité. L'énergie peut se disperser dans trop de directions ou s'investir dans des entreprises disproportionnées. Cette position suggère un apprentissage de la mesure dans l'audace. La sagesse se déploie lorsque l'enthousiasme guerrier se canalise dans des batailles qui en valent vraiment la peine.",
    "Mars-Saturne":
      "Le carré Mars-Saturne suggère une tension profonde entre le désir d'agir et la peur de l'erreur, entre l'élan et le frein. La frustration peut s'accumuler lorsque l'énergie est constamment bloquée par des obstacles intérieurs ou extérieurs. Cette position invite à transformer cette tension en endurance stratégique. La puissance se révèle lorsque la patience forge une volonté d'acier capable de traverser n'importe quel mur.",
    "Jupiter-Saturne":
      "Le carré Jupiter-Saturne tend vers une tension entre l'optimisme et le réalisme, l'expansion et la contraction. La foi en l'avenir se heurte régulièrement aux exigences du présent. Cette position invite à trouver un rythme d'avancée qui respecte à la fois le rêve et la réalité. La sagesse se déploie lorsque les oscillations entre enthousiasme et découragement deviennent un mouvement de croissance conscient.",
    "Venus-Jupiter":
      "Le carré Vénus-Jupiter invite à confronter une tension entre le plaisir et l'excès, la générosité et la dépense. La vie affective peut être marquée par des idéaux démesurés ou une tendance à en vouloir toujours plus. Cette position suggère un apprentissage de la juste mesure dans le plaisir et les relations. L'harmonie se déploie lorsque l'abondance du coeur se conjugue avec la sagesse de la modération.",
    "Venus-Saturne":
      "Le carré Vénus-Saturne suggère une tension entre le désir d'aimer et la peur de la vulnérabilité, entre le besoin de beauté et l'austérité intérieure. L'amour peut sembler difficile d'accès ou marqué par des retards et des épreuves de patience. Cette position invite à construire des liens profonds à travers les difficultés plutôt que malgré elles. La tendresse se révèle lorsque les murs protecteurs s'ouvrent enfin à la chaleur du coeur.",
  },

  Trigone: {
    "Soleil-Lune":
      "Le trigone Soleil-Lune invite à une harmonie naturelle entre la volonté consciente et le monde émotionnel. L'être intérieur et l'expression extérieure coulent ensemble avec fluidité, créant un sentiment de bien-être fondamental. Cette position tend vers une confiance en soi enracinée dans une sécurité émotionnelle solide. La sagesse s'approfondit lorsque cette aisance naturelle est utilisée au service des autres.",
    "Soleil-Mars":
      "Le trigone Soleil-Mars tend vers un flux naturel entre l'identité et l'énergie d'action, créant une efficacité remarquable. Le courage vient spontanément soutenir les projets et l'initiative personnelle rencontre peu de résistance intérieure. Cette position invite à utiliser cette facilité d'action pour accomplir des objectifs significatifs. La puissance se déploie pleinement lorsque l'aisance est mise au service d'une cause qui en vaut la peine.",
    "Soleil-Venus":
      "Le trigone Soleil-Vénus invite à une grâce naturelle dans l'expression de soi, le charme et les relations. L'harmonie entre l'identité et les valeurs affectives crée un rayonnement qui attire la sympathie et la beauté. Cette position tend vers une facilité relationnelle et un sens esthétique qui enrichissent la vie. L'épanouissement se déploie lorsque ce don naturel est consciemment cultivé au service de la beauté du monde.",
    "Lune-Mars":
      "Le trigone Lune-Mars suggère une alliance fluide entre la sensibilité émotionnelle et la capacité d'action. Les émotions nourrissent l'énergie et l'action protège le monde intérieur avec une assurance naturelle. Cette position invite à apprécier cette force émotionnelle qui se mobilise avec grâce dans les moments qui comptent. La puissance du coeur se déploie dans le courage instinctif de protéger ce que l'on aime.",
    "Lune-Venus":
      "Le trigone Lune-Vénus tend vers une douceur émotionnelle naturelle et un don pour créer de l'harmonie et de la beauté dans les relations. Le bien-être intérieur et le plaisir circulent ensemble avec fluidité, créant une aura de sérénité. Cette position invite à partager cette grâce avec l'entourage comme un baume naturel. L'épanouissement se révèle dans la capacité à nourrir les liens avec tendresse et beauté.",
    "Venus-Mars":
      "Le trigone Vénus-Mars invite à une harmonie naturelle entre le désir et la tendresse, l'action et la réceptivité. La vie affective et la créativité bénéficient d'un courant fluide entre les polarités masculines et féminines intérieures. Cette position tend vers un charme magnétique et une capacité à initier les relations avec grâce. L'harmonie s'exprime pleinement lorsque la passion se conjugue naturellement avec la douceur.",
    "Soleil-Jupiter":
      "Le trigone Soleil-Jupiter tend vers une expansion naturelle de l'identité, une chance innée et un optimisme contagieux. La confiance en soi est soutenue par une foi en la vie qui attire les opportunités. Cette position invite à accueillir cette grâce avec gratitude et à la partager généreusement. La sagesse se déploie lorsque la facilité naturelle ne conduit pas à la complaisance mais à une générosité consciente.",
    "Soleil-Saturne":
      "Le trigone Soleil-Saturne invite à une alliance fluide entre l'expression de soi et la discipline, la lumière et la structure. L'ambition est soutenue par la patience et le sens des responsabilités vient naturellement renforcer les projets. Cette position tend vers une maturité qui inspire confiance et un leadership naturellement structuré. L'accomplissement se déploie dans la constance d'une vision portée avec intégrité.",
    "Lune-Jupiter":
      "Le trigone Lune-Jupiter suggère un bien-être émotionnel naturellement expansif, généreux et optimiste. La joie de vivre coule de source et la capacité à nourrir les autres est spontanée et abondante. Cette position invite à apprécier cette grâce intérieure et à la partager avec ceux qui en ont besoin. La sagesse émotionnelle se déploie dans la gratitude active pour les bénédictions de la vie affective.",
    "Lune-Saturne":
      "Le trigone Lune-Saturne tend vers une stabilité émotionnelle profonde et une maturité affective qui porte ses fruits avec le temps. La sensibilité et la structure collaborent naturellement, créant un socle intérieur fiable. Cette position invite à utiliser cette solidité émotionnelle comme une ancre pour soi et pour les autres. La sérénité se déploie dans la confiance d'un coeur qui a trouvé ses fondations.",
    "Mercure-Venus":
      "Le trigone Mercure-Vénus invite à une communication gracieuse et une pensée naturellement empreinte de beauté et d'harmonie. L'intelligence et le sens esthétique collaborent avec fluidité, créant un don pour l'écriture, l'art et la diplomatie. Cette position tend vers des échanges agréables qui enrichissent les relations. La sagesse de la parole se déploie lorsque la beauté du langage porte des vérités profondes.",
    "Mercure-Mars":
      "Le trigone Mercure-Mars tend vers une agilité mentale remarquable et une capacité à passer de la pensée à l'action avec fluidité. L'esprit est vif, stratégique et capable de défendre ses idées avec efficacité et conviction. Cette position invite à mettre cette puissance intellectuelle au service de projets concrets. La pensée s'accomplit lorsque la rapidité de l'esprit guide une action précise et déterminée.",
    "Mars-Jupiter":
      "Le trigone Mars-Jupiter invite à une synergie naturelle entre l'énergie d'action et l'expansion optimiste. Le courage est amplifié par la foi et les entreprises bénéficient d'un élan enthousiaste qui favorise la réussite. Cette position tend vers un leadership inspiré et une capacité à mobiliser les énergies autour de projets ambitieux. La sagesse se déploie dans l'art de canaliser cette puissance dans des causes qui servent le bien.",
    "Mars-Saturne":
      "Le trigone Mars-Saturne suggère une force d'exécution remarquable qui combine énergie et endurance, audace et stratégie. La volonté est à la fois dynamique et patiente, capable de mener des projets de long terme avec détermination. Cette position invite à apprécier cette capacité rare à allier le feu et la terre. La puissance s'accomplit dans la persévérance qui transforme les visions en réalisations durables.",
    "Jupiter-Saturne":
      "Le trigone Jupiter-Saturne tend vers un équilibre naturel entre expansion et structure, permettant de construire des oeuvres à la fois ambitieuses et solides. La foi et la discipline collaborent harmonieusement, créant une sagesse pratique remarquable. Cette position invite à incarner ce pont entre le rêve et la réalité dans des réalisations concrètes. L'accomplissement se déploie dans la patience d'une vision qui se construit pierre par pierre.",
    "Venus-Jupiter":
      "Le trigone Vénus-Jupiter invite à une abondance naturelle dans les domaines de l'amour, de la beauté et du plaisir. La joie se multiplie au contact des autres et la générosité du coeur attire les bénédictions. Cette position tend vers des relations enrichissantes et une capacité à célébrer la vie avec grâce. L'harmonie se déploie dans la gratitude pour les cadeaux que la vie offre généreusement.",
    "Venus-Saturne":
      "Le trigone Vénus-Saturne tend vers une solidité affective naturelle et un goût pour la beauté qui s'approfondit avec le temps. L'amour et la fidélité se conjuguent harmonieusement, créant des liens d'une qualité rare. Cette position invite à apprécier la beauté de ce qui dure et mûrit. L'harmonie se révèle dans la patience d'un amour qui se bonifie comme un grand cru avec les années.",
  },

  Opposition: {
    "Soleil-Lune":
      "L'opposition Soleil-Lune, symbolisant la Pleine Lune intérieure, invite à un dialogue permanent entre la volonté consciente et les besoins émotionnels. La tension entre ces deux pôles crée une richesse intérieure qui se manifeste par une conscience accrue de soi et des autres. Cette position tend vers des relations qui reflètent ce dialogue interne entre donner et recevoir. La sagesse s'accomplit lorsque les deux luminaires trouvent un rythme de collaboration consciente.",
    "Soleil-Mars":
      "L'opposition Soleil-Mars tend vers une projection de l'énergie combative sur l'extérieur, créant des confrontations qui sont autant de miroirs de la force intérieure. Les conflits avec les autres révèlent le rapport personnel au pouvoir et à l'assertivité. Cette position invite à reconnaître que l'adversaire extérieur porte souvent le visage de son propre courage refoulé. La puissance se déploie lorsque la combativité cesse d'être projetée pour être intégrée.",
    "Soleil-Venus":
      "L'opposition Soleil-Vénus invite à explorer la tension entre l'identité et les valeurs relationnelles, souvent vécue à travers le miroir du partenaire. Ce que l'on admire ou critique chez l'autre reflète la part de soi qui demande à être intégrée. Cette position tend vers des relations miroirs qui enseignent l'amour de soi. L'harmonie se révèle lorsque la quête d'approbation extérieure se transforme en acceptation intérieure.",
    "Lune-Mars":
      "L'opposition Lune-Mars suggère une tension entre la sensibilité émotionnelle et la force d'action qui se projette souvent dans les relations proches. Les conflits affectifs révèlent le dialogue intérieur entre vulnérabilité et combativité. Cette position invite à intégrer ces deux polarités plutôt que de les vivre alternativement. La maturité se déploie lorsque la douceur et la force coexistent sans se dominer mutuellement.",
    "Lune-Venus":
      "L'opposition Lune-Vénus tend vers une tension entre le confort émotionnel et les plaisirs relationnels, entre ce qui rassure et ce qui attire. Les besoins affectifs profonds peuvent sembler en conflit avec les désirs de la vie sociale. Cette position invite à reconnaître que sécurité et plaisir ne sont pas incompatibles. L'harmonie se révèle dans la capacité à nourrir ses besoins fondamentaux tout en s'ouvrant à la beauté du monde.",
    "Venus-Mars":
      "L'opposition Vénus-Mars invite à danser avec la tension entre le désir et la tendresse, le masculin et le féminin. La vie affective est marquée par une attraction magnétique qui peut osciller entre passion et conflit. Cette position tend vers des relations intenses qui sont des creusets de croissance. L'harmonie se déploie lorsque les deux polarités cessent de se combattre pour créer ensemble une danse créatrice.",
    "Soleil-Jupiter":
      "L'opposition Soleil-Jupiter tend vers une tension entre l'identité personnelle et le besoin d'expansion, souvent projetée dans des excès ou des idéalisations. Les autres peuvent sembler être source d'opportunités démesurées ou de promesses non tenues. Cette position invite à développer son propre optimisme intérieur sans en dépendre extérieurement. La sagesse se déploie lorsque la grandeur est trouvée en soi plutôt que recherchée dans le reflet des autres.",
    "Soleil-Saturne":
      "L'opposition Soleil-Saturne suggère une tension entre l'expression de soi et l'autorité, entre le désir de briller et les limitations imposées par le monde extérieur. Les figures d'autorité peuvent sembler oppressives ou frustrantes, reflétant le dialogue intérieur entre confiance et doute. Cette position invite à devenir sa propre autorité bienveillante. L'accomplissement se révèle lorsque les murs extérieurs sont reconnus comme les reflets des murs intérieurs à transformer.",
    "Lune-Jupiter":
      "L'opposition Lune-Jupiter invite à confronter la tension entre le besoin de sécurité émotionnelle et l'appel de l'expansion. Le confort intérieur et l'aventure peuvent sembler mutuellement exclusifs. Cette position tend vers des oscillations entre le repli nourricier et l'élan vers le large. La sagesse se déploie lorsque la maison intérieure est assez vaste pour contenir l'aventure et assez chaude pour offrir le repos.",
    "Lune-Saturne":
      "L'opposition Lune-Saturne tend vers une tension entre la vulnérabilité émotionnelle et les exigences de la maturité, souvent projetée dans la relation aux figures parentales. Le monde intérieur peut se sentir assiégé par des responsabilités qui ne laissent pas de place aux besoins du coeur. Cette position invite à intégrer la structure et la tendresse comme deux faces d'un même amour. La sérénité se révèle lorsque la force de Saturne protège plutôt qu'elle n'étouffe la Lune.",
    "Mercure-Venus":
      "L'opposition Mercure-Vénus invite à explorer la tension entre la pensée analytique et les valeurs affectives. La communication peut être tiraillée entre le besoin de dire la vérité et le désir de plaire. Cette position tend vers un apprentissage de la diplomatie qui ne sacrifie pas l'authenticité. La clarté se déploie lorsque les mots portent autant de vérité que de beauté.",
    "Mercure-Mars":
      "L'opposition Mercure-Mars tend vers une communication qui se confronte à l'énergie d'action des autres, créant des débats stimulants mais parfois conflictuels. L'esprit est mis au défi par des adversaires qui aiguisent la pensée. Cette position invite à voir dans chaque confrontation verbale une opportunité d'affiner ses idées. La puissance de la parole se déploie lorsque l'écoute de l'adversaire enrichit plutôt qu'elle ne menace.",
    "Mars-Jupiter":
      "L'opposition Mars-Jupiter invite à confronter la tension entre l'action personnelle et l'expansion collective. L'énergie peut se disperser dans des entreprises trop ambitieuses ou se projeter sur des figures d'autorité idéalisées. Cette position tend vers un apprentissage de la juste mesure entre audace et sagesse. La puissance se déploie lorsque l'action est guidée par une vision qui dépasse l'ego sans le nier.",
    "Mars-Saturne":
      "L'opposition Mars-Saturne suggère une tension profonde entre l'élan d'action et les obstacles, entre le désir d'avancer et la nécessité de structurer. La frustration peut être intense lorsque l'énergie se heurte à des murs apparemment infranchissables. Cette position invite à transformer cette résistance en endurance stratégique qui surmonte tout. La puissance se révèle dans la patience d'un guerrier qui connaît la valeur du temps.",
    "Jupiter-Saturne":
      "L'opposition Jupiter-Saturne tend vers un balancier permanent entre l'optimisme et le réalisme, la foi et le doute. Les périodes d'expansion alternent avec des phases de contraction, créant un rythme de croissance en vagues. Cette position invite à accueillir ces oscillations comme le rythme naturel de la sagesse qui mûrit. L'accomplissement se déploie lorsque l'expansion et la contraction sont reconnues comme les deux temps d'une même respiration.",
    "Venus-Jupiter":
      "L'opposition Vénus-Jupiter invite à explorer la tension entre l'amour personnel et la générosité universelle. Les relations peuvent souffrir d'idéalisation ou d'excès de générosité qui déséquilibrent l'échange. Cette position tend vers un apprentissage de la juste mesure entre donner et recevoir, entre l'idéal et le réel. L'harmonie se déploie lorsque l'amour trouve sa grandeur dans la justesse plutôt que dans la démesure.",
    "Venus-Saturne":
      "L'opposition Vénus-Saturne suggère une tension entre le désir d'amour et la peur du rejet, entre la beauté et l'austérité. Les relations peuvent sembler exiger des sacrifices ou se heurter à des obstacles de timing et de maturité. Cette position invite à reconnaître que les murs qui séparent de l'amour sont souvent construits par soi-même. La tendresse se révèle lorsque la patience de Saturne est reconnue comme la forme la plus profonde de la dévotion.",
  },
};

// ─── DESCRIPTIONS DES SIGNES ─────────────────────────────────────────

export const signDescriptions: Record<
  string,
  { element: string; mode: string; ruler: string; description: string }
> = {
  Belier: {
    element: "Feu",
    mode: "Cardinal",
    ruler: "Mars",
    description:
      "Le Bélier ouvre le zodiaque avec l'énergie du commencement, l'impulsion première qui jaillit au printemps. Archétype du pionnier et du guerrier, il incarne le courage d'exister, la volonté pure d'initier sans attendre. Sa quête fondamentale est celle de l'identité à travers l'action.",
  },
  Taureau: {
    element: "Terre",
    mode: "Fixe",
    ruler: "Vénus",
    description:
      "Le Taureau incarne la stabilité féconde de la terre au printemps, la patience de celui qui sait que les fruits mûrissent à leur propre rythme. Archétype du bâtisseur et de l'artisan, il cherche la valeur durable, la beauté tangible et la sécurité sensorielle. Sa quête fondamentale est celle de la substance et du sens de la permanence.",
  },
  Gemeaux: {
    element: "Air",
    mode: "Mutable",
    ruler: "Mercure",
    description:
      "Les Gémeaux incarnent le mouvement de l'esprit qui tisse des liens entre les fragments du monde. Archétype du messager et du conteur, ils cherchent à nommer, comprendre et connecter toute chose avec une curiosité insatiable. Leur quête fondamentale est celle de la compréhension par l'échange et la multiplicité des points de vue.",
  },
  Cancer: {
    element: "Eau",
    mode: "Cardinal",
    ruler: "Lune",
    description:
      "Le Cancer porte en lui les eaux matricielles de la mémoire et de l'attachement premier. Archétype de la mère et du gardien du foyer, il incarne la puissance de la sensibilité, la force protectrice de l'amour et la richesse de la vie intérieure. Sa quête fondamentale est celle de l'appartenance et de la sécurité émotionnelle.",
  },
  Lion: {
    element: "Feu",
    mode: "Fixe",
    ruler: "Soleil",
    description:
      "Le Lion porte la flamme solaire de la créativité et de l'expression joyeuse de soi. Archétype du roi et de l'artiste, il incarne le courage de briller, la générosité du coeur et la noblesse de l'âme qui ose se montrer. Sa quête fondamentale est celle de la reconnaissance de sa lumière unique au service de l'amour.",
  },
  Vierge: {
    element: "Terre",
    mode: "Mutable",
    ruler: "Mercure",
    description:
      "La Vierge incarne l'intelligence du discernement et l'art sacré du service attentif au monde. Archétype de l'artisan et du guérisseur, elle cherche la perfection dans le détail et la pureté fonctionnelle des systèmes. Sa quête fondamentale est celle de l'utilité et de la mise en ordre du chaos au service du vivant.",
  },
  Balance: {
    element: "Air",
    mode: "Cardinal",
    ruler: "Vénus",
    description:
      "La Balance inaugure l'automne avec le souci de l'équilibre, de la beauté et de la justice dans les relations humaines. Archétype du diplomate et de l'esthète, elle cherche l'harmonie entre les contraires et la grâce du compromis éclairé. Sa quête fondamentale est celle du juste rapport entre soi et l'autre, entre le beau et le vrai.",
  },
  Scorpion: {
    element: "Eau",
    mode: "Fixe",
    ruler: "Pluton",
    description:
      "Le Scorpion plonge dans les profondeurs de l'existence là où la plupart n'osent pas regarder. Archétype de l'alchimiste et du phénix, il incarne la puissance de la transformation, la mort et la renaissance comme processus de vérité. Sa quête fondamentale est celle de l'authenticité absolue, conquise à travers l'exploration de l'ombre.",
  },
  Sagittaire: {
    element: "Feu",
    mode: "Mutable",
    ruler: "Jupiter",
    description:
      "Le Sagittaire incarne la flèche de l'esprit qui vise toujours plus haut et plus loin. Archétype de l'explorateur et du philosophe, il cherche le sens ultime de l'existence à travers le voyage, l'enseignement et la quête de vérité. Sa quête fondamentale est celle de la sagesse qui naît de l'aventure vécue.",
  },
  Capricorne: {
    element: "Terre",
    mode: "Cardinal",
    ruler: "Saturne",
    description:
      "Le Capricorne gravit sa montagne avec la patience du temps lui-même, incarnant la maîtrise et la responsabilité. Archétype du sage et du bâtisseur, il cherche la structure durable, l'intégrité et l'accomplissement qui laisse une empreinte. Sa quête fondamentale est celle de la maîtrise de soi au service d'une oeuvre qui transcende l'individu.",
  },
  Verseau: {
    element: "Air",
    mode: "Fixe",
    ruler: "Uranus",
    description:
      "Le Verseau porte la vision du futur et le souffle de la liberté qui refuse de se conformer. Archétype du visionnaire et du réformateur, il cherche à libérer la pensée des carcans du passé pour inventer demain. Sa quête fondamentale est celle de l'authenticité individuelle au service de la fraternité universelle.",
  },
  Poissons: {
    element: "Eau",
    mode: "Mutable",
    ruler: "Neptune",
    description:
      "Les Poissons ferment le cycle zodiacal avec la dissolution des frontières et le retour à l'océan primordial de la conscience. Archétype du mystique et du poète, ils incarnent la compassion universelle et la perception de l'unité derrière la diversité. Leur quête fondamentale est celle de la réunion avec le tout, la transcendance par l'amour inconditionnel.",
  },
};

// ─── DESCRIPTIONS DES MAISONS ────────────────────────────────────────

export const houseDescriptions: Record<
  number,
  { name: string; domain: string; description: string }
> = {
  1: {
    name: "Maison I — L'Ascendant",
    domain: "Identité, apparence, premiers pas dans le monde",
    description:
      "La maison I est le seuil entre l'invisible et le visible, le masque premier que l'on offre au monde. Elle révèle la manière dont on arrive dans chaque situation nouvelle, le véhicule corporel et psychique à travers lequel l'âme s'exprime. C'est le point de départ de toute l'aventure du thème.",
  },
  2: {
    name: "Maison II — Les Ressources",
    domain: "Valeurs, finances, talents, rapport à la matière",
    description:
      "La maison II explore le territoire des valeurs et des ressources que l'être porte en lui et développe. Elle parle du rapport à l'argent, aux possessions et à l'estime de soi comme expressions de ce qui a véritablement de la valeur. C'est le sol fertile où l'on plante les graines de sa sécurité intérieure.",
  },
  3: {
    name: "Maison III — La Communication",
    domain: "Parole, apprentissages, environnement proche, fratrie",
    description:
      "La maison III est le carrefour des échanges quotidiens, des mots et des pensées qui tissent le lien avec l'environnement immédiat. Elle révèle le style de communication, le rapport aux frères et soeurs et la manière dont l'esprit appréhende le monde par la curiosité. C'est l'atelier de l'intelligence en mouvement.",
  },
  4: {
    name: "Maison IV — Les Racines",
    domain: "Foyer, famille, fondations psychiques, mère",
    description:
      "La maison IV est le fondement invisible sur lequel repose tout l'édifice de l'existence. Elle explore les racines familiales, le foyer intérieur et la relation à la mère comme matrice de la sécurité émotionnelle. C'est le sanctuaire intime où l'on se retire pour retrouver son essence.",
  },
  5: {
    name: "Maison V — La Création",
    domain: "Expression créatrice, enfants, amours, plaisirs, jeu",
    description:
      "La maison V est la scène où l'être déploie sa joie de vivre, sa créativité et sa capacité à aimer avec passion. Elle parle des enfants (biologiques et symboliques), des amours qui enflamment le coeur et du jeu comme expression de la force vitale. C'est le théâtre de la vie où l'on ose briller.",
  },
  6: {
    name: "Maison VI — Le Service",
    domain: "Travail quotidien, santé, routines, perfectionnement",
    description:
      "La maison VI est l'atelier du quotidien où l'on polit les routines, entretient le corps et met ses compétences au service du monde. Elle révèle le rapport au travail, à la santé et à la discipline comme formes d'amour envers la vie concrète. C'est le creuset de la maîtrise qui se forge dans l'humble répétition.",
  },
  7: {
    name: "Maison VII — Le Partenaire",
    domain: "Relations, mariage, associations, l'Autre comme miroir",
    description:
      "La maison VII est le miroir relationnel par excellence, l'espace où l'on découvre qui l'on est à travers l'autre. Elle explore le partenariat, le mariage et toute forme d'engagement qui demande de concilier le je et le nous. C'est le territoire de l'art de la relation, avec ses défis et ses grâces.",
  },
  8: {
    name: "Maison VIII — La Transformation",
    domain: "Crises, mort symbolique, sexualité, ressources partagées",
    description:
      "La maison VIII est le creuset alchimique où les processus de mort et de renaissance transforment l'être en profondeur. Elle explore la sexualité, les crises existentielles et le rapport aux ressources partagées avec l'autre. C'est le territoire de l'ombre fertile où se cachent les plus grands trésors psychiques.",
  },
  9: {
    name: "Maison IX — La Quête",
    domain: "Philosophie, voyages, enseignement, sens de la vie",
    description:
      "La maison IX est l'horizon lointain qui appelle l'âme à s'élever au-delà du connu. Elle explore la quête de sens, les voyages (géographiques et intérieurs), l'enseignement et les systèmes de croyances qui donnent un cadre à l'existence. C'est la flèche tirée vers la compréhension ultime de la vie.",
  },
  10: {
    name: "Maison X — La Vocation",
    domain: "Carrière, mission de vie, réputation, père",
    description:
      "La maison X est le sommet visible de l'existence, le lieu où l'on laisse sa marque dans le monde. Elle révèle la vocation profonde, la relation au père et la manière dont on assume son autorité et sa responsabilité sociale. C'est le pic de la montagne vers lequel toute la vie aspire secrètement.",
  },
  11: {
    name: "Maison XI — Le Collectif",
    domain: "Amitiés, groupes, idéaux, projets futurs",
    description:
      "La maison XI est le réseau vivant des amitiés, des idéaux partagés et des projets qui dépassent l'individu. Elle explore le rapport au groupe, les aspirations sociales et la capacité à contribuer au futur collectif. C'est l'espace de la fraternité créatrice où la singularité enrichit le tout.",
  },
  12: {
    name: "Maison XII — L'Invisible",
    domain: "Inconscient, spiritualité, solitude, transcendance",
    description:
      "La maison XII est l'océan de l'inconscient collectif, le territoire de l'invisible où l'âme se dissout et se régénère. Elle explore la spiritualité, les retraites, les épreuves cachées et la connexion avec le numineux. C'est le silence fécond qui précède le recommencement du cycle, la matrice d'où naîtra un nouvel Ascendant.",
  },
};

// ─── HELPER FUNCTION ─────────────────────────────────────────────────

export function getInterpretation(
  planet: string,
  sign: string,
  house: number | undefined,
  preferences: { tone: number; depth: number; focus: number }
): string {
  const { tone, depth, focus } = preferences;

  // Récupérer les textes de base
  const signText = planetInSign[planet]?.[sign] ?? "";
  const houseText =
    house !== undefined ? planetInHouse[planet]?.[house] ?? "" : "";

  if (!signText && !houseText) {
    return `Aucune interprétation disponible pour ${planet} en ${sign}.`;
  }

  const parts: string[] = [];

  // ── Tone: contexte astronomique (bas) ou archétypal (haut) ──

  if (tone <= 3) {
    const astroContext: Record<string, string> = {
      Soleil:
        "Le Soleil, notre étoile centrale, représente en astronomie le coeur gravitationnel autour duquel tout s'organise.",
      Lune: "La Lune, seul satellite naturel de la Terre, influence les marées et les rythmes biologiques de notre planète.",
      Mercure:
        "Mercure, la planète la plus proche du Soleil, effectue sa révolution en seulement 88 jours terrestres.",
      Venus:
        "Vénus, souvent appelée l'étoile du berger, brille avec un éclat incomparable dans le ciel crépusculaire.",
      Mars: "Mars, la planète rouge, porte les traces d'un passé volcanique qui témoigne d'une énergie géologique considérable.",
      Jupiter:
        "Jupiter, la géante gazeuse, est la plus massive des planètes du système solaire, avec un diamètre onze fois celui de la Terre.",
      Saturne:
        "Saturne, reconnaissable à ses anneaux majestueux, symbolise les cycles longs avec sa révolution de 29 ans.",
      Uranus:
        "Uranus, inclinée à 98 degrés sur son axe, tourne littéralement sur le côté, défiant les conventions planétaires.",
      Neptune:
        "Neptune, la plus lointaine des planètes, baigne dans une atmosphère d'un bleu profond chargé de méthane.",
      Pluton:
        "Pluton, bien que reclassée en planète naine, continue de fasciner par son orbite excentrique et son rôle symbolique.",
      "Noeud Nord":
        "Le Noeud Nord lunaire correspond au point d'intersection entre l'orbite de la Lune et le plan de l'écliptique.",
    };
    const ctx = astroContext[planet];
    if (ctx) {
      parts.push(ctx);
    }
  } else if (tone >= 8) {
    const archetypeContext: Record<string, string> = {
      Soleil:
        "Dans la tradition archétypale, le Soleil incarne le Héros intérieur, la quête de lumière propre et d'individuation que Jung décrivait comme le processus central de la psyché.",
      Lune: "La Lune porte l'archétype de la Grande Mère, gardienne des eaux de l'inconscient et du rythme cyclique de la vie émotionnelle.",
      Mercure:
        "Mercure-Hermès, le messager ailé, incarne l'archétype du Trickster et du Psychopompe, celui qui traverse les frontières entre les mondes.",
      Venus:
        "Vénus-Aphrodite porte l'archétype de l'Anima, le principe d'attraction et de beauté qui relie toutes les formes de la création.",
      Mars: "Mars-Arès incarne l'archétype du Guerrier, la force primordiale qui protège, conquiert et affirme le droit d'exister.",
      Jupiter:
        "Jupiter-Zeus porte l'archétype du Roi Sage, le principe d'expansion qui élargit la conscience au-delà des limites connues.",
      Saturne:
        "Saturne-Chronos incarne l'archétype du Vieux Sage, le gardien du seuil qui exige la maturité comme prix de passage.",
      Uranus:
        "Uranus-Ouranos porte l'archétype du Porteur de Feu, l'éclair prométhéen qui éveille la conscience à des réalités insoupçonnées.",
      Neptune:
        "Neptune-Poséidon incarne l'archétype du Mystique, l'appel de l'océan primordial qui dissout les frontières de l'ego.",
      Pluton:
        "Pluton-Hadès porte l'archétype de l'Alchimiste des profondeurs, le seigneur des morts qui préside à toute transformation radicale.",
      "Noeud Nord":
        "Le Noeud Nord incarne l'archétype du Sentier de l'Âme, la direction évolutive que la psyché cherche à accomplir dans cette incarnation.",
    };
    const ctx = archetypeContext[planet];
    if (ctx) {
      parts.push(ctx);
    }
  }

  // ── Depth: texte concis ou complet ──

  if (depth <= 3) {
    const sentences = signText.split(". ").filter((s) => s.length > 0);
    const concise =
      sentences.length > 0
        ? sentences.slice(0, 2).join(". ") +
          (sentences[1] && !sentences[1].endsWith(".") ? "." : "")
        : signText;
    parts.push(concise);
  } else if (depth <= 6) {
    parts.push(signText);
  } else {
    parts.push(signText);
    if (houseText) {
      parts.push(houseText);
    }
  }

  // ── Focus: conseils pratiques (bas) ou réflexion psychologique (haut) ──

  if (focus <= 3 && signText) {
    const practicalAdvice: Record<string, string> = {
      Soleil:
        "Sur le plan concret, explorer des activités qui nourrissent le sentiment de vitalité et d'expression personnelle peut être particulièrement bénéfique.",
      Lune: "Au quotidien, porter attention aux rituels de confort, aux besoins de repos et aux environnements qui procurent un sentiment de sécurité peut grandement nourrir le bien-être.",
      Mercure:
        "En pratique, cultiver des activités d'écriture, de lecture ou d'échange régulier permet de nourrir et de structurer cette intelligence naturelle.",
      Venus:
        "Au niveau concret, s'entourer de beauté, cultiver des moments de plaisir partagé et entretenir ses liens affectifs nourrit directement l'harmonie intérieure.",
      Mars: "En termes d'action, pratiquer un sport ou un art martial, s'engager dans des projets qui demandent du courage et de l'initiative permet de canaliser cette énergie.",
      Jupiter:
        "Sur le plan pratique, voyager, étudier ou enseigner sont des voies concrètes pour nourrir cette soif d'expansion et de sens.",
      Saturne:
        "En pratique, établir des objectifs réalistes à long terme, cultiver la discipline et célébrer les petites victoires permet d'apprivoiser cette exigence intérieure.",
      Uranus:
        "Concrètement, s'autoriser à explorer des voies non conventionnelles, à innover dans son domaine et à fréquenter des esprits libres nourrit cette énergie.",
      Neptune:
        "Au quotidien, pratiquer la méditation, cultiver l'art sous toutes ses formes et s'accorder des moments de solitude régénératrice soutient cette sensibilité.",
      Pluton:
        "En pratique, la thérapie, le travail sur les émotions profondes et l'exploration des schémas inconscients offrent des outils précieux pour accompagner cette transformation.",
      "Noeud Nord":
        "Concrètement, identifier les situations de vie qui poussent hors de la zone de confort et les embrasser consciemment accélère le cheminement évolutif.",
    };
    const advice = practicalAdvice[planet];
    if (advice) {
      parts.push(advice);
    }
  } else if (focus >= 8 && signText) {
    const psychReflection: Record<string, string> = {
      Soleil:
        "D'un point de vue psychologique, ce placement invite à explorer le processus d'individuation : comment l'être se différencie du collectif pour assumer pleinement sa propre lumière, sans inflation narcissique ni effacement.",
      Lune: "Sur le plan de la psyché profonde, ce placement invite à explorer le rapport à l'imago maternelle et les schémas d'attachement qui colorent toute la vie émotionnelle, ouvrant la voie à une relation plus consciente avec son enfant intérieur.",
      Mercure:
        "D'un point de vue psychologique, cette configuration invite à examiner comment la pensée sert parfois de défense contre le ressenti, et comment l'intégration de l'intelligence émotionnelle enrichit la compréhension globale.",
      Venus:
        "Sur le plan de la psyché profonde, ce placement invite à explorer la projection de l'Anima ou de l'Animus dans les relations, et à comprendre comment ce que l'on cherche chez l'autre révèle ce qui demande à être intégré en soi.",
      Mars: "D'un point de vue psychologique, cette configuration invite à examiner la relation à l'agressivité, à la colère et à la pulsion de vie, en explorant comment la force brute peut devenir un allié de l'individuation.",
      Jupiter:
        "Sur le plan de la psyché profonde, ce placement invite à explorer le rapport à l'inflation, au sens du destin et à la tendance à chercher le salut dans l'expansion plutôt que dans l'approfondissement.",
      Saturne:
        "D'un point de vue psychologique, cette configuration invite à examiner le complexe paternel, la relation à l'autorité intérieure et la manière dont les limitations deviennent des structures de maturité.",
      Uranus:
        "Sur le plan de la psyché profonde, ce placement invite à explorer la tension entre le besoin d'appartenance et le besoin d'individuation, entre la conformité qui rassure et l'authenticité qui libère.",
      Neptune:
        "D'un point de vue psychologique, cette configuration invite à examiner les mécanismes de projection idéaliste, la tendance à la fusion et la frontière subtile entre compassion authentique et codépendance.",
      Pluton:
        "Sur le plan de la psyché profonde, ce placement invite à explorer le rapport à l'ombre jungienne, les dynamiques de pouvoir inconscientes et le processus de mort-renaissance comme voie royale de l'individuation.",
      "Noeud Nord":
        "D'un point de vue psychologique, cette configuration invite à examiner les schémas répétitifs hérités qui offrent un confort trompeur, et à trouver le courage d'avancer vers le territoire inconnu de la croissance.",
    };
    const reflection = psychReflection[planet];
    if (reflection) {
      parts.push(reflection);
    }
  }

  return parts.join("\n\n");
}
