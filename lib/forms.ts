import type { L10n } from "./data";
import type { Locale } from "./i18n";

export type FieldDef =
  | {
      kind: "text" | "tel" | "email" | "number" | "date";
      name: string;
      label: L10n;
      required?: boolean;
      half?: boolean;
    }
  | { kind: "choice"; name: string; label: L10n; options: L10n[]; required?: boolean }
  | { kind: "multi"; name: string; label: L10n; options: L10n[]; required?: boolean };

export type SectionDef = { title: L10n; fields: FieldDef[] };

export type ResolvedField =
  | {
      kind: "text" | "tel" | "email" | "number" | "date";
      name: string;
      label: string;
      required: boolean;
      half: boolean;
    }
  | { kind: "choice" | "multi"; name: string; label: string; options: string[]; required: boolean };

export type ResolvedSection = { title: string; fields: ResolvedField[] };

const o = (fr: string, en: string = fr): L10n => ({ fr, en });
const yesNo = [o("Oui", "Yes"), o("Non", "No"), o("Ne sais pas", "Don't know")];
const supply = [o("Monophasé 230V", "Single-phase 230V"), o("Triphasé 380V", "Three-phase 380V"), o("Ne sais pas", "Don't know")];
const state = [o("Existant", "Existing"), o("En construction", "Under construction")];

export const individualForm: SectionDef[] = [
  {
    title: o("Vos coordonnées", "Your details"),
    fields: [
      { kind: "text", name: "firstName", label: o("Prénom", "First name"), required: true, half: true },
      { kind: "text", name: "lastName", label: o("Nom de famille", "Last name"), required: true, half: true },
      { kind: "tel", name: "phone", label: o("Téléphone", "Phone"), required: true, half: true },
      { kind: "email", name: "email", label: o("E-mail", "Email"), half: true },
      { kind: "text", name: "address", label: o("Adresse du logement", "Home address"), half: true },
      { kind: "text", name: "city", label: o("Ville", "City"), half: true },
    ],
  },
  {
    title: o("Votre logement", "Your home"),
    fields: [
      { kind: "choice", name: "housing", label: o("Type de logement", "Type of home"), options: [o("Appartement", "Apartment"), o("Maison", "House")] },
      { kind: "choice", name: "state", label: o("État du logement", "Home status"), options: state },
      { kind: "number", name: "bedrooms", label: o("Combien de chambres dans le logement ?", "How many bedrooms?"), half: true },
      { kind: "choice", name: "jirama", label: o("Êtes-vous connecté à la Jirama ?", "Are you connected to Jirama?"), options: yesNo },
      { kind: "choice", name: "stabilizer", label: o("Présence d'un stabilisateur général ?", "General stabiliser present?"), options: yesNo },
      { kind: "choice", name: "generator", label: o("Présence d'un groupe électrogène ?", "Generator present?"), options: yesNo },
      { kind: "choice", name: "supply", label: o("Type d'alimentation", "Power supply type"), options: supply },
      { kind: "choice", name: "earthing", label: o("Mise à la terre aux normes ?", "Earthing up to standard?"), options: yesNo },
    ],
  },
  {
    title: o("Votre projet", "Your project"),
    fields: [
      {
        kind: "choice",
        name: "goal",
        label: o("Votre objectif", "Your goal"),
        required: true,
        options: [
          o("Système anti-délestage", "Anti-load-shedding system"),
          o("Système 100 % autonome (indépendant de la Jirama)", "100% standalone system (independent from Jirama)"),
          o("Système hybride", "Hybrid system"),
          o("Extension du système", "System extension"),
          o("Autre", "Other"),
        ],
      },
      {
        kind: "choice",
        name: "budget",
        label: o("Quel est votre budget ?", "What is your budget?"),
        options: [
          o("Moins de 3 millions Ar", "Under 3 million Ar"),
          o("3 à 5 millions Ar", "3 to 5 million Ar"),
          o("6 à 10 millions Ar", "6 to 10 million Ar"),
          o("11 à 15 millions Ar", "11 to 15 million Ar"),
          o("16 à 20 millions Ar", "16 to 20 million Ar"),
          o("21 à 30 millions Ar", "21 to 30 million Ar"),
          o("31 à 50 millions Ar", "31 to 50 million Ar"),
        ],
      },
      {
        kind: "multi",
        name: "options",
        label: o("De quelles options avez-vous besoin ?", "Which options do you need?"),
        required: true,
        options: [o("Connexion à la Jirama", "Jirama connection"), o("Monitoring à distance", "Remote monitoring"), o("Autre", "Other")],
      },
    ],
  },
];

export const companyForm: SectionDef[] = [
  {
    title: o("Société", "Company"),
    fields: [
      { kind: "text", name: "company", label: o("Nom de la société", "Company name"), required: true, half: true },
      { kind: "text", name: "contact", label: o("Nom du contact", "Contact name"), required: true, half: true },
      { kind: "tel", name: "phone", label: o("Téléphone du contact", "Contact phone"), required: true, half: true },
      { kind: "email", name: "email", label: o("E-mail", "Email"), half: true },
    ],
  },
  {
    title: o("Informations sur le site", "Site information"),
    fields: [
      { kind: "text", name: "site", label: o("Nom du site", "Site name"), half: true },
      {
        kind: "choice",
        name: "activity",
        label: o("Activité exercée", "Activity"),
        options: [o("Bureaux", "Offices"), o("Commerce", "Retail"), o("Usine", "Factory"), o("Dépôt", "Warehouse"), o("Autre", "Other")],
      },
      { kind: "choice", name: "hours", label: o("Horaire de travail", "Working hours"), options: [o("8h – 17h", "8am – 5pm"), o("24h/24", "24/7")] },
      { kind: "text", name: "address", label: o("Adresse", "Address"), half: true },
      { kind: "text", name: "city", label: o("Ville", "City"), half: true },
      { kind: "choice", name: "state", label: o("État du site", "Site status"), options: state },
      { kind: "choice", name: "jirama", label: o("Présence de la Jirama ?", "Jirama present?"), options: yesNo },
      { kind: "date", name: "date", label: o("Date de mise en service souhaitée", "Desired commissioning date"), half: true },
      { kind: "choice", name: "stabilizer", label: o("Présence d'un stabilisateur général ?", "General stabiliser present?"), options: yesNo },
      { kind: "choice", name: "generator", label: o("Présence d'un groupe électrogène ?", "Generator present?"), options: yesNo },
      { kind: "choice", name: "supply", label: o("Type d'alimentation", "Power supply type"), options: supply },
      {
        kind: "choice",
        name: "goal",
        label: o("Objectif", "Goal"),
        required: true,
        options: [
          o("Économie (système on-grid)", "Savings (on-grid system)"),
          o("Délestage (kit anti-délestage)", "Load shedding (anti-load-shedding kit)"),
          o("Autonomie (kit 100 % autonome)", "Autonomy (100% standalone kit)"),
          o("Un peu des trois (kit hybride)", "A bit of all three (hybrid kit)"),
          o("Autre", "Other"),
        ],
      },
    ],
  },
  {
    title: o("Options du système", "System options"),
    fields: [
      {
        kind: "text",
        name: "priority",
        label: o("Ordre de priorité : Jirama / batterie / panneau solaire / groupe électrogène", "Priority order: Jirama / battery / solar panel / generator"),
      },
      {
        kind: "multi",
        name: "options",
        label: o("Quelles options voulez-vous ?", "Which options do you want?"),
        options: [o("Connexion à la Jirama", "Jirama connection"), o("Monitoring à distance", "Remote monitoring")],
      },
    ],
  },
];

export function resolveForm(form: SectionDef[], lang: Locale): ResolvedSection[] {
  return form.map((s) => ({
    title: s.title[lang],
    fields: s.fields.map((f): ResolvedField =>
      f.kind === "choice" || f.kind === "multi"
        ? {
            kind: f.kind,
            name: f.name,
            label: f.label[lang],
            options: f.options.map((x) => x[lang]),
            required: !!f.required,
          }
        : {
            kind: f.kind,
            name: f.name,
            label: f.label[lang],
            required: !!f.required,
            half: !!f.half,
          },
    ),
  }));
}
