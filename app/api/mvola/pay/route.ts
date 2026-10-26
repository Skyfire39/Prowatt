import { products } from "@/lib/data";
import { isMvolaConfigured, MvolaError, startPayment } from "@/lib/mvola";

const REF = /^PW-\d{6}-[A-Z0-9]{4}$/;
const MSISDN = /^03[48]\d{7}$/; // numéros MVola (Telma) : 034 et 038
const MAX_LINES = 30;

// Limite simple par IP (instance unique) : 5 demandes de paiement par minute.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Démarre un paiement MVola. Le montant n'est JAMAIS lu dans la requête : il est recalculé ici à
 * partir du catalogue, pour qu'un client ne puisse pas payer moins que le panier.
 */
export async function POST(request: Request) {
  if (!isMvolaConfigured()) return json({ error: "not_configured" }, 503);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (limited(ip)) return json({ error: "rate_limited" }, 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const { ref, lines, msisdn, attempt } = (body ?? {}) as {
    ref?: unknown;
    lines?: unknown;
    msisdn?: unknown;
    attempt?: unknown;
  };

  if (typeof ref !== "string" || !REF.test(ref)) return json({ error: "bad_reference" }, 400);
  if (typeof msisdn !== "string" || !MSISDN.test(msisdn)) return json({ error: "bad_phone" }, 400);
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > MAX_LINES) return json({ error: "bad_cart" }, 400);

  let amount = 0;
  for (const l of lines as { id?: unknown; qty?: unknown }[]) {
    const product = typeof l?.id === "string" ? products.find((p) => p.id === l.id) : undefined;
    const qty = l?.qty;
    if (!product || typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return json({ error: "bad_cart" }, 400);
    }
    amount += product.price * qty;
  }

  // Une nouvelle tentative pour la même commande reçoit un suffixe : MVola refuse une référence réutilisée (409).
  const n = typeof attempt === "number" && Number.isInteger(attempt) && attempt > 1 && attempt < 10 ? attempt : 1;
  const reference = n === 1 ? ref : `${ref}-${n}`;

  try {
    const started = await startPayment({
      amount,
      reference,
      customerMsisdn: msisdn,
      callbackUrl: process.env.MVOLA_CALLBACK_URL || undefined,
    });
    return json({ id: started.serverCorrelationId, status: started.status, amount });
  } catch (e) {
    // On journalise le code HTTP seulement : ni jeton, ni clés, ni numéro de téléphone.
    console.error("[mvola] pay failed", e instanceof MvolaError ? e.httpStatus : "unexpected");
    return json({ error: "provider_error" }, 502);
  }
}
