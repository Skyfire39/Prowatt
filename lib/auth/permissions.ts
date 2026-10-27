/** Rôles et droits de l'administration. Les droits se vérifient côté serveur à chaque action. */
export const ROLES = ["owner", "manager", "sales", "accountant", "editor"] as const;
export type Role = (typeof ROLES)[number];

export const roleLabels: Record<Role, string> = {
  owner: "Propriétaire",
  manager: "Gestionnaire",
  sales: "Commercial",
  accountant: "Comptable",
  editor: "Éditeur",
};

export const roleDescriptions: Record<Role, string> = {
  owner: "Accès complet, y compris utilisateurs et réglages.",
  manager: "Tout gérer sauf les utilisateurs.",
  sales: "Clients, commandes, devis ; consultation des produits et factures.",
  accountant: "Factures et paiements ; consultation des clients, commandes et devis.",
  editor: "Produits, motos Ecooter, contenu du site et newsletter.",
};

export const PERMISSIONS = [
  "dashboard.view",
  "products.read",
  "products.write",
  "motos.write",
  "customers.read",
  "customers.write",
  "orders.read",
  "orders.write",
  "quotes.read",
  "quotes.write",
  "invoices.read",
  "invoices.write",
  "payments.write",
  "content.write",
  "newsletter.manage",
  "settings.manage",
  "users.manage",
  "audit.read",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const matrix: Record<Role, readonly Permission[]> = {
  owner: PERMISSIONS,
  manager: PERMISSIONS.filter((p) => p !== "users.manage"),
  sales: [
    "dashboard.view",
    "products.read",
    "customers.read",
    "customers.write",
    "orders.read",
    "orders.write",
    "quotes.read",
    "quotes.write",
    "invoices.read",
  ],
  accountant: [
    "dashboard.view",
    "customers.read",
    "orders.read",
    "quotes.read",
    "invoices.read",
    "invoices.write",
    "payments.write",
  ],
  editor: ["dashboard.view", "products.read", "products.write", "motos.write", "content.write", "newsletter.manage"],
};

export const can = (role: string, permission: Permission): boolean =>
  (matrix[role as Role] ?? []).includes(permission);

export const isRole = (v: string): v is Role => (ROLES as readonly string[]).includes(v);
