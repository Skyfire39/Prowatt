/** Données structurées schema.org : le `<` est échappé pour qu'aucun texte ne puisse refermer la balise script. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
