"use server";

import { eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_PROJECT_IMAGES } from "@/lib/admin/projects";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { isSlug } from "@/lib/data";
import { getDb, schema } from "@/lib/db";
import { saveUpload } from "@/lib/media";
import { bool, int, opt, s, type FormState } from "@/lib/validate";

/** Nombre décimal facultatif : champ vide → null, texte invalide → undefined (refusé). */
function optNum(fd: FormData, k: string): number | null | undefined {
  const v = s(fd, k).replace(/[\s ]/g, "").replace(",", ".");
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

const numberFields = [
  ["kwc", "Puissance (kWc)"],
  ["storageKwh", "Stockage (kWh)"],
  ["inverterKva", "Onduleur (kVA)"],
  ["capacityL", "Capacité (L)"],
  ["coveragePct", "Couverture (%)"],
  ["autonomyHours", "Autonomie (h)"],
  ["annualKwh", "Production annuelle (kWh)"],
  ["roiYears", "Retour sur investissement (ans)"],
  ["co2", "CO₂ évité (t/an)"],
  ["panelsCount", "Nombre de panneaux"],
  ["panelsWatts", "Puissance d'un panneau (W)"],
  ["warrantyYears", "Garantie (ans)"],
] as const;

const isImagePath = (v: string) => /^\/(images\/[\w./-]+|api\/media\/[0-9a-f-]{36})$/i.test(v);

export async function saveProjectAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("content.write");
  const db = await getDb();
  const existingId = s(fd, "id");

  const slug = s(fd, "slug");
  const title = s(fd, "titleFr");
  const date = s(fd, "date");
  if (!isSlug(slug)) return { error: "Choisissez la catégorie de la réalisation." };
  if (title.length < 2) return { error: "Le titre de la réalisation est obligatoire." };
  if (date && !/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) return { error: "La date d'installation est invalide (mois et année)." };

  const nums: Record<string, number | null> = {};
  for (const [k, label] of numberFields) {
    const n = optNum(fd, k);
    if (n === undefined) return { error: `« ${label} » doit être un nombre positif.` };
    nums[k] = n;
  }
  for (const k of ["panelsCount", "panelsWatts", "warrantyYears"]) if (nums[k] != null) nums[k] = Math.round(nums[k]!);
  if ((nums.panelsCount == null) !== (nums.panelsWatts == null)) return { error: "Renseignez à la fois le nombre de panneaux et la puissance d'un panneau, ou aucun des deux." };

  // Photos conservées (dans l'ordre du formulaire), puis nouvelles photos envoyées.
  const images = fd.getAll("image").map(String).filter(isImagePath);
  const files = fd.getAll("gallery").filter((f): f is File => f instanceof File && f.size > 0);
  if (images.length + files.length > MAX_PROJECT_IMAGES) return { error: `Une réalisation accepte ${MAX_PROJECT_IMAGES} photos au maximum.` };
  for (const file of files) {
    const up = await saveUpload(file);
    if (up && "error" in up) return { error: `Photo « ${file.name} » : ${up.error}` };
    if (up && "url" in up) images.push(up.url);
  }

  let sort = fd.get("sort") === null || s(fd, "sort") === "" ? null : int(fd, "sort", 0);
  if (sort === null) {
    if (existingId) {
      const [cur] = await db.select({ sort: schema.projects.sort }).from(schema.projects).where(eq(schema.projects.id, existingId)).limit(1);
      sort = cur?.sort ?? 0;
    } else {
      const [m] = await db.select({ max: sql<number>`coalesce(max(${schema.projects.sort}), -1)::int` }).from(schema.projects);
      sort = m.max + 1;
    }
  }

  const values = {
    slug,
    titleFr: title,
    city: opt(fd, "city"),
    date,
    client: opt(fd, "client"),
    descriptionFr: opt(fd, "descriptionFr"),
    noteFr: opt(fd, "noteFr"),
    storageKind: opt(fd, "storageKind"),
    kwc: nums.kwc,
    panelsCount: nums.panelsCount,
    panelsWatts: nums.panelsWatts,
    storageKwh: nums.storageKwh,
    inverterKva: nums.inverterKva,
    capacityL: nums.capacityL,
    coveragePct: nums.coveragePct,
    autonomyHours: nums.autonomyHours,
    annualKwh: nums.annualKwh,
    roiYears: nums.roiYears,
    warrantyYears: nums.warrantyYears,
    co2: nums.co2,
    images,
    active: bool(fd, "active"),
    sort,
    updatedAt: new Date(),
  };

  let id = existingId;
  if (existingId) {
    const updated = await db.update(schema.projects).set(values).where(eq(schema.projects.id, existingId)).returning({ id: schema.projects.id });
    if (updated.length === 0) return { error: "Réalisation introuvable. Rechargez la page." };
    await logAudit(user, "modification", "réalisation", existingId, title);
  } else {
    const [row] = await db.insert(schema.projects).values(values).returning({ id: schema.projects.id });
    id = row.id;
    await logAudit(user, "création", "réalisation", id, title);
  }

  updateTag("projects");
  redirect(`/admin/realisations?cat=${slug}&ok=${existingId ? "saved" : "created"}`);
}

export async function deleteProjectAction(fd: FormData) {
  const user = await requireActionUser("content.write");
  const id = s(fd, "id");
  const db = await getDb();
  const [p] = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);
  if (!p) redirect("/admin/realisations?ok=notfound");
  await db.delete(schema.projects).where(eq(schema.projects.id, id));
  await logAudit(user, "suppression", "réalisation", id, p.titleFr);
  updateTag("projects");
  redirect(`/admin/realisations?cat=${p.slug}&ok=deleted`);
}

export async function toggleProjectAction(fd: FormData) {
  const user = await requireActionUser("content.write");
  const id = s(fd, "id");
  const db = await getDb();
  const [p] = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);
  if (!p) return;
  await db.update(schema.projects).set({ active: !p.active, updatedAt: new Date() }).where(eq(schema.projects.id, id));
  await logAudit(user, p.active ? "masquage" : "affichage", "réalisation", id, p.titleFr);
  updateTag("projects");
}
