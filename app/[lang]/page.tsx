import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import {
  Audiences,
  EcooterTeaser,
  FeaturedSection,
  Partners,
  SolarAdvantages,
  Solutions,
  Steps,
  Testimonials,
  Why,
} from "@/components/sections";
import { SolarParallax } from "@/components/solar-parallax";
import { CtaBand } from "@/components/ui";
import { getEcooters, getPartners, getProducts, getTestimonials } from "@/lib/content";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "./dictionaries";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { home, categories, ecooter, realisations, shop } = await getDictionary(lang);
  const [products, ecooters, testimonials, partners] = await Promise.all([getProducts(), getEcooters(), getTestimonials(), getPartners()]);

  return (
    <>
      <SolarParallax />
      <Hero lang={lang} dict={home.hero} message={home.message} statLabels={home.stats} />
      <Solutions dict={home.solutions} categories={categories} explore={realisations.explore} />
      <FeaturedSection lang={lang} dict={home.featured} shop={shop} products={products} />
      <EcooterTeaser lang={lang} dict={home.ecooter} models={ecooter} ecooters={ecooters} />
      <Steps dict={home.steps} />
      <SolarAdvantages dict={home.advantages} />
      <Audiences dict={home.audiences} />
      <Testimonials lang={lang} dict={home.testimonials} items={testimonials} />
      <Partners dict={home.partners} items={partners} />
      <Why dict={home.why} />
      <CtaBand
        title={home.cta.title}
        subtitle={home.cta.subtitle}
        primary={{ href: `/devis`, label: home.cta.primary }}
        secondary={{ href: `/contact`, label: home.cta.secondary }}
      />
    </>
  );
}
