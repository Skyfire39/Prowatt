import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/client";
import { EyeIcon } from "@/components/admin/icons";
import { ProjectForm } from "@/components/admin/project-form";
import { LinkBtn, PageHeader, Panel } from "@/components/admin/ui";
import { TrashIcon } from "@/components/icons";
import { projectCategories } from "@/lib/admin/project-categories";
import { projectNumbers } from "@/lib/admin/projects";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { isUuid } from "@/lib/validate";
import { deleteProjectAction } from "../actions";

export const metadata: Metadata = { title: "Modifier la réalisation" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("content.write");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const db = await getDb();
  const [p] = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);
  if (!p) notFound();
  const category = projectCategories.find((c) => c.id === p.slug)?.name ?? p.slug;
  const record = p as unknown as Record<string, number | null>;

  return (
    <>
      <PageHeader
        eyebrow={category}
        title={p.titleFr}
        subtitle={p.city ?? undefined}
        back={{ href: `/admin/realisations?cat=${p.slug}`, label: "Toutes les réalisations" }}
        actions={
          <LinkBtn href={`/realisations/${p.slug}`} target="_blank" variant="soft">
            <EyeIcon className="size-4" />
            Voir la catégorie sur le site
          </LinkBtn>
        }
      />
      <ProjectForm
        categories={projectCategories}
        values={{
          id: p.id,
          slug: p.slug,
          titleFr: p.titleFr,
          city: p.city ?? "",
          date: p.date,
          client: p.client ?? "",
          descriptionFr: p.descriptionFr ?? "",
          noteFr: p.noteFr ?? "",
          storageKind: p.storageKind ?? "",
          panelsCount: p.panelsCount ?? "",
          panelsWatts: p.panelsWatts ?? "",
          numbers: Object.fromEntries(projectNumbers.map((f) => [f.key, record[f.key] ?? ""])),
          images: p.images,
          active: p.active,
          sort: p.sort,
        }}
      />
      <Panel title="Zone sensible" className="mt-6">
        <form action={deleteProjectAction} className="flex flex-wrap items-center justify-between gap-4">
          <input type="hidden" name="id" value={p.id} />
          <p className="max-w-xl text-sm text-muted">Supprimer la réalisation la retire définitivement du site. Pour la cacher temporairement, désactivez « Visible sur le site ».</p>
          <ConfirmButton title="Supprimer cette réalisation ?" message={`« ${p.titleFr} » sera retirée définitivement du site.`} confirmLabel="Supprimer">
            <TrashIcon className="size-4" />
            Supprimer
          </ConfirmButton>
        </form>
      </Panel>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
