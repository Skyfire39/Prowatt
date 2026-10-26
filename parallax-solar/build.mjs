// Synchronise le SVG source (scene.svg) avec ses copies :
//   - le bloc inline de index.html (entre les marqueurs SVG:START / SVG:END)
//   - scene.svg.js, un module qui exporte le SVG en chaîne (utilisé par le composant Next.js)
// Usage : node parallax-solar/build.mjs
import { readFileSync, writeFileSync } from "node:fs";

const here = (name) => new URL(`./${name}`, import.meta.url);
const svg = readFileSync(here("scene.svg"), "utf8").trim();

const html = readFileSync(here("index.html"), "utf8");
const next = html.replace(
  /<!-- SVG:START -->[\s\S]*<!-- SVG:END -->/,
  () => `<!-- SVG:START -->\n${svg}\n<!-- SVG:END -->`,
);
writeFileSync(here("index.html"), next);

writeFileSync(
  here("scene.svg.js"),
  `// Généré par build.mjs à partir de scene.svg : ne pas modifier à la main.\nexport default ${JSON.stringify(svg)};\n`,
);

console.log(`scene.svg (${svg.length} octets) → index.html + scene.svg.js`);
