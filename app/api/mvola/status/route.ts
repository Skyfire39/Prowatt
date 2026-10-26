import { markOrderPaidByTx, markOrderPaymentFailedByTx } from "@/lib/admin/orders";
import { dbConfigured } from "@/lib/db";
import { getPaymentStatus, isMvolaConfigured, MvolaError } from "@/lib/mvola";

const ID = /^[A-Za-z0-9-]{8,80}$/;
const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Statut d'un paiement MVola (interrogé toutes les quelques secondes par la page de commande). */
export async function GET(request: Request) {
  if (!isMvolaConfigured()) return json({ error: "not_configured" }, 503);

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!ID.test(id)) return json({ error: "bad_request" }, 400);

  try {
    const status = await getPaymentStatus(id);
    if (dbConfigured()) {
      // Le statut vient de MVola lui-même : c'est la seule source qui marque une commande « payée ».
      if (status === "completed") await markOrderPaidByTx(id).catch((e) => console.error("[mvola] marquage payé", e instanceof Error ? e.message : e));
      else if (status === "failed") await markOrderPaymentFailedByTx(id).catch(() => {});
    }
    return json({ status });
  } catch (e) {
    console.error("[mvola] status failed", e instanceof MvolaError ? e.httpStatus : "unexpected");
    return json({ error: "provider_error" }, 502);
  }
}
