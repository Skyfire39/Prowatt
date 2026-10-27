import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { inArray } from "drizzle-orm";
import { ModelPageForm } from "@/components/admin/model-page-form";
import { Badge, Flash, PageHeader, Panel } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { SHARED_ID, defaultEcooterPage, pageKey, parseEcooterPage } from "@/lib/ecooter-page";
import { specFields } from "@/lib/admin/specs";

export const metadata: Metadata = { title: "Fiche modèle Ecooter" };

export default async function ModelPageEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  await requireUser("motos.write");
  const [{ id }, { ok }] = await Promise.all([params, searchParams]);
  const db = await getDb();
  const shared = id === SHARED_ID;

  const [motos, rows] = await Promise.all([
    db.select().from(schema.ecooters).orderBy(schema.ecooters.sort),
    db.select().from(schema.settings).where(inArray(schema.settings.key, shared ? [pageKey()] : [pageKey(id), pageKey()])),
  ]);
  const moto = shared ? null : motos.find((m) => m.id === id);
  if (!shared && !moto) notFound();

  const own = rows.find((r) => r.key === pageKey(shared ? undefined : id));
  const common = rows.find((r) => r.key === pageKey());
  // Une moto sans fiche à elle démarre depuis le contenu commun : elle ne devient personnalisée qu'à l'enregistrement.
  const initial = own ? parseEcooterPage(own.value) : common ? parseEcooterPage(common.value) : defaultEcooterPage;
  const photo = moto?.photo ?? motos[0]?.photo ?? "/images/ecooter/aura.webp";
  const specs = moto?.specs ?? {};
  const filledSpecs = specFields.filter((f) => specs[f.key]);

  return (
    <>
      <Flash code={ok} />
      <Link href="/admin/fiche-modele" className="mb-4 inline-flex text-sm font-semibold text-accent hover:underline">
        ← Toutes les fiches
      </Link>
      <PageHeader
        eyebrow="Fiche modèle"
        title={moto ? moto.name : "Contenu commun"}
        subtitle={
          moto
            ? "Les blocs photo et texte affichés sous les caractéristiques de cette moto sur le site. Ajoutez une photo de détail à chaque bloc (tableau de bord, selle, coffre…)."
            : "Les blocs repris par toutes les motos qui n'ont pas de fiche personnalisée. La photo change selon la moto, les textes restent."
        }
        actions={
          moto && (
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link href={`/fr/ecooter/modeles/${moto.id}`} target="_blank" className="text-accent hover:underline">
                Voir sur le site ↗
              </Link>
              <Link href={`/admin/motos/${moto.id}`} className="text-accent hover:underline">
                Modifier les caractéristiques
              </Link>
            </div>
          )
        }
      />

      {moto && (
        <Panel className="mb-6" title="En-tête de la fiche" subtitle="Ce que le visiteur voit en haut de la page. Le nom, la photo et les caractéristiques se modifient dans « Motos Ecooter ».">
          <div className="grid items-center gap-6 sm:grid-cols-[12rem_1fr]">
            <div className="grid aspect-square place-items-center rounded-2xl bg-accent-soft/70 p-3">
              <Image src={moto.photo} unoptimized={moto.photo.startsWith("/api/")} alt="" width={300} height={300} className="max-h-full w-auto object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-3xl tracking-tight">{moto.name}</p>
                <Badge tone={own ? "teal" : "neutral"}>{own ? "Fiche personnalisée" : "Contenu commun"}</Badge>
                {!moto.active && <Badge tone="amber">Masquée</Badge>}
              </div>
              <p className="mt-1 text-muted">{moto.taglineFr}</p>
              {filledSpecs.length > 0 && (
                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {filledSpecs.slice(0, 6).map((f) => (
                    <div key={f.key} className="flex justify-between gap-3 border-b border-line/60 py-1.5">
                      <dt className="text-muted">{f.label}</dt>
                      <dd className="font-semibold">{specs[f.key]}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {!own && (
                <p className="mt-4 rounded-xl border border-line bg-white/50 px-4 py-3 text-sm text-muted">
                  Cette moto utilise pour l&apos;instant le contenu commun. Dès que vous enregistrez, elle aura sa propre fiche, sans toucher aux autres modèles.
                </p>
              )}
            </div>
          </div>
        </Panel>
      )}

      <ModelPageForm key={id} initial={initial} photo={photo} scope={shared ? SHARED_ID : id} custom={Boolean(own)} />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
