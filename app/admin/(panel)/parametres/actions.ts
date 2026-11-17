"use server";

import { updateTag } from "next/cache";
import { sql } from "drizzle-orm";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getDb, schema } from "@/lib/db";
import { intlDigits } from "@/lib/site-info";
import { getSettings } from "@/lib/content";
import { sendMail } from "@/lib/mail";
import { renderMail } from "@/lib/mail-templates";
import { buildRequest } from "@/lib/quote-requests";
import { bool, isEmail, int, num, s, type FormState } from "@/lib/validate";

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
  // Un numéro saisi en local (034…, 038…) est converti au format international (26134…, 26138…).
  const wa = intlDigits(s(fd, "whatsappNumber"));
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

const MAX_RECIPIENTS = 10;

/** Textes et destinataires des e-mails envoyés à chaque demande de devis du site. */
export async function saveMailAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("settings.manage");
  const salesEmails = [...new Set(s(fd, "salesEmails").split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];
  const bad = salesEmails.find((e) => !isEmail(e));
  if (bad) return { error: `Adresse invalide dans la liste des commerciaux : « ${bad.slice(0, 60)} ».` };
  if (salesEmails.length > MAX_RECIPIENTS) return { error: `${MAX_RECIPIENTS} adresses au plus pour les commerciaux.` };
  const notifySales = bool(fd, "notifySales");
  if (notifySales && salesEmails.length === 0) return { error: "Ajoutez au moins une adresse de commercial, ou décochez l'alerte aux commerciaux." };
  const replyTo = s(fd, "replyTo");
  if (replyTo && !isEmail(replyTo)) return { error: "Adresse de réponse invalide." };

  const salesSubject = s(fd, "salesSubject").slice(0, 200);
  const customerSubject = s(fd, "customerSubject").slice(0, 200);
  const salesBody = s(fd, "salesBody").slice(0, 8000);
  const customerBody = s(fd, "customerBody").slice(0, 8000);
  if ((notifySales && (!salesSubject || !salesBody)) || (bool(fd, "confirmCustomer") && (!customerSubject || !customerBody))) {
    return { error: "Le sujet et le texte d'un e-mail activé ne peuvent pas être vides." };
  }

  await put("mail", { notifySales, salesEmails, salesSubject, salesBody, confirmCustomer: bool(fd, "confirmCustomer"), customerSubject, customerBody, replyTo });
  await logAudit(user, "modification", "réglages", "mail");
  updateTag("settings");
  return { ok: "E-mails des demandes de devis enregistrés." };
}

/** Envoie un exemple de chaque e-mail (avec une demande fictive) pour vérifier la configuration et les textes enregistrés. */
export async function sendTestMailAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireActionUser("settings.manage");
  const to = s(fd, "to").toLowerCase();
  if (!isEmail(to)) return { error: "Indiquez l'adresse qui doit recevoir l'essai." };
  const kind = s(fd, "which") === "customer" ? "customer" : "sales";
  const built = buildRequest("individual", {
    firstName: ["Rina"],
    lastName: ["Rakoto"],
    phone: ["034 00 000 00"],
    email: [to],
    city: ["Antananarivo"],
    housing: ["Maison"],
    bedrooms: ["3"],
    jirama: ["Oui"],
    goal: ["Système hybride"],
    budget: ["6 à 10 millions Ar"],
    options: ["Monitoring à distance"],
  });
  if (!built) return { error: "Impossible de préparer l'exemple." };
  const settings = await getSettings();
  const mail = renderMail(
    kind === "sales" ? { subject: settings.mail.salesSubject, body: settings.mail.salesBody } : { subject: settings.mail.customerSubject, body: settings.mail.customerBody },
    { id: "00000000-0000-4000-8000-000000000000", ref: "DD-EXEMPLE", createdAt: new Date(), ...built },
    settings,
  );
  const res = await sendMail({ to: [to], ...mail, subject: `[ESSAI] ${mail.subject}` });
  return res.ok ? { ok: `E-mail d'essai envoyé à ${to}. Vérifiez aussi vos courriers indésirables.` } : { error: res.error };
}

void sql;
