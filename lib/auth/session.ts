import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { getDb, schema } from "../db";
import { can, type Permission } from "./permissions";

export const SESSION_COOKIE = "pw_session";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionUser = { id: string; email: string; name: string; role: string };

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Crée une session en base et pose le cookie (httpOnly, SameSite, Secure en production). */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const h = await headers();
  const db = await getDb();
  await db.insert(schema.sessions).values({
    id: sha256(token),
    userId,
    expiresAt: new Date(Date.now() + TTL_MS),
    ip: h.get("x-forwarded-for")?.split(",")[0].trim() ?? null,
    userAgent: h.get("user-agent")?.slice(0, 200) ?? null,
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: TTL_MS / 1000,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(schema.sessions).where(eq(schema.sessions.id, sha256(token)));
  }
  jar.delete({ name: SESSION_COOKIE, path: "/admin" });
}

/** Utilisateur de la session courante, ou null. Dédupliqué pendant une même requête. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  await connection(); // tout ce qui suit dépend de la requête (cookies, heure) : jamais prérendu
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const [row] = await db
    .select({ id: schema.users.id, email: schema.users.email, name: schema.users.name, role: schema.users.role })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.id, sha256(token)), gt(schema.sessions.expiresAt, new Date()), eq(schema.users.active, true)))
    .limit(1);
  return row ?? null;
});

/** Exige une session (sinon redirection vers la connexion) et, si précisé, un droit. */
export async function requireUser(permission?: Permission): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (permission && !can(user.role, permission)) redirect("/admin?denied=1");
  return user;
}

/** Variante pour les actions serveur : lève une erreur au lieu de rediriger quand le droit manque. */
export async function requireActionUser(permission: Permission): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (!can(user.role, permission)) throw new Error("Droit insuffisant");
  return user;
}
