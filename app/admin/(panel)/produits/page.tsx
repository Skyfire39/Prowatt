import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { BoxIcon, EditIcon, EyeIcon } from "@/components/admin/icons";
import { Badge, DataTable, Empty, FilterBar, Flash, LinkBtn, PageHeader, Pagination, Panel, Td, inputClass, selectClass } from "@/components/admin/ui";
import { PlusIcon } from "@/components/icons";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { categories } from "@/lib/data";
import { getDb, schema } from "@/lib/db";
import { ar, num } from "@/lib/format";

export const metadata: Metadata = { title: "Produits" };
const PAGE_SIZE = 15;
const catName = new Map(categories.map((c) => [c.id, c.name.fr]));

type SP = { q?: string; category?: string; state?: string; page?: string; ok?: string };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser("products.read");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim();
  const db = await getDb();
  const p = schema.products;

  const where = and(
    q ? or(ilike(p.nameFr, `%${q}%`), ilike(p.nameEn, `%${q}%`), ilike(p.sku, `%${q}%`)) : undefined,
    sp.category ? eq(p.category, sp.category) : undefined,
    sp.state === "hidden" ? eq(p.active, false) : sp.state === "promo" ? sql`${p.oldPrice} is not null` : sp.state === "best" ? eq(p.bestSeller, true) : undefined,
  );

  const [[{ n }], rows] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(p).where(where),
    db.select().from(p).where(where).orderBy(desc(p.addedAt), p.nameFr).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
  ]);
  const pages = Math.max(1, Math.ceil(n / PAGE_SIZE));
  const canWrite = can(user.role, "products.write");
  const href = (pg: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (sp.category) u.set("category", sp.category);
    if (sp.state) u.set("state", sp.state);
    if (pg > 1) u.set("page", String(pg));
    return `/admin/produits${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <Flash code={sp.ok} />
      <PageHeader
        eyebrow="Catalogue"
        title="Produits"
        subtitle={`${num(n)} produit${n > 1 ? "s" : ""} dans la boutique`}
        actions={
          canWrite && (
            <LinkBtn href="/admin/produits/nouveau">
              <PlusIcon className="size-4" />
              Nouveau produit
            </LinkBtn>
          )
        }
      />
      <Panel flush>
        <FilterBar action="/admin/produits">
          <input name="q" defaultValue={q} placeholder="Rechercher un nom, une référence…" className={`${inputClass} w-64`} aria-label="Rechercher" />
          <select name="category" defaultValue={sp.category ?? ""} className={`${selectClass} w-52`} aria-label="Catégorie">
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.fr}
              </option>
            ))}
          </select>
          <select name="state" defaultValue={sp.state ?? ""} className={`${selectClass} w-44`} aria-label="État">
            <option value="">Tous</option>
            <option value="best">Meilleures ventes</option>
            <option value="promo">En promotion</option>
            <option value="hidden">Masqués</option>
          </select>
        </FilterBar>

        {rows.length === 0 ? (
          <Empty
            icon={<BoxIcon className="size-6" />}
            title="Aucun produit trouvé"
            text={q || sp.category || sp.state ? "Essayez d'autres filtres." : "Ajoutez votre premier produit."}
            action={canWrite ? <LinkBtn href="/admin/produits/nouveau">Nouveau produit</LinkBtn> : undefined}
          />
        ) : (
          <DataTable head={["Produit", "Catégorie", { label: "Prix", right: true }, "Stock", "Étiquettes", { label: "", right: true }]} className="mt-5">
            {rows.map((r) => (
              <tr key={r.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-accent-soft text-accent">
                      {r.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt="" className="size-full object-contain" />
                      ) : (
                        <BoxIcon className="size-5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <Link href={`/admin/produits/${r.id}`} className="line-clamp-1 font-semibold hover:underline">
                        {r.nameFr}
                      </Link>
                      <p className="text-xs text-muted">{r.sku ?? r.id}</p>
                    </div>
                  </div>
                </Td>
                <Td className="whitespace-nowrap text-muted">{catName.get(r.category) ?? r.category}</Td>
                <Td right>
                  {r.oldPrice && <span className="mr-2 text-xs text-muted line-through">{ar(r.oldPrice)}</span>}
                  <span className="font-semibold">{ar(r.price)}</span>
                </Td>
                <Td className="tabular-nums">{r.stock === null ? <span className="text-muted">—</span> : r.stock <= 0 ? <Badge tone="red">Rupture</Badge> : r.stock}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {r.bestSeller && <Badge tone="teal">Top vente</Badge>}
                    {r.oldPrice && <Badge tone="amber">Promo</Badge>}
                    {!r.active && <Badge tone="neutral">Masqué</Badge>}
                  </div>
                </Td>
                <Td right>
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/fr/boutique/${r.id}`} target="_blank" aria-label={`Voir ${r.nameFr} sur le site`} className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-ink">
                      <EyeIcon className="size-[18px]" />
                    </Link>
                    {canWrite && (
                      <Link href={`/admin/produits/${r.id}`} aria-label={`Modifier ${r.nameFr}`} className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-ink">
                        <EditIcon className="size-[18px]" />
                      </Link>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
        <Pagination page={page} pages={pages} hrefFor={href} />
      </Panel>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
