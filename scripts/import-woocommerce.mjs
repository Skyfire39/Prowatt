/**
 * Import ponctuel du catalogue de l'ancien site (WooCommerce) : produits, catégories, images, et fiches
 * techniques des motos Ecooter. Écrit lib/catalog.json et les images dans public/images/products/.
 *
 *   node scripts/import-woocommerce.mjs
 *
 * Réutilisable : relancé, il met à jour le fichier et ne retélécharge pas les images déjà présentes.
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ORIGIN = "https://prowattmadagascar.com";
const OUT_IMG = "public/images/products";

const get = async (url) => {
  const r = await fetch(url, { headers: { "user-agent": "prowatt-import/1.0" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
};

/* ───────────── Catégories : slug WooCommerce → id du site ───────────── */
const CATEGORY_MAP = {
  accessoire: "accessoire",
  "batterie-gel": "batterie-gel",
  "batterie-lithium": "batterie-lithium",
  "cables-electriques": "cable-electrique",
  "chauffe-eau-solaire": "chauffe-eau-solaire",
  convertisseur: "convertisseur",
  disjoncteur: "disjoncteur",
  "luminaire-solaire": "luminaire-solaire",
  "mini-kit-solaire": "mini-kit-solaire",
  "motos-electriques": "motos-electriques",
  "panneaux-solaires": "panneau-solaire",
  "pompe-solaire": "pompe-solaire",
  powerbank: "powerbank",
  regulateur: "regulateur",
  solis: "solis",
  stabilisateur: "stabilisateur",
  "structure-en-aluminium": "structure-aluminium",
};
const CATEGORIES = [
  { id: "structure-aluminium", fr: "Structure aluminium", en: "Aluminium mounting" },
  { id: "panneau-solaire", fr: "Panneau solaire", en: "Solar panel" },
  { id: "batterie-lithium", fr: "Batterie lithium", en: "Lithium battery" },
  { id: "batterie-gel", fr: "Batterie gel", en: "Gel battery" },
  { id: "convertisseur", fr: "Convertisseur", en: "Inverter" },
  { id: "solis", fr: "Solis", en: "Solis" },
  { id: "regulateur", fr: "Régulateur", en: "Charge controller" },
  { id: "stabilisateur", fr: "Stabilisateur", en: "Stabiliser" },
  { id: "disjoncteur", fr: "Disjoncteur", en: "Circuit breaker" },
  { id: "cable-electrique", fr: "Câble électrique", en: "Electric cable" },
  { id: "chauffe-eau-solaire", fr: "Chauffe-eau solaire", en: "Solar water heater" },
  { id: "pompe-solaire", fr: "Pompe solaire", en: "Solar pump" },
  { id: "luminaire-solaire", fr: "Luminaire solaire", en: "Solar light" },
  { id: "mini-kit-solaire", fr: "Mini kit solaire", en: "Mini solar kit" },
  { id: "powerbank", fr: "Powerbank", en: "Power bank" },
  { id: "motos-electriques", fr: "Motos électriques", en: "Electric motorbikes" },
  { id: "accessoire", fr: "Accessoire", en: "Accessory" },
];

/* ───────────── Texte ───────────── */
const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", rsquo: "’", lsquo: "‘", ndash: "–", mdash: "—", laquo: "«", raquo: "»" };
const unescape = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => entities[n.toLowerCase()] ?? m);

const ACRONYMS = new Set("MPPT PWM DC AC CE LED VGV DPN MCB GSL PS SP GM AD ICT TGBT UPS PV USB GEL LCD IP RS".split(" "));
ACRONYMS.delete("GEL");
const BRANDS = { PROWATT: "Prowatt", SOLIS: "Solis", PROBAT: "Probat", WIFI: "WiFi", WH: "Wh", KWH: "kWh", KW: "kW", KVA: "kVA" };
const ACCENTS = {
  regulateur: "régulateur", boitier: "boîtier", pressurise: "pressurisé", integre: "intégré", isole: "isolé", differentiel: "différentiel",
  separe: "séparé", metallique: "métallique", controleur: "contrôleur", derivation: "dérivation", hydride: "hybride", electrique: "électrique",
  electriques: "électriques", ecran: "écran", etanche: "étanche", resistant: "résistant", reglable: "réglable", reglage: "réglage", cable: "câble",
  cables: "câbles", energie: "énergie", generateur: "générateur", protege: "protégé", tubulair: "tubulaire", "reglable.": "réglable.",
};

/** « STRUCTURE PANNEAUX COSSE… 20 MM » → « Structure panneaux cosse… 20 MM » (sigles, marques et références conservés). */
function niceName(raw) {
  const name = unescape(raw).replace(/\s+/g, " ").trim();
  const letters = name.replace(/[^A-Za-zÀ-ÿ]/g, "");
  const upper = letters.replace(/[^A-ZÀ-Þ]/g, "").length;
  if (letters.length === 0 || upper / letters.length < 0.6) return name;
  const out = name
    .split(" ")
    .map((tok) => {
      const m = tok.match(/^([^A-Za-zÀ-ÿ0-9]*)(.*?)([^A-Za-zÀ-ÿ0-9]*)$/);
      const [, pre, core, post] = m;
      if (!core) return tok;
      if (/\d/.test(core) || core.length === 1) return tok; // 48V, 5000W, 30mA, 100A… et lettres seules (L feet)
      const up = core.toUpperCase();
      if (BRANDS[up]) return pre + BRANDS[up] + post;
      if (ACRONYMS.has(up)) return pre + up + post;
      const low = core.toLowerCase();
      return pre + (ACCENTS[low] ?? low) + post;
    })
    .join(" ");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** HTML de description → texte brut lisible (titres, paragraphes, puces). */
function htmlToText(html) {
  if (!html) return "";
  let h = html
    .replace(/<(style|script|svg)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/(p|h[1-6]|ul|ol|div|tr|table)>/gi, "\n\n")
    .replace(/<(h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  h = unescape(h)
    .split("\n")
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(• [^\n]*)\n\n(?=• )/g, "$1\n") // une liste reste compacte
    .replace(/(• [^\n]*)\n\n(?=• )/g, "$1\n")
    .trim();
  return h.slice(0, 5000);
}

/* ───────────── Motos : fiche technique extraite des pages produit ───────────── */
const MOTO_IDS = { 3229: "alta", 3141: "nova-lite", 3131: "via-lite", 3119: "voltis", 3101: "aura", 3062: "cargox" };

const fixUnits = (v) =>
  v
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(\d)\s*(w|W)\b/, "$1 W")
    .replace(/(\d)\s*km\s*\/\s*h/i, "$1 km/h")
    .replace(/(\d)\s*km\b/i, "$1 km")
    .replace(/(\d)\s*heures?/i, "$1 h")
    .replace(/\bAns\b/g, "ans")
    .replace(/\bKm\b/g, "km")
    .replace(/(\d)\s*Litres?/i, "$1 L")
    .replace(/\bou\b/g, "ou");

function motoSpecs(html) {
  const lines = html
    .replace(/<(style|script|svg)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/(li|p|h\d|tr|div|span)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((l) => unescape(l).replace(/\s+/g, " ").trim())
    .filter((l) => l && !/[{}]/.test(l) && !/^\.st\d/.test(l)); // la page mélange du CSS d'icônes au texte
  const LABELS = { "PUISSANCE MOTEUR": "power", "TYPE DE BATTERIE": "battery", "PUISSANCE BATTERIE": "batteryPower", "TEMPS DE CHARGE": "charge", "VITESSE MAX": "speed", AUTONOMIE: "range", GARANTIE: "warranty", "CAISSE ARRIÈRE": "trunk" };
  const specs = {};
  for (let i = 0; i < lines.length; i++) {
    const key = LABELS[lines[i].toUpperCase()];
    if (!key) continue;
    const vals = [];
    for (let j = i + 1; j < lines.length && !LABELS[lines[j].toUpperCase()] && !/^[A-ZÉÈ ]{8,}$/.test(lines[j]) && vals.length < 3; j++) vals.push(lines[j]);
    let v = fixUnits(vals.join(" "));
    if (key === "battery") v = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
    if (v) specs[key] = v;
  }
  return specs;
}

/* ───────────── Images ───────────── */
const exists = (p) => access(p).then(() => true, () => false);

function pickSrc(img) {
  // On prend une version d'environ 800 px quand elle existe (inutile de télécharger le plein format).
  const cands = String(img.srcset ?? "")
    .split(",")
    .map((s) => s.trim().split(/\s+/))
    .map(([url, w]) => ({ url, w: parseInt(w) || 0 }))
    .filter((c) => c.url);
  const good = cands.filter((c) => c.w >= 700).sort((a, b) => a.w - b.w)[0];
  return good?.url ?? img.src;
}

async function saveImage(img, id) {
  const file = path.join(OUT_IMG, `${id}.webp`);
  if (await exists(file)) return `/images/products/${id}.webp`;
  try {
    const buf = Buffer.from(await (await get(pickSrc(img))).arrayBuffer());
    await sharp(buf).rotate().resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(file);
    return `/images/products/${id}.webp`;
  } catch (e) {
    console.warn("image ignorée", id, e.message);
    return null;
  }
}

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k], k);
      }
    }),
  );
  return out;
}

/* ───────────── Programme principal ───────────── */
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

async function main() {
  await mkdir(OUT_IMG, { recursive: true });

  // Produits du site actuel : on reprend leurs valeurs d'essai (meilleures ventes, promotions) et leurs noms anglais.
  const current = await readFile("lib/catalog.json", "utf8").then(JSON.parse).catch(() => null);
  const carry = new Map();
  if (current) for (const p of current.products) carry.set(norm(p.name.fr), p);
  else {
    const src = await readFile("lib/data.ts", "utf8");
    for (const m of src.matchAll(/\{ id: "([^"]+)"([^\n]*?)name: \{ fr: "([^"]+)", en: "([^"]+)" \}/g)) {
      const flags = m[2];
      carry.set(norm(m[3]), {
        name: { fr: m[3], en: m[4] },
        bestSeller: /bestSeller: true/.test(flags) || undefined,
        oldPrice: Number(flags.match(/oldPrice: (\d+)/)?.[1]) || undefined,
      });
    }
  }

  const all = [];
  for (let page = 1; ; page++) {
    const batch = await (await get(`${ORIGIN}/wp-json/wc/store/v1/products?per_page=100&page=${page}`)).json();
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  const dates = new Map();
  for (let page = 1; ; page++) {
    const batch = await (await get(`${ORIGIN}/wp-json/wp/v2/product?per_page=100&page=${page}&_fields=id,date`)).json();
    if (!batch.length) break;
    for (const b of batch) dates.set(b.id, b.date.slice(0, 10));
    if (batch.length < 100) break;
  }
  console.log(`${all.length} produits récupérés`);

  const isMoto = (p) => p.categories.some((c) => c.slug === "motos-electriques");
  const ecooters = {};
  for (const p of all.filter(isMoto)) {
    const id = MOTO_IDS[p.id];
    if (!id) continue;
    const price = Number(p.prices.price) || null;
    ecooters[id] = { price, specs: motoSpecs(p.description) };
  }

  const products = [];
  const usedIds = new Set();
  const shop = all.filter((p) => !isMoto(p));
  const images = await pool(shop, 8, async (p) => (p.images[0] ? saveImage(p.images[0], p.slug.slice(0, 80)) : null));

  shop.forEach((p, i) => {
    const cat = CATEGORY_MAP[p.categories[0]?.slug];
    if (!cat) return;
    let id = p.slug.slice(0, 80);
    while (usedIds.has(id)) id += "-2";
    usedIds.add(id);
    const fr = niceName(p.name);
    const old = carry.get(norm(fr));
    const price = Number(p.prices.price) || 0;
    const desc = htmlToText(p.description) || htmlToText(p.short_description);
    const oldPrice = old?.oldPrice && old.oldPrice > price ? old.oldPrice : undefined;
    products.push({
      id,
      category: cat,
      name: { fr, en: old?.name?.en ?? fr },
      price,
      ...(oldPrice ? { oldPrice } : {}),
      ...(old?.bestSeller ? { bestSeller: true } : {}),
      addedAt: dates.get(p.id) ?? "2025-03-24",
      ...(p.sku ? { sku: p.sku } : {}),
      ...(desc ? { description: { fr: desc, en: desc } } : {}),
      ...(images[i] ? { image: images[i] } : {}),
      // Sans prix publié, le produit est importé masqué : on le voit dans l'admin, pas sur la boutique.
      ...(price > 0 ? {} : { active: false }),
    });
  });
  products.sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.name.fr.localeCompare(b.name.fr));

  await writeFile("lib/catalog.json", JSON.stringify({ categories: CATEGORIES, products, ecooters }, null, 1) + "\n");
  const hidden = products.filter((p) => p.active === false);
  console.log(`${products.length} produits écrits (${products.filter((p) => p.image).length} avec image) · ${hidden.length} masqués faute de prix :`);
  for (const h of hidden) console.log("  -", h.name.fr);
  console.log("motos :", Object.keys(ecooters).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
