import type { Metadata } from "next";
import { Checkout } from "@/components/checkout";
import { PageHero } from "@/components/ui";
import { isMvolaConfigured } from "@/lib/mvola";
import { loadPage } from "@/lib/page";
import { getSettings } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/[lang]/commande">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.checkout.eyebrow, description: dict.checkout.subtitle, robots: { index: false } };
}

export default async function CheckoutPage({ params }: PageProps<"/[lang]/commande">) {
  const { lang, dict } = await loadPage(params);
  const d = dict.checkout;
  const settings = await getSettings();

  return (
    <>
      <PageHero eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} />
      <section className="px-4 pb-20 pt-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Checkout
            lang={lang}
            dict={d}
            currency={dict.shop.currency}
            shopHref={`/boutique`}
            pickupAddress={settings.company.address[lang]}
            payment={settings.payment}
            mvolaLive={isMvolaConfigured()}
          />
        </div>
      </section>
    </>
  );
}
