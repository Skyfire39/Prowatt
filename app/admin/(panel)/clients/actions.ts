"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getDb, schema } from "@/lib/db";
import { isEmail, isUuid, opt, s, type FormState } from "@/lib/validate";

export async function saveCustomerAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("customers.write");
  const db = await getDb();
  const id = s(fd, "id");

  const type = s(fd, "type") === "company" ? "company" : "individual";
  const name = s(fd, "name");
  const email = s(fd, "email").toLowerCase();
  if (name.length < 2) return { error: "Le nom est obligatoire." };
  if (email && !isEmail(email)) return { error: "Adresse e-mail invalide." };

  const values = {
    type,
    name,
    company: opt(fd, "company"),
    email: email || null,
    phone: opt(fd, "phone"),
    address: opt(fd, "address"),
    city: opt(fd, "city"),
    nif: opt(fd, "nif"),
    stat: opt(fd, "stat"),
    notes: opt(fd, "notes"),
    updatedAt: new Date(),
  };

  let target = id;
  if (id) {
    if (!isUuid(id)) return { error: "Client introuvable." };
    await db.update(schema.customers).set(values).where(eq(schema.customers.id, id));
    await logAudit(user, "modification", "client", id, name);
  } else {
    const [row] = await db.insert(schema.customers).values({ ...values, source: "admin" }).returning({ id: schema.customers.id });
    target = row.id;
    await logAudit(user, "création", "client", target, name);
  }
  redirect(`/admin/clients/${target}?ok=${id ? "saved" : "created"}`);
}

export async function deleteCustomerAction(fd: FormData) {
  const user = await requireActionUser("customers.write");
  const id = s(fd, "id");
  if (!isUuid(id)) redirect("/admin/clients?ok=notfound");
  const db = await getDb();
  // Un client facturé ne se supprime pas : les factures émises doivent rester rattachées à leur destinataire.
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.invoices)
    .where(eq(schema.invoices.customerId, id));
  if (n > 0) redirect(`/admin/clients/${id}?ok=inuse`);
  const [c] = await db.select().from(schema.customers).where(eq(schema.customers.id, id)).limit(1);
  if (!c) redirect("/admin/clients?ok=notfound");
  await db.delete(schema.customers).where(eq(schema.customers.id, id));
  await logAudit(user, "suppression", "client", id, c.name);
  redirect("/admin/clients?ok=deleted");
}
