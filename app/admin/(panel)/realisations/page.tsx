import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { EditIcon, EyeIcon, ProjectsIcon } from "@/components/admin/icons";
import { Badge, Empty, Flash, LinkBtn, PageHeader, Panel } from "@/components/admin/ui";
import { PlusIcon } from "@/components/icons";
import { projectCategories } from "@/lib/admin/project-categories";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { toggleProjectAction } from "./actions";

export const metadata: Metadata = { title: "Réalisations" };

const monthYear = (d: string) => {
  if (!d) return "";
  const [y, m] = d.split("-").map(Number);
  return new Intl.DateTimeFormat("fr", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
};

export default async function ProjectsAdminPage({ searchParams }: { searchParams: Promise<{ ok?: string; cat?: string }> }) {
  await requireUser("content.write");
  const { ok, cat } = await searchParams;
  const current = projectCategories.find((c) => c.id === cat);
  const db = await getDb();
  const rows = await db.select().from(schema.projects).orderBy(asc(schema.projects.sort), asc(schema.projects.createdAt));
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.slug, (counts.get(r.slug) ?? 0) + 1);
  const list = current ? rows.filter((r) => r.slug === current.id) : rows;
  const nameOf = (slug: string) => projectCategories.find((c) => c.id === slug)?.name ?? slug;

  const tab = (active: boolean) =>
    `inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${active ? "bg-accent text-on-accent" : "glass-chip text-ink hover:bg-accent-soft"}`;

  return (
    <>
      <Flash code={ok} />
      <PageHeader
        eyebrow="Site"
        title="Réalisations"
        subtitle="Ajoutez, modifiez ou masquez les chantiers présentés dans chacune des catégories : la page Réalisations du site se met à jour aussitôt."
        actions={
          <LinkBtn href={`/admin/realisations/nouveau${current ? `?cat=${current.id}` : ""}`}>
            <PlusIcon className="size-4" />
            Nouvelle réalisation
          </LinkBtn>
        }
      />

      <nav aria-label="Catégories" className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/realisations" className={tab(!current)}>
          Toutes <span className="text-xs opacity-75">{rows.length}</span>
        </Link>
        {projectCategories.map((c) => (
          <Link key={c.id} href={`/admin/realisations?cat=${c.id}`} className={tab(current?.id === c.id)}>
            {c.name} <span className="text-xs opacity-75">{counts.get(c.id) ?? 0}</span>
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <Panel>
          <Empty
            icon={<ProjectsIcon className="size-6" />}
            title="Aucune réalisation"
            text={current ? `Aucun chantier dans « ${current.name} » pour l'instant.` : "Ajoutez votre première réalisation."}
            action={<LinkBtn href={`/admin/realisations/nouveau${current ? `?cat=${current.id}` : ""}`}>Nouvelle réalisation</LinkBtn>}
          />
        </Panel>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => {
            const cover = p.images[0];
            return (
              <article key={p.id} className="glass flex flex-col overflow-hidden rounded-3xl p-5">
                <Link href={`/admin/realisations/${p.id}`} className="relative block aspect-[16/10] overflow-hidden rounded-2xl bg-accent-soft">
                  {cover ? (
                    <Image src={cover} alt="" fill sizes="(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 90vw" unoptimized={cover.startsWith("/api/")} className="object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center text-muted">
                      <ProjectsIcon className="size-8" />
                    </span>
                  )}
                  {!p.active && (
                    <span className="absolute left-2 top-2">
                      <Badge tone="neutral">Masquée</Badge>
                    </span>
                  )}
                  {p.images.length > 1 && <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white">{p.images.length} photos</span>}
                </Link>
                <div className="mt-4 flex flex-1 flex-col">
                  <Badge tone="teal">{nameOf(p.slug)}</Badge>
                  <h2 className="mt-2 text-xl leading-snug tracking-tight">{p.titleFr}</h2>
                  <p className="mt-1 flex-1 text-sm text-muted">{[p.city, monthYear(p.date)].filter(Boolean).join(" · ") || "—"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <LinkBtn href={`/admin/realisations/${p.id}`} variant="primary" size="sm" className="flex-1">
                      <EditIcon className="size-4" />
                      Modifier
                    </LinkBtn>
                    <form action={toggleProjectAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="glass-chip inline-flex h-9 items-center rounded-full px-4 text-[13px] font-semibold transition-colors hover:bg-accent-soft">
                        {p.active ? "Masquer" : "Afficher"}
                      </button>
                    </form>
                    <LinkBtn href={`/realisations/${p.slug}`} target="_blank" variant="soft" size="sm" aria-label="Voir la catégorie sur le site">
                      <EyeIcon className="size-4" />
                    </LinkBtn>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
