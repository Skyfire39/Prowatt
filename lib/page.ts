import { notFound } from "next/navigation";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { hasLocale } from "./i18n";

/** Valide la locale de l'URL et charge le dictionnaire correspondant. */
export async function loadPage(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return { lang, dict: await getDictionary(lang) };
}
