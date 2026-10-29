import { upsertCustomer } from "@/lib/admin/customers";
import { logAudit } from "@/lib/audit";
import { dbConfigured, getDb, schema } from "@/lib/db";
import { buildRequest, isRequestKind, newRequestRef } from "@/lib/quote-requests";

const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

// 5 demandes par minute et par IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

/**
 * Enregistre une demande de devis envoyée depuis les formulaires du site.
 * Elle apparaît dans l'administration (« Demandes de devis ») et peut être exportée en PDF. Le client est retrouvé
 * (téléphone ou e-mail) ou créé, comme pour une commande, pour garder tout son historique au même endroit.
 */
export async function POST(request: Request) {
  if (!dbConfigured()) return json({ ok: false, error: "not_configured" }, 503);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (limited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  let b: Record<string, unknown>;
  try {
    b = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  // Champ piège invisible : seuls les robots le remplissent. On répond « ok » sans rien enregistrer.
  if (typeof b.website === "string" && b.website.trim()) return json({ ok: true });

  if (!isRequestKind(b.kind) || typeof b.values !== "object" || b.values === null || Array.isArray(b.values)) {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  const built = buildRequest(b.kind, b.values as Record<string, unknown>);
  if (!built) return json({ ok: false, error: "invalid" }, 400);

  try {
    const db = await getDb();
    const customerId = await upsertCustomer({
      name: built.contact ? `${built.contact}` : built.name,
      phone: built.phone,
      email: built.email,
      city: built.city,
      source: "site",
    });
    const ref = newRequestRef();
    const [row] = await db
      .insert(schema.quoteRequests)
      .values({ ref, customerId, ...built })
      .returning({ id: schema.quoteRequests.id });
    await logAudit(null, "nouvelle demande de devis", "demande", row.id, `${ref} · ${built.name}`);
    return json({ ok: true, ref });
  } catch (e) {
    console.error("[devis] échec d'enregistrement", e instanceof Error ? e.message : e);
    return json({ ok: false, error: "server_error" }, 500);
  }
}
