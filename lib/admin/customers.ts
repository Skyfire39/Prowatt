import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

const digits = (v: string) => v.replace(/\D/g, "");

/**
 * Retrouve un client par téléphone (9 derniers chiffres) ou e-mail, ou le crée.
 * Utilisé à chaque commande passée sur le site : un même client n'est jamais dupliqué.
 */
export async function upsertCustomer(input: {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  source: "site" | "admin";
}): Promise<string> {
  const db = await getDb();
  const phone = input.phone?.trim() || null;
  const email = input.email?.trim().toLowerCase() || null;
  const tail = phone ? digits(phone).slice(-9) : "";

  let found: typeof schema.customers.$inferSelect | undefined;
  if (tail.length >= 7) {
    [found] = await db
      .select()
      .from(schema.customers)
      .where(sql`right(regexp_replace(coalesce(${schema.customers.phone}, ''), '\\D', '', 'g'), 9) = ${tail}`)
      .limit(1);
  }
  if (!found && email) {
    [found] = await db.select().from(schema.customers).where(sql`lower(${schema.customers.email}) = ${email}`).limit(1);
  }

  if (found) {
    // On complète les informations manquantes sans écraser ce qui a été saisi à la main.
    await db
      .update(schema.customers)
      .set({
        phone: found.phone || phone,
        email: found.email || email,
        address: found.address || input.address || null,
        city: found.city || input.city || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.customers.id, found.id));
    return found.id;
  }

  const [created] = await db
    .insert(schema.customers)
    .values({
      name: input.name,
      phone,
      email,
      address: input.address || null,
      city: input.city || null,
      source: input.source,
    })
    .returning({ id: schema.customers.id });
  return created.id;
}
