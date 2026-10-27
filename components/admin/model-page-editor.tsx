import { inArray } from "drizzle-orm";
import { ModelPageForm } from "@/components/admin/model-page-form";
import { getDb, schema } from "@/lib/db";
import { SHARED_ID, defaultEcooterPage, pageKey, parseEcooterPage } from "@/lib/ecooter-page";

/**
 * Éditeur de la page détaillée d'une moto (ou du contenu commun quand `id` est `null`).
 * Une moto sans page à elle démarre depuis le contenu commun : elle ne devient personnalisée qu'à l'enregistrement.
 */
export async function ModelPageEditor({ id, photo }: { id: string | null; photo: string }) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.settings)
    .where(inArray(schema.settings.key, id ? [pageKey(id), pageKey()] : [pageKey()]));
  const own = rows.find((r) => r.key === pageKey(id ?? undefined));
  const common = rows.find((r) => r.key === pageKey());
  const initial = own ? parseEcooterPage(own.value) : common ? parseEcooterPage(common.value) : defaultEcooterPage;
  const scope = id ?? SHARED_ID;

  return (
    <>
      {id && !own && (
        <p className="mb-6 rounded-2xl border border-line bg-white/50 px-5 py-3.5 text-sm text-muted">
          Cette moto affiche pour l&apos;instant le <strong className="text-ink">contenu commun</strong>. Dès que vous enregistrez, elle aura sa propre page, sans toucher aux autres modèles.
        </p>
      )}
      <ModelPageForm key={`${scope}-${own ? new Date(own.updatedAt).getTime() : 0}`} initial={initial} photo={photo} scope={scope} custom={Boolean(own)} />
    </>
  );
}
