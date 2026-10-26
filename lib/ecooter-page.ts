import defaultsJson from "./ecooter-page-defaults.json";

/** Contenu modifiable de la fiche d'un modèle Ecooter (identique pour tous les modèles). */
export type Bi = { fr: string; en: string };
export type PageButton = { label: Bi; href: string; style: "primary" | "glass" };
export type PageBlock = {
  id: string;
  enabled: boolean;
  side: "left" | "right";
  /** Agrandissement de la photo (1 = entière) et point sur lequel on zoome, en %. */
  zoom: number;
  originX: number;
  originY: number;
  title: Bi;
  /** `**gras**` accepté ; {address} {hours} {phone} remplacés par les coordonnées de l'entreprise. */
  bullets: Bi[];
  /** href : « /ecooter/lithium » (préfixé par la langue), « https://… », « {phoneHref} », « {emailHref} ». */
  buttons: PageButton[];
};
export type EcooterPageContent = {
  blocks: PageBlock[];
  paramsNote: Bi;
  cta: { title: Bi; subtitle: Bi };
};

export const defaultEcooterPage = defaultsJson as EcooterPageContent;

export const LIMITS = { blocks: 8, bullets: 8, buttons: 3, title: 120, bullet: 400, label: 40, href: 200 } as const;

const str = (v: unknown, max: number, fallback = "") => (typeof v === "string" ? v.trim().slice(0, max) : fallback);
const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
function bi(v: unknown, max: number): Bi {
  const o = (v ?? {}) as Record<string, unknown>;
  const fr = str(o.fr, max);
  return { fr, en: str(o.en, max) || fr };
}
/** Une adresse de bouton sûre : chemin du site, https, mailto, tel ou jeton connu. */
export const safeHref = (h: string) => /^(\/(?!\/)[\w\-./?#=&%]*|https:\/\/[^\s]+|mailto:[^\s]+|tel:[\d+\s]+|\{phoneHref\}|\{emailHref\})$/.test(h);

/** Valide un contenu venant de la base ou du navigateur ; ce qui est invalide retombe sur le défaut. */
export function parseEcooterPage(raw: unknown): EcooterPageContent {
  const o = (raw ?? {}) as Record<string, unknown>;
  const d = defaultEcooterPage;
  const blocks = Array.isArray(o.blocks)
    ? o.blocks.slice(0, LIMITS.blocks).map((b, i): PageBlock => {
        const x = (b ?? {}) as Record<string, unknown>;
        return {
          id: str(x.id, 40).replace(/[^\w-]/g, "") || `bloc-${i + 1}`,
          enabled: x.enabled !== false,
          side: x.side === "right" ? "right" : "left",
          zoom: num(x.zoom, 1, 3, 1),
          originX: num(x.originX, 0, 100, 50),
          originY: num(x.originY, 0, 100, 50),
          title: bi(x.title, LIMITS.title),
          bullets: (Array.isArray(x.bullets) ? x.bullets : []).slice(0, LIMITS.bullets).map((t) => bi(t, LIMITS.bullet)).filter((t) => t.fr),
          buttons: (Array.isArray(x.buttons) ? x.buttons : [])
            .slice(0, LIMITS.buttons)
            .map((t): PageButton => {
              const y = (t ?? {}) as Record<string, unknown>;
              return { label: bi(y.label, LIMITS.label), href: str(y.href, LIMITS.href), style: y.style === "primary" ? "primary" : "glass" };
            })
            .filter((t) => t.label.fr && safeHref(t.href)),
        };
      })
    : d.blocks;
  const c = (o.cta ?? {}) as Record<string, unknown>;
  const note = bi(o.paramsNote, 300);
  const ctaTitle = bi(c.title, 120);
  const ctaSub = bi(c.subtitle, 200);
  return {
    blocks,
    paramsNote: note.fr ? note : d.paramsNote,
    cta: { title: ctaTitle.fr ? ctaTitle : d.cta.title, subtitle: ctaSub.fr ? ctaSub : d.cta.subtitle },
  };
}
