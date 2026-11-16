/**
 * Guides pratiques du site (page /guides) : contenu éditorial pensé pour répondre aux questions que les clients
 * posent avant d'acheter (batterie lithium ou gel, délestage, quelle installation choisir, moto électrique).
 * Les chiffres sont des ordres de grandeur, jamais des promesses : la garantie du fabricant et l'étude personnalisée font foi.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][]; note?: string }
  | { type: "tip"; title: string; text: string };

export type Guide = {
  slug: string;
  title: string;
  /** Description pour les résultats de recherche (≈ 155 caractères). */
  description: string;
  excerpt: string;
  eyebrow: string;
  published: string;
  updated: string;
  minutes: number;
  intro: string;
  sections: { h2: string; blocks: Block[] }[];
  faq: { q: string; a: string }[];
  cta: { title: string; text: string; label: string; href: string };
  related: string[];
};

export const guides: Guide[] = [
  {
    slug: "batterie-lithium-ou-gel",
    title: "Batterie lithium ou gel : laquelle choisir pour votre installation solaire ?",
    description: "Lithium ou gel ? Prix, durée de vie, entretien, usage au quotidien : le comparatif simple pour choisir la bonne batterie solaire à Madagascar.",
    excerpt: "Prix d'achat, durée de vie, capacité réellement utilisable : ce qui compte pour choisir entre une batterie gel et une batterie lithium.",
    eyebrow: "Batteries",
    published: "2026-11-16",
    updated: "2026-11-16",
    minutes: 6,
    intro:
      "La batterie est le cœur d'une installation solaire avec stockage : c'est elle qui garde l'électricité pour la nuit ou pour les coupures du réseau. Deux technologies dominent : la batterie gel, économique, et la batterie lithium, plus chère mais plus durable. Voici comment choisir sans vous tromper.",
    sections: [
      {
        h2: "À quoi sert la batterie dans une installation solaire ?",
        blocks: [
          { type: "p", text: "La batterie stocke l'électricité produite par vos panneaux pendant la journée, ou prise sur le réseau quand il fonctionne, pour la restituer quand vous en avez besoin : le soir, la nuit, ou pendant un délestage." },
          { type: "p", text: "Sa capacité (en Wh ou en kWh) décide combien de temps vos appareils tiennent sans courant. Avec l'onduleur, elle décide aussi la puissance que vous pouvez utiliser en même temps." },
        ],
      },
      {
        h2: "La batterie gel : l'option économique",
        blocks: [
          { type: "p", text: "La batterie gel est une batterie au plomb scellée, sans entretien. C'est une technologie éprouvée, vendue depuis longtemps pour le solaire." },
          {
            type: "ul",
            items: [
              "Prix d'achat plus bas : pratique pour démarrer avec un budget serré.",
              "Sans entretien : pas d'eau à rajouter, boîtier scellé.",
              "Plus lourde et plus volumineuse à capacité égale.",
              "On évite de la décharger à fond : en pratique, on n'exploite qu'environ la moitié de sa capacité pour ne pas l'user trop vite.",
              "Durée de vie plus courte, et sensible à la chaleur et aux décharges profondes répétées.",
            ],
          },
        ],
      },
      {
        h2: "La batterie lithium : l'option longue durée",
        blocks: [
          { type: "p", text: "La batterie lithium (le plus souvent lithium fer phosphate pour le solaire) coûte plus cher à l'achat, mais elle compense sur la durée. Elle est protégée par un système électronique, le BMS, qui surveille chaque cellule." },
          {
            type: "ul",
            items: [
              "Capacité exploitable beaucoup plus grande : souvent 80 % ou plus de la capacité annoncée.",
              "Très grand nombre de cycles de charge, donc des années de service en plus.",
              "Légère et compacte : plus simple à installer.",
              "Recharge plus rapide, ce qui compte quand les coupures reviennent souvent.",
              "Aucun entretien régulier.",
            ],
          },
        ],
      },
      {
        h2: "Comparatif en un coup d'œil",
        blocks: [
          {
            type: "table",
            head: ["", "Batterie gel", "Batterie lithium"],
            rows: [
              ["Prix d'achat", "Plus bas", "Plus élevé"],
              ["Capacité réellement utilisable", "Environ la moitié", "Souvent 80 % ou plus"],
              ["Durée de vie", "Quelques années", "Souvent plus de dix ans"],
              ["Poids et volume", "Lourde, volumineuse", "Légère, compacte"],
              ["Entretien", "Aucun (scellée)", "Aucun"],
              ["Vitesse de recharge", "Plus lente", "Plus rapide"],
            ],
            note: "Ordres de grandeur, qui varient selon la marque, la température et l'usage. La garantie du fabricant donne l'indication la plus fiable.",
          },
        ],
      },
      {
        h2: "Le vrai calcul : le coût par cycle",
        blocks: [
          { type: "p", text: "Comparer deux batteries sur le seul prix d'achat est trompeur. Ce qui compte, c'est ce que chaque batterie vous coûte pour chaque cycle de charge et de décharge pendant toute sa vie." },
          { type: "p", text: "Plus vous utilisez votre batterie souvent (maison autonome, délestages fréquents), plus le lithium devient rentable : on amortit son prix sur beaucoup de cycles. Si la batterie ne sert que quelques heures par mois, une batterie gel peut parfaitement suffire." },
        ],
      },
      {
        h2: "Quelle batterie pour quel usage ?",
        blocks: [
          {
            type: "ul",
            items: [
              "Maison 100 % autonome (une charge et une décharge chaque jour) : lithium conseillé.",
              "Anti-délestage occasionnel avec un petit budget : gel, une bonne porte d'entrée.",
              "Commerce, atelier ou bureau avec des coupures fréquentes : lithium, pour la durée de vie et la recharge rapide.",
              "Installation hybride avec réseau ou groupe électrogène : les deux sont possibles, selon le budget et l'usage prévu.",
            ],
          },
          { type: "tip", title: "Un conseil", text: "Ne mélangez jamais deux technologies dans le même parc de batteries : leurs tensions et leur façon de se recharger sont différentes. Le choix se fait une fois, avec l'onduleur." },
        ],
      },
      {
        h2: "Comment dimensionner sa batterie",
        blocks: [
          { type: "p", text: "Le principe est simple : énergie (Wh) = puissance de l'appareil (W) × nombre d'heures d'utilisation. On additionne ensuite les appareils à garder allumés pendant une coupure." },
          {
            type: "ul",
            items: [
              "5 lampes LED de 10 W pendant 4 h : 5 × 10 × 4 = 200 Wh.",
              "Un téléviseur de 80 W pendant 4 h : 80 × 4 = 320 Wh.",
              "Un réfrigérateur : demandez sa consommation sur 24 h (plaque ou notice), il ne tourne pas en continu.",
            ],
          },
          { type: "p", text: "Ajoutez une marge pour les pertes. Avec une batterie gel, prévoyez à peu près le double de capacité nominale, puisqu'on n'en exploite que la moitié. Une étude personnalisée évite de sous-dimensionner, l'erreur la plus fréquente." },
        ],
      },
    ],
    faq: [
      { q: "Quelle est la durée de vie d'une batterie solaire ?", a: "Elle dépend de la technologie, de la profondeur de décharge, de la température et de la marque. Le lithium dure en général bien plus longtemps que le gel. La garantie du fabricant donne la meilleure indication." },
      { q: "Peut-on mélanger des batteries gel et lithium ?", a: "Non. Leurs tensions et leurs profils de charge sont différents : on choisit une technologie pour tout le parc de batteries, en cohérence avec l'onduleur." },
      { q: "Une batterie de voiture peut-elle servir pour le solaire ?", a: "C'est déconseillé. Une batterie de voiture est conçue pour de courts pics de démarrage, pas pour des décharges profondes répétées : elle s'use très vite en usage solaire." },
      { q: "Faut-il entretenir une batterie solaire ?", a: "Les batteries gel (scellées) et lithium ne demandent pas d'entretien régulier. Il faut simplement les installer dans un endroit aéré et pas trop chaud, et faire vérifier les connexions lors d'une visite de contrôle." },
    ],
    cta: { title: "Besoin d'aide pour choisir ?", text: "Dites-nous quels appareils vous voulez garder allumés : nous vous conseillons la capacité et la technologie adaptées.", label: "Demander un devis", href: "/devis" },
    related: ["delestage-jirama-solutions", "quelle-installation-solaire-maison-madagascar"],
  },
  {
    slug: "delestage-jirama-solutions",
    title: "Délestage Jirama : les solutions pour garder la lumière allumée",
    description: "Coupures d'électricité et délestages à Madagascar : groupe électrogène, kit anti-délestage ou solaire hybride, comparez les solutions et choisissez la vôtre.",
    excerpt: "Groupe électrogène, onduleur et batteries, solaire hybride : trois façons de se protéger des coupures, et comment choisir.",
    eyebrow: "Délestage",
    published: "2026-11-16",
    updated: "2026-11-16",
    minutes: 5,
    intro:
      "Quand le réseau s'arrête, le réfrigérateur se réchauffe, le commerce ferme et le travail s'interrompt. Le délestage n'est pas une fatalité : il existe des solutions simples pour garder vos équipements en marche. Voici les trois principales, et comment choisir.",
    sections: [
      {
        h2: "Qu'est-ce que le délestage ?",
        blocks: [
          { type: "p", text: "Le délestage est une coupure d'électricité organisée par le gestionnaire du réseau quand la production ne suffit pas à couvrir la demande. À Madagascar, ces coupures reviennent régulièrement et leur durée varie selon les quartiers et les périodes." },
          { type: "p", text: "À côté des coupures programmées, il y a aussi les baisses et les variations de tension, qui abîment les appareils sans même que le courant s'arrête." },
        ],
      },
      {
        h2: "Ce que les coupures vous coûtent vraiment",
        blocks: [
          {
            type: "ul",
            items: [
              "Aliments perdus quand le réfrigérateur ou le congélateur s'arrête.",
              "Appareils abîmés par les retours de courant et les variations de tension.",
              "Activité interrompue : commerce, atelier, bureau, études ou télétravail.",
              "Carburant et entretien d'un groupe électrogène, quand on en utilise un.",
            ],
          },
        ],
      },
      {
        h2: "Trois façons de s'en protéger",
        blocks: [
          {
            type: "table",
            head: ["", "Groupe électrogène", "Kit anti-délestage (onduleur + batteries)", "Solaire hybride"],
            rows: [
              ["Fonctionnement", "Moteur à carburant", "Batteries rechargées sur le réseau", "Panneaux + batteries + réseau ou groupe"],
              ["Démarrage", "Manuel, ou automatique avec une brève coupure", "Bascule automatique", "Bascule automatique"],
              ["Bruit et fumées", "Oui", "Aucun", "Aucun"],
              ["Coût d'usage", "Carburant et entretien", "Électricité du réseau", "Le soleil recharge gratuitement le jour"],
              ["Autonomie", "Tant qu'il y a du carburant", "Limitée par la capacité des batteries", "Prolongée par les panneaux"],
            ],
            note: "Comparatif général. La solution adaptée dépend de vos équipements, de la durée des coupures et de votre budget.",
          },
        ],
      },
      {
        h2: "Le kit anti-délestage : la solution la plus simple",
        blocks: [
          { type: "p", text: "Un onduleur associé à des batteries bascule automatiquement dès que le courant s'arrête et garde vos équipements essentiels en marche : éclairage, ventilateur, télévision, ordinateur, box internet, réfrigérateur. Quand le réseau revient, les batteries se rechargent." },
          { type: "p", text: "C'est silencieux, sans carburant et sans rien à faire de votre côté. La durée dépend de la capacité des batteries et de la puissance de ce que vous branchez dessus." },
        ],
      },
      {
        h2: "Quand ajouter des panneaux solaires ?",
        blocks: [
          { type: "p", text: "Si les coupures sont longues ou fréquentes, ou si vous voulez aussi réduire votre facture, des panneaux solaires rechargent les batteries gratuitement pendant la journée. C'est le principe de l'installation hybride : le réseau, le soleil et les batteries se relaient automatiquement." },
          { type: "p", text: "On peut démarrer par un kit anti-délestage et le faire évoluer ensuite : l'important est de bien choisir l'onduleur dès le départ." },
        ],
      },
      {
        h2: "Penser aussi à la tension : le stabilisateur",
        blocks: [
          { type: "p", text: "Un stabilisateur de tension protège vos appareils des variations du réseau, qui les usent bien plus vite qu'une simple coupure. C'est une protection peu coûteuse, à envisager dès que vous avez des appareils sensibles : réfrigérateur, climatiseur, informatique." },
        ],
      },
      {
        h2: "Comment choisir en quatre étapes",
        blocks: [
          {
            type: "ol",
            items: [
              "Listez les équipements que vous voulez absolument garder allumés.",
              "Estimez la durée de coupure à couvrir : deux heures, une soirée, une journée.",
              "Fixez votre budget et dites si vous souhaitez aussi réduire votre facture.",
              "Faites établir un devis : la capacité des batteries et la puissance de l'onduleur se calculent à partir de ces trois points.",
            ],
          },
        ],
      },
    ],
    faq: [
      { q: "Un kit anti-délestage peut-il faire tourner un climatiseur ou un chauffe-eau électrique ?", a: "Ces appareils consomment beaucoup. Ils demandent un onduleur et un parc de batteries nettement plus importants. On conseille souvent de réserver le stockage aux usages essentiels, ou de passer à une installation hybride avec panneaux." },
      { q: "Combien de temps tiennent les batteries pendant une coupure ?", a: "À peu près : énergie utilisable des batteries (Wh) ÷ puissance de ce que vous utilisez (W). Plus vous branchez d'appareils, plus la durée diminue. L'étude personnalisée vous donne une durée précise pour votre cas." },
      { q: "Peut-on combiner groupe électrogène et solaire ?", a: "Oui, c'est l'installation hybride : le solaire et les batteries prennent le relais du réseau, et un groupe électrogène peut compléter lors des longues périodes sans soleil, avec une gestion automatique des sources." },
      { q: "Le groupe électrogène est-il encore utile avec des batteries ?", a: "Il peut servir de secours pour des coupures très longues ou des charges très lourdes. Pour la majorité des usages quotidiens, des batteries suffisent, sans bruit ni carburant." },
    ],
    cta: { title: "Dites-nous ce que vous voulez garder allumé", text: "Nous dimensionnons le kit anti-délestage ou l'installation hybride adapté à votre maison, votre commerce ou votre entreprise.", label: "Demander un devis anti-délestage", href: "/devis" },
    related: ["batterie-lithium-ou-gel", "quelle-installation-solaire-maison-madagascar"],
  },
  {
    slug: "quelle-installation-solaire-maison-madagascar",
    title: "Quelle installation solaire choisir pour une maison à Madagascar ?",
    description: "100 % autonome, hybride, on-grid ou anti-délestage : le guide pour choisir l'installation solaire adaptée à votre maison, votre commerce ou votre entreprise.",
    excerpt: "Autonome, hybride, on-grid, anti-délestage : à chaque situation sa solution, et ce qu'il faut préparer pour obtenir un devis juste.",
    eyebrow: "Installation solaire",
    published: "2026-11-16",
    updated: "2026-11-16",
    minutes: 6,
    intro:
      "Il n'existe pas une seule installation solaire, mais plusieurs familles de solutions. Le bon choix dépend de votre situation : raccordé ou non au réseau, coupures fréquentes ou rares, objectif de réduire la facture ou de ne plus dépendre du réseau. Ce guide vous aide à vous repérer.",
    sections: [
      {
        h2: "Les grandes familles d'installation",
        blocks: [
          {
            type: "ul",
            items: [
              "100 % autonome : panneaux, batteries et onduleurs dimensionnés pour une électricité sans réseau, sans coupures et sans facture mensuelle.",
              "Hybride : le solaire et les batteries s'associent au réseau ou à un groupe électrogène, avec une gestion automatique des sources.",
              "On-grid : une centrale raccordée au réseau pour produire et consommer sur place et alléger la facture, idéale pour les entreprises et les commerces déjà raccordés.",
              "Anti-délestage : un kit de batteries qui bascule automatiquement et garde les équipements en marche pendant les coupures.",
              "Accès à l'eau : chauffe-eau solaire et pompe immergée solaire, pour l'eau chaude et l'approvisionnement en eau sans réseau ni carburant.",
            ],
          },
        ],
      },
      {
        h2: "Choisir selon votre situation",
        blocks: [
          {
            type: "table",
            head: ["Votre situation", "La solution qui correspond"],
            rows: [
              ["Pas de réseau, ou envie de ne plus en dépendre", "100 % autonome"],
              ["Réseau instable, petit à moyen budget", "Anti-délestage"],
              ["Réseau avec coupures, et envie de réduire la facture", "Hybride"],
              ["Entreprise ou commerce raccordé, forte consommation de jour", "On-grid"],
              ["Besoin d'eau chaude ou de pompage", "Chauffe-eau solaire, pompe solaire"],
            ],
            note: "Une visite technique confirme le bon choix : consommation réelle, toiture, tableau électrique, type de raccordement.",
          },
        ],
      },
      {
        h2: "Ce qui fait varier le budget",
        blocks: [
          {
            type: "ul",
            items: [
              "Votre consommation : plus vous voulez couvrir d'équipements, plus l'installation est importante.",
              "La puissance de l'onduleur, qui décide ce que vous pouvez utiliser en même temps.",
              "La capacité des batteries, et leur technologie (gel ou lithium).",
              "Le nombre de panneaux et la façon de les fixer (toiture, structure au sol).",
              "Les options : suivi à distance, connexion au réseau.",
            ],
          },
        ],
      },
      {
        h2: "Le déroulement d'un projet",
        blocks: [
          {
            type: "ol",
            items: [
              "Étude personnalisée : une pré-analyse gratuite de vos besoins et de votre consommation.",
              "Visite technique et devis détaillé, avec une projection de la production solaire.",
              "Installation par des techniciens.",
              "Mise en service, formation à l'usage et suivi en temps réel.",
              "Garantie et maintenance : une garantie pouvant aller jusqu'à 10 ans sur le matériel et la pose.",
            ],
          },
        ],
      },
      {
        h2: "Ce qu'il faut préparer pour un devis juste",
        blocks: [
          {
            type: "ul",
            items: [
              "Vos dernières factures d'électricité (les trois dernières pour une société).",
              "La liste des équipements à alimenter, avec leur puissance si vous la connaissez.",
              "Le type de logement ou de site, et sa surface de toiture disponible.",
              "Le type d'alimentation (monophasé ou triphasé) et l'état de la mise à la terre.",
              "Votre objectif : économiser, vous protéger des coupures, devenir autonome.",
            ],
          },
          { type: "tip", title: "Bon à savoir", text: "Pas besoin d'avoir toutes les réponses : le formulaire de devis vous guide pas à pas, et notre équipe complète lors de l'étude." },
        ],
      },
      {
        h2: "Les erreurs à éviter",
        blocks: [
          {
            type: "ul",
            items: [
              "Sous-dimensionner les batteries, puis se retrouver sans courant à 22 h.",
              "Négliger la mise à la terre et la protection contre les surtensions.",
              "Acheter des composants séparément, sans vérifier leur compatibilité avec l'onduleur.",
              "Oublier le stabilisateur de tension pour les appareils sensibles.",
              "Choisir du matériel sans garantie ni service après-vente sur place.",
            ],
          },
        ],
      },
    ],
    faq: [
      { q: "Faut-il être connecté au réseau pour installer du solaire ?", a: "Non. Une installation 100 % autonome fonctionne sans réseau. Les solutions hybride, on-grid et anti-délestage, elles, s'appuient sur un raccordement existant." },
      { q: "Combien de temps dure l'installation ?", a: "Cela dépend de la taille du projet. La visite technique permet de donner un calendrier précis, de la livraison du matériel à la mise en service." },
      { q: "Peut-on agrandir l'installation plus tard ?", a: "Souvent oui, à condition d'avoir prévu un onduleur et un câblage qui le permettent. C'est un point à discuter dès l'étude, pour démarrer petit sans se bloquer ensuite." },
      { q: "Le solaire fonctionne-t-il quand il pleut ?", a: "Oui, avec une production réduite. Les batteries et la gestion automatique des sources assurent la continuité, c'est justement leur rôle." },
    ],
    cta: { title: "Recevez un devis adapté à votre situation", text: "Particulier ou société, décrivez votre besoin : notre équipe l'étudie et vous répond.", label: "Demander un devis", href: "/devis" },
    related: ["delestage-jirama-solutions", "batterie-lithium-ou-gel"],
  },
  {
    slug: "moto-electrique-madagascar-guide",
    title: "Moto électrique à Madagascar : ce qu'il faut savoir avant d'acheter",
    description: "Autonomie, recharge, batterie lithium ou graphène, usage en ville ou en livraison : le guide pour bien choisir sa moto ou son scooter électrique à Madagascar.",
    excerpt: "Autonomie, recharge, lithium ou graphène, modèle selon votre usage : les bonnes questions avant d'acheter un scooter électrique.",
    eyebrow: "Mobilité électrique",
    published: "2026-11-16",
    updated: "2026-11-16",
    minutes: 6,
    intro:
      "Plus de carburant à acheter, très peu d'entretien, un moteur silencieux : la moto électrique séduit de plus en plus à Madagascar. Encore faut-il choisir le bon modèle et la bonne batterie. Voici les points à vérifier avant d'acheter.",
    sections: [
      {
        h2: "Pourquoi passer à la moto électrique ?",
        blocks: [
          {
            type: "ul",
            items: [
              "Plus de carburant : on recharge sur une prise, chez soi ou au travail.",
              "Moins d'entretien : pas de vidange, de bougies ni de filtre à changer.",
              "Silencieuse et agréable en ville, avec une reprise franche dès le démarrage.",
              "Un budget d'usage plus facile à prévoir, puisqu'on connaît le prix de l'électricité.",
            ],
          },
        ],
      },
      {
        h2: "Lire une fiche technique : puissance, vitesse, autonomie",
        blocks: [
          {
            type: "ul",
            items: [
              "Puissance du moteur (en W) : elle décide de la reprise et de la capacité à charger du poids ou à monter une côte.",
              "Vitesse maximale : à comparer avec vos trajets habituels.",
              "Autonomie (en km) : la distance annoncée dépend de la charge transportée, de la vitesse et du relief. Gardez une marge.",
              "Capacité de la batterie (par exemple 28A 74V) : plus elle est élevée, plus l'autonomie est grande.",
              "Temps de charge : indiqué sur chaque fiche, à comparer avec la durée pendant laquelle le scooter reste branché.",
            ],
          },
        ],
      },
      {
        h2: "Batterie lithium ou graphène ?",
        blocks: [
          { type: "p", text: "Les scooters Ecooter existent avec deux technologies de batterie. Elles se choisissent selon votre usage et votre budget." },
          {
            type: "table",
            head: ["", "Lithium", "Graphène"],
            rows: [
              ["Forces", "Légère et compacte, longue durée de vie, recharge rapide", "Robustesse, performance et budget maîtrisé"],
              ["Entretien", "Minimal, batterie protégée par un système BMS", "Minimal"],
              ["Pour qui ?", "Usage quotidien intensif, recharge rapide entre deux trajets", "Usage régulier avec un budget plus serré"],
            ],
            note: "Retrouvez le détail de chaque technologie sur nos pages Ecooter lithium et Ecooter graphène.",
          },
        ],
      },
      {
        h2: "Recharger au quotidien",
        blocks: [
          { type: "p", text: "Une moto électrique se recharge sur une prise domestique. Pour estimer le coût d'une charge, multipliez l'énergie de la batterie (en kWh) par le prix du kWh sur votre facture d'électricité." },
          { type: "p", text: "Si vous avez des panneaux solaires, vous pouvez recharger en journée avec votre propre production : la mobilité devient alors presque gratuite. C'est une des raisons pour lesquelles Prowatt propose à la fois le solaire et les scooters Ecooter." },
        ],
      },
      {
        h2: "Quel modèle selon votre usage ?",
        blocks: [
          {
            type: "table",
            head: ["Votre usage", "Le modèle qui s'en approche"],
            rows: [
              ["Confort et style en ville", "Ecooter AURA"],
              ["Livraison et terrain, usage professionnel", "Ecooter CARGOX"],
              ["Actifs pressés et connectés", "Ecooter ALTA"],
              ["Tout sans compromis", "Ecooter VOLTIS"],
              ["Petits trajets du quotidien", "Ecooter VIA Lite"],
              ["Bon compromis budget / liberté urbaine", "Ecooter NOVA lite"],
            ],
            note: "Chaque modèle a sa fiche détaillée, avec ses caractéristiques et ses options de couleur.",
          },
        ],
      },
      {
        h2: "Les questions à poser avant d'acheter",
        blocks: [
          {
            type: "ol",
            items: [
              "Quelle est la garantie sur la moto et sur la batterie ?",
              "Quelle technologie de batterie, et quelle capacité ?",
              "Quel est le temps de charge complet ?",
              "La charge maximale couvre-t-elle votre usage (passager, livraison) ?",
              "Y a-t-il un service après-vente et des pièces disponibles sur place ?",
              "Puis-je l'essayer avant de décider ?",
            ],
          },
        ],
      },
    ],
    faq: [
      { q: "Combien de temps faut-il pour recharger une moto électrique ?", a: "Le temps de charge est indiqué sur la fiche de chaque modèle. En général, une charge complète se fait en quelques heures, ce qui permet de recharger la nuit ou pendant la journée de travail." },
      { q: "Quelle est la durée de vie de la batterie ?", a: "Elle dépend de la technologie, de l'usage et de la façon de la recharger. Le lithium offre en général une durée de vie plus longue. Renseignez-vous toujours sur la garantie de la batterie." },
      { q: "Peut-on recharger une moto électrique avec des panneaux solaires ?", a: "Oui. Avec une installation adaptée, vous rechargez avec l'électricité que vous produisez vous-même. C'est une façon d'avoir des trajets quasi gratuits." },
      { q: "Peut-on acheter une moto électrique Ecooter en ligne ?", a: "Les modèles affichés avec un prix s'achètent directement dans la boutique. Pour les autres, une fiche dédiée détaille le modèle et vous pouvez demander le prix ou un essai." },
    ],
    cta: { title: "Découvrez nos scooters Ecooter", text: "Plusieurs modèles et deux technologies de batterie : trouvez celui qui correspond à vos trajets.", label: "Voir les modèles Ecooter", href: "/ecooter" },
    related: ["batterie-lithium-ou-gel", "quelle-installation-solaire-maison-madagascar"],
  },
];

export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug);
