/**
 * Options d'un produit ou d'une moto (couleur, type, batterie…), avec un supplément de prix facultatif par valeur.
 * Partagé entre l'admin, le panier (navigateur) et les routes de commande (serveur) : le serveur recalcule toujours
 * le prix à partir de ces règles, le navigateur n'envoie que les choix.
 */
export type OptionValue = {
  label: string;
  /** Couleur de la pastille (#rrggbb) pour une option de type « color ». */
  color?: string | null;
  /** Supplément en ariary (négatif : réduction). 0 : même prix. */
  delta: number;
  /** Photo du produit pour ce choix (/api/media/<id>), facultative : elle remplace la photo principale quand le choix est sélectionné. */
  image?: string | null;
};
/** Affichage côté client : pastilles de couleur, boutons de texte ou vignettes photo. */
export type OptionKind = "color" | "text" | "image";
export type ProductOption = { name: string; kind: OptionKind; values: OptionValue[] };
/** Choix du client : nom de l'option → libellé de la valeur. */
export type Selection = Record<string, string>;

export const OPTION_LIMITS = { options: 4, values: 12, name: 40, label: 40 } as const;

const HEX = /^#[0-9a-f]{6}$/i;
const MEDIA_URL = /^\/api\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Valide des options venant de la base ou d'un formulaire : ce qui est invalide est écarté, les doublons aussi. */
export function parseOptions(raw: unknown): ProductOption[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: ProductOption[] = [];
  for (const o of raw.slice(0, OPTION_LIMITS.options)) {
    const x = (o ?? {}) as Record<string, unknown>;
    const name = clip(x.name, OPTION_LIMITS.name);
    if (!name || seen.has(name.toLowerCase())) continue;
    const kind: OptionKind = x.kind === "color" ? "color" : x.kind === "image" ? "image" : "text";
    const labels = new Set<string>();
    const values: OptionValue[] = [];
    for (const v of (Array.isArray(x.values) ? x.values : []).slice(0, OPTION_LIMITS.values)) {
      const y = (v ?? {}) as Record<string, unknown>;
      const label = clip(y.label, OPTION_LIMITS.label);
      if (!label || labels.has(label.toLowerCase())) continue;
      const delta = Math.round(Number(y.delta));
      const color = kind === "color" && typeof y.color === "string" && HEX.test(y.color) ? y.color.toLowerCase() : null;
      const image = typeof y.image === "string" && MEDIA_URL.test(y.image) ? y.image : null;
      values.push({ label, color, image, delta: Number.isFinite(delta) ? Math.max(-1_000_000_000, Math.min(1_000_000_000, delta)) : 0 });
      labels.add(label.toLowerCase());
    }
    if (values.length === 0) continue;
    seen.add(name.toLowerCase());
    out.push({ name, kind, values });
  }
  return out;
}

/** Première valeur de chaque option. */
export function defaultSelection(options: ProductOption[]): Selection {
  return Object.fromEntries(options.map((o) => [o.name, o.values[0].label]));
}

/**
 * Choix valide pour ces options, ou `null` s'il en contient un qui n'existe pas (option retirée, valeur renommée…).
 * Une option sans choix prend sa première valeur ; les clés inconnues sont ignorées.
 */
export function resolveSelection(options: ProductOption[], raw: unknown): Selection | null {
  const given = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out: Selection = {};
  for (const o of options) {
    const v = given[o.name];
    if (v === undefined) {
      out[o.name] = o.values[0].label;
      continue;
    }
    if (typeof v !== "string" || !o.values.some((x) => x.label === v)) return null;
    out[o.name] = v;
  }
  return out;
}

/** Photo liée aux choix sélectionnés (la première trouvée, dans l'ordre des options), ou `null`. */
export const selectionImage = (options: ProductOption[], sel: Selection) => {
  for (const o of options) {
    const img = o.values.find((v) => v.label === sel[o.name])?.image;
    if (img) return img;
  }
  return null;
};

export const selectionDelta = (options: ProductOption[], sel: Selection) =>
  options.reduce((n, o) => n + (o.values.find((v) => v.label === sel[o.name])?.delta ?? 0), 0);

/** « Couleur : Rouge · Batterie : Lithium », dans l'ordre des options. Vide s'il n'y a pas d'options. */
export const selectionLabel = (options: ProductOption[], sel: Selection) =>
  options.map((o) => `${o.name} : ${sel[o.name] ?? o.values[0].label}`).join(" · ");

/** Identifiant d'une ligne de panier : le produit et ses choix (deux couleurs = deux lignes). */
export const lineKey = (id: string, sel?: Selection | null) => {
  const parts = Object.entries(sel ?? {}).sort(([a], [b]) => a.localeCompare(b));
  return parts.length ? `${id}|${parts.map(([k, v]) => `${k}=${v}`).join(";")}` : id;
};

/** Prix le plus bas et le plus haut selon les choix possibles. */
export function priceRange(base: number, options: ProductOption[]) {
  let min = base;
  let max = base;
  for (const o of options) {
    const ds = o.values.map((v) => v.delta);
    min += Math.min(...ds);
    max += Math.max(...ds);
  }
  return { min, max };
}

/** Prix affiché sur une carte : « À partir de … » quand les options le font varier, et pas de prix barré dans ce cas. */
export function cardPrice(base: number, oldPrice: number | undefined, options: ProductOption[], money: (n: number) => string, from: string) {
  const { min, max } = priceRange(base, options);
  const varies = min !== max;
  return {
    price: varies ? `${from} ${money(min)}` : money(min),
    oldPrice: !varies && oldPrice ? money(oldPrice + (min - base)) : undefined,
    hasOptions: options.length > 0,
  };
}
