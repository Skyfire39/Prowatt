/**
 * Accès à la base de données (Postgres).
 *  - Production / hébergé : Neon via DATABASE_URL (pilote HTTP serverless).
 *  - Développement sans DATABASE_URL : Postgres local embarqué (PGlite) dans .data/pglite, migré et
 *    rempli automatiquement. Jamais utilisé pendant `next build` ni en production.
 * Ce module ne doit être importé que côté serveur.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import type { PgDatabase } from "drizzle-orm/pg-core";
import * as schema from "./schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = PgDatabase<any, typeof schema>;
export { schema };

type Kind = "neon" | "pglite";
type Holder = { db?: Db; kind?: Kind; ready?: Promise<void> };
const g = globalThis as unknown as { __prowattDb?: Holder };
const holder: Holder = (g.__prowattDb ??= {});

const url = () => process.env.DATABASE_URL?.trim() || "";

/** Une base est-elle utilisable ? Sinon l'admin affiche l'écran de configuration et le site reste statique. */
export const dbConfigured = () => Boolean(url()) || process.env.NODE_ENV === "development";

/** Vrai quand la base est le Postgres local de développement (PGlite). */
export const isLocalDb = () => !url() && process.env.NODE_ENV === "development";

async function create(): Promise<Db> {
  if (url()) {
    holder.kind = "neon";
    return drizzleNeon(neon(url()), { schema }) as unknown as Db;
  }
  if (process.env.NODE_ENV !== "development") throw new Error("DATABASE_URL manquant");
  holder.kind = "pglite";
  (await import("node:fs")).mkdirSync("./.data", { recursive: true });
  const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("drizzle-orm/pglite/migrator"),
  ]);
  const client = new PGlite("./.data/pglite");
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  const { seedIfEmpty } = await import("./seed");
  await seedIfEmpty(db as unknown as Db);
  return db as unknown as Db;
}

/** Connexion paresseuse (aucun accès à l'import : le build ne doit pas exiger de base). */
export async function getDb(): Promise<Db> {
  if (holder.db) return holder.db;
  holder.ready ??= create().then(
    (db) => {
      holder.db = db;
    },
    (e) => {
      holder.ready = undefined; // une erreur de connexion ne doit pas rester en mémoire
      throw e;
    },
  );
  await holder.ready;
  return holder.db!;
}

/**
 * Exécute plusieurs écritures de façon atomique : tout passe ou rien.
 * `build` reçoit l'exécuteur à utiliser pour construire chaque requête.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function atomic(build: (q: Db) => any[]): Promise<void> {
  const db = await getDb();
  if (holder.kind === "neon") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).batch(build(db));
    return;
  }
  await db.transaction(async (tx) => {
    for (const q of build(tx as unknown as Db)) await q;
  });
}
