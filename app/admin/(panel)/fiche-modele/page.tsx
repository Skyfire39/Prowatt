import type { Metadata } from "next";
import Link from "next/link";
import { ModelPageForm } from "@/components/admin/model-page-form";
import { Flash, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getEcooterPage, getEcooters } from "@/lib/content";

export const metadata: Metadata = { title: "Fiche modèle Ecooter" };

export default async function ModelPageEditor({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("motos.write");
  const { ok } = await searchParams;
  const [page, ecooters] = await Promise.all([getEcooterPage(), getEcooters()]);
  const sample = ecooters[0];

  return (
    <>
      <Flash code={ok} />
      <PageHeader
        eyebrow="Catalogue"
        title="Fiche modèle Ecooter"
        subtitle="Les blocs image et texte qui s'affichent sous les paramètres de chaque modèle. Ils sont communs à tous les modèles : la photo change, les textes restent."
        actions={
          sample && (
            <Link href={`/fr/ecooter/modeles/${sample.id}`} target="_blank" className="text-sm font-semibold text-accent hover:underline">
              Voir une fiche sur le site ↗
            </Link>
          )
        }
      />
      <ModelPageForm initial={page} photo={sample?.photo ?? "/images/ecooter/aura.webp"} />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
