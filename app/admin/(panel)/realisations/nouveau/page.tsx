import type { Metadata } from "next";
import { ProjectForm } from "@/components/admin/project-form";
import { PageHeader } from "@/components/admin/ui";
import { projectCategories } from "@/lib/admin/project-categories";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nouvelle réalisation" };

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  await requireUser("content.write");
  const { cat } = await searchParams;
  const slug = projectCategories.find((c) => c.id === cat)?.id ?? projectCategories[0].id;
  return (
    <>
      <PageHeader eyebrow="Réalisations" title="Nouvelle réalisation" back={{ href: "/admin/realisations", label: "Toutes les réalisations" }} />
      <ProjectForm
        categories={projectCategories}
        values={{
          slug,
          titleFr: "",
          city: "",
          date: "",
          client: "",
          descriptionFr: "",
          noteFr: "",
          storageKind: "",
          panelsCount: "",
          panelsWatts: "",
          numbers: {},
          images: [],
          active: true,
          sort: "",
        }}
      />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
