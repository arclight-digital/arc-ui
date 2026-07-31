/**
 * color.js — the contrast solver behind the theme.
 *
 * The two palettes used to be written by eye and corrected by incident. The
 * comments they accumulated read as a log: status colors darkened after an
 * install command rendered at 1.81 on the landing page, glows retuned because
 * the light theme inherited alphas chosen against near-black, the accent
 * caught at 4.18 against its own tint. Every fix was right and none of them
 * generalised, because a hand-picked hex answers one pairing and says nothing
 * about the next.
 *
 * A role does not want a color. It wants a contrast against the thing it sits
 * on — 4.5:1 for body text, 3:1 for a large or non-text mark — and a hue that
 * still looks like the brand. So the palette states the contract and this
 * solves for it: hold hue and chroma from the seed, move lightness until the
 * ratio is met, in OKLCH so equal steps look equal rather than merely
 * measuring equal.
 *
 * Lightness is the only axis touched on purpose. Rotating hue would change the
 * brand; dropping chroma would grey it out. Moving lightness keeps a blue a
 * blue and makes it legible, which is the whole job.
 *
 * Everything here is build-time and dependency-free: `pnpm generate` writes
 * static values into base.css, so nothing is solved in a browser. The runtime
 * counterpart is the relative-color clamp on the derived tokens, which is what
 * keeps a consumer's own --accent-primary legible without them solving anything.
 */

/* ── sRGB ⇄ linear ── */

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Parse `rgb(r, g, b)` or `#rrggbb` to [r, g, b] in 0-255. */
export function parseColor(input) {
  const rgb = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(input);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  const hex = /^#?([0-9a-f]{6})$/i.exec(input.trim());
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  throw new Error(`color.js: cannot parse ${input}`);
}

export const formatRgb = ([r, g, b]) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

/* ── WCAG ── */

/** Relative luminance, WCAG 2.x. */
export function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => toLinear(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two colors, 1 to 21. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Composite a translucent color over an opaque one — the background a role
 * actually sits on when the surface under it is tinted. The accent-on-its-own
 * tint pairing is the strictest in the system and is invisible to anyone
 * checking the accent against the page color.
 */
export function composite(fg, alpha, bg) {
  return fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));
}

/* ── OKLCH ── */

export function rgbToOklch([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map((v) => toLinear(v / 255));
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(a, bb), h: (Math.atan2(bb, a) * 180) / Math.PI };
}

export function oklchToRgb({ l: L, c: C, h: H }) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    clamp01(toGamma(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)) * 255,
    clamp01(toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)) * 255,
    clamp01(toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)) * 255,
  ];
}

/**
 * Move a seed's lightness until it clears `target` against `background`,
 * keeping hue and chroma.
 *
 * Direction is inferred rather than asked for: contrast on a light ground comes
 * from going darker, on a dark ground from going lighter, and the background's
 * own luminance already says which. A seed that already clears the target is
 * returned untouched — the solver is a floor, not a normalizer, so a color
 * chosen deliberately keeps its value.
 *
 * Binary search rather than a formula because OKLCH lightness and WCAG
 * luminance are different curves; fifteen iterations lands inside a thousandth
 * of a step, which is finer than an 8-bit channel can express anyway.
 *
 * Returns null when the target is unreachable in this hue — pure black or white
 * would be the answer, and silently returning it would be a worse lie than
 * saying so. Callers decide whether to widen the target or change the surface.
 */
export function solveContrast(seed, background, target) {
  const seedRgb = parseColor(seed);
  const bgRgb = typeof background === 'string' ? parseColor(background) : background;
  if (contrast(seedRgb, bgRgb) >= target) return formatRgb(seedRgb);

  const { c, h } = rgbToOklch(seedRgb);
  const darker = luminance(bgRgb) > 0.18;
  let lo = darker ? 0 : rgbToOklch(seedRgb).l;
  let hi = darker ? rgbToOklch(seedRgb).l : 1;

  const at = (l) => oklchToRgb({ l, c, h });
  if (contrast(at(darker ? lo : hi), bgRgb) < target) return null;

  for (let i = 0; i < 15; i++) {
    const mid = (lo + hi) / 2;
    const ok = contrast(at(mid), bgRgb) >= target;
    // Keep the half that still contains the shallowest passing lightness, so
    // the result is the least change to the seed that satisfies the contract.
    if (darker === ok) lo = mid;
    else hi = mid;
  }
  return formatRgb(at(darker ? lo : hi));
}

/**
 * Solve the `color-mix` percentage that carries a color to its contract.
 *
 * The theme already had this mechanism — --accent-text-mix, a percentage of
 * --text-primary blended into an accent so it stays legible as text — but the
 * percentage was chosen by eye: 55% in the light theme, 0% in the dark. One
 * number covering six accents on an unstated background is a guess that
 * happens to be right about some of them.
 *
 * Mixing toward the page's own text color is the right instrument, though: it
 * is theme-adaptive by construction, it needs no branch on which theme is
 * active, and because color-mix resolves in the browser it applies to a
 * consumer's brand color as readily as to ours. So this keeps the mechanism
 * and computes the number, returning the smallest percentage that satisfies
 * every pairing it is asked about — least change to the hue that clears the
 * bar, in 5% steps because a percentage nobody can see the difference of is
 * false precision in a stylesheet.
 *
 * @param {Array<{seed: string, background: number[]}>} pairings - Each accent
 *   and the background it sits on as text.
 * @param {string} toward - The color being mixed in, normally --text-primary.
 * @param {number} target - Contrast ratio to clear.
 * @returns {number} Percentage, 0 to 100.
 */
export function solveMixPercent(pairings, toward, target) {
  const towardRgb = parseColor(toward);
  // srgb, matching `color-mix(in srgb, …)` in the stylesheets: a plain
  // channel-wise blend, so the solver and the browser agree exactly.
  const mix = (rgb, p) => rgb.map((c, i) => c + (towardRgb[i] - c) * p);

  let worst = 0;
  for (const { seed, background } of pairings) {
    const seedRgb = parseColor(seed);
    let need = null;
    for (let p = 0; p <= 100; p += 5) {
      if (contrast(mix(seedRgb, p / 100), background) >= target) {
        need = p;
        break;
      }
    }
    // Unreachable means mixing toward the text color cannot save this pairing
    // — the surface is the problem, not the accent. Reported as the ceiling so
    // the caller sees it rather than silently shipping an almost.
    worst = Math.max(worst, need ?? 100);
  }
  return worst;
}
