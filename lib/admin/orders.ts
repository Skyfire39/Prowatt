import { eq } from "drizzle-orm";
import { logAudit } from "@/lib/audit";
import { atomic, getDb, schema } from "@/lib/db";

/** Rattache un paiement MVola démarré à sa commande (par référence). */
export async function attachPaymentToOrder(ref: string, tx: string) {
  const db = await getDb();
  await db
    .update(schema.orders)
    .set({ paymentTx: tx, paymentStatus: "pending", paymentMethod: "mvola", updatedAt: new Date() })
    .where(eq(schema.orders.ref, ref));
}

/**
 * MVola a confirmé le paiement (statut « completed » lu auprès de MVola, pas déclaré par le navigateur) :
 * on marque la commande payée et on enregistre l'encaissement, une seule fois.
 */
export async function markOrderPaidByTx(tx: string) {
  const db = await getDb();
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.paymentTx, tx)).limit(1);
  if (!o || o.paymentStatus === "paid") return;
  await atomic((q) => [
    q.update(schema.orders).set({ paymentStatus: "paid", updatedAt: new Date() }).where(eq(schema.orders.id, o.id)),
    q.insert(schema.payments).values({ orderId: o.id, method: "mvola", amount: o.total, reference: tx, note: "Paiement confirmé par MVola" }),
  ]);
  await logAudit(null, "paiement MVola confirmé", "commande", o.id, o.ref);
}

export async function markOrderPaymentFailedByTx(tx: string) {
  const db = await getDb();
  await db.update(schema.orders).set({ paymentStatus: "unpaid", updatedAt: new Date() }).where(eq(schema.orders.paymentTx, tx));
}
