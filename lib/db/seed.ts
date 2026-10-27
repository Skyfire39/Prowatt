import { sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { ecooters, partners, products, projects, testimonials } from "../data";
import { defaultSettings } from "../settings";
import type { Db } from "./index";
import * as t from "./schema";

/** Remplit les tables vides avec le contenu actuel du site (catalogue, motos, réalisations, avis, partenaires, réglages). */
export async function seedIfEmpty(db: Db) {
  const count = async (table: PgTable) => {
    const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(table);
    return row.n;
  };

  if ((await count(t.products)) === 0) {
    await db.insert(t.products).values(
      products.map((p) => ({
        id: p.id,
        category: p.category,
        nameFr: p.name.fr,
        nameEn: p.name.en,
        descriptionFr: p.description?.fr ?? null,
        descriptionEn: p.description?.en ?? null,
        sku: p.sku ?? null,
        image: p.image ?? null,
        active: p.active !== false,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        bestSeller: p.bestSeller ?? false,
        addedAt: p.addedAt,
      })),
    );
  }

  if ((await count(t.ecooters)) === 0) {
    await db.insert(t.ecooters).values(
      ecooters.map((m, i) => ({
        id: m.id,
        name: m.name,
        taglineFr: m.tagline.fr,
        taglineEn: m.tagline.en,
        photo: m.photo,
        specs: m.specs as Record<string, string>,
        price: m.price,
        sort: i,
      })),
    );
  }

  if ((await count(t.projects)) === 0) {
    await db.insert(t.projects).values(
      projects.map((p, i) => ({
        slug: p.slug,
        titleFr: p.title.fr,
        city: p.city ?? null,
        date: p.date,
        client: p.client ?? null,
        descriptionFr: p.description?.fr ?? null,
        noteFr: p.note?.fr ?? null,
        kwc: p.kwc ?? null,
        panelsCount: p.panels?.count ?? null,
        panelsWatts: p.panels?.watts ?? null,
        storageKwh: p.storageKwh ?? null,
        storageKind: p.storageKind?.fr ?? null,
        inverterKva: p.inverterKva ?? null,
        capacityL: p.capacityL ?? null,
        coveragePct: p.coveragePct ?? null,
        autonomyHours: p.autonomyHours ?? null,
        annualKwh: p.annualKwh ?? null,
        roiYears: p.roiYears ?? null,
        warrantyYears: p.warrantyYears ?? null,
        co2: p.co2 ?? null,
        images: p.images ?? [],
        sort: i,
      })),
    );
  }

  if ((await count(t.testimonials)) === 0) {
    await db.insert(t.testimonials).values(
      testimonials.map((x, i) => ({ name: x.name, photo: x.photo, textFr: x.text.fr, textEn: x.text.en, sort: i })),
    );
  }

  if ((await count(t.partners)) === 0) {
    await db.insert(t.partners).values(partners.map((p, i) => ({ name: p.name, logo: p.logo, sort: i })));
  }

  if ((await count(t.settings)) === 0) {
    await db
      .insert(t.settings)
      .values(Object.entries(defaultSettings).map(([key, value]) => ({ key, value: value as object })));
  }
}
