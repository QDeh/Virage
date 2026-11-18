export const steps = [
  "Profil",
  "Centres d’intérêt",
  "Préférences",
  "Résultats",
  "Analyse",
  "Parcours",
  "Formations",
];
export const interests = [
  "Informatique",
  "Jeux vidéo",
  "Bricolage",
  "Mécanique",
  "Formation",
  "Communication",
  "Gestion",
  "Marketing",
  "Finance",
  "Commerce",
  "Ressources humaines",
  "Santé",
  "Logistique",
  "Administration",
  "Relation client",
  "Éducation",
];
export const jobs = [
  {
    id: "support",
    title: "Technicien Support IT",
    category: "Informatique & numérique",
    score: 89,
    description:
      "Accompagnez les utilisateurs au quotidien et résolvez leurs problèmes informatiques.",
    reason:
      "Votre expérience de la relation client, votre sens de l’écoute et votre capacité à résoudre des problèmes sont de vrais atouts pour le support informatique.",
    skills: ["Réseaux", "Active Directory", "Windows Server", "ITIL"],
    duration: 6,
    tags: ["Relation client", "Résolution de problèmes"],
    salary: "24–32 k€ / an",
  },
  {
    id: "trainer",
    title: "Formateur Numérique",
    category: "Formation & accompagnement",
    score: 84,
    description:
      "Transmettez vos connaissances et accompagnez chacun dans ses usages numériques.",
    reason:
      "Vos qualités de communication et votre pédagogie peuvent se transformer en compétences de formation. Votre expérience vous aide à comprendre les besoins des apprenants.",
    skills: [
      "Ingénierie pédagogique",
      "Animation de groupe",
      "Outils numériques",
      "Évaluation des acquis",
    ],
    duration: 6,
    tags: ["Pédagogie", "Communication"],
    salary: "26–35 k€ / an",
  },
  {
    id: "qa",
    title: "Testeur QA",
    category: "Informatique & numérique",
    score: 80,
    description:
      "Contribuez à la qualité des applications en testant les fonctionnalités et les usages.",
    reason:
      "Votre rigueur, votre organisation et votre connaissance des attentes des utilisateurs sont utiles pour détecter les anomalies et améliorer les produits.",
    skills: ["Plans de test", "SQL", "Tests automatisés", "Méthodes agiles"],
    duration: 6,
    tags: ["Rigueur", "Esprit d’analyse"],
    salary: "28–36 k€ / an",
  },
  {
    id: "business",
    title: "Gestionnaire Support Métier",
    category: "Gestion & organisation",
    score: 78,
    description:
      "Faites le lien entre les équipes métier et les outils qui facilitent leur quotidien.",
    reason:
      "Votre connaissance des processus et votre aisance relationnelle vous permettent d’aider les équipes à résoudre leurs difficultés opérationnelles.",
    skills: [
      "Outils métier",
      "Analyse des processus",
      "Reporting",
      "Documentation",
    ],
    duration: 4,
    tags: ["Organisation", "Accompagnement"],
    salary: "26–34 k€ / an",
  },
  {
    id: "csm",
    title: "Customer Success Manager",
    category: "Relation client & commerce",
    score: 76,
    description:
      "Aidez les clients à atteindre leurs objectifs et construisez une relation durable.",
    reason:
      "Votre expérience client est un socle pour accompagner un portefeuille et anticiper les besoins. Une montée en compétences sur les outils et indicateurs complète ce profil.",
    skills: [
      "CRM",
      "Analyse de données",
      "Stratégie de fidélisation",
      "Gestion de portefeuille",
    ],
    duration: 5,
    tags: ["Écoute", "Relation client"],
    salary: "30–42 k€ / an",
  },
];
export const strengths = [
  "Communication",
  "Gestion des incidents",
  "Relation client",
  "Organisation",
];
export const courses = [
  {
    id: "tssr",
    title: "Technicien supérieur systèmes et réseaux",
    short: "TSSR",
    provider: "AFPA",
    initials: "afpa",
    duration: "8 mois",
    level: "Bac +2",
    description:
      "Apprenez à installer, administrer et sécuriser les infrastructures informatiques d’une entreprise.",
    url: "https://www.afpa.fr/formation-qualifiante/technicien-superieur-systemes-et-reseaux",
    color: "green",
  },
  {
    id: "support",
    title: "Support informatique",
    short: "SUPPORT IT",
    provider: "OpenClassrooms",
    initials: "OC",
    duration: "6 mois",
    level: "Débutant",
    description:
      "Développez les bons réflexes pour accompagner les utilisateurs et résoudre les incidents techniques.",
    url: "https://openclassrooms.com/fr/paths",
    color: "purple",
  },
  {
    id: "admin",
    title: "Administrateur systèmes",
    short: "SYSTÈMES & RÉSEAUX",
    provider: "CNAM",
    initials: "cnam",
    duration: "12 mois",
    level: "Intermédiaire",
    description:
      "Approfondissez l’administration des systèmes, des serveurs et des réseaux professionnels.",
    url: "https://formation.cnam.fr/",
    color: "red",
  },
];
export function roadmap(job: (typeof jobs)[number]) {
  const specific: Record<string, string[][]> = {
    support: [
      ["Bases réseaux", "TCP/IP", "DNS"],
      ["Windows", "Active Directory"],
      ["Support utilisateurs", "Gestion des incidents"],
    ],
    trainer: [
      ["Pédagogie des adultes", "Besoins des apprenants"],
      ["Conception de supports", "Outils numériques"],
      ["Animation de groupe", "Évaluation"],
    ],
    qa: [
      ["Qualité logicielle", "Plans de test"],
      ["SQL", "Tests fonctionnels"],
      ["Automatisation", "Méthodes agiles"],
    ],
    business: [
      ["Processus métier", "Outils métier"],
      ["Reporting", "Documentation"],
      ["Accompagnement des équipes", "Résolution d’incidents"],
    ],
    csm: [
      ["Parcours client", "CRM"],
      ["Indicateurs de satisfaction", "Analyse de données"],
      ["Fidélisation", "Gestion de portefeuille"],
    ],
  };
  return [
    ...specific[job.id],
    ["Projets pratiques"],
    ["Cas réels", "Mise en situation professionnelle"],
    ["Préparation aux entretiens", "Recherche d’emploi"],
  ]
    .slice(0, job.duration)
    .map((items, i, all) =>
      i === all.length - 1
        ? ["Préparation aux entretiens", "Recherche d’emploi"]
        : items,
    );
}
