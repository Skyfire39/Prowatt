# Parallax solaire

Décor SVG plein écran qui évolue au scroll : on « descend » du ciel jusqu'à une maison à panneaux
solaires dont l'énergie recharge une moto électrique. JavaScript vanilla, un seul `<svg>` inline,
aucune dépendance. Poids : environ 46 Ko (SVG + CSS + JS).

| Fichier | Rôle |
|---|---|
| `index.html` | Démo complète : 5 sections de texte posées sur le décor |
| `parallax-solar.css` | Variables de couleurs, formes, animations continues |
| `parallax-solar.js` | Moteur : progression du scroll → transformations des groupes |
| `scene.svg` | **Source** du décor, organisé en groupes commentés |
| `build.mjs` | Recopie `scene.svg` dans `index.html` et dans `scene.svg.js` |
| `scene.svg.js` | Le SVG en chaîne (généré), utilisé par le composant Next.js |

## Couches et découpage du scroll

La progression globale (0 → 1) pilote tout. Chaque étape occupe un cinquième du scroll, avec des
fondus qui se chevauchent pour éviter toute coupure.

| Étape | Progression | Scène |
|---|---|---|
| 1 · Soleil + nuages | 0 – 0,2 | `sun` (halo, rayons qui tournent) entre `clouds-back` et `clouds-mid` |
| 2 · Nuages | 0,2 – 0,4 | Le soleil sort du cadre, 3 couches de nuages à vitesses différentes |
| 3 · Nuages + toits | 0,4 – 0,6 | Les nuages s'écartent, `rooftops` monte, `sky-3` plus chaud |
| 4 · Maison + panneaux | 0,6 – 0,8 | `house-stage` zoome, reflet sur `solar-panels`, `sun-rays` |
| 5 · Moto en charge | 0,8 – 1 | `moto`, `cable`, `energy-flow` (particules), `battery` qui se remplit |

Ordre des groupes, du fond vers l'avant :
`sky` → `clouds-back` → `sun` → `clouds-mid` → `clouds-front` → `rooftops` (`-far`, `-near`) →
`house-stage` (`hill`, `house`, `solar-panels`, `sun-rays`, `wallbox`, `driveway`, `lawn`, `moto`,
`cable`, `battery`, `energy-flow`).

## Intégration

**HTML simple** : voir `index.html`.

```html
<link rel="stylesheet" href="parallax-solar.css">
<main data-ps-scroll>            <!-- sa hauteur définit le scroll (sinon : toute la page) -->
  <div class="ps" data-parallax-solar aria-hidden="true"> <!-- le <svg> inline ici --> </div>
  <!-- votre contenu, avec position: relative; z-index: 1 -->
</main>
<script type="module" src="parallax-solar.js"></script>
```

**Next.js / Astro** : importez le module et passez-lui l'élément racine.

```tsx
import "@/parallax-solar/parallax-solar.css";
import scene from "@/parallax-solar/scene.svg.js";

useEffect(() => {
  let inst; let off = false;
  import("@/parallax-solar/parallax-solar.js").then((m) => { if (!off) inst = m.initParallaxSolar(ref.current); });
  return () => { off = true; inst?.destroy(); };
}, []);
// <div ref={ref} className="ps" data-parallax-solar aria-hidden dangerouslySetInnerHTML={{ __html: scene }} />
```

L'API : `initParallaxSolar(root, { scrollContainer })` renvoie `{ setProgress(p), destroy() }`.
Pour passer d'un décor fixe à un décor collé dans un conteneur, ajoutez la classe `ps--sticky`.

## Modifier le décor

Après toute modification de `scene.svg`, relancez : `node parallax-solar/build.mjs`.

### Les attributs `data-*` (à poser sur n'importe quel groupe)

| Attribut | Format | Effet |
|---|---|---|
| `data-speed` | `1.25` | Parallax continu : monte de `speed × 1000` unités sur tout le scroll. Grand = proche |
| `data-show` | `a b c d` | Opacité : fondu a→b, plein b→c, fondu c→d |
| `data-y` / `data-x` | `de vers a b` | Translation de `de` à `vers` entre les progressions a et b |
| `data-scale` | `de vers a b` | Zoom autour de `data-origin="x y"` |
| `data-scalex` | `de vers a b` | Étirement horizontal (jauge de batterie) |
| `data-x-portrait` | `de vers a b` | Comme `data-x`, appliqué selon l'étroitesse de l'écran (garde la moto visible sur mobile) |
| `data-flow` | id d'un tracé | Fait circuler `data-count` particules (`data-rate`, `data-r`) |

### Changer les vitesses

Les nuages : `clouds-back` (0,25), `clouds-mid` (0,7), `clouds-front` (1,25). Augmentez `data-speed`
pour accentuer la profondeur. Le soleil sort plus tôt avec un `data-speed` plus fort ou un
`data-show` plus court. Le lissage du scroll est la constante `LERP` en haut de `parallax-solar.js`
(plus petit = plus doux), l'amplitude du parallax est `PARALLAX_RANGE`.

### Changer les couleurs

Toutes les couleurs sont des variables CSS en haut de `parallax-solar.css` (`--ps-sky`, `--ps-sun`,
`--ps-panel`, `--ps-moto`, …). Surchargez-les sur `.ps` ou `:root`, par exemple :
`.ps { --ps-sun: #ffd23f; --ps-moto: #ff7a59; }`.

### Ajouter une étape

1. Ajoutez un groupe dans `scene.svg` à la bonne profondeur, avec un id et un `data-show` qui
   couvre sa plage (ex. `0.8 0.9 1 1`), plus `data-y` pour qu'il entre en mouvement.
2. Si l'étape est la dernière, laissez le groupe visible jusqu'à 1 ; sinon donnez-lui un fondu de sortie.
3. Ajoutez sa progression représentative à `STAGE_CENTERS` dans `parallax-solar.js` (image statique
   en mode mouvement réduit).
4. `node parallax-solar/build.mjs`, puis ajoutez une section de texte dans la démo si besoin.

## Accessibilité et performances

- Le SVG est décoratif : `aria-hidden="true"`, `pointer-events: none`.
- `prefers-reduced-motion` : plus de lissage ni de parallax continu, les animations CSS sont
  coupées et le décor saute à une **image statique par étape** selon le scroll.
- Seuls `transform` et `opacity` sont animés ; les couches invisibles passent en `visibility:hidden`.
  La boucle `requestAnimationFrame` s'arrête dès que la scène est au repos (sauf les particules
  de la dernière étape) et se met en pause quand l'onglet est caché.
- Si une machine ramait, simplifiez d'abord les nuages (moins de `<use>` dans `clouds-*`).
