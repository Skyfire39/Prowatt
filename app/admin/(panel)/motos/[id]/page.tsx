import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/client";
import { ModelPageEditor } from "@/components/admin/model-page-editor";
import { MotoForm } from "@/components/admin/moto-form";
import { ScrollTop } from "@/components/admin/scroll-top";
import { Flash, LinkBtn, PageHeader, Panel } from "@/components/admin/ui";
import { EyeIcon } from "@/components/admin/icons";
import { TrashIcon } from "@/components/icons";
import { parseOptions } from "@/lib/options";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { deleteMotoAction } from "../actions";

export const metadata: Metadata = { title: "Modifier le modèle" };

export default async function EditMotoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ onglet?: string; ok?: string }> }) {
  await requireUser("motos.write");
  const [{ id }, { onglet, ok }] = await Promise.all([params, searchParams]);
  const onPage = onglet === "page";
  const db = await getDb();
  const [m] = await db.select().from(schema.ecooters).where(eq(schema.ecooters.id, id)).limit(1);
  if (!m) notFound();

  const tab = (active: boolean) =>
    `inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-colors ${active ? "bg-accent text-on-accent" : "glass-chip text-ink hover:bg-accent-soft"}`;

  return (
    <>
      {ok && <ScrollTop />}
      <Flash code={ok} />
      <PageHeader
        eyebrow="Motos Ecooter"
        title={m.name}
        subtitle={m.taglineFr}
        back={{ href: "/admin/motos", label: "Tous les modèles" }}
        actions={
          <LinkBtn href={`/ecooter/modeles/${m.id}`} target="_blank" variant="soft">
            <EyeIcon className="size-4" />
            Voir la page publique
          </LinkBtn>
        }
      />
      <nav aria-label="Sections de la moto" className="mb-6 flex flex-wrap gap-2">
        <Link href={`/admin/motos/${m.id}`} className={tab(!onPage)} aria-current={onPage ? undefined : "page"}>
          Informations et photo
        </Link>
        <Link href={`/admin/motos/${m.id}?onglet=page`} className={tab(onPage)} aria-current={onPage ? "page" : undefined}>
          Page détaillée
        </Link>
      </nav>

      {onPage ? (
        <>
          <p className="mb-6 max-w-3xl text-sm text-muted">
            Les blocs photo et texte affichés sous les caractéristiques de la moto sur le site : tableau de bord, selle, coffre… Ajoutez plusieurs photos d&apos;un coup, puis choisissez-les dans chaque bloc.
          </p>
          <ModelPageEditor id={m.id} photo={m.photo} />
        </>
      ) : (
      <>
      <MotoForm
        values={{
          id: m.id,
          name: m.name,
          taglineFr: m.taglineFr,
          taglineEn: m.taglineEn,
          descriptionFr: m.descriptionFr ?? "",
          descriptionEn: m.descriptionEn ?? "",
          photo: m.photo,
          productPhoto: m.productPhoto,
          price: m.price ?? "",
          active: m.active,
          sort: m.sort,
          specs: m.specs,
          highlightsFr: m.highlights.map((h) => h.fr).join("\n"),
          highlightsEn: m.highlights.map((h) => h.en).join("\n"),
          options: parseOptions(m.options),
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
      )}
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
