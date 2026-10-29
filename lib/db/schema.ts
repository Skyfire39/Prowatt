import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { ProductOption } from "../options";

const bytea = customType<{ data: Buffer; driverData: Buffer | Uint8Array | string }>({
  dataType: () => "bytea",
  toDriver: (v) => v,
  fromDriver: (v) => (typeof v === "string" ? Buffer.from(v.replace(/^\\x/, ""), "hex") : Buffer.from(v)),
});

const stamp = (name: string) => timestamp(name, { withTimezone: true }).notNull().defaultNow();

/* ───────────── Comptes, sessions, journal ───────────── */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("sales"),
    passwordHash: text("password_hash").notNull(),
    active: boolean("active").notNull().default(true),
    failedAttempts: integer("failed_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: stamp("created_at"),
  },
  (t) => [uniqueIndex("users_email_idx").on(sql`lower(${t.email})`)],
);

export const sessions = pgTable(
  "sessions",
  {
    /** Empreinte SHA-256 du jeton : le jeton lui-même n'est jamais stocké. */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: stamp("created_at"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id"),
    userName: text("user_name").notNull().default("Système"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    detail: text("detail"),
    createdAt: stamp("created_at"),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

/* ───────────── Réglages, médias, compteurs ───────────── */

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: stamp("updated_at"),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  data: bytea("data").notNull(),
  createdAt: stamp("created_at"),
});

/** Compteurs atomiques pour la numérotation des devis et des factures (une ligne par année). */
export const counters = pgTable("counters", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
});

/* ───────────── Catalogue ───────────── */

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    category: text("category").notNull(),
    nameFr: text("name_fr").notNull(),
    nameEn: text("name_en").notNull(),
    descriptionFr: text("description_fr"),
    descriptionEn: text("description_en"),
    price: integer("price").notNull(),
    oldPrice: integer("old_price"),
    bestSeller: boolean("best_seller").notNull().default(false),
    sku: text("sku"),
    /** Options au choix du client (couleur, type…), avec supplément de prix facultatif : voir lib/options.ts. */
    options: jsonb("options").$type<ProductOption[]>().notNull().default([]),
    stock: integer("stock"),
    /** Adresse de l'image (/api/media/<id>) envoyée depuis l'admin. */
    image: text("image"),
    active: boolean("active").notNull().default(true),
    addedAt: date("added_at").notNull().defaultNow(),
    createdAt: stamp("created_at"),
    updatedAt: stamp("updated_at"),
  },
  (t) => [index("products_category_idx").on(t.category)],
);

/** Catégories de la boutique. `id` (adresse courte) est repris par `products.category` ; « motos-electriques » est réservée. */
export const productCategories = pgTable("product_categories", {
  id: text("id").primaryKey(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  sort: integer("sort").notNull().default(0),
  createdAt: stamp("created_at"),
});

export const ecooters = pgTable("ecooters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  taglineFr: text("tagline_fr").notNull(),
  taglineEn: text("tagline_en").notNull(),
  descriptionFr: text("description_fr"),
  descriptionEn: text("description_en"),
  /** Photo détourée (fond transparent) : accueil, blocs de la page du modèle. */
  photo: text("photo").notNull(),
  /** Photo produit (avec décor) : pages Ecooter, boutique et panier. Vide : on reprend la photo détourée. */
  productPhoto: text("product_photo"),
  /** Puissance, vitesse, autonomie, charge, freins, pneus, dimensions, poids, charge max, selle. */
  specs: jsonb("specs").$type<Record<string, string>>().notNull().default({}),
  /** Points forts affichés sur la page du modèle : [{ fr, en }]. */
  highlights: jsonb("highlights").$type<{ fr: string; en: string }[]>().notNull().default([]),
  price: integer("price"),
  /** Options au choix du client (couleur, batterie…), avec supplément de prix facultatif. */
  options: jsonb("options").$type<ProductOption[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
  updatedAt: stamp("updated_at"),
});

/* ───────────── Clients, commandes, paiements ───────────── */

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull().default("individual"),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    nif: text("nif"),
    stat: text("stat"),
    notes: text("notes"),
    source: text("source").notNull().default("admin"),
    createdAt: stamp("created_at"),
    updatedAt: stamp("updated_at"),
  },
  (t) => [index("customers_phone_idx").on(t.phone), index("customers_email_idx").on(t.email)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ref: text("ref").notNull(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerEmail: text("customer_email"),
    mode: text("mode").notNull().default("pickup"),
    address: text("address"),
    city: text("city"),
    note: text("note"),
    status: text("status").notNull().default("new"),
    paymentMethod: text("payment_method").notNull().default("mvola"),
    paymentStatus: text("payment_status").notNull().default("unpaid"),
    paymentTx: text("payment_tx"),
    total: integer("total").notNull(),
    lang: text("lang").notNull().default("fr"),
    invoiceId: uuid("invoice_id"),
    createdAt: stamp("created_at"),
    updatedAt: stamp("updated_at"),
  },
  (t) => [uniqueIndex("orders_ref_idx").on(t.ref), index("orders_status_idx").on(t.status)],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id"),
    name: text("name").notNull(),
    unitPrice: integer("unit_price").notNull(),
    qty: integer("qty").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

/* ───────────── Devis et factures ───────────── */

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: text("number").notNull(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    title: text("title"),
    status: text("status").notNull().default("draft"),
    issuedAt: date("issued_at").notNull().defaultNow(),
    validUntil: date("valid_until"),
    discount: integer("discount").notNull().default(0),
    vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).notNull().default("0"),
    /** Les prix saisis sont TTC (TVA incluse) : le total ne change pas, la TVA est « dont ». */
    vatIncluded: boolean("vat_included").notNull().default(false),
    subtotal: integer("subtotal").notNull().default(0),
    total: integer("total").notNull().default(0),
    notes: text("notes"),
    terms: text("terms"),
    invoiceId: uuid("invoice_id"),
    createdBy: uuid("created_by"),
    createdAt: stamp("created_at"),
    updatedAt: stamp("updated_at"),
  },
  (t) => [uniqueIndex("quotes_number_idx").on(t.number), index("quotes_customer_idx").on(t.customerId)],
);

export const quoteItems = pgTable(
  "quote_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    productId: text("product_id"),
    description: text("description").notNull(),
    unitPrice: integer("unit_price").notNull(),
    qty: integer("qty").notNull().default(1),
  },
  (t) => [index("quote_items_quote_idx").on(t.quoteId)],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: text("number").notNull(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    quoteId: uuid("quote_id"),
    orderId: uuid("order_id"),
    title: text("title"),
    /** draft | issued | cancelled — l'état de paiement se déduit des paiements enregistrés. */
    status: text("status").notNull().default("draft"),
    issuedAt: date("issued_at").notNull().defaultNow(),
    dueAt: date("due_at"),
    discount: integer("discount").notNull().default(0),
    vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).notNull().default("0"),
    vatIncluded: boolean("vat_included").notNull().default(false),
    subtotal: integer("subtotal").notNull().default(0),
    total: integer("total").notNull().default(0),
    notes: text("notes"),
    createdBy: uuid("created_by"),
    createdAt: stamp("created_at"),
    updatedAt: stamp("updated_at"),
  },
  (t) => [uniqueIndex("invoices_number_idx").on(t.number), index("invoices_customer_idx").on(t.customerId)],
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    productId: text("product_id"),
    description: text("description").notNull(),
    unitPrice: integer("unit_price").notNull(),
    qty: integer("qty").notNull().default(1),
  },
  (t) => [index("invoice_items_invoice_idx").on(t.invoiceId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    method: text("method").notNull(),
    amount: integer("amount").notNull(),
    reference: text("reference"),
    note: text("note"),
    paidAt: date("paid_at").notNull().defaultNow(),
    recordedBy: uuid("recorded_by"),
    createdAt: stamp("created_at"),
  },
  (t) => [index("payments_invoice_idx").on(t.invoiceId)],
);

/* ───────────── Contenu du site ───────────── */

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  photo: text("photo"),
  textFr: text("text_fr").notNull(),
  textEn: text("text_en").notNull(),
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

/** Réalisations (chantiers) présentées sur le site, classées par type de solution (`slug`). */
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Type de solution : 100-autonome, hybride, ongrid, anti-delestage ou acces-a-eau. */
    slug: text("slug").notNull(),
    titleFr: text("title_fr").notNull(),
    city: text("city"),
    /** AAAA-MM, ou vide. */
    date: text("date").notNull().default(""),
    client: text("client"),
    descriptionFr: text("description_fr"),
    noteFr: text("note_fr"),
    kwc: doublePrecision("kwc"),
    panelsCount: integer("panels_count"),
    panelsWatts: integer("panels_watts"),
    storageKwh: doublePrecision("storage_kwh"),
    storageKind: text("storage_kind"),
    inverterKva: doublePrecision("inverter_kva"),
    capacityL: doublePrecision("capacity_l"),
    coveragePct: doublePrecision("coverage_pct"),
    autonomyHours: doublePrecision("autonomy_hours"),
    annualKwh: doublePrecision("annual_kwh"),
    roiYears: doublePrecision("roi_years"),
    warrantyYears: integer("warranty_years"),
    co2: doublePrecision("co2"),
    /** Photos du chantier (adresses /images/… ou /api/media/<id>), la première sert de couverture. */
    images: jsonb("images").$type<string[]>().notNull().default([]),
    active: boolean("active").notNull().default(true),
    sort: integer("sort").notNull().default(0),
    createdAt: stamp("created_at"),
    updatedAt: stamp("updated_at"),
  },
  (t) => [index("projects_slug_idx").on(t.slug)],
);

export const partners = pgTable("partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

/* ───────────── Newsletter ───────────── */

/**
 * Abonnés à la newsletter : sauvegarde locale de chaque adresse, quelle que soit la réponse de Mailchimp.
 * `status` est le choix de l'abonné côté site (abonné / désabonné) ; `mailchimpStatus` est ce que Mailchimp a répondu.
 */
export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    status: text("status").notNull().default("subscribed"),
    source: text("source").notNull().default("site"),
    mailchimpStatus: text("mailchimp_status"),
    mailchimpSyncedAt: timestamp("mailchimp_synced_at", { withTimezone: true }),
    mailchimpError: text("mailchimp_error"),
    consentAt: stamp("consent_at"),
    createdAt: stamp("created_at"),
    updatedAt: stamp("updated_at"),
  },
  (t) => [uniqueIndex("subscribers_email_uq").on(t.email), index("subscribers_status_idx").on(t.status)],
);

/* ───────────── Demandes de devis du site ───────────── */

export type QuoteRequestAnswers = { section: string; items: { label: string; value: string }[] }[];

/**
 * Demandes de devis envoyées depuis les formulaires « Particulier » et « Société » du site.
 * `answers` garde les questions et les réponses telles que le visiteur les a vues : le PDF reste fidèle
 * même si le formulaire change plus tard. Nom, téléphone, e-mail et ville sont repris à part pour la liste et la recherche.
 */
export const quoteRequests = pgTable(
  "quote_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ref: text("ref").notNull(),
    /** individual | company */
    kind: text("kind").notNull(),
    name: text("name").notNull(),
    /** Personne à contacter (société) ; vide pour un particulier. */
    contact: text("contact"),
    phone: text("phone").notNull(),
    email: text("email"),
    city: text("city"),
    goal: text("goal"),
    answers: jsonb("answers").$type<QuoteRequestAnswers>().notNull().default([]),
    /** new | contacted | quoted | closed */
    status: text("status").notNull().default("new"),
    note: text("note"),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    createdAt: stamp("created_at"),
    updatedAt: stamp("updated_at"),
  },
  (t) => [
    uniqueIndex("quote_requests_ref_idx").on(t.ref),
    index("quote_requests_status_idx").on(t.status),
    index("quote_requests_created_idx").on(t.createdAt),
  ],
);
