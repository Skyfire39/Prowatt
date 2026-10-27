import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { asc } from "drizzle-orm";
import { EditIcon, EyeIcon, ScooterIcon } from "@/components/admin/icons";
import { Badge, Empty, Flash, LinkBtn, PageHeader, Panel } from "@/components/admin/ui";
import { PlusIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { ar } from "@/lib/format";

export const metadata: Metadata = { title: "Motos Ecooter" };

export default async function MotosPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("motos.write");
  const { ok } = await searchParams;
  const db = await getDb();
  const rows = await db.select().from(schema.ecooters).orderBy(asc(schema.ecooters.sort), asc(schema.ecooters.name));

  return (
    <>
      <Flash code={ok} />
      <PageHeader
        eyebrow="Catalogue"
        title="Motos Ecooter"
        subtitle="Pour chaque modèle : ses informations et sa photo, puis sa page détaillée (photos de détail et textes). Le site se met à jour aussitôt."
        actions={
          <LinkBtn href="/admin/motos/nouveau">
            <PlusIcon className="size-4" />
            Nouveau modèle
          </LinkBtn>
        }
      />
      {rows.length === 0 ? (
        <Panel>
          <Empty icon={<ScooterIcon className="size-6" />} title="Aucun modèle" text="Ajoutez votre premier modèle Ecooter." action={<LinkBtn href="/admin/motos/nouveau">Nouveau modèle</LinkBtn>} />
        </Panel>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((m) => {
            const filled = Object.values(m.specs).filter(Boolean).length;
            return (
              <article key={m.id} className="glass group flex flex-col overflow-hidden rounded-3xl p-5">
                <Link href={`/admin/motos/${m.id}`} className="relative grid place-items-center overflow-hidden rounded-2xl bg-accent-soft p-3">
                  <Image src={m.photo} alt="" width={400} height={400} unoptimized={m.photo.startsWith("/api/")} className="h-44 w-auto object-contain drop-shadow-[0_14px_14px_rgb(10_35_32/0.22)] transition-transform duration-500 group-hover:scale-105" />
                  {!m.active && <Badge tone="neutral">Masqué</Badge>}
                </Link>
                <div className="mt-4 flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-2xl tracking-tight">{m.name}</h2>
                    <Badge tone={filled >= 4 ? "teal" : "amber"}>{filled} caractéristique{filled > 1 ? "s" : ""}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{m.taglineFr}</p>
                  <p className="mt-3 text-sm font-semibold tabular-nums">{m.price ? ar(m.price) : <span className="font-medium text-muted">Prix sur demande</span>}</p>
                  {m.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.options.map((o) => (
                        <Badge key={o.name} tone="neutral">
                          {o.name} · {o.values.length}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <LinkBtn href={`/admin/motos/${m.id}`} variant="primary" size="sm" className="flex-1">
                      <EditIcon className="size-4" />
                      Modifier
                    </LinkBtn>
                    <LinkBtn href={`/admin/motos/${m.id}?onglet=page`} variant="soft" size="sm">
                      Page détaillée
                    </LinkBtn>
                    <LinkBtn href={`/ecooter/modeles/${m.id}`} target="_blank" variant="soft" size="sm" aria-label="Voir sur le site">
                      <EyeIcon className="size-4" />
                    </LinkBtn>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Panel title="Contenu commun des pages" subtitle="Les blocs repris par les motos qui n'ont pas de page détaillée à elles." className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-muted">Modifier le contenu commun change toutes les pages de moto qui n&apos;ont pas la leur.</p>
          <LinkBtn href="/admin/motos/commun" variant="soft" size="sm">
            <EditIcon className="size-4" />
            Modifier le contenu commun
          </LinkBtn>
        </div>
      </Panel>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
