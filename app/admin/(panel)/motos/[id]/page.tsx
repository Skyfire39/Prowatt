import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/client";
import { MotoForm } from "@/components/admin/moto-form";
import { LinkBtn, PageHeader, Panel } from "@/components/admin/ui";
import { EyeIcon } from "@/components/admin/icons";
import { TrashIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { deleteMotoAction } from "../actions";

export const metadata: Metadata = { title: "Modifier le modèle" };

export default async function EditMotoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("motos.write");
  const { id } = await params;
  const db = await getDb();
  const [m] = await db.select().from(schema.ecooters).where(eq(schema.ecooters.id, id)).limit(1);
  if (!m) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Motos Ecooter"
        title={m.name}
        subtitle={m.taglineFr}
        back={{ href: "/admin/motos", label: "Tous les modèles" }}
        actions={
          <LinkBtn href={`/fr/ecooter/modeles/${m.id}`} target="_blank" variant="soft">
            <EyeIcon className="size-4" />
            Voir la page publique
          </LinkBtn>
        }
      />
      <MotoForm
        values={{
          id: m.id,
          name: m.name,
          taglineFr: m.taglineFr,
          taglineEn: m.taglineEn,
          descriptionFr: m.descriptionFr ?? "",
          descriptionEn: m.descriptionEn ?? "",
          photo: m.photo,
          price: m.price ?? "",
          active: m.active,
          sort: m.sort,
          specs: m.specs,
          highlightsFr: m.highlights.map((h) => h.fr).join("\n"),
          highlightsEn: m.highlights.map((h) => h.en).join("\n"),
        }}
      />
      <Panel title="Zone sensible" className="mt-6">
        <form action={deleteMotoAction} className="flex flex-wrap items-center justify-between gap-4">
          <input type="hidden" name="id" value={m.id} />
          <p className="max-w-xl text-sm text-muted">Supprimer le modèle retire sa page et sa carte du site. Pour le cacher temporairement, désactivez « Visible sur le site ».</p>
          <ConfirmButton title="Supprimer ce modèle ?" message={`Le modèle ${m.name} sera retiré définitivement du site.`} confirmLabel="Supprimer">
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
