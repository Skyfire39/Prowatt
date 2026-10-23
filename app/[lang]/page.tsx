import { notFound } from "next/navigation";
import { Contact } from "@/components/contact";
import { Hero } from "@/components/hero";
import { Moto, Solar, Steps, Why } from "@/components/sections";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "./dictionaries";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Hero lang={lang} dict={dict.hero} />
      <Solar dict={dict.solar} />
      <Moto lang={lang} dict={dict.moto} />
      <Why dict={dict.why} />
      <Steps dict={dict.steps} />
      <Contact dict={dict.contact} />
    </>
  );
}
