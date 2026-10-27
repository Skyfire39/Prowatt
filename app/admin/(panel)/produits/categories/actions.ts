"use server";

import { eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { MOTO_CATEGORY } from "@/lib/admin/categories";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { categories as staticCategories } from "@/lib/data";
import { getDb, schema } from "@/lib/db";
import { int, s, slugify } from "@/lib/validate";

const BACK = "/admin/produits/categories";

/** Catégories d'origine du site, recopiées en base si la table est encore vide (avant le premier enregistrement). */
async function ensureSeeded() {
  const db = await getDb();
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.productCategories);
  if (n === 0) {
    await db.insert(schema.productCategories).values(staticCategories.map((c, i) => ({ id: c.id, nameFr: c.name.fr, nameEn: c.name.en, sort: i })));
  }
}

export async function createCategoryAction(fd: FormData) {
  const user = await requireActionUser("products.write");
  const name = s(fd, "name").slice(0, 60);
  if (name.length < 2) redirect(`${BACK}?ok=cat-name`);
  await ensureSeeded();
  const db = await getDb();
  const base = slugify(name) || "categorie";
  let id = base;
  for (let n = 2; ; n++) {
    const [dup] = await db.select({ id: schema.productCategories.id }).from(schema.productCategories).where(eq(schema.productCategories.id, id)).limit(1);
    if (!dup) break;
    id = `${base}-${n}`;
  }
  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${schema.productCategories.sort}), -1)::int` }).from(schema.productCategories);
  await db.insert(schema.productCategories).values({ id, nameFr: name, nameEn: name, sort: max + 1 });
  await logAudit(user, "création", "catégorie", id, name);
  updateTag("categories");
  redirect(`${BACK}?ok=created`);
}

export async function saveCategoryAction(fd: FormData) {
  const user = await requireActionUser("products.write");
  const id = s(fd, "id");
  const name = s(fd, "name").slice(0, 60);
  if (name.length < 2) redirect(`${BACK}?ok=cat-name`);
  await ensureSeeded();
  const db = await getDb();
  const updated = await db
    .update(schema.productCategories)
    .set({ nameFr: name, nameEn: name, sort: int(fd, "sort", 0) })
    .where(eq(schema.productCategories.id, id))
    .returning({ id: schema.productCategories.id });
  if (updated.length === 0) redirect(`${BACK}?ok=notfound`);
  await logAudit(user, "modification", "catégorie", id, name);
  updateTag("categories");
  redirect(`${BACK}?ok=saved`);
}

export async function deleteCategoryAction(fd: FormData) {
  const user = await requireActionUser("products.write");
  const id = s(fd, "id");
  if (id === MOTO_CATEGORY) redirect(`${BACK}?ok=cat-reserved`);
  await ensureSeeded();
  const db = await getDb();
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.products).where(eq(schema.products.category, id));
  if (n > 0) redirect(`${BACK}?ok=inuse`);
  const [c] = await db.delete(schema.productCategories).where(eq(schema.productCategories.id, id)).returning({ name: schema.productCategories.nameFr });
  if (!c) redirect(`${BACK}?ok=notfound`);
  await logAudit(user, "suppression", "catégorie", id, c.name);
  updateTag("categories");
  redirect(`${BACK}?ok=deleted`);
}

