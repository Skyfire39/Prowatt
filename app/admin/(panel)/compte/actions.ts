"use server";

import { eq } from "drizzle-orm";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getDb, schema } from "@/lib/db";
import { s, type FormState } from "@/lib/validate";

export async function changeOwnPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("dashboard.view");
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("password") ?? "");
  if (next !== String(fd.get("confirm") ?? "")) return { error: "Les deux mots de passe ne correspondent pas." };
  const problem = passwordProblem(next);
  if (problem) return { error: problem };

  const db = await getDb();
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, user.id)).limit(1);
  if (!u || !(await verifyPassword(current, u.passwordHash))) return { error: "Mot de passe actuel incorrect." };

  await db.update(schema.users).set({ passwordHash: await hashPassword(next) }).where(eq(schema.users.id, user.id));
  // On ferme toutes les sessions (y compris des autres appareils), puis on rouvre celle-ci.
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, user.id));
  await destroySession();
  await createSession(user.id);
  await logAudit(user, "mot de passe modifié", "utilisateur", user.id);
  return { ok: "Mot de passe mis à jour. Les autres appareils ont été déconnectés." };
}

export async function updateOwnNameAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("dashboard.view");
  const name = s(fd, "name");
  if (name.length < 2) return { error: "Indiquez votre nom." };
  const db = await getDb();
  await db.update(schema.users).set({ name }).where(eq(schema.users.id, user.id));
  return { ok: "Nom mis à jour." };
}
