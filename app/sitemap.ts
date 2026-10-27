import type { MetadataRoute } from "next";
import { getEcooters, getProducts } from "@/lib/content";
import { slugs, techs } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

type Entry = MetadataRoute.Sitemap[number];

/** Plan du site : pages publiques, catégories de réalisations, fiches produit et modèles Ecooter. Pas d'administration, d'API ni de commande. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, ecooters] = await Promise.all([getProducts(), getEcooters()]);
  const page = (path: string, priority: number, changeFrequency: Entry["changeFrequency"], lastModified?: Date): Entry => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
    ...(lastModified && !Number.isNaN(lastModified.getTime()) ? { lastModified } : {}),
  });

  return [
    page("/", 1, "weekly"),
    page("/realisations", 0.9, "weekly"),
    ...slugs.map((s) => page(`/realisations/${s}`, 0.8, "weekly")),
    page("/boutique", 0.9, "daily"),
    ...products.map((p) => page(`/boutique/${p.id}`, 0.7, "weekly", new Date(p.addedAt))),
    page("/ecooter", 0.9, "weekly"),
    ...techs.map((t) => page(`/ecooter/${t}`, 0.6, "monthly")),
    ...ecooters.map((m) => page(`/ecooter/modeles/${m.id}`, 0.8, "weekly")),
    page("/avantages", 0.7, "monthly"),
    page("/devis", 0.8, "monthly"),
    page("/devis/particulier", 0.6, "monthly"),
    page("/devis/societe", 0.6, "monthly"),
    page("/contact", 0.7, "monthly"),
  ];
}
