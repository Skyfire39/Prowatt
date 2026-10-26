"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { categories } from "@/lib/data";
import { getDb, schema } from "@/lib/db";
import { saveUpload } from "@/lib/media";
import { bool, int, isIsoDate, opt, optInt, s, slugify, type FormState } from "@/lib/validate";

const categoryIds = new Set(categories.map((c) => c.id));

export async function saveProductAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("products.write");
  const db = await getDb();
  const existingId = s(fd, "id");

  const nameFr = s(fd, "nameFr");
  const nameEn = s(fd, "nameEn") || nameFr;
  const category = s(fd, "category");
  const price = int(fd, "price", -1);
  const oldPrice = optInt(fd, "oldPrice");
  const addedAt = s(fd, "addedAt");

  if (nameFr.length < 2) return { error: "Le nom en français est obligatoire." };
  if (!categoryIds.has(category)) return { error: "Choisissez une catégorie." };
  if (price < 0) return { error: "Indiquez un prix valide (en ariary)." };
  if (oldPrice !== null && oldPrice <= price) return { error: "L'ancien prix doit être supérieur au prix actuel pour afficher une promotion." };
  if (addedAt && !isIsoDate(addedAt)) return { error: "Date d'ajout invalide." };

  const upload = await saveUpload(fd.get("image"));
  if (upload && "error" in upload) return { error: upload.error };

  const values = {
    category,
    nameFr,
    nameEn,
    descriptionFr: opt(fd, "descriptionFr"),
    descriptionEn: opt(fd, "descriptionEn"),
    price,
    oldPrice,
    bestSeller: bool(fd, "bestSeller"),
    sku: opt(fd, "sku"),
    stock: optInt(fd, "stock"),
    active: bool(fd, "active"),
    ...(addedAt ? { addedAt } : {}),
    ...(upload && "url" in upload ? { image: upload.url } : {}),
    ...(bool(fd, "removeImage") && !upload ? { image: null } : {}),
    updatedAt: new Date(),
  };

  let id = existingId;
  if (existingId) {
    await db.update(schema.products).set(values).where(eq(schema.products.id, existingId));
    await logAudit(user, "modification", "produit", existingId, nameFr);
  } else {
    // Identifiant lisible et unique, utilisé dans l'adresse de la fiche (/boutique/<id>).
    const base = slugify(nameFr) || "produit";
    id = base;
    for (let n = 2; ; n++) {
      const [dup] = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.id, id)).limit(1);
      if (!dup) break;
      id = `${base}-${n}`;
    }
    await db.insert(schema.products).values({ id, ...values });
    await logAudit(user, "création", "produit", id, nameFr);
  }

  updateTag("products");
  redirect(`/admin/produits?ok=${existingId ? "saved" : "created"}`);
}

export async function deleteProductAction(fd: FormData) {
  const user = await requireActionUser("products.write");
  const id = s(fd, "id");
  const db = await getDb();
  const [p] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  if (!p) redirect("/admin/produits?ok=notfound");
  await db.delete(schema.products).where(eq(schema.products.id, id));
  await logAudit(user, "suppression", "produit", id, p.nameFr);
  updateTag("products");
  redirect("/admin/produits?ok=deleted");
}

/** Bascules rapides (page « Mise en avant » et liste) : visibilité, meilleure vente. */
export async function toggleProductAction(fd: FormData) {
  const user = await requireActionUser("products.write");
  const id = s(fd, "id");
  const field = s(fd, "field");
  if (field !== "active" && field !== "bestSeller") return;
  const db = await getDb();
  const [p] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  if (!p) return;
  const next = !p[field];
  await db.update(schema.products).set({ [field]: next, updatedAt: new Date() }).where(eq(schema.products.id, id));
  await logAudit(user, field === "active" ? (next ? "affichage" : "masquage") : next ? "top vente" : "retrait top vente", "produit", id, p.nameFr);
  updateTag("products");
}

/** Définit ou retire le prix barré d'un produit (promotion). */
export async function setPromoAction(fd: FormData) {
  const user = await requireActionUser("products.write");
  const id = s(fd, "id");
  const oldPrice = optInt(fd, "oldPrice");
  const db = await getDb();
  const [p] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  if (!p) redirect("/admin/mise-en-avant?ok=notfound");
  if (oldPrice !== null && oldPrice <= p.price) redirect("/admin/mise-en-avant?ok=badpromo");
  await db.update(schema.products).set({ oldPrice, updatedAt: new Date() }).where(eq(schema.products.id, id));
  await logAudit(user, oldPrice ? "promotion" : "fin de promotion", "produit", id, p.nameFr);
  updateTag("products");
  redirect("/admin/mise-en-avant?ok=saved");
}

type QuickResult = { ok: true } | { ok: false; error: string };

/** Variante sans redirection de `toggleProductAction`, pour les écrans qui se mettent à jour sur place. */
export async function quickToggleAction(id: string, field: "active" | "bestSeller", value: boolean): Promise<QuickResult> {
  const user = await requireActionUser("products.write");
  const db = await getDb();
  const [p] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  if (!p) return { ok: false, error: "Produit introuvable." };
  await db.update(schema.products).set({ [field]: value, updatedAt: new Date() }).where(eq(schema.products.id, id));
  await logAudit(user, field === "active" ? (value ? "affichage" : "masquage") : value ? "top vente" : "retrait top vente", "produit", id, p.nameFr);
  updateTag("products");
  return { ok: true };
}

/** Variante sans redirection de `setPromoAction` : `oldPrice` nul retire la promotion. */
export async function quickPromoAction(id: string, oldPrice: number | null): Promise<QuickResult> {
  const user = await requireActionUser("products.write");
  const db = await getDb();
  const [p] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  if (!p) return { ok: false, error: "Produit introuvable." };
  if (oldPrice !== null && (!Number.isInteger(oldPrice) || oldPrice <= p.price)) {
    return { ok: false, error: "L'ancien prix doit être supérieur au prix actuel." };
  }
  await db.update(schema.products).set({ oldPrice, updatedAt: new Date() }).where(eq(schema.products.id, id));
  await logAudit(user, oldPrice ? "promotion" : "fin de promotion", "produit", id, p.nameFr);
  updateTag("products");
  return { ok: true };
}
