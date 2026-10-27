import projectMedia from "./realisations-media.json";
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
  /** Identifiant en base (absent des données statiques). */
  id?: string;
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
  /** Nom ou profil du client (repris de l'ancien site). */
  client?: string;
  /** Présentation du projet (repris de l'ancien site). */
  description?: L10n;
  /** Photos du chantier, dans /public/images/realisations. */
  images?: string[];
};

const rawProjects: Project[] = [
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

// Photos, clients et descriptions des chantiers : scripts/import-realisations.mjs → lib/realisations-media.json.
// Clé : type de solution | date | rang parmi les projets de même date (dans l'ordre de ce fichier).
const media = projectMedia as Record<string, Pick<Project, "client" | "description" | "images">>;
const rank = new Map<string, number>();
export const projects: Project[] = rawProjects.map((p) => {
  const base = `${p.slug}|${p.date}`;
  const k = rank.get(base) ?? 0;
  rank.set(base, k + 1);
  return { ...p, ...media[`${base}|${k}`] };
});

export const projectsBySlug = (slug: Slug) => projects.filter((p) => p.slug === slug);

// Boutique : catalogue importé de l'ancien site (voir scripts/import-woocommerce.mjs et lib/catalog.json).
// Il alimente la boutique tant qu'aucune base n'est configurée, et sert de contenu initial à la base.
import catalog from "./catalog.json";

export const categories: { id: string; name: L10n }[] = catalog.categories.map((c) => ({ id: c.id, name: { fr: c.fr, en: c.en } }));

export type Product = {
  id: string;
  category: string;
  name: L10n;
  price: number;
  addedAt: string;
  sku?: string;
  description?: L10n;
  /** Image dans /public (ou /api/media/… une fois envoyée depuis l'admin). */
  image?: string;
  /** Masqué de la boutique (ex. prix non publié). */
  active?: boolean;
  /** Mis en avant dans « Meilleures ventes » sur l'accueil. */
  bestSeller?: boolean;
  /** Ancien prix : le produit est alors en promotion (price est le prix remisé). */
  oldPrice?: number;
};

// Les meilleures ventes et promotions viennent de valeurs d'essai reprises de la maquette : à remplacer
// par les vraies ventes et remises de Prowatt depuis l'admin (Mise en avant).
export const products: Product[] = catalog.products as Product[];

// Ecooter
/**
 * Fiche technique d'une moto : textes libres (« 3 000 W », « 75 km/h »). Puissance, vitesse, autonomie,
 * batterie et temps de charge viennent des fiches de l'ancien site ; les autres lignes sont facultatives
 * et n'apparaissent que si elles sont renseignées.
 */
export type EcooterSpecs = {
  power?: string;
  speed?: string;
  range?: string;
  /** Type de batterie (Lithium, Acide…). Vide : « Lithium ou graphène ». */
  battery?: string;
  /** Capacité de la batterie (ex. 28A 74V). */
  batteryPower?: string;
  warranty?: string;
  /** Caisse arrière (livraison). */
  trunk?: string;
  charge?: string;
  brakes?: string;
  tires?: string;
  dimensions?: string;
  weight?: string;
  load?: string;
  seat?: string;
};

export const modelHref = (lang: string, id: string) => `/ecooter/modeles/${id}`;

/** Identifiant d'une moto dans le panier et les commandes (distinct des identifiants de produits). */
export const motoCartId = (id: string) => `ecooter-${id}`;

const woo = catalog.ecooters as Record<string, { price: number | null; specs: EcooterSpecs }>;
const baseEcooters: { id: string; name: string; tagline: L10n; photo: string }[] = [
  { id: "aura", name: "AURA", tagline: { fr: "Confort, style et performance pour la ville.", en: "Comfort, style and performance for the city." }, photo: "/images/ecooter/aura.webp" },
  { id: "cargox", name: "CARGOX", tagline: { fr: "Le compagnon robuste des pros de la livraison et du terrain.", en: "The rugged companion for delivery and field professionals." }, photo: "/images/ecooter/cargox.webp" },
  { id: "alta", name: "ALTA", tagline: { fr: "L'électrique pour les actifs pressés et connectés.", en: "The electric ride for busy, connected people." }, photo: "/images/ecooter/alta.webp" },
  { id: "voltis", name: "VOLTIS", tagline: { fr: "L'excellence pour ceux qui veulent tout, sans compromis.", en: "Excellence for those who want it all, without compromise." }, photo: "/images/ecooter/voltis.webp" },
  { id: "via-lite", name: "VIA Lite", tagline: { fr: "La citadine parfaite pour les petits trajets du quotidien.", en: "The perfect city bike for short everyday trips." }, photo: "/images/ecooter/via-lite.webp" },
  { id: "nova-lite", name: "NOVA lite", tagline: { fr: "Le bon compromis entre budget et liberté urbaine.", en: "The right balance between budget and urban freedom." }, photo: "/images/ecooter/nova-lite.webp" },
];

export const ecooters: { id: string; name: string; tagline: L10n; photo: string; specs: EcooterSpecs; price: number | null }[] = baseEcooters.map((m) => ({
  ...m,
  specs: woo[m.id]?.specs ?? {},
  price: woo[m.id]?.price ?? null,
}));

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
