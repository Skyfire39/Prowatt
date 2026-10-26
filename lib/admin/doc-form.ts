import { asc } from "drizzle-orm";
import { getProducts } from "@/lib/content";
import { getDb, schema } from "@/lib/db";

/** Listes nécessaires aux formulaires de devis et de factures : clients et catalogue. */
export async function getDocFormLists() {
  const db = await getDb();
  const [customers, products] = await Promise.all([
    db.select({ id: schema.customers.id, name: schema.customers.name, company: schema.customers.company }).from(schema.customers).orderBy(asc(schema.customers.name)).limit(1000),
    getProducts(),
  ]);
  return { customers, products: products.map((p) => ({ id: p.id, name: p.name.fr, price: p.price })) };
}
