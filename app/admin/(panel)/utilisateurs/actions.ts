"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hashPassword, passwordProblem } from "@/lib/auth/password";
import { isRole } from "@/lib/auth/permissions";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getDb, schema } from "@/lib/db";
import { bool, isEmail, isUuid, s, type FormState } from "@/lib/validate";

/** Il doit toujours rester au moins un propriétaire actif : sinon plus personne ne peut gérer les comptes. */
async function otherActiveOwners(excludeId: string) {
  const db = await getDb();
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.users)
    .where(and(eq(schema.users.role, "owner"), eq(schema.users.active, true), ne(schema.users.id, excludeId)));
  return n;
}

export async function createUserAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireActionUser("users.manage");
  const name = s(fd, "name");
  const email = s(fd, "email").toLowerCase();
  const role = s(fd, "role");
  const password = String(fd.get("password") ?? "");
  if (name.length < 2) return { error: "Le nom est obligatoire." };
  if (!isEmail(email)) return { error: "Adresse e-mail invalide." };
  if (!isRole(role)) return { error: "Rôle invalide." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };

  const db = await getDb();
  const [dup] = await db.select({ id: schema.users.id }).from(schema.users).where(sql`lower(${schema.users.email}) = ${email}`).limit(1);
  if (dup) return { error: "Un compte existe déjà avec cette adresse e-mail." };

  const [row] = await db.insert(schema.users).values({ name, email, role, passwordHash: await hashPassword(password) }).returning({ id: schema.users.id });
  await logAudit(admin, "création", "utilisateur", row.id, `${name} · ${role}`);
  redirect("/admin/utilisateurs?ok=created");
}

export async function updateUserAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireActionUser("users.manage");
  const id = s(fd, "id");
  if (!isUuid(id)) return { error: "Utilisateur introuvable." };
  const name = s(fd, "name");
  const role = s(fd, "role");
  const active = bool(fd, "active");
  if (name.length < 2) return { error: "Le nom est obligatoire." };
  if (!isRole(role)) return { error: "Rôle invalide." };

  const db = await getDb();
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  if (!u) return { error: "Utilisateur introuvable." };

  if (id === admin.id && (!active || role !== u.role)) return { error: "Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte." };
  if (u.role === "owner" && (role !== "owner" || !active) && (await otherActiveOwners(id)) === 0) return { error: "Il doit rester au moins un propriétaire actif." };

  await db.update(schema.users).set({ name, role, active, ...(active ? {} : { failedAttempts: 0 }) }).where(eq(schema.users.id, id));
  if (!active) await db.delete(schema.sessions).where(eq(schema.sessions.userId, id));
  await logAudit(admin, "modification", "utilisateur", id, `${name} · ${role}${active ? "" : " · désactivé"}`);
  redirect("/admin/utilisateurs?ok=saved");
}

export async function resetUserPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireActionUser("users.manage");
  const id = s(fd, "id");
  const password = String(fd.get("password") ?? "");
  if (!isUuid(id)) return { error: "Utilisateur introuvable." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  const db = await getDb();
  await db.update(schema.users).set({ passwordHash: await hashPassword(password), failedAttempts: 0, lockedUntil: null }).where(eq(schema.users.id, id));
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, id)); // l'utilisateur doit se reconnecter
  await logAudit(admin, "mot de passe réinitialisé", "utilisateur", id);
  return { ok: "Mot de passe réinitialisé. L'utilisateur devra se reconnecter." };
}
