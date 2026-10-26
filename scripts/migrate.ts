/**
 * Applique les migrations (dossier ./drizzle) sur la base DATABASE_URL, puis remplit les tables vides
 * avec le contenu actuel du site. À lancer à chaque mise à jour du schéma : `npm run db:migrate`.
 */
import { config } from "dotenv";
import * as schema from "../lib/db/schema";

config({ path: ".env.local" });
config();

async function main() {
  // Connexion directe (hors pooler) recommandée pour les migrations : DATABASE_URL_UNPOOLED, sinon DATABASE_URL.
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL est absent : renseignez-le dans .env.local ou dans l'environnement.");
    process.exit(1);
  }
  console.log("Migration en cours…");
  if (/\.neon\.tech(:|\/|\?|$)/.test(url)) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    const db = drizzle(neon(url), { schema });
    await migrate(db, { migrationsFolder: "./drizzle" });
    const { seedIfEmpty } = await import("../lib/db/seed");
    await seedIfEmpty(db as never);
  } else {
    const { default: postgres } = await import("postgres");
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    const client = postgres(url, { max: 1, ssl: "require", connect_timeout: 20 });
    try {
      const db = drizzle(client, { schema });
      await migrate(db, { migrationsFolder: "./drizzle" });
      const { seedIfEmpty } = await import("../lib/db/seed");
      await seedIfEmpty(db as never);
    } finally {
      await client.end();
    }
  }
  console.log("Base à jour.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
