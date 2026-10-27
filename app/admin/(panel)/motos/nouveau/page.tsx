import type { Metadata } from "next";
import { MotoForm } from "@/components/admin/moto-form";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nouveau modèle" };

export default async function NewMotoPage() {
  await requireUser("motos.write");
  return (
    <>
      <PageHeader eyebrow="Motos Ecooter" title="Nouveau modèle" back={{ href: "/admin/motos", label: "Tous les modèles" }} />
      <MotoForm values={{ name: "", taglineFr: "", taglineEn: "", descriptionFr: "", descriptionEn: "", photo: null, productPhoto: null, price: "", active: true, sort: 0, specs: {}, highlightsFr: "", highlightsEn: "", options: [] }} />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
