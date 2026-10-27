import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asc, like } from "drizzle-orm";
import { EditIcon, EyeIcon } from "@/components/admin/icons";
import { Badge, Flash, PageHeader, Panel } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { SHARED_ID, parseEcooterPage } from "@/lib/ecooter-page";

export const metadata: Metadata = { title: "Fiches modèles Ecooter" };

export default async function ModelPagesList({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("motos.write");
  const { ok } = await searchParams;
  const db = await getDb();
  const [motos, pages] = await Promise.all([
    db.select().from(schema.ecooters).orderBy(asc(schema.ecooters.sort), asc(schema.ecooters.name)),
    db.select().from(schema.settings).where(like(schema.settings.key, "ecooterPage%")),
  ]);
  const content = new Map(pages.map((p) => [p.key === "ecooterPage" ? SHARED_ID : p.key.slice("ecooterPage:".length), parseEcooterPage(p.value)]));
  const details = (id: string) => content.get(id)?.blocks.filter((b) => b.image).length ?? 0;

  return (
    <>
      <Flash code={ok} />
      <PageHeader
        eyebrow="Catalogue"
        title="Fiches modèles Ecooter"
        subtitle="La page détaillée de chaque moto sur le site : photos de détail, textes et boutons sous les caractéristiques. Choisissez un modèle pour modifier sa fiche."
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {motos.map((m) => {
          const custom = content.has(m.id);
          const detailCount = details(m.id);
          return (
            <section key={m.id} className="glass flex flex-col overflow-hidden rounded-3xl">
              <div className="grid aspect-[4/3] place-items-center bg-accent-soft/70 p-4">
                <Image src={m.photo} unoptimized={m.photo.startsWith("/api/")} alt="" width={420} height={420} className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl tracking-tight">{m.name}</h2>
                  {!m.active && <Badge tone="amber">Masquée</Badge>}
                  <Badge tone={custom ? "teal" : "neutral"}>{custom ? "Fiche personnalisée" : "Contenu commun"}</Badge>
                </div>
                <p className="text-sm text-muted">
                  {custom ? `${content.get(m.id)!.blocks.length} bloc${content.get(m.id)!.blocks.length > 1 ? "s" : ""}` : "Reprend le contenu commun"}
                  {detailCount > 0 ? ` · ${detailCount} photo${detailCount > 1 ? "s" : ""} de détail` : ""}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Link href={`/admin/fiche-modele/${m.id}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent hover:opacity-90">
                    <EditIcon className="size-4" />
                    Modifier la fiche
                  </Link>
                  <Link href={`/ecooter/modeles/${m.id}`} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted hover:bg-accent-soft hover:text-ink">
                    <EyeIcon className="size-4" />
                    Voir sur le site
                  </Link>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <Panel title="Contenu commun" subtitle="Les blocs repris par toutes les motos qui n'ont pas de fiche personnalisée." className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {content.has(SHARED_ID) ? "Contenu commun modifié." : "Contenu d'origine du site."} Modifier ici change toutes les fiches qui n&apos;ont pas la leur.
          </p>
          <Link href={`/admin/fiche-modele/${SHARED_ID}`} className="inline-flex h-10 items-center gap-2 rounded-full glass-chip px-5 text-sm font-semibold hover:bg-accent-soft">
            <EditIcon className="size-4" />
            Modifier le contenu commun
          </Link>
        </div>
      </Panel>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
