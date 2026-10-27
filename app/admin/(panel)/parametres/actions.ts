"use server";

import { updateTag } from "next/cache";
import { sql } from "drizzle-orm";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getDb, schema } from "@/lib/db";
import { isEmail, int, num, s, type FormState } from "@/lib/validate";

async function put(key: string, value: object) {
  const db = await getDb();
  await db
    .insert(schema.settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
}
const lines = (v: string) => v.split("\n").map((l) => l.trim()).filter(Boolean);

export async function saveCompanyAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("settings.manage");
  const name = s(fd, "name");
  const email = s(fd, "email");
  const phone = s(fd, "phone");
  const wa = s(fd, "whatsappNumber").replace(/\D/g, "");
  if (name.length < 2) return { error: "Le nom de l'entreprise est obligatoire." };
  if (!isEmail(email)) return { error: "Adresse e-mail invalide." };
  if (phone.replace(/\D/g, "").length < 7) return { error: "Numéro de téléphone invalide." };
  if (wa.length < 9 || wa.length > 15) return { error: "Numéro WhatsApp invalide (format international sans « + », ex. 261340000000)." };

  await put("company", {
    name,
    email,
    phone,
    whatsappNumber: wa,
    address: { fr: s(fd, "addressFr"), en: s(fd, "addressFr") },
    hours: { fr: lines(s(fd, "hoursFr")), en: lines(s(fd, "hoursFr")) },
  });
  await logAudit(user, "modification", "réglages", "company");
  updateTag("settings");
  return { ok: "Informations de l'entreprise enregistrées." };
}

export async function savePaymentAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("settings.manage");
  const cardUrl = s(fd, "cardUrl");
  if (cardUrl) {
    try {
      if (new URL(cardUrl).protocol !== "https:") throw new Error();
    } catch {
      return { error: "Le lien de paiement par carte doit être une adresse https valide." };
    }
  }
  await put("payment", {
    mvola: { number: s(fd, "mvolaNumber"), holder: s(fd, "mvolaHolder") },
    bank: { bank: s(fd, "bankName"), holder: s(fd, "bankHolder"), account: s(fd, "bankAccount") },
    card: { url: cardUrl },
  });
  await logAudit(user, "modification", "réglages", "payment");
  updateTag("settings");
  return { ok: "Coordonnées de paiement enregistrées." };
}

export async function saveBillingAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("settings.manage");
  const vatRate = num(fd, "vatRate", -1);
  const quotePrefix = s(fd, "quotePrefix").toUpperCase();
  const invoicePrefix = s(fd, "invoicePrefix").toUpperCase();
  if (vatRate < 0 || vatRate > 100) return { error: "Le taux de TVA doit être compris entre 0 et 100." };
  if (!/^[A-Z0-9]{1,6}$/.test(quotePrefix) || !/^[A-Z0-9]{1,6}$/.test(invoicePrefix)) return { error: "Les préfixes de numérotation : 1 à 6 lettres ou chiffres." };
  if (quotePrefix === invoicePrefix) return { error: "Les préfixes des devis et des factures doivent être différents." };
  const quoteValidityDays = int(fd, "quoteValidityDays", -1);
  const paymentTermsDays = int(fd, "paymentTermsDays", -1);
  if (quoteValidityDays < 0 || quoteValidityDays > 365 || paymentTermsDays < 0 || paymentTermsDays > 365) return { error: "Les délais doivent être compris entre 0 et 365 jours." };

  await put("billing", {
    legalName: s(fd, "legalName"),
    address: s(fd, "address"),
    nif: s(fd, "nif"),
    stat: s(fd, "stat"),
    rcs: s(fd, "rcs"),
    vatRate,
    quotePrefix,
    invoicePrefix,
    quoteValidityDays,
    paymentTermsDays,
    bankDetails: s(fd, "bankDetails"),
    quoteTerms: s(fd, "quoteTerms"),
    invoiceFooter: s(fd, "invoiceFooter"),
  });
  await logAudit(user, "modification", "réglages", "billing");
  updateTag("settings");
  return { ok: "Paramètres de facturation enregistrés." };
}

void sql;
