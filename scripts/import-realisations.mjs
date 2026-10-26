/**
 * Import ponctuel des photos, clients et descriptions des réalisations de l'ancien site.
 * Les chiffres (kWc, stockage, CO₂…) sont déjà dans lib/data.ts : ce script ajoute ce qui manquait.
 * Écrit lib/realisations-media.json et les photos dans public/images/realisations/.
 *
 *   node scripts/import-realisations.mjs
 */
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ORIGIN = "https://prowattmadagascar.com";
const OUT = "public/images/realisations";
// Pages WordPress de chaque type de solution → identifiant utilisé par le site.
const PAGES = { 1601: "100-autonome", 1603: "hybride", 1605: "ongrid", 1599: "anti-delestage", 1464: "acces-a-eau" };
const MONTHS = { janvier: 1, fevrier: 2, février: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, août: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12, décembre: 12 };

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', nbsp: " ", rsquo: "’", ndash: "–", hellip: "…" };
const unescape = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&([a-z]+);/gi, (m, n) => entities[n.toLowerCase()] ?? m);
const exists = (p) => access(p).then(() => true, () => false);

/** Texte et images de la page, dans l'ordre d'apparition. */
function tokens(html) {
  const h = html.replace(/<(style|script|svg)[\s\S]*?<\/\1>/gi, "");
  const out = [];
  for (const m of h.matchAll(/<img[^>]+?src="([^"]+)"[^>]*>|>([^<>]+)</g)) {
    if (m[1]) out.push({ img: m[1] });
    else {
      const t = unescape(m[2].replace(/\s+/g, " ")).trim();
      if (t) out.push({ t });
    }
  }
  return out;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const result = {};

  for (const [id, slug] of Object.entries(PAGES)) {
    const page = await (await fetch(`${ORIGIN}/wp-json/wp/v2/pages/${id}`)).json();
    const T = tokens(page.content.rendered);
    const starts = T.map((x, i) => (x.t?.startsWith("Client") ? i : -1)).filter((i) => i >= 0);

    const seen = new Set();
    const counters = new Map();
    for (let n = 0; n < starts.length; n++) {
      // Un projet commence 2 lignes avant « Client : » (catégorie + titre) et finit au projet suivant.
      const block = T.slice(starts[n] - 2, n + 1 < starts.length ? starts[n + 1] - 2 : T.length);
      const text = block.filter((x) => x.t).map((x) => x.t);
      const joined = text.join(" ");
      const sig = text.slice(0, 8).join("|");
      if (seen.has(sig)) continue; // Elementor répète chaque bloc (version mobile)
      seen.add(sig);

      const dt = joined.match(/Date d.installation\s*:?\s*(?:\d{0,2})\s*([A-Za-zéûèô]+)\s*(\d{4})/);
      const date = dt && MONTHS[dt[1].toLowerCase()] ? `${dt[2]}-${String(MONTHS[dt[1].toLowerCase()]).padStart(2, "0")}` : "";
      const k = counters.get(date) ?? 0;
      counters.set(date, k + 1);

      let client = text[text.findIndex((t) => t.startsWith("Client")) + 1]?.replace(/^:\s*/, "").trim();
      // Quelques libellés de l'ancien site sont des phrases, ou sans accents : on les nettoie.
      if (client && /^Installation réalisée/i.test(client)) client = undefined;
      client = client?.replace(/\betages\b/g, "étages").replace(/\bglacon\b/g, "glaçons");
      const description = text
        .filter((t) => t.length > 60 && !/^(Client|Localisation|Date)/.test(t))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      const urls = [...new Set(block.filter((x) => x.img).map((x) => x.img))];

      const images = [];
      for (let i = 0; i < urls.length; i++) {
        const name = `${slug}-${date || "x"}-${k}-${i + 1}`;
        const file = path.join(OUT, `${name}.webp`);
        if (!(await exists(file))) {
          try {
            const buf = Buffer.from(await (await fetch(urls[i])).arrayBuffer());
            await sharp(buf).rotate().resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
          } catch (e) {
            console.warn("image ignorée", urls[i], e.message);
            continue;
          }
        }
        images.push(`/images/realisations/${name}.webp`);
      }

      result[`${slug}|${date}|${k}`] = {
        ...(client ? { client } : {}),
        ...(description ? { description: { fr: description, en: description } } : {}),
        images,
      };
      console.log(`${slug} ${date || "(sans date)"} #${k} — ${client ?? "?"} — ${images.length} photo(s)`);
    }
  }

  await writeFile("lib/realisations-media.json", JSON.stringify(result, null, 1) + "\n");
  console.log(`${Object.keys(result).length} réalisations écrites`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
