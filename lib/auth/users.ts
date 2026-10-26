import { sql } from "drizzle-orm";
import { getDb, schema } from "../db";

export async function countUsers() {
  const db = await getDb();
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.users);
  return n;
}
