import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { QuoteForm } from "@/components/quote-form";
import { PageHero } from "@/components/ui";
import { individualForm, resolveForm } from "@/lib/forms";
import { loadPage } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[lang]/devis/particulier">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.quotes.individual.formTitle, description: dict.quotes.individual.formSubtitle };
}

export default async function IndividualQuotePage({ params }: PageProps<"/[lang]/devis/particulier">) {
  const { lang, dict } = await loadPage(params);
  const q = dict.quotes.individual;

  return (
    <>
      <PageHero eyebrow={dict.quotes.eyebrow} title={q.formTitle} subtitle={q.formSubtitle} />
      <section className="px-4 pb-20 pt-4 sm:px-6 sm:pb-28">
        <Reveal className="mx-auto max-w-4xl">
          <div className="glass-strong rounded-3xl p-5 sm:p-10 lg:p-14">
            <QuoteForm
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
