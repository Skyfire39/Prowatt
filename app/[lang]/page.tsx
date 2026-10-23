import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import {
  Audiences,
  EcooterTeaser,
  Partners,
  SolarAdvantages,
  Solutions,
  Steps,
  Testimonials,
  Why,
} from "@/components/sections";
import { ScrollScene } from "@/components/scroll-scene";
import { CtaBand } from "@/components/ui";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "./dictionaries";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { home, categories, ecooter } = await getDictionary(lang);

  return (
    <>
      <ScrollScene />
      <Hero lang={lang} dict={home.hero} message={home.message} statLabels={home.stats} />
      <Solutions lang={lang} dict={home.solutions} categories={categories} />
      <EcooterTeaser lang={lang} dict={home.ecooter} models={ecooter} />
      <Steps dict={home.steps} />
      <SolarAdvantages dict={home.advantages} />
      <Audiences dict={home.audiences} />
      <Testimonials lang={lang} dict={home.testimonials} />
      <Partners dict={home.partners} />
      <Why dict={home.why} />
      <CtaBand
        title={home.cta.title}
        subtitle={home.cta.subtitle}
        primary={{ href: `/${lang}/devis`, label: home.cta.primary }}
        secondary={{ href: `/${lang}/contact`, label: home.cta.secondary }}
      />
    </>
  );
}
