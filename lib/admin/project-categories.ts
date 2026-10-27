import fr from "@/app/[lang]/dictionaries/fr.json";
import { slugs } from "@/lib/data";

/** Les cinq catégories de réalisations (types de solutions), avec leur nom affiché sur le site. */
export const projectCategories = slugs.map((id) => ({ id, name: fr.categories[id].name }));
