/**
 * Contenu public du site, lu dans la base (modifiable depuis l'admin) avec repli sur les données
 * statiques de lib/data.ts quand aucune base n'est configurée ou qu'elle est injoignable.
 * Chaque lecture est mise en cache et étiquetée : l'admin l'invalide avec updateTag(<étiquette>).
 */
import { asc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import * as data from "./data";
import type { EcooterSpecs, L10n } from "./data";
import { dbConfigured, getDb, schema } from "./db";
import { defaultEcooterPage, pageKey, parseEcooterPage, type EcooterPageContent } from "./ecooter-page";
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
};

/** Version allégée pour le panier côté navigateur : sans les descriptions, trop lourdes à envoyer sur chaque page. */
export type CartProduct = Omit<CatalogProduct, "description">;

export type CatalogEcooter = {
  id: string;
  name: string;
  tagline: L10n;
  description: L10n | null;
  photo: string;
  specs: EcooterSpecs;
  highlights: L10n[];
  price: number | null;
};

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
    }));

export async function getProducts(): Promise<CatalogProduct[]> {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");
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
    specs: m.specs,
    highlights: [],
    price: m.price,
  }));

export async function getEcooters(): Promise<CatalogEcooter[]> {
  "use cache";
  cacheTag("ecooters");
  cacheLife("minutes");
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
      specs: r.specs as EcooterSpecs,
      highlights: r.highlights,
      price: r.price,
    }));
  } catch (e) {
    console.error("[content] motos : repli statique", e instanceof Error ? e.message : e);
    return staticEcooters();
  }
}

export async function getTestimonials(): Promise<CatalogTestimonial[]> {
  "use cache";
  cacheTag("testimonials");
  cacheLife("minutes");
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
  cacheLife("minutes");
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
  cacheLife("minutes");
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
  cacheLife("minutes");
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
