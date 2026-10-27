import type { Locale } from "@/lib/i18n";
import type fr from "./dictionaries/fr.json";

export type Dictionary = typeof fr;

// Une seule langue : le paramètre reste pour que les appels n'aient pas à changer.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDictionary = (_locale: Locale): Promise<Dictionary> =>
  import("./dictionaries/fr.json").then((m) => m.default);
