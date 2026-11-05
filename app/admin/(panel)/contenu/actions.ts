"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getDb, schema } from "@/lib/db";
import { saveUpload } from "@/lib/media";
import { bool, int, isUuid, s, type FormState } from "@/lib/validate";

export async function saveTestimonialAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("content.write");
  const db = await getDb();
  const id = s(fd, "id");
  const name = s(fd, "name");
  const textFr = s(fd, "textFr");
  const textEn = s(fd, "textEn") || textFr;
  if (name.length < 2) return { error: "Le nom est obligatoire." };
  if (textFr.length < 5) return { error: "Le témoignage en français est obligatoire." };
  if (textFr.length > 400 || textEn.length > 400) return { error: "400 caractères maximum par témoignage." };

  const upload = await saveUpload(fd.get("photo"));
  if (upload && "error" in upload) return { error: upload.error };
  const values = { name, textFr, textEn, sort: int(fd, "sort", 0), active: bool(fd, "active"), ...(upload && "url" in upload ? { photo: upload.url } : {}) };

  if (id) {
    if (!isUuid(id)) return { error: "Avis introuvable." };
    await db.update(schema.testimonials).set(values).where(eq(schema.testimonials.id, id));
    await logAudit(user, "modification", "avis", id, name);
  } else {
    const [row] = await db.insert(schema.testimonials).values(values).returning({ id: schema.testimonials.id });
    await logAudit(user, "création", "avis", row.id, name);
  }
  updateTag("testimonials");
  redirect(`/admin/contenu?ok=${id ? "saved" : "created"}#avis`);
}

export async function deleteTestimonialAction(fd: FormData) {
  const user = await requireActionUser("content.write");
  const id = s(fd, "id");
  if (!isUuid(id)) redirect("/admin/contenu?ok=notfound");
  const db = await getDb();
  await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id));
  await logAudit(user, "suppression", "avis", id);
  updateTag("testimonials");
  redirect("/admin/contenu?ok=deleted#avis");
}

export async function savePartnerAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("content.write");
  const db = await getDb();
  const id = s(fd, "id");
  const kind = s(fd, "kind") === "brand" ? "brand" : "partner";
  const noun = kind === "brand" ? "marque" : "partenaire";
  const name = s(fd, "name");
  if (name.length < 2) return { error: kind === "brand" ? "Le nom de la marque est obligatoire." : "Le nom du partenaire est obligatoire." };

  const upload = await saveUpload(fd.get("logo"));
  if (upload && "error" in upload) return { error: upload.error };
  if (!id && !(upload && "url" in upload)) return { error: `Ajoutez le logo ${kind === "brand" ? "de la marque" : "du partenaire"}.` };
  const values = { name, sort: int(fd, "sort", 0), active: bool(fd, "active"), ...(upload && "url" in upload ? { logo: upload.url } : {}) };

  if (id) {
    if (!isUuid(id)) return { error: `${kind === "brand" ? "Marque" : "Partenaire"} introuvable.` };
    await db.update(schema.partners).set(values).where(eq(schema.partners.id, id));
    await logAudit(user, "modification", noun, id, name);
  } else {
    const [row] = await db.insert(schema.partners).values({ ...values, kind, logo: (upload as { url: string }).url }).returning({ id: schema.partners.id });
    await logAudit(user, "création", noun, row.id, name);
  }
  updateTag("partners");
  redirect(`/admin/contenu?ok=${id ? "saved" : "created"}#${kind === "brand" ? "marques" : "partenaires"}`);
}

export async function deletePartnerAction(fd: FormData) {
  const user = await requireActionUser("content.write");
  const id = s(fd, "id");
  if (!isUuid(id)) redirect("/admin/contenu?ok=notfound");
  const db = await getDb();
  const [row] = await db.select({ kind: schema.partners.kind }).from(schema.partners).where(eq(schema.partners.id, id)).limit(1);
  await db.delete(schema.partners).where(eq(schema.partners.id, id));
  await logAudit(user, "suppression", row?.kind === "brand" ? "marque" : "partenaire", id);
  updateTag("partners");
  redirect(`/admin/contenu?ok=deleted#${row?.kind === "brand" ? "marques" : "partenaires"}`);
}
