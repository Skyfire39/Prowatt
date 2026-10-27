import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { ModelPageEditor } from "@/components/admin/model-page-editor";
import { ScrollTop } from "@/components/admin/scroll-top";
import { Flash, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";

export const metadata: Metadata = { title: "Contenu commun des pages Ecooter" };

export default async function CommonModelPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("motos.write");
  const { ok } = await searchParams;
  const db = await getDb();
  const [first] = await db.select({ photo: schema.ecooters.photo }).from(schema.ecooters).orderBy(asc(schema.ecooters.sort)).limit(1);

  return (
    <>
      {ok && <ScrollTop />}
      <Flash code={ok} />
      <PageHeader
        eyebrow="Motos Ecooter"
        title="Contenu commun des pages"
        subtitle="Les blocs repris par toutes les motos qui n'ont pas de page détaillée à elles. La photo change selon la moto, les textes restent."
        back={{ href: "/admin/motos", label: "Toutes les motos" }}
      />
      <ModelPageEditor id={null} photo={first?.photo ?? "/images/ecooter/aura.webp"} />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
