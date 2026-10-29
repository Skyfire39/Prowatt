"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { upsertCustomer } from "@/lib/admin/customers";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getDb, schema } from "@/lib/db";
import { requestStatusList } from "@/lib/quote-requests";
import { isUuid, opt, s } from "@/lib/validate";

async function load(id: string) {
  if (!isUuid(id)) redirect("/admin/demandes?ok=notfound");
  const db = await getDb();
  const [r] = await db.select().from(schema.quoteRequests).where(eq(schema.quoteRequests.id, id)).limit(1);
  if (!r) redirect("/admin/demandes?ok=notfound");
  return { db, r };
}

/** Change le statut de suivi et la note interne d'une demande. */
export async function updateRequestAction(fd: FormData) {
  const user = await requireActionUser("quotes.write");
  const id = s(fd, "id");
  const status = s(fd, "status");
  const { db, r } = await load(id);
  if (!(requestStatusList as string[]).includes(status)) redirect(`/admin/demandes/${id}?ok=notfound`);
  const note = opt(fd, "note")?.slice(0, 2000) ?? null;
  await db.update(schema.quoteRequests).set({ status, note, updatedAt: new Date() }).where(eq(schema.quoteRequests.id, id));
  if (status !== r.status) await logAudit(user, `statut → ${status}`, "demande", id, r.ref);
  redirect(`/admin/demandes/${id}?ok=saved`);
}

/** Rattache la demande à une fiche client (retrouvée par téléphone ou e-mail, sinon créée). */
export async function createRequestCustomerAction(fd: FormData) {
  const user = await requireActionUser("customers.write");
  const id = s(fd, "id");
  const { db, r } = await load(id);
  const customerId = await upsertCustomer({ name: r.contact || r.name, phone: r.phone, email: r.email, city: r.city, source: "site" });
  await db.update(schema.quoteRequests).set({ customerId, updatedAt: new Date() }).where(eq(schema.quoteRequests.id, id));
  await logAudit(user, "fiche client liée", "demande", id, r.ref);
  redirect(`/admin/demandes/${id}?ok=req-customer`);
}

export async function deleteRequestAction(fd: FormData) {
  const user = await requireActionUser("quotes.write");
  const { db, r } = await load(s(fd, "id"));
  await db.delete(schema.quoteRequests).where(eq(schema.quoteRequests.id, r.id));
  await logAudit(user, "suppression", "demande", r.id, `${r.ref} · ${r.name}`);
  redirect("/admin/demandes?ok=deleted");
}
