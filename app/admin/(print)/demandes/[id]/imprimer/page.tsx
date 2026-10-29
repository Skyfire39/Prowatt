import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PrintToolbar } from "@/components/admin/print-toolbar";
import { RequestSheet } from "@/components/admin/request-sheet";
import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/content";
import { getDb, schema } from "@/lib/db";
import { isUuid } from "@/lib/validate";

export const metadata: Metadata = { title: "Impression de la demande de devis" };

export default async function PrintRequestPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("quotes.read");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const db = await getDb();
  const [[r], settings] = await Promise.all([db.select().from(schema.quoteRequests).where(eq(schema.quoteRequests.id, id)).limit(1), getSettings()]);
  if (!r) notFound();
  return (
    <>
      <PrintToolbar backHref={`/admin/demandes/${id}`} backLabel="Retour à la demande" />
      <RequestSheet
        reference={r.ref}
        kind={r.kind}
        status={r.status}
        createdAt={r.createdAt}
        name={r.name}
        contact={r.contact}
        phone={r.phone}
        email={r.email}
        city={r.city}
        answers={r.answers}
        settings={settings}
      />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
