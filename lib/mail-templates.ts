import type { QuoteRequestAnswers } from "./db/schema";
import { SITE_URL } from "./seo";
import type { AppSettings } from "./settings";
import { fmtDate, fmtDateTime } from "./format";
import { requestKinds } from "./quote-requests";

/** Champs utilisables dans les textes des e-mails (entre doubles accolades), avec leur sens : affichés dans l'administration. */
export const mailFields = [
  ["nom", "Nom du demandeur (ou de la société)"],
  ["contact", "Personne à contacter (sociétés)"],
  ["telephone", "Téléphone du demandeur"],
  ["email", "E-mail du demandeur"],
  ["ville", "Ville"],
  ["type", "Particulier ou Société"],
  ["objectif", "Objectif indiqué dans le formulaire"],
  ["reference", "Référence de la demande (DD-…)"],
  ["date", "Date et heure de réception"],
  ["reponses", "Toutes les réponses du formulaire"],
  ["lien_admin", "Lien vers la demande dans l'administration"],
  ["entreprise", "Nom de l'entreprise"],
  ["telephone_entreprise", "Téléphone de l'entreprise"],
  ["email_entreprise", "E-mail de l'entreprise"],
] as const;

export type RequestForMail = {
  id: string;
  ref: string;
  kind: string;
  name: string;
  contact: string | null;
  phone: string;
  email: string | null;
  city: string | null;
  goal: string | null;
  answers: QuoteRequestAnswers;
  createdAt: Date;
};

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const show = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? fmtDate(v) : v);

function values(r: RequestForMail, s: AppSettings): Record<string, string> {
  return {
    nom: r.name,
    contact: r.contact ?? "",
    telephone: r.phone,
    email: r.email ?? "—",
    ville: r.city ?? "—",
    type: requestKinds[r.kind as keyof typeof requestKinds] ?? r.kind,
    objectif: r.goal ?? "—",
    reference: r.ref,
    date: fmtDateTime(r.createdAt),
    lien_admin: `${SITE_URL}/admin/demandes/${r.id}`,
    entreprise: s.company.name,
    telephone_entreprise: s.company.phone,
    email_entreprise: s.company.email,
  };
}

const answersText = (a: QuoteRequestAnswers) =>
  a.map((sec) => `${sec.section.toUpperCase()}\n${sec.items.map((i) => `• ${i.label} : ${show(i.value)}`).join("\n")}`).join("\n\n");

const answersHtml = (a: QuoteRequestAnswers) =>
  a
    .map(
      (sec) =>
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0;border-collapse:collapse"><tr><td colspan="2" style="background:#175c55;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:8px 12px;border-radius:8px">${esc(sec.section)}</td></tr>${sec.items
          .map(
            (i) =>
              `<tr><td style="width:46%;padding:9px 12px;border-bottom:1px solid #dfe9d0;color:#4b6f6a;font-size:14px;vertical-align:top">${esc(i.label)}</td><td style="padding:9px 12px;border-bottom:1px solid #dfe9d0;font-size:14px;font-weight:600;color:#12413c">${esc(show(i.value))}</td></tr>`,
          )
          .join("")}</table>`,
    )
    .join("");

/** Remplace les champs {{…}} ; un champ inconnu est laissé tel quel pour que la faute de frappe se voie. */
function fill(tpl: string, v: Record<string, string>, escape: boolean) {
  return tpl.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (m, k: string) => {
    const val = v[k.toLowerCase()];
    return val === undefined ? m : escape ? esc(val) : val;
  });
}

export type Rendered = { subject: string; text: string; html: string };

/**
 * Compose un e-mail à partir d'un modèle (sujet + texte) : version texte brut et version HTML aux couleurs de Prowatt.
 * Les valeurs du formulaire sont échappées dans le HTML ; {{reponses}} devient un tableau lisible.
 */
export function renderMail(tpl: { subject: string; body: string }, r: RequestForMail, s: AppSettings): Rendered {
  const v = values(r, s);
  const subject = fill(tpl.subject, v, false).replace(/\s+/g, " ").trim();
  const text = fill(tpl.body, { ...v, reponses: answersText(r.answers) }, false);

  const marker = "\u0000REPONSES\u0000";
  const htmlBody = fill(esc(tpl.body), { ...v, reponses: marker }, true)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.includes(marker) ? p.replace(marker, `</p>${answersHtml(r.answers)}<p style="margin:18px 0 0">`) : `<p style="margin:0 0 14px;line-height:1.6">${p.replace(/\n/g, "<br>")}</p>`))
    .join("")
    .replace(/<p style="margin:0 0 14px;line-height:1\.6"><\/p>/g, "");

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#eef3e4;font-family:Helvetica,Arial,sans-serif;color:#12413c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3e4"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #d5e3c0">
<tr><td style="background:#f3f9e6;padding:26px 32px;border-bottom:4px solid #c8e0a2"><img src="${SITE_URL}/images/logo-email.png" width="210" alt="${esc(s.company.name)}" style="display:block;border:0;height:auto"></td></tr>
<tr><td style="padding:30px 32px 10px;font-size:15px;line-height:1.6;color:#12413c">${htmlBody}</td></tr>
<tr><td style="padding:18px 32px 26px;font-size:12px;color:#4b6f6a;border-top:1px solid #e3ecd5">${esc(s.company.name)} · ${esc(s.company.phone)} · <a href="mailto:${esc(s.company.email)}" style="color:#175c55">${esc(s.company.email)}</a><br>${esc(s.company.address.fr)}</td></tr>
</table></td></tr></table></body></html>`;

  return { subject, text, html };
}
