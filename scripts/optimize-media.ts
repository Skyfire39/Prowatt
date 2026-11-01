/**
 * Allège les images déjà envoyées depuis l'administration (table `media`) : redimensionnement à 2 000 px au plus et
 * conversion en WebP. Les adresses (/api/media/<id>) ne changent pas, mais le fichier d'origine est remplacé.
 *
 *   npx tsx scripts/optimize-media.ts           simulation : montre le gain, ne modifie rien
 *   npx tsx scripts/optimize-media.ts --apply   remplace les fichiers par leur version allégée
 */
import { config } from "dotenv";
import postgres from "postgres";
import { compressImage } from "../lib/media";

config({ path: ".env.local" });
config();

const MIN_SIZE = 60 * 1024; // en dessous, le gain ne vaut pas le remplacement

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL est absent.");
  const apply = process.argv.includes("--apply");
  const sql = postgres(url, { prepare: false, max: 1, ssl: "require" });
  try {
    const ids = await sql`select id, filename, mime, size from media where size >= ${MIN_SIZE} and mime <> 'image/webp' order by size desc`;
    let before = 0;
    let after = 0;
    let done = 0;
    for (const m of ids) {
      const [row] = await sql`select data from media where id = ${m.id}`;
      const packed = await compressImage(Buffer.from(row.data));
      if (!packed) continue;
      before += Number(m.size);
      after += packed.data.length;
      done++;
      if (apply) {
        const filename = String(m.filename).replace(/\.[a-z0-9]+$/i, "") + ".webp";
        await sql`update media set data = ${packed.data}, mime = ${packed.mime}, size = ${packed.data.length}, filename = ${filename.slice(0, 120)} where id = ${m.id}`;
      }
      console.log(`${apply ? "✓" : "·"} ${m.filename}: ${Math.round(Number(m.size) / 1024)} Ko → ${Math.round(packed.data.length / 1024)} Ko`);
    }
    console.log(`\n${done} image(s) ${apply ? "allégée(s)" : "à alléger"} : ${Math.round(before / 1024)} Ko → ${Math.round(after / 1024)} Ko (−${before ? Math.round((1 - after / before) * 100) : 0} %).`);
    if (!apply && done) console.log("Simulation seulement. Ajoutez --apply pour remplacer les fichiers.");
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
