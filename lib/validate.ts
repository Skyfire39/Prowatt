/** Lecture et nettoyage des champs de formulaire (actions serveur). */
export const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
export const opt = (fd: FormData, k: string) => s(fd, k) || null;
export const bool = (fd: FormData, k: string) => fd.get(k) === "on";

/** Entier (ariary, quantités) : accepte les espaces et la virgule décimale. */
export function int(fd: FormData, k: string, fallback = 0) {
  const n = Number(s(fd, k).replace(/[\s ]/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n) : fallback;
}
export function optInt(fd: FormData, k: string) {
  return s(fd, k) === "" ? null : int(fd, k);
}
export function num(fd: FormData, k: string, fallback = 0) {
  const n = Number(s(fd, k).replace(/[\s ]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
export const isIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
export const slugify = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export type FormState = { error?: string; ok?: string } | null;
