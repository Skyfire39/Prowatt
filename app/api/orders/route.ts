import { eq } from "drizzle-orm";
import { upsertCustomer } from "@/lib/admin/customers";
import { logAudit } from "@/lib/audit";
import { getProducts } from "@/lib/content";
import { atomic, dbConfigured, getDb, schema } from "@/lib/db";
import { isEmail } from "@/lib/validate";

const REF = /^PW-\d{6}-[A-Z0-9]{4}$/;
const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

// 10 commandes par minute et par IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Enregistre une commande passée depuis le site (étape « Valider ma commande »).
 * Montants et noms viennent du catalogue côté serveur ; le navigateur n'envoie que des identifiants et des quantités.
 * Appel idempotent : renvoyer la même référence met à jour la commande tant qu'elle est « nouvelle ».
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

  const ref = clean(b.ref, 40);
  const name = clean(b.name, 80);
  const phone = clean(b.phone, 30);
  const email = clean(b.email, 120).toLowerCase();
  const mode = b.mode === "ship" ? "ship" : "pickup";
  const address = clean(b.address, 200);
  const city = clean(b.city, 80);
  const note = clean(b.note, 500);
  const pay = ["mvola", "bank", "card"].includes(String(b.pay)) ? (b.pay as string) : "mvola";
  const lang = "fr";

  if (!REF.test(ref) || name.length < 2 || phone.replace(/\D/g, "").length < 7) return json({ ok: false, error: "bad_request" }, 400);
  if (email && !isEmail(email)) return json({ ok: false, error: "bad_request" }, 400);
  if (mode === "ship" && (!address || !city)) return json({ ok: false, error: "bad_request" }, 400);
  if (!Array.isArray(b.lines) || b.lines.length === 0 || b.lines.length > 30) return json({ ok: false, error: "bad_cart" }, 400);

  const catalog = new Map((await getProducts()).map((p) => [p.id, p]));
  const items: { productId: string; name: string; unitPrice: number; qty: number }[] = [];
  for (const l of b.lines as { id?: unknown; qty?: unknown }[]) {
    const p = typeof l?.id === "string" ? catalog.get(l.id) : undefined;
    const qty = l?.qty;
    if (!p || typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 99) return json({ ok: false, error: "bad_cart" }, 400);
    items.push({ productId: p.id, name: p.name[lang], unitPrice: p.price, qty });
  }
  const total = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  try {
    const db = await getDb();
    const [existing] = await db.select().from(schema.orders).where(eq(schema.orders.ref, ref)).limit(1);
    if (existing && existing.status !== "new") return json({ ok: true, existing: true });

    const customerId = await upsertCustomer({ name, phone, email: email || null, address: address || null, city: city || null, source: "site" });
    const fields = { customerId, customerName: name, customerPhone: phone, customerEmail: email || null, mode, address: address || null, city: city || null, note: note || null, paymentMethod: pay, total, lang, updatedAt: new Date() };

    if (existing) {
      await atomic((q) => [
        q.update(schema.orders).set(fields).where(eq(schema.orders.id, existing.id)),
        q.delete(schema.orderItems).where(eq(schema.orderItems.orderId, existing.id)),
        q.insert(schema.orderItems).values(items.map((i) => ({ orderId: existing.id, ...i }))),
      ]);
    } else {
      const id = crypto.randomUUID();
      await atomic((q) => [
        q.insert(schema.orders).values({ id, ref, ...fields }),
        q.insert(schema.orderItems).values(items.map((i) => ({ orderId: id, ...i }))),
      ]);
      await logAudit(null, "nouvelle commande", "commande", id, `${ref} · ${name}`);
    }
    return json({ ok: true });
  } catch (e) {
    console.error("[orders] échec d'enregistrement", e instanceof Error ? e.message : e);
    return json({ ok: false, error: "server_error" }, 500);
  }
}
