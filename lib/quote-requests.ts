import type { QuoteRequestAnswers } from "./db/schema";
import { companyForm, individualForm, resolveForm, type ResolvedField } from "./forms";
import { isEmail, isIsoDate } from "./validate";

export type RequestKind = "individual" | "company";
export const isRequestKind = (v: unknown): v is RequestKind => v === "individual" || v === "company";

export const requestKinds = { individual: "Particulier", company: "Société" } as const;

export const requestStatuses = {
  new: { label: "Nouvelle", tone: "amber" },
  contacted: { label: "Contactée", tone: "blue" },
  quoted: { label: "Devis envoyé", tone: "teal" },
  closed: { label: "Classée", tone: "neutral" },
} as const;
export type RequestStatus = keyof typeof requestStatuses;
export const requestStatusList = Object.keys(requestStatuses) as RequestStatus[];

const MAX_TEXT = 300;

export type BuiltRequest = {
  kind: RequestKind;
  name: string;
  contact: string | null;
  phone: string;
  email: string | null;
  city: string | null;
  goal: string | null;
  answers: QuoteRequestAnswers;
};

const asList = (v: unknown): string[] =>
  (Array.isArray(v) ? v : typeof v === "string" ? [v] : []).filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean);

/** Vérifie une réponse d'après la définition du champ ; renvoie le texte à garder, ou `null` si elle est invalide. */
function readField(f: ResolvedField, raw: unknown): string | null | undefined {
  const values = asList(raw);
  if (f.kind === "choice" || f.kind === "multi") {
    const ok = values.filter((v) => f.options.includes(v));
    if (f.kind === "choice" && ok.length > 1) return null;
    return ok.length ? ok.join(", ") : undefined;
  }
  const v = (values[0] ?? "").slice(0, MAX_TEXT);
  if (!v) return undefined;
  if (f.kind === "email") return isEmail(v) ? v.toLowerCase() : null;
  if (f.kind === "tel") return v.replace(/\D/g, "").length >= 7 ? v : null;
  if (f.kind === "number") return /^\d{1,4}$/.test(v) ? v : null;
  if (f.kind === "date") return isIsoDate(v) ? v : null;
  return v;
}

/**
 * Transforme les valeurs envoyées par le navigateur en demande propre. Les questions, les options et les champs
 * obligatoires viennent des définitions du serveur (lib/forms.ts), jamais du navigateur : seules les réponses
 * viennent de lui. Renvoie `null` si une réponse est invalide ou si un champ obligatoire manque.
 */
export function buildRequest(kind: RequestKind, values: Record<string, unknown>): BuiltRequest | null {
  const sections = resolveForm(kind === "company" ? companyForm : individualForm, "fr");
  const answers: QuoteRequestAnswers = [];
  const byName: Record<string, string> = {};

  for (const section of sections) {
    const items: { label: string; value: string }[] = [];
    for (const f of section.fields) {
      const v = readField(f, values[f.name]);
      if (v === null) return null;
      if (v === undefined) {
        if (f.required) return null;
        continue;
      }
      byName[f.name] = v;
      items.push({ label: f.label, value: v });
    }
    if (items.length) answers.push({ section: section.title, items });
  }

  const name = kind === "company" ? byName.company : [byName.firstName, byName.lastName].filter(Boolean).join(" ");
  if (!name || !byName.phone) return null;
  return {
    kind,
    name,
    contact: kind === "company" ? (byName.contact ?? null) : null,
    phone: byName.phone,
    email: byName.email ?? null,
    city: byName.city ?? null,
    goal: byName.goal ?? null,
    answers,
  };
}

/** Référence lisible : DD-260131-K7QF. */
export function newRequestRef(now = new Date()) {
  const day = now.toISOString().slice(2, 10).replace(/-/g, "");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => alphabet[b % alphabet.length]).join("");
  return `DD-${day}-${rand}`;
}
