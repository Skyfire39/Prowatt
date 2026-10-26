"use server";

import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DUMMY_HASH, hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getSessionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { isEmail, s, type FormState } from "@/lib/validate";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

// Limite par IP : 10 tentatives de connexion toutes les 5 minutes.
const tries = new Map<string, number[]>();
async function tooMany() {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  const recent = (tries.get(ip) ?? []).filter((t) => now - t < 5 * 60 * 1000);
  recent.push(now);
  tries.set(ip, recent);
  return recent.length > 10;
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!dbConfigured()) return { error: "La base de données n'est pas configurée." };
  if (await tooMany()) return { error: "Trop de tentatives. Réessayez dans quelques minutes." };

  const email = s(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const generic = { error: "Identifiant ou mot de passe incorrect." };
  if (!isEmail(email) || !password) return generic;

  const db = await getDb();
  const [user] = await db.select().from(schema.users).where(sql`lower(${schema.users.email}) = ${email}`).limit(1);

  // On vérifie toujours un mot de passe (factice si le compte n'existe pas) : même durée dans tous les cas.
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !user.active) return generic;
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "Compte verrouillé après plusieurs échecs. Réessayez dans quelques minutes." };
  }
  if (!valid) {
    const fails = user.failedAttempts + 1;
    await db
      .update(schema.users)
      .set(fails >= MAX_FAILS ? { failedAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_MS) } : { failedAttempts: fails })
      .where(eq(schema.users.id, user.id));
    await logAudit(null, "login.failed", "user", user.id, user.email);
    return generic;
  }

  await db.update(schema.users).set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
  await createSession(user.id);
  await logAudit({ id: user.id, name: user.name }, "login", "user", user.id);
  redirect("/admin");
}

export async function logoutAction() {
  const user = await getSessionUser();
  await destroySession();
  if (user) await logAudit(user, "logout", "user", user.id);
  redirect("/admin/login");
}

/** Première configuration : crée le compte propriétaire, uniquement tant qu'aucun utilisateur n'existe. */
export async function setupAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!dbConfigured()) return { error: "La base de données n'est pas configurée." };
  if (await tooMany()) return { error: "Trop de tentatives. Réessayez dans quelques minutes." };

  const db = await getDb();
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.users);
  if (n > 0) redirect("/admin/login");

  // En production, un code d'installation évite que le premier visiteur prenne le contrôle du site.
  const code = process.env.ADMIN_SETUP_CODE ?? "";
  if (process.env.NODE_ENV === "production") {
    if (!code) return { error: "ADMIN_SETUP_CODE n'est pas défini sur le serveur." };
    if (s(fd, "code") !== code) return { error: "Code d'installation incorrect." };
  }

  const name = s(fd, "name");
  const email = s(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (name.length < 2) return { error: "Indiquez votre nom." };
  if (!isEmail(email)) return { error: "Adresse e-mail invalide." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  if (password !== String(fd.get("confirm") ?? "")) return { error: "Les deux mots de passe ne correspondent pas." };

  const [created] = await db
    .insert(schema.users)
    .values({ name, email, role: "owner", passwordHash: await hashPassword(password), lastLoginAt: new Date() })
    .returning({ id: schema.users.id });
  await createSession(created.id);
  await logAudit({ id: created.id, name }, "setup", "user", created.id, "Création du compte propriétaire");
  redirect("/admin");
}
