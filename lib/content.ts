/**
 * Contenu public du site, lu dans la base (modifiable depuis l'admin) avec repli sur les données
 * statiques de lib/data.ts quand aucune base n'est configurée ou qu'elle est injoignable.
 * Chaque lecture est mise en cache et étiquetée : l'admin l'invalide avec updateTag(<étiquette>).
 */
import { asc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import * as data from "./data";
import type { EcooterSpecs, L10n, Project } from "./data";
import { isSlug } from "./data";
import { dbConfigured, getDb, schema } from "./db";
import { defaultEcooterPage, pageKey, parseEcooterPage, type EcooterPageContent } from "./ecooter-page";
import { parseOptions, type ProductOption } from "./options";
import { defaultSettings, mergeSettings, type AppSettings } from "./settings";

export type CatalogProduct = {
  id: string;
  category: string;
  name: L10n;
  description: L10n | null;
  price: number;
  oldPrice?: number;
  bestSeller: boolean;
  addedAt: string;
  image: string | null;
  /** Page du produit quand ce n'est pas /boutique/<id> (motos Ecooter). */
  href?: string;
  /** Choix proposés au client (couleur, type…), avec supplément de prix facultatif. */
  options: ProductOption[];
};

/** Version allégée pour le panier côté navigateur : sans les descriptions, trop lourdes à envoyer sur chaque page. */
export type CartProduct = Omit<CatalogProduct, "description">;

export type CatalogEcooter = {
  id: string;
  name: string;
  tagline: L10n;
  description: L10n | null;
  /** Photo détourée (fond transparent), utilisée sur l'accueil. */
  photo: string;
  /** Photo produit (avec décor) des pages Ecooter, de la boutique et du panier ; `null` : on reprend `photo`. */
  productPhoto: string | null;
  specs: EcooterSpecs;
  highlights: L10n[];
  price: number | null;
  options: ProductOption[];
};

export type CatalogCategory = { id: string; name: L10n };

export type CatalogTestimonial = { name: string; photo: string; text: L10n };
export type CatalogPartner = { name: string; logo: string };

const staticProducts = (): CatalogProduct[] =>
  data.products
    .filter((p) => p.active !== false)
    .map((p) => ({
      id: p.id,
      category: p.category,
      name: p.name,
      description: p.description ?? null,
      price: p.price,
      oldPrice: p.oldPrice,
      bestSeller: p.bestSeller ?? false,
      addedAt: p.addedAt,
      image: p.image ?? null,
      options: [],
    }));

export async function getProducts(): Promise<CatalogProduct[]> {
  "use cache";
  cacheTag("products");
  cacheLife("hours");
  if (!dbConfigured()) return staticProducts();
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.products).where(eq(schema.products.active, true));
    return rows
      .map((r) => ({
        id: r.id,
        category: r.category,
        name: { fr: r.nameFr, en: r.nameEn },
        description: r.descriptionFr || r.descriptionEn ? { fr: r.descriptionFr ?? "", en: r.descriptionEn ?? r.descriptionFr ?? "" } : null,
        price: r.price,
        oldPrice: r.oldPrice ?? undefined,
        bestSeller: r.bestSeller,
        addedAt: r.addedAt,
        image: r.image,
        options: parseOptions(r.options),
      }))
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.name.fr.localeCompare(b.name.fr, "fr"));
  } catch (e) {
    console.error("[content] produits : repli statique", e instanceof Error ? e.message : e);
    return staticProducts();
  }
}

const staticEcooters = (): CatalogEcooter[] =>
  data.ecooters.map((m) => ({
    id: m.id,
    name: m.name,
    tagline: m.tagline,
    description: null,
    photo: m.photo,
    productPhoto: null,
    specs: m.specs,
    highlights: [],
    price: m.price,
    options: [],
  }));

export async function getEcooters(): Promise<CatalogEcooter[]> {
  "use cache";
  cacheTag("ecooters");
  cacheLife("hours");
  if (!dbConfigured()) return staticEcooters();
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.ecooters).where(eq(schema.ecooters.active, true)).orderBy(asc(schema.ecooters.sort), asc(schema.ecooters.name));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      tagline: { fr: r.taglineFr, en: r.taglineEn },
      description: r.descriptionFr || r.descriptionEn ? { fr: r.descriptionFr ?? "", en: r.descriptionEn ?? r.descriptionFr ?? "" } : null,
      photo: r.photo,
      productPhoto: r.productPhoto,
      specs: r.specs as EcooterSpecs,
      highlights: r.highlights,
      price: r.price,
      options: parseOptions(r.options),
    }));
  } catch (e) {
    console.error("[content] motos : repli statique", e instanceof Error ? e.message : e);
    return staticEcooters();
  }
}

export async function getCategories(): Promise<CatalogCategory[]> {
  "use cache";
  cacheTag("categories");
  cacheLife("hours");
  if (!dbConfigured()) return data.categories;
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.productCategories).orderBy(asc(schema.productCategories.sort), asc(schema.productCategories.nameFr));
    // Table pas encore remplie (migration non lancée) : on garde les catégories d'origine.
    return rows.length ? rows.map((r) => ({ id: r.id, name: { fr: r.nameFr, en: r.nameEn } })) : data.categories;
  } catch (e) {
    console.error("[content] catégories : repli statique", e instanceof Error ? e.message : e);
    return data.categories;
  }
}

/**
 * Tout ce qui s'achète depuis le panier : le catalogue et les motos Ecooter qui ont un prix
 * (identifiant `ecooter-<modèle>`). Les motos sans prix restent « sur demande ».
 */
export async function getSellable(): Promise<CatalogProduct[]> {
  const [products, ecooters] = await Promise.all([getProducts(), getEcooters()]);
  const motos: CatalogProduct[] = ecooters
    .filter((m) => m.price)
    .map((m) => ({
      id: data.motoCartId(m.id),
      category: "motos-electriques",
      name: { fr: `Ecooter ${m.name}`, en: `Ecooter ${m.name}` },
      description: null,
      price: m.price!,
      bestSeller: false,
      addedAt: "2025-01-01",
      image: m.productPhoto ?? m.photo,
      href: data.modelHref("fr", m.id),
      options: m.options,
    }));
  return [...products, ...motos];
}

/** Une ligne de la table `projects` convertie en réalisation du site. */
export function rowToProject(r: typeof schema.projects.$inferSelect): Project | null {
  if (!isSlug(r.slug)) return null;
  const same = (v: string | null) => (v ? { fr: v, en: v } : undefined);
  return {
    id: r.id,
    slug: r.slug,
    title: { fr: r.titleFr, en: r.titleFr },
    city: r.city ?? undefined,
    date: r.date,
    client: r.client ?? undefined,
    description: same(r.descriptionFr),
    note: same(r.noteFr),
    kwc: r.kwc ?? undefined,
    panels: r.panelsCount != null && r.panelsWatts != null ? { count: r.panelsCount, watts: r.panelsWatts } : undefined,
    storageKwh: r.storageKwh ?? undefined,
    storageKind: same(r.storageKind),
    inverterKva: r.inverterKva ?? undefined,
    capacityL: r.capacityL ?? undefined,
    coveragePct: r.coveragePct ?? undefined,
    autonomyHours: r.autonomyHours ?? undefined,
    annualKwh: r.annualKwh ?? undefined,
    roiYears: r.roiYears ?? undefined,
    warrantyYears: r.warrantyYears ?? undefined,
    co2: r.co2 ?? undefined,
    images: r.images.length > 0 ? r.images : undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheTag("projects");
  cacheLife("hours");
  if (!dbConfigured()) return data.projects;
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.projects).where(eq(schema.projects.active, true)).orderBy(asc(schema.projects.sort), asc(schema.projects.createdAt));
    return rows.map(rowToProject).filter((p): p is Project => p !== null);
  } catch (e) {
    console.error("[content] réalisations : repli statique", e instanceof Error ? e.message : e);
    return data.projects;
  }
}

export async function getTestimonials(): Promise<CatalogTestimonial[]> {
  "use cache";
  cacheTag("testimonials");
  cacheLife("hours");
  if (!dbConfigured()) return data.testimonials;
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.testimonials).where(eq(schema.testimonials.active, true)).orderBy(asc(schema.testimonials.sort));
    return rows.map((r) => ({ name: r.name, photo: r.photo ?? "", text: { fr: r.textFr, en: r.textEn } }));
  } catch (e) {
    console.error("[content] avis : repli statique", e instanceof Error ? e.message : e);
    return data.testimonials;
  }
}

export async function getPartners(): Promise<CatalogPartner[]> {
  "use cache";
  cacheTag("partners");
  cacheLife("hours");
  if (!dbConfigured()) return data.partners;
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.partners).where(eq(schema.partners.active, true)).orderBy(asc(schema.partners.sort));
    return rows.map((r) => ({ name: r.name, logo: r.logo }));
  } catch (e) {
    console.error("[content] partenaires : repli statique", e instanceof Error ? e.message : e);
    return data.partners;
  }
}

export async function getSettings(): Promise<AppSettings> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  if (!dbConfigured()) return defaultSettings;
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.settings);
    return mergeSettings(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  } catch (e) {
    console.error("[content] réglages : repli statique", e instanceof Error ? e.message : e);
    return defaultSettings;
  }
}

/**
 * Contenu des blocs de la fiche d'un modèle Ecooter (modifiable dans l'admin) : celui de la moto si elle a une
 * fiche personnalisée, sinon le contenu commun, sinon celui d'origine du site.
 */
export async function getEcooterPage(motoId?: string): Promise<EcooterPageContent> {
  "use cache";
  cacheTag("ecooter-page");
  cacheLife("hours");
  if (!dbConfigured()) return defaultEcooterPage;
  try {
    const db = await getDb();
    const keys = motoId ? [pageKey(motoId), pageKey()] : [pageKey()];
    const rows = await db.select().from(schema.settings).where(inArray(schema.settings.key, keys));
    const row = keys.map((k) => rows.find((r) => r.key === k)).find(Boolean);
    return row ? parseEcooterPage(row.value) : defaultEcooterPage;
  } catch (e) {
    console.error("[content] fiche Ecooter : repli statique", e instanceof Error ? e.message : e);
    return defaultEcooterPage;
  }
}
