/**
 * Applique les migrations (dossier ./drizzle) sur la base DATABASE_URL, puis remplit les tables vides
 * avec le contenu actuel du site. À lancer à chaque mise à jour du schéma : `npm run db:migrate`.
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "../lib/db/schema";

config({ path: ".env.local" });
config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL est absent : renseignez-le dans .env.local ou dans l'environnement.");
    process.exit(1);
  }
  const db = drizzle(neon(url), { schema });
  console.log("Migration en cours…");
  await migrate(db, { migrationsFolder: "./drizzle" });
  const { seedIfEmpty } = await import("../lib/db/seed");
  await seedIfEmpty(db as never);
  console.log("Base à jour.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
