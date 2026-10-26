import type { ReactNode } from "react";

/** Texte avec `**gras**` : rend les passages encadrés en <strong>, sans aucun HTML libre. */
export function RichText({ text }: { text: string }): ReactNode {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-ink">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}
