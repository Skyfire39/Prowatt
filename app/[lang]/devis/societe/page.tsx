import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { QuoteForm } from "@/components/quote-form";
import { PageHero } from "@/components/ui";
import { companyForm, resolveForm } from "@/lib/forms";
import { loadPage } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[lang]/devis/societe">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.quotes.company.formTitle, description: dict.quotes.company.formSubtitle };
}

export default async function CompanyQuotePage({ params }: PageProps<"/[lang]/devis/societe">) {
  const { lang, dict } = await loadPage(params);
  const q = dict.quotes.company;

  return (
    <>
      <PageHero eyebrow={dict.quotes.eyebrow} title={q.formTitle} subtitle={q.formSubtitle} />
      <section className="px-4 pb-4 pt-4 sm:px-6 sm:pb-8">
        <Reveal className="mx-auto max-w-6xl">
          <div className="glass-strong rounded-3xl px-5 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <QuoteForm
              sections={resolveForm(companyForm, lang)}
              labels={dict.form}
              subject={dict.form.subjectCompany}
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}
