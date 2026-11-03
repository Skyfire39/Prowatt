import type { Metadata } from "next";
import { BillingForm, CompanyForm, MailForm, PaymentForm } from "@/components/admin/settings-forms";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/content";
import { mailConfig } from "@/lib/mail";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  await requireUser("settings.manage");
  const s = await getSettings();
  return (
    <>
      <PageHeader eyebrow="Site" title="Paramètres" subtitle="Informations de l'entreprise, e-mails des demandes de devis, paiement et règles de facturation." />
      <div className="grid gap-6">
        <CompanyForm v={s.company} />
        <MailForm v={s.mail} configured={mailConfig() !== null} from={mailConfig()?.from ?? null} />
        <PaymentForm v={s.payment} />
        <BillingForm v={s.billing} />
      </div>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
