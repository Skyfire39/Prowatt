"use client";

/**
 * Chargeur d'images du site, à la place de l'optimiseur de Vercel : son quota mensuel, une fois dépassé, renvoie
 * « 402 Payment required » et les images ne s'affichent plus. Chaque image passe par /api/img, qui la réduit à la
 * largeur demandée et la convertit en WebP ; le CDN garde ensuite chaque version.
 * Une adresse déjà complète (http…, data:) est laissée telle quelle.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith("/") || src.startsWith("/api/img")) return src;
  return `/api/img?src=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}
