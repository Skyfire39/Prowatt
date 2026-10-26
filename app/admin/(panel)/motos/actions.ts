"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getDb, schema } from "@/lib/db";
import { specFields } from "@/lib/admin/specs";
import { saveUpload } from "@/lib/media";
import { bool, int, opt, optInt, s, slugify, type FormState } from "@/lib/validate";

const lines = (v: string) => v.split("\n").map((l) => l.trim()).filter(Boolean);

export async function saveMotoAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("motos.write");
  const db = await getDb();
  const existingId = s(fd, "id");

  const name = s(fd, "name");
  const taglineFr = s(fd, "taglineFr");
  const taglineEn = s(fd, "taglineEn") || taglineFr;
  if (name.length < 2) return { error: "Le nom du modèle est obligatoire." };
  if (!taglineFr) return { error: "La phrase d'accroche en français est obligatoire." };

  const upload = await saveUpload(fd.get("photo"));
  if (upload && "error" in upload) return { error: upload.error };

  const specs: Record<string, string> = {};
  for (const f of specFields) {
    const v = s(fd, `spec_${f.key}`);
    if (v) specs[f.key] = v;
  }

  const fr = lines(s(fd, "highlightsFr"));
  const en = lines(s(fd, "highlightsEn"));
  const highlights = fr.map((t, i) => ({ fr: t, en: en[i] || t }));

  const values = {
    name,
    taglineFr,
    taglineEn,
    descriptionFr: opt(fd, "descriptionFr"),
    descriptionEn: opt(fd, "descriptionEn"),
    specs,
    highlights,
    price: optInt(fd, "price"),
    active: bool(fd, "active"),
    sort: int(fd, "sort", 0),
    updatedAt: new Date(),
    ...(upload && "url" in upload ? { photo: upload.url } : {}),
  };

  if (existingId) {
    await db.update(schema.ecooters).set(values).where(eq(schema.ecooters.id, existingId));
    await logAudit(user, "modification", "moto", existingId, name);
  } else {
    if (!(upload && "url" in upload)) return { error: "Ajoutez une photo détourée de la moto (PNG ou WebP, fond transparent de préférence)." };
    const base = slugify(name) || "modele";
    let id = base;
    for (let n = 2; ; n++) {
      const [dup] = await db.select({ id: schema.ecooters.id }).from(schema.ecooters).where(eq(schema.ecooters.id, id)).limit(1);
      if (!dup) break;
      id = `${base}-${n}`;
    }
    await db.insert(schema.ecooters).values({ id, photo: upload.url, ...values });
    await logAudit(user, "création", "moto", id, name);
  }

  updateTag("ecooters");
  redirect(`/admin/motos?ok=${existingId ? "saved" : "created"}`);
}

export async function deleteMotoAction(fd: FormData) {
  const user = await requireActionUser("motos.write");
  const id = s(fd, "id");
  const db = await getDb();
  const [m] = await db.select().from(schema.ecooters).where(eq(schema.ecooters.id, id)).limit(1);
  if (!m) redirect("/admin/motos?ok=notfound");
  await db.delete(schema.ecooters).where(eq(schema.ecooters.id, id));
  await logAudit(user, "suppression", "moto", id, m.name);
  updateTag("ecooters");
  redirect("/admin/motos?ok=deleted");
}

export async function toggleMotoAction(fd: FormData) {
  const user = await requireActionUser("motos.write");
  const id = s(fd, "id");
  const db = await getDb();
  const [m] = await db.select().from(schema.ecooters).where(eq(schema.ecooters.id, id)).limit(1);
  if (!m) return;
  await db.update(schema.ecooters).set({ active: !m.active, updatedAt: new Date() }).where(eq(schema.ecooters.id, id));
  await logAudit(user, m.active ? "masquage" : "affichage", "moto", id, m.name);
  updateTag("ecooters");
}
