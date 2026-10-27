/**
 * Crée (ou promeut) un compte propriétaire de l'administration sur la base DATABASE_URL.
 *   npm run user:owner -- vous@exemple.com "Votre nom"
 * Le mot de passe est demandé au clavier (jamais affiché) ; il peut aussi venir de la variable OWNER_PASSWORD.
 */
import { config } from "dotenv";
import { createInterface } from "node:readline";
import * as schema from "../lib/db/schema";

config({ path: ".env.local" });
config();

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
    process.stdout.write(question);
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = () => {};
    rl.question("", (answer) => {
      (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = write;
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const [email, ...rest] = process.argv.slice(2);
  const name = rest.join(" ") || "Propriétaire";
  if (!email) {
    console.error('Usage : npm run user:owner -- vous@exemple.com "Votre nom"');
    process.exit(1);
  }
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL est absent : renseignez-le dans .env.local.");
    process.exit(1);
  }
  const password = process.env.OWNER_PASSWORD || (await askHidden("Mot de passe (10 caractères minimum, lettres et chiffres) : "));
  if (!process.env.OWNER_PASSWORD && (await askHidden("Confirmez le mot de passe : ")) !== password) {
    console.error("Les deux mots de passe sont différents.");
    process.exit(1);
  }

  const { createOwner } = await import("../lib/admin/create-owner");
  let result: { id: string; created: boolean };
  if (/\.neon\.tech(:|\/|\?|$)/.test(url)) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    result = await createOwner(drizzle(neon(url), { schema }) as never, { email, name, password });
  } else {
    const { default: postgres } = await import("postgres");
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const client = postgres(url, { max: 1, ssl: "require", prepare: false, connect_timeout: 20 });
    try {
      result = await createOwner(drizzle(client, { schema }) as never, { email, name, password });
    } finally {
      await client.end();
    }
  }
  console.log(result.created ? `Compte propriétaire créé pour ${email}.` : `Le compte ${email} existait : il est maintenant propriétaire actif, avec le nouveau mot de passe.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
