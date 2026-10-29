import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { QuoteForm } from "@/components/quote-form";
import { PageHero } from "@/components/ui";
import { individualForm, resolveForm } from "@/lib/forms";
import { loadPage } from "@/lib/page";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/devis/particulier">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return pageMetadata({ ...dict.seo.devisParticulier, path: "/devis/particulier" });
}

export default async function IndividualQuotePage({ params }: PageProps<"/[lang]/devis/particulier">) {
  const { lang, dict } = await loadPage(params);
  const q = dict.quotes.individual;

  return (
    <>
      <PageHero eyebrow={dict.quotes.eyebrow} title={q.formTitle} subtitle={q.formSubtitle} />
      <section className="px-4 pb-4 pt-4 sm:px-6 sm:pb-8">
        <Reveal className="mx-auto max-w-6xl">
          <div className="glass-strong rounded-3xl px-5 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <QuoteForm
              kind="individual"
              sections={resolveForm(individualForm, lang)}
              labels={dict.form}
              subject={dict.form.subjectIndividual}
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}
