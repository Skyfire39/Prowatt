import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/client";
import { PartnerForm, TestimonialForm } from "@/components/admin/content-forms";
import { Badge, Flash, PageHeader, Panel } from "@/components/admin/ui";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { deletePartnerAction, deleteTestimonialAction } from "./actions";

export const metadata: Metadata = { title: "Avis et partenaires" };

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ ok?: string; edit?: string }> }) {
  await requireUser("content.write");
  const { ok, edit } = await searchParams;
  const db = await getDb();
  const [testimonials, partners] = await Promise.all([
    db.select().from(schema.testimonials).orderBy(asc(schema.testimonials.sort), asc(schema.testimonials.name)),
    db.select().from(schema.partners).orderBy(asc(schema.partners.sort), asc(schema.partners.name)),
  ]);
  const editingT = testimonials.find((t) => t.id === edit);
  const editingP = partners.find((p) => p.id === edit);

  return (
    <>
      <Flash code={ok} />
      <PageHeader eyebrow="Site" title="Avis et partenaires" subtitle="Ce que voient vos visiteurs sur l'accueil : témoignages clients et bandeau de logos." />

      <section id="avis" className="scroll-mt-6">
        <h2 className="mb-4 text-2xl tracking-tight">Avis clients</h2>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-5">
          <div className="grid content-start gap-3 xl:col-span-3">
            {testimonials.map((t) => (
              <article key={t.id} className="glass flex gap-4 rounded-3xl p-5">
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo} alt="" className="size-14 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-soft font-bold text-accent">{t.name[0]}</span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{t.name}</p>
                    {!t.active && <Badge tone="neutral">Masqué</Badge>}
                    <span className="text-xs text-muted">#{t.sort}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{t.textFr}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link href={`/admin/contenu?edit=${t.id}#form-avis`} className="rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-on-accent">
                      Modifier
                    </Link>
                    <form action={deleteTestimonialAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <ConfirmButton title="Supprimer cet avis ?" message={`L'avis de ${t.name} sera retiré du site.`} confirmLabel="Supprimer" size="sm">
                        <TrashIcon className="size-3.5" />
                        Supprimer
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </article>
            ))}
            {testimonials.length === 0 && <Panel>Aucun avis : le site affiche ses avis d&apos;origine tant que la liste est vide.</Panel>}
          </div>
          <div id="form-avis" className="xl:col-span-2">
            <Panel title={editingT ? "Modifier l'avis" : "Ajouter un avis"} actions={editingT ? <Link href="/admin/contenu#form-avis" className="inline-flex items-center gap-1 text-sm font-semibold text-accent"><PlusIcon className="size-4" />Nouveau</Link> : undefined}>
              <TestimonialForm
                key={editingT?.id ?? "new"}
                values={{ id: editingT?.id, name: editingT?.name ?? "", textFr: editingT?.textFr ?? "", textEn: editingT?.textEn ?? "", photo: editingT?.photo ?? null, sort: editingT?.sort ?? testimonials.length, active: editingT?.active ?? true }}
              />
            </Panel>
          </div>
        </div>
      </section>

      <section id="partenaires" className="mt-12 scroll-mt-6">
        <h2 className="mb-4 text-2xl tracking-tight">Partenaires</h2>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-5">
          <div className="grid content-start gap-3 sm:grid-cols-2 xl:col-span-3">
            {partners.map((p) => (
              <article key={p.id} className="glass flex items-center gap-4 rounded-3xl p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.logo} alt="" className="size-16 shrink-0 rounded-2xl bg-white object-contain p-1.5" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-xs text-muted">
                    #{p.sort} {!p.active && "· masqué"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Link href={`/admin/contenu?edit=${p.id}#form-partenaire`} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent hover:bg-accent hover:text-on-accent">
                      Modifier
                    </Link>
                    <form action={deletePartnerAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmButton title="Retirer ce partenaire ?" message={`${p.name} disparaîtra du bandeau de logos.`} confirmLabel="Retirer" size="sm" variant="ghost">
                        <TrashIcon className="size-3.5" />
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div id="form-partenaire" className="xl:col-span-2">
            <Panel title={editingP ? "Modifier le partenaire" : "Ajouter un partenaire"} actions={editingP ? <Link href="/admin/contenu#form-partenaire" className="inline-flex items-center gap-1 text-sm font-semibold text-accent"><PlusIcon className="size-4" />Nouveau</Link> : undefined}>
              <PartnerForm key={editingP?.id ?? "new"} values={{ id: editingP?.id, name: editingP?.name ?? "", logo: editingP?.logo ?? null, sort: editingP?.sort ?? partners.length, active: editingP?.active ?? true }} />
            </Panel>
          </div>
        </div>
      </section>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
