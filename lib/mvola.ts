/**
 * Client serveur de l'API MVola « Merchant Pay » (https://developer.mvola.mg).
 * Ce fichier ne doit jamais être importé depuis un composant client : il lit des secrets.
 *
 * Environnements (doc « API Authentication ») :
 *   sandbox     https://devapi.mvola.mg
 *   production  https://api.mvola.mg
 * Variables d'environnement : voir .env.example.
 *
 * Ce qui vient de la spécification OpenAPI du portail : chemins, en-têtes obligatoires (Version,
 * X-CorrelationID, Cache-Control, UserAccountIdentifier, partnerName pour le statut), champs du corps.
 * Les valeurs exactes de certains champs (descriptionText, metadata) sont à confirmer en sandbox.
 */

const MERCHANT_PATH = "/mvola/mm/transactions/type/merchantpay/1.0.0";

const env = {
  get key() {
    return process.env.MVOLA_CONSUMER_KEY ?? "";
  },
  get secret() {
    return process.env.MVOLA_CONSUMER_SECRET ?? "";
  },
  get merchant() {
    return process.env.MVOLA_MERCHANT_MSISDN ?? "";
  },
  get partner() {
    return process.env.MVOLA_PARTNER_NAME ?? "Prowatt Madagascar";
  },
  get production() {
    return process.env.MVOLA_ENV === "production";
  },
  get base() {
    return process.env.MVOLA_BASE_URL ?? (this.production ? "https://api.mvola.mg" : "https://devapi.mvola.mg");
  },
};

/** Simulation locale (sans clés) : jamais active en production. */
export const isMock = () => process.env.MVOLA_MOCK === "1" && process.env.NODE_ENV !== "production";

/** Les clés sont-elles là ? Sinon le bouton MVola n'est pas proposé (consigne manuelle à la place). */
export const isMvolaConfigured = () => isMock() || Boolean(env.key && env.secret && env.merchant);

export type MvolaStatus = "pending" | "completed" | "failed";

export class MvolaError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number,
  ) {
    super(message);
  }
}

// --- Jeton : valable 1 h (expires_in = 3600), mis en cache jusqu'à une minute avant l'expiration.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const basic = Buffer.from(`${env.key}:${env.secret}`).toString("base64");
  const res = await fetch(`${env.base}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: "EXT_INT_MVOLA_SCOPE" }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new MvolaError("MVola token request failed", res.status);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + (json.expires_in - 60) * 1000 };
  return json.access_token;
}

function commonHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Version: "1.0",
    "X-CorrelationID": crypto.randomUUID(),
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  };
}

export type PaymentRequest = {
  /** Montant entier en ariary. */
  amount: number;
  /** Référence de commande Prowatt (requestingOrganisationTransactionReference). */
  reference: string;
  /** Numéro MVola du client, format 03XXXXXXXX. */
  customerMsisdn: string;
  callbackUrl?: string;
};

export type PaymentStarted = { serverCorrelationId: string; status: MvolaStatus };

// --- Simulation : on mémorise l'heure de départ ; « completed » après ~6 s, « failed » pour 0340000000.
const mockStarts = new Map<string, { at: number; msisdn: string }>();

/** Lance le paiement : le client reçoit une demande de confirmation sur son téléphone (réponse 202). */
export async function startPayment(req: PaymentRequest): Promise<PaymentStarted> {
  if (isMock()) {
    const id = `mock-${crypto.randomUUID()}`;
    mockStarts.set(id, { at: Date.now(), msisdn: req.customerMsisdn });
    return { serverCorrelationId: id, status: "pending" };
  }

  const token = await getToken();
  const body = {
    amount: String(req.amount),
    currency: "Ar",
    descriptionText: `Commande ${req.reference}`.slice(0, 50),
    requestingOrganisationTransactionReference: req.reference,
    requestDate: new Date().toISOString(),
    originalTransactionReference: "",
    debitParty: [{ key: "msisdn", value: req.customerMsisdn }],
    creditParty: [{ key: "msisdn", value: env.merchant }],
    metadata: [{ key: "partnerName", value: env.partner }],
  };
  const res = await fetch(`${env.base}${MERCHANT_PATH}/`, {
    method: "POST",
    headers: {
      ...commonHeaders(token),
      UserAccountIdentifier: `msisdn;${env.merchant}`,
      partnerName: env.partner,
      ...(req.callbackUrl ? { "X-Callback-URL": req.callbackUrl } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  // 202 = en attente de confirmation du client ; 200 toléré.
  if (res.status !== 202 && res.status !== 200) throw new MvolaError("MVola payment request failed", res.status);
  const json = (await res.json()) as { serverCorrelationId?: string; status?: string };
  if (!json.serverCorrelationId) throw new MvolaError("MVola response without correlation id", 502);
  return { serverCorrelationId: json.serverCorrelationId, status: normalise(json.status) };
}

/** Statut d'une transaction : completed (finalisée), pending (en attente), failed (renversée ou rejetée). */
export async function getPaymentStatus(serverCorrelationId: string): Promise<MvolaStatus> {
  if (isMock()) {
    const start = mockStarts.get(serverCorrelationId);
    if (!start) return "failed";
    if (start.msisdn === "0340000000") return Date.now() - start.at > 4000 ? "failed" : "pending";
    return Date.now() - start.at > 6000 ? "completed" : "pending";
  }

  const token = await getToken();
  const res = await fetch(`${env.base}${MERCHANT_PATH}/status/${encodeURIComponent(serverCorrelationId)}`, {
    headers: {
      ...commonHeaders(token),
      UserAccountIdentifier: `msisdn;${env.merchant}`,
      partnerName: env.partner,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new MvolaError("MVola status request failed", res.status);
  const json = (await res.json()) as { status?: string };
  return normalise(json.status);
}

function normalise(s: string | undefined): MvolaStatus {
  const v = (s ?? "").toLowerCase();
  if (v === "completed") return "completed";
  if (v === "failed" || v === "rejected" || v === "reversed") return "failed";
  return "pending";
}
