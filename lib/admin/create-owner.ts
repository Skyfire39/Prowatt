import { sql } from "drizzle-orm";
import { hashPassword, passwordProblem } from "@/lib/auth/password";
import type { Db } from "@/lib/db";
import { schema } from "@/lib/db";
import { isEmail } from "@/lib/validate";

/**
 * Crée un compte propriétaire, ou — si l'adresse existe déjà — le passe en propriétaire actif avec le nouveau mot de passe.
 * Utilisé par `npm run user:owner` ; les comptes se gèrent ensuite dans l'admin (Utilisateurs).
 */
export async function createOwner(db: Db, input: { email: string; name: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!isEmail(email)) throw new Error("Adresse e-mail invalide.");
  if (name.length < 2) throw new Error("Le nom est obligatoire.");
  const problem = passwordProblem(input.password);
  if (problem) throw new Error(problem);

  const passwordHash = await hashPassword(input.password);
  const [existing] = await db.select({ id: schema.users.id }).from(schema.users).where(sql`lower(${schema.users.email}) = ${email}`).limit(1);
  if (existing) {
    await db
      .update(schema.users)
      .set({ role: "owner", active: true, passwordHash, failedAttempts: 0, lockedUntil: null })
      .where(sql`${schema.users.id} = ${existing.id}`);
    return { id: existing.id, created: false };
  }
  const [row] = await db.insert(schema.users).values({ email, name, role: "owner", passwordHash }).returning({ id: schema.users.id });
  return { id: row.id, created: true };
}
