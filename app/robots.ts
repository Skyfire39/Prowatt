import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // /commande (paiement) n'est PAS bloquée ici : elle porte « noindex », et Google doit pouvoir la lire pour la retirer
    // de ses résultats (une page bloquée par robots.txt peut rester indexée sans description). Les photos des produits,
    // servies par /api/media/ et redimensionnées par /api/img, doivent rester accessibles aux robots ; le reste de /api/ et l'administration sont fermés.
    rules: [{ userAgent: "*", allow: ["/", "/api/media/", "/api/img"], disallow: ["/admin", "/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
