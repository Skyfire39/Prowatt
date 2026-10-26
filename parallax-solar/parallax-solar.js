/**
 * Parallax solaire — moteur d'animation (JavaScript vanilla, aucune dépendance).
 *
 * Le décor est un seul <svg> inline. La progression globale du scroll (0 → 1) pilote
 * chaque élément marqué par des attributs data-* (voir README.md) :
 *   data-speed, data-show, data-y, data-x, data-scale, data-scalex, data-x-portrait, data-flow
 *
 * Seuls `transform` et `opacity` sont animés. Le scroll est lissé (lerp) dans une boucle
 * requestAnimationFrame qui s'arrête dès que la scène est au repos.
 *
 * Usage HTML simple :  <script type="module" src="parallax-solar.js"></script>
 *                      avec <div class="ps" data-parallax-solar> … </div>
 * Usage module :       import { initParallaxSolar } from "./parallax-solar.js";
 */

/** Amplitude du parallax continu : data-speed="1" monte de 1000 unités du viewBox sur tout le scroll. */
const PARALLAX_RANGE = 1000;
/** Lissage du scroll : plus petit = plus doux et plus lent. */
const LERP = 0.085;
/**
 * Rapport largeur / hauteur en dessous duquel on décale la scène (data-x-portrait) pour garder
 * la moto visible : décalage nul à 1,5, complet à 0,5 et en dessous (mobile).
 */
const NARROW_FROM = 1.5;
const NARROW_TO = 0.5;
/** Progression représentative de chaque étape, utilisée en mode mouvement réduit. */
const STAGE_CENTERS = [0.1, 0.3, 0.5, 0.7, 0.9];

const SVG_NS = "http://www.w3.org/2000/svg";

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
/** Easing « smoothstep » : départ et arrivée en douceur. */
const ease = (t) => t * t * (3 - 2 * t);
const nums = (str) => String(str).trim().split(/[\s,]+/).map(Number);

/** Interpolation « de vers a b » : va de `de` à `vers` entre les progressions a et b. */
function ranged([from, to, a, b], p) {
  const t = b === a ? (p >= a ? 1 : 0) : clamp((p - a) / (b - a));
  return from + (to - from) * ease(t);
}

/** Trapèze d'opacité « a b c d » : fondu a→b, plein b→c, fondu c→d. */
function windowOpacity([a, b, c, d], p) {
  if (p < a) return 0;
  if (p < b) return b === a ? 1 : ease((p - a) / (b - a));
  if (p <= c) return 1;
  if (p < d) return d === c ? 0 : 1 - ease((p - c) / (d - c));
  return 0;
}

/** Lit les attributs data-* d'un élément et prépare son état. */
function describe(el) {
  const get = (name) => (el.hasAttribute(name) ? nums(el.getAttribute(name)) : null);
  const origin = get("data-origin") || [800, 450];
  return {
    el,
    speed: el.hasAttribute("data-speed") ? Number(el.getAttribute("data-speed")) : 0,
    show: get("data-show"),
    y: get("data-y"),
    x: get("data-x"),
    xPortrait: get("data-x-portrait"),
    scale: get("data-scale"),
    scaleX: get("data-scalex"),
    origin,
    last: "",
  };
}

/** Génère les particules de chaque [data-flow] en échantillonnant le tracé une seule fois. */
function buildFlows(root) {
  return [...root.querySelectorAll("[data-flow]")].map((group) => {
    const path = root.querySelector(`#${group.getAttribute("data-flow")}`);
    const count = Number(group.getAttribute("data-count") || 6);
    const radius = Number(group.getAttribute("data-r") || 6);
    const rate = Number(group.getAttribute("data-rate") || 0.2);
    const steps = 140;
    const length = path.getTotalLength();
    const points = Array.from({ length: steps + 1 }, (_, i) => {
      const pt = path.getPointAtLength((i / steps) * length);
      return [pt.x, pt.y];
    });
    const dots = Array.from({ length: count }, (_, i) => {
      const c = document.createElementNS(SVG_NS, "circle");
      c.setAttribute("r", radius);
      group.appendChild(c);
      return { c, phase: i / count };
    });
    return { group, points, dots, rate, steps };
  });
}

/**
 * Initialise le décor sur un élément racine (le conteneur du <svg>).
 * @param {HTMLElement} root  conteneur .ps contenant le <svg>
 * @param {{scrollContainer?: HTMLElement}} [options]
 *   scrollContainer : élément dont la hauteur définit le scroll (sinon [data-ps-scroll] le plus proche, sinon la page)
 * @returns {{destroy: () => void, setProgress: (p: number) => void}}
 */
export function initParallaxSolar(root, options = {}) {
  if (root.__psInstance) return root.__psInstance;

  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const container = options.scrollContainer || root.closest("[data-ps-scroll]") || null;

  const items = [...root.querySelectorAll(
    "[data-speed],[data-show],[data-y],[data-x],[data-x-portrait],[data-scale],[data-scalex]",
  )].map(describe);
  const flows = buildFlows(root);

  // Origine de transformation exprimée en unités du viewBox.
  for (const it of items) {
    it.el.style.transformBox = "view-box";
    it.el.style.transformOrigin = `${it.origin[0]}px ${it.origin[1]}px`;
    it.el.style.willChange = "transform, opacity";
  }

  let reduced = reduceQuery.matches;
  let narrow = 0; // 0 = écran large, 1 = écran en hauteur
  let inView = true;
  let target = 0;
  let current = 0;
  let raf = 0;

  /** Progression du scroll (0 → 1) sur la page ou sur le conteneur choisi. */
  function readProgress() {
    if (container) {
      const rect = container.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      return total > 0 ? clamp(-rect.top / total) : 0;
    }
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    return total > 0 ? clamp(window.scrollY / total) : 0;
  }

  /** Applique la scène pour une progression donnée. */
  function render(p) {
    for (const it of items) {
      let tx = 0;
      let ty = 0;
      if (it.speed) ty -= it.speed * PARALLAX_RANGE * p;
      if (it.y) ty += ranged(it.y, p);
      if (it.x) tx += ranged(it.x, p);
      if (it.xPortrait && narrow) tx += ranged(it.xPortrait, p) * narrow;
      const s = it.scale ? ranged(it.scale, p) : 1;
      const sx = it.scaleX ? ranged(it.scaleX, p) : null;

      const transform =
        sx !== null
          ? `scale(${sx.toFixed(4)}, 1)`
          : `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)})`;
      if (transform !== it.last) {
        it.el.style.transform = transform;
        it.last = transform;
      }

      if (it.show) {
        const o = windowOpacity(it.show, p);
        it.el.style.opacity = o < 0.005 ? "0" : o.toFixed(3);
        // visibility:hidden évite de peindre les couches invisibles (vide = hérite du parent).
        it.el.style.visibility = o < 0.005 ? "hidden" : "";
      }
    }
  }

  /** Fait circuler les particules d'énergie (visibles seulement à la dernière étape). */
  function renderFlows(now) {
    for (const f of flows) {
      for (const d of f.dots) {
        const t = (now / 1000 * f.rate + d.phase) % 1;
        const [x, y] = f.points[Math.round(t * f.steps)];
        d.c.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        // Les particules apparaissent et disparaissent aux extrémités du tracé.
        d.c.style.opacity = String(Math.min(1, t * 8, (1 - t) * 8));
      }
    }
  }

  const flowsActive = () => !reduced && inView && !document.hidden && current > 0.76;

  function tick(now) {
    raf = 0;
    const delta = target - current;
    current = Math.abs(delta) < 0.0004 ? target : current + delta * LERP;
    render(current);
    if (flowsActive()) renderFlows(now);
    if (current !== target || flowsActive()) raf = requestAnimationFrame(tick);
  }

  function start() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  /** Mouvement réduit : pas de lerp, la scène saute à l'image statique de l'étape courante. */
  function snap(p) {
    const stage = Math.min(STAGE_CENTERS.length - 1, Math.floor(p * STAGE_CENTERS.length));
    current = target = STAGE_CENTERS[stage];
    render(current);
  }

  function onScroll() {
    const p = readProgress();
    if (reduced) return snap(p);
    target = p;
    start();
  }

  /** Calcule à quel point l'écran est « étroit » (0 à 1). */
  function measure() {
    const ratio = window.innerWidth / window.innerHeight;
    narrow = clamp((NARROW_FROM - ratio) / (NARROW_FROM - NARROW_TO));
  }

  function onResize() {
    measure();
    onScroll();
    render(current);
  }

  function onReducedChange(e) {
    reduced = e.matches;
    root.classList.toggle("ps--static", reduced);
    if (reduced) {
      cancelAnimationFrame(raf);
      raf = 0;
      snap(readProgress());
    } else {
      onScroll();
    }
  }

  // Met en pause la boucle quand le décor n'est pas à l'écran (utile hors mode fixed).
  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) start();
  });
  io.observe(root);

  measure();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", start);
  reduceQuery.addEventListener("change", onReducedChange);

  root.classList.toggle("ps--static", reduced);
  current = target = reduced ? STAGE_CENTERS[0] : readProgress();
  if (reduced) snap(readProgress());
  else render(current);
  if (!reduced) start();

  const instance = {
    /** Force une progression (0 → 1), par exemple pour piloter la scène depuis un autre script. */
    setProgress(p) {
      target = clamp(p);
      if (reduced) snap(target);
      else start();
    },
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", start);
      reduceQuery.removeEventListener("change", onReducedChange);
      for (const f of flows) f.dots.forEach((d) => d.c.remove());
      root.__psInstance = null;
    },
  };
  root.__psInstance = instance;
  return instance;
}

/** Initialise tous les blocs [data-parallax-solar] de la page. */
export function autoInit() {
  document.querySelectorAll("[data-parallax-solar]").forEach((el) => initParallaxSolar(el));
}

// Auto-initialisation pour l'usage HTML simple (idempotent : sans effet si déjà initialisé).
if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoInit);
  else autoInit();
}
