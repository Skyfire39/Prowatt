import type { Locale } from "./i18n";

export type L10n = { fr: string; en: string };
export const tr = (v: L10n, lang: Locale) => v[lang];

export const slugs = [
  "100-autonome",
  "hybride",
  "ongrid",
  "anti-delestage",
  "acces-a-eau",
] as const;
export type Slug = (typeof slugs)[number];
export const isSlug = (v: string): v is Slug =>
  (slugs as readonly string[]).includes(v);

export type Project = {
  slug: Slug;
  title: L10n;
  city?: string;
  /** AAAA-MM */
  date: string;
  kwc?: number;
  panels?: { count: number; watts: number };
  storageKwh?: number;
  storageKind?: L10n;
  inverterKva?: number;
  co2?: number;
  roiYears?: number;
  coveragePct?: number;
  autonomyHours?: number;
  annualKwh?: number;
  capacityL?: number;
  warrantyYears?: number;
  note?: L10n;
};

export const projects: Project[] = [
  // 100 % autonome
  {
    slug: "100-autonome",
    title: { fr: "Plateforme logistique", en: "Logistics platform" },
    city: "Antananarivo",
    date: "2025-04",
    kwc: 132,
    panels: { count: 240, watts: 550 },
    storageKwh: 60,
    storageKind: { fr: "Lithium", en: "Lithium" },
    co2: 138,
    note: {
      fr: "Production moyenne d'environ 550 kWh par jour.",
      en: "Average output of around 550 kWh per day.",
    },
  },
  {
    slug: "100-autonome",
    title: { fr: "ONG internationale", en: "International NGO" },
    city: "Ambatondrazaka",
    date: "2024-04",
    kwc: 49.5,
    storageKwh: 40,
    co2: 59,
  },
  {
    slug: "100-autonome",
    title: { fr: "Immeuble de 5 étages", en: "5-storey building" },
    city: "Alasora, Antananarivo",
    date: "2025-04",
    kwc: 19.5,
    storageKwh: 30,
    co2: 25,
    note: {
      fr: "Alimente 8 appartements, totalement indépendants du réseau public.",
      en: "Powers 8 apartments, fully independent from the public grid.",
    },
  },
  {
    slug: "100-autonome",
    title: { fr: "Villa avec piscine", en: "Villa with pool" },
    city: "Port-Bergé",
    date: "2023-03",
    kwc: 6.6,
    panels: { count: 12, watts: 550 },
    storageKwh: 10,
    co2: 7.9,
    note: {
      fr: "Site hors de portée du réseau JIRAMA.",
      en: "Site out of reach of the JIRAMA grid.",
    },
  },
  {
    slug: "100-autonome",
    title: { fr: "Villa", en: "Villa" },
    city: "Majunga",
    date: "2025-03",
    kwc: 4.5,
    storageKwh: 5,
    co2: 5.4,
    annualKwh: 8212,
  },
  {
    slug: "100-autonome",
    title: { fr: "Kit autonome", en: "Standalone kit" },
    city: "Ambohijanaka, Antananarivo",
    date: "2024-02",
    kwc: 7.2,
    panels: { count: 16, watts: 450 },
    storageKwh: 25,
    co2: 9,
  },
  {
    slug: "100-autonome",
    title: { fr: "Appartement", en: "Apartment" },
    city: "Ambohimangakely",
    date: "2022-02",
    kwc: 1.2,
    storageKwh: 2.56,
    co2: 2.08,
  },
  // Hybride
  {
    slug: "hybride",
    title: {
      fr: "Hôtel · hybride 70 % couplé à un groupe électrogène",
      en: "Hotel · 70% hybrid coupled with a generator",
    },
    city: "Tsarasaotra, Antananarivo",
    date: "2025-02",
    kwc: 3,
    storageKwh: 9.6,
    storageKind: { fr: "Batterie gel", en: "Gel battery" },
    co2: 6.75,
    autonomyHours: 12,
    note: {
      fr: "Alimentation continue et stabilisée, dépendance réduite au réseau.",
      en: "Continuous, stabilised power and reduced dependence on the grid.",
    },
  },
  // On-grid
  {
    slug: "ongrid",
    title: { fr: "Immeuble de bureaux de 11 étages", en: "11-storey office building" },
    city: "Antananarivo",
    date: "2025-11",
    kwc: 195.8,
    panels: { count: 408, watts: 480 },
    inverterKva: 250,
    co2: 275,
    coveragePct: 20,
    roiYears: 1.8,
  },
  {
    slug: "ongrid",
    title: { fr: "Usine de glace", en: "Ice factory" },
    city: "Tuléar",
    date: "2025-03",
    kwc: 33,
    panels: { count: 60, watts: 550 },
    inverterKva: 25,
    co2: 36,
    coveragePct: 65,
    roiYears: 2.5,
  },
  {
    slug: "ongrid",
    title: { fr: "Site industriel", en: "Industrial site" },
    city: "Andapa",
    date: "2023-07",
    kwc: 18.7,
    panels: { count: 34, watts: 550 },
    inverterKva: 20,
    co2: 22,
  },
  // Anti-délestage
  {
    slug: "anti-delestage",
    title: { fr: "Kit anti-délestage · maison", en: "Load-shedding kit · house" },
    city: "Ambohijanaka",
    date: "2024-09",
    storageKwh: 10,
    storageKind: { fr: "Lithium", en: "Lithium" },
    note: {
      fr: "Alimentation continue pendant les pannes du réseau.",
      en: "Continuous power during grid outages.",
    },
  },
  {
    slug: "anti-delestage",
    title: { fr: "Kit anti-délestage · commerce", en: "Load-shedding kit · business" },
    city: "Antananarivo",
    date: "2023-12",
    storageKwh: 20,
    storageKind: { fr: "Lithium", en: "Lithium" },
    note: {
      fr: "Confort électrique maintenu même lors d'une coupure pouvant durer jusqu'à 10 heures.",
      en: "Electrical comfort maintained even during an outage of up to 10 hours.",
    },
  },
  {
    slug: "anti-delestage",
    title: { fr: "Kit anti-délestage autonome · particulier", en: "Standalone load-shedding kit · home" },
    date: "2025-02",
    inverterKva: 22,
    storageKind: { fr: "Lithium", en: "Lithium" },
    note: {
      fr: "Une solution autonome contre le délestage pour un usage domestique.",
      en: "A standalone answer to load shedding for home use.",
    },
  },
  // Eau
  {
    slug: "acces-a-eau",
    title: { fr: "Chauffe-eau solaire pressurisé", en: "Pressurised solar water heater" },
    city: "Ambohijanaka",
    date: "",
    capacityL: 300,
    warrantyYears: 3,
    note: {
      fr: "Pression d'eau stable, contrôle précis de la température. Système hybride électricité et solaire.",
      en: "Stable water pressure and precise temperature control. Hybrid electricity and solar system.",
    },
  },
  {
    slug: "acces-a-eau",
    title: { fr: "Pompe immergée solaire Premium · forage de 120 m", en: "Premium solar submersible pump · 120 m borehole" },
    city: "Antsahabe, Ambohidratrimo",
    date: "",
    capacityL: 200,
    warrantyYears: 3,
    note: {
      fr: "Autonome et écologique, sans réseau électrique ni carburant.",
      en: "Standalone and eco-friendly, with no grid power or fuel.",
    },
  },
];

export const projectsBySlug = (slug: Slug) => projects.filter((p) => p.slug === slug);

// Boutique
export const categories: { id: string; name: L10n }[] = [
  { id: "structure-aluminium", name: { fr: "Structure aluminium", en: "Aluminium mounting" } },
  { id: "panneau-solaire", name: { fr: "Panneau solaire", en: "Solar panel" } },
  { id: "batterie-lithium", name: { fr: "Batterie lithium", en: "Lithium battery" } },
  { id: "batterie-gel", name: { fr: "Batterie gel", en: "Gel battery" } },
  { id: "convertisseur", name: { fr: "Convertisseur", en: "Inverter" } },
  { id: "regulateur", name: { fr: "Régulateur", en: "Charge controller" } },
  { id: "stabilisateur", name: { fr: "Stabilisateur", en: "Stabiliser" } },
  { id: "disjoncteur", name: { fr: "Disjoncteur", en: "Circuit breaker" } },
  { id: "cable-electrique", name: { fr: "Câble électrique", en: "Electric cable" } },
  { id: "chauffe-eau-solaire", name: { fr: "Chauffe-eau solaire", en: "Solar water heater" } },
  { id: "pompe-solaire", name: { fr: "Pompe solaire", en: "Solar pump" } },
  { id: "luminaire-solaire", name: { fr: "Luminaire solaire", en: "Solar light" } },
  { id: "mini-kit-solaire", name: { fr: "Mini kit solaire", en: "Mini solar kit" } },
  { id: "powerbank", name: { fr: "Powerbank", en: "Power bank" } },
  { id: "motos-electriques", name: { fr: "Motos électriques", en: "Electric motorbikes" } },
  { id: "accessoire", name: { fr: "Accessoire", en: "Accessory" } },
];

/**
 * addedAt (AAAA-MM-JJ) sert au tri « plus récents ». Dates provisoires : l'ancienne boutique
 * listait les produits du plus récent au plus ancien, on a espacé les dates d'une semaine.
 * À remplacer par les vraies dates d'ajout.
 */
export type Product = {
  id: string;
  category: string;
  name: L10n;
  price: number;
  addedAt: string;
  /** Mis en avant dans « Meilleures ventes » sur l'accueil. */
  bestSeller?: boolean;
  /** Ancien prix : le produit est alors en promotion (price est le prix remisé). */
  oldPrice?: number;
};

// PROVISOIRE : « bestSeller » et « oldPrice » (promotions) sont des valeurs d'essai pour la maquette de
// l'accueil, à remplacer par les vraies ventes et remises de Prowatt avant mise en ligne.
export const products: Product[] = [
  { id: "cosse-terre-20", oldPrice: 11000, category: "structure-aluminium", price: 9000, addedAt: "2025-09-30", name: { fr: "Structure panneaux cosse mise à la terre pour toit plat 20 mm", en: "Panel mounting earthing lug for flat roof, 20 mm" } },
  { id: "clip-terre-25", category: "structure-aluminium", price: 1000, addedAt: "2025-09-23", name: { fr: "Structure panneaux clip mise à la terre pour toit plat 25 mm", en: "Panel mounting earthing clip for flat roof, 25 mm" } },
  { id: "tube-675", oldPrice: 62000, category: "structure-aluminium", price: 53000, addedAt: "2025-09-16", name: { fr: "Structure panneaux tube pour toit plat 675 mm", en: "Panel mounting tube for flat roof, 675 mm" } },
  { id: "base-40", oldPrice: 62000, category: "structure-aluminium", price: 53000, addedAt: "2025-09-09", name: { fr: "Structure panneaux base pour toit plat 40 mm", en: "Panel mounting base for flat roof, 40 mm" } },
  { id: "front-base", oldPrice: 30000, category: "structure-aluminium", price: 25000, addedAt: "2025-09-02", name: { fr: "Structure panneaux front base pour toit plat", en: "Panel mounting front base for flat roof" } },
  { id: "mid-clamp-30", bestSeller: true, category: "structure-aluminium", price: 5000, addedAt: "2025-08-26", name: { fr: "Structure mid clamp 30 mm", en: "Mounting mid clamp, 30 mm" } },
  { id: "l-feet-40", bestSeller: true, category: "structure-aluminium", price: 12000, addedAt: "2025-08-19", name: { fr: "Structure panneaux L feet 40 mm", en: "Panel mounting L feet, 40 mm" } },
  { id: "rail-connector", bestSeller: true, category: "structure-aluminium", price: 12000, addedAt: "2025-08-12", name: { fr: "Structure panneaux rail connector alu CR1 150 mm", en: "Panel mounting aluminium rail connector CR1, 150 mm" } },
  { id: "rail-cr20", bestSeller: true, category: "structure-aluminium", price: 98000, addedAt: "2025-08-05", name: { fr: "Structure panneau rail alu CR20 2400 mm", en: "Panel mounting aluminium rail CR20, 2400 mm" } },
];

// Ecooter
/**
 * Fiche technique affichée dans les bulles du slider. Les valeurs sont des textes libres
 * (« 3 000 W », « 75 km/h », « 120 km »). Tant qu'une valeur manque, la bulle affiche « Sur demande » :
 * ni l'ancien site ni la page Ecooter ne publient ces caractéristiques, à renseigner avec Prowatt.
 */
export type EcooterSpecs = {
  power?: string;
  speed?: string;
  range?: string;
  /** Lignes facultatives de la fiche : n'apparaissent que si elles sont renseignées. */
  charge?: string;
  brakes?: string;
  tires?: string;
  dimensions?: string;
  weight?: string;
  load?: string;
  seat?: string;
};

export const modelHref = (lang: string, id: string) => `/${lang}/ecooter/modeles/${id}`;

export const ecooters: { id: string; name: string; tagline: L10n; photo: string; specs?: EcooterSpecs }[] = [
  { id: "aura", name: "AURA", tagline: { fr: "Confort, style et performance pour la ville.", en: "Comfort, style and performance for the city." }, photo: "/images/ecooter/aura.webp" },
  { id: "cargox", name: "CARGOX", tagline: { fr: "Le compagnon robuste des pros de la livraison et du terrain.", en: "The rugged companion for delivery and field professionals." }, photo: "/images/ecooter/cargox.webp" },
  { id: "alta", name: "ALTA", tagline: { fr: "L'électrique pour les actifs pressés et connectés.", en: "The electric ride for busy, connected people." }, photo: "/images/ecooter/alta.webp" },
  { id: "voltis", name: "VOLTIS", tagline: { fr: "L'excellence pour ceux qui veulent tout, sans compromis.", en: "Excellence for those who want it all, without compromise." }, photo: "/images/ecooter/voltis.webp" },
  { id: "via-lite", name: "VIA Lite", tagline: { fr: "La citadine parfaite pour les petits trajets du quotidien.", en: "The perfect city bike for short everyday trips." }, photo: "/images/ecooter/via-lite.webp" },
  { id: "nova-lite", name: "NOVA lite", tagline: { fr: "Le bon compromis entre budget et liberté urbaine.", en: "The right balance between budget and urban freedom." }, photo: "/images/ecooter/nova-lite.webp" },
];

export const techs = ["lithium", "graphene"] as const;
export type Tech = (typeof techs)[number];
export const isTech = (v: string): v is Tech => (techs as readonly string[]).includes(v);

// Accueil
// Logos repris de l'ancien site (public/images/partners), dans le même ordre.
export const partners: { name: string; logo: string }[] = [
  { name: "Rapide Service", logo: "/images/partners/rapide-service.png" },
  { name: "Jovena", logo: "/images/partners/jovena.png" },
  { name: "Jiro Ve", logo: "/images/partners/jiro-ve.png" },
  { name: "SQ Vision", logo: "/images/partners/sq-vision.png" },
  { name: "Fadintseranana", logo: "/images/partners/fadintseranana.png" },
  { name: "Chine – Madagascar, 50 ans de relations diplomatiques", logo: "/images/partners/chine-madagascar-50.png" },
];

export const testimonials: { name: string; photo: string; text: L10n }[] = [
  {
    name: "Fanilo Razanamino",
    photo: "/images/testimonials/fanilo.jpg",
    text: {
      fr: "Très satisfait de l'installation, et le produit est garanti.",
      en: "Very happy with the installation, and the product is under warranty.",
    },
  },
  {
    name: "Mampiray Rakotoarisoa",
    photo: "/images/testimonials/mampiray.jpg",
    text: {
      fr: "Très satisfait : plus aucun souci de délestage.",
      en: "Very satisfied: no more load-shedding worries.",
    },
  },
  {
    name: "Arnaud Aban'i Magneva",
    photo: "/images/testimonials/arnaud.jpg",
    text: {
      fr: "Une électricité stable en brousse, sans factures ni coupures.",
      en: "Stable electricity in the countryside, with no bills and no outages.",
    },
  },
  {
    name: "Mika Andriamaraina",
    photo: "/images/testimonials/mika.jpg",
    text: {
      fr: "Tranquille depuis 5 ans : je ne remarque même plus les délestages.",
      en: "At ease for 5 years now: I no longer even notice the power cuts.",
    },
  },
];
