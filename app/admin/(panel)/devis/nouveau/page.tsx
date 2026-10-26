import type { Metadata } from "next";
import { DocEditor } from "@/components/admin/doc-editor";
import { PageHeader } from "@/components/admin/ui";
import { getDocFormLists } from "@/lib/admin/doc-form";
import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/content";
import { addDays, today } from "@/lib/format";
import { isUuid } from "@/lib/validate";
import { saveQuoteAction } from "../actions";

export const metadata: Metadata = { title: "Nouveau devis" };

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  await requireUser("quotes.write");
  const { client } = await searchParams;
  const [lists, settings] = await Promise.all([getDocFormLists(), getSettings()]);
  const issuedAt = today();
  return (
    <>
      <PageHeader eyebrow="Devis" title="Nouveau devis" subtitle="Composez un devis personnalisé : le numéro est attribué à l'enregistrement." back={{ href: "/admin/devis", label: "Tous les devis" }} />
      <DocEditor
        kind="quote"
        action={saveQuoteAction}
        customers={lists.customers}
        products={lists.products}
        values={{
          customerId: client && isUuid(client) ? client : "",
          title: "",
          issuedAt,
          endDate: addDays(issuedAt, settings.billing.quoteValidityDays),
          vatRate: settings.billing.vatRate,
          vatIncluded: false,
          discount: "",
          notes: "",
          terms: settings.billing.quoteTerms,
          lines: [],
        }}
      />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
