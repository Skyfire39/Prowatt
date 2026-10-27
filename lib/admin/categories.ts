import { asc } from "drizzle-orm";
import { categories as staticCategories } from "@/lib/data";
import { getDb, schema } from "@/lib/db";

/** Catégorie réservée : elle rassemble les motos Ecooter dans la boutique. On peut la renommer, pas la supprimer. */
export const MOTO_CATEGORY = "motos-electriques";

/** Catégories pour l'admin, lues sans cache. Table vide (migration non lancée) : catégories d'origine. */
export async function listCategories(): Promise<{ id: string; name: string; sort: number }[]> {
  const db = await getDb();
  const rows = await db.select().from(schema.productCategories).orderBy(asc(schema.productCategories.sort), asc(schema.productCategories.nameFr));
  if (rows.length) return rows.map((r) => ({ id: r.id, name: r.nameFr, sort: r.sort }));
  return staticCategories.map((c, i) => ({ id: c.id, name: c.name.fr, sort: i }));
}
