/**
 * contrast.js — tell a consumer when the color they passed cannot be read.
 *
 * The theme mixes accents toward the page's text color by a solved amount
 * (--accent-text-mix, see shared/color.js), and that amount is deliberately
 * only as large as our own palette needs. The alternative — enough mixing to
 * rescue any color at all — would repaint every accent that was already fine
 * to save one that never was, so the library leaves a consumer's color as
 * given. Which is the right call, and silently shipping something unreadable
 * would not be.
 *
 * So it warns instead. Once, in the console, naming the element, the color and
 * the ratio, because a developer who passed `color="140, 140, 150"` cannot see
 * the problem in a screenshot and will not find it in an audit they do not run.
 *
 * Measured rather than modeled: the browser has already resolved the
 * color-mix, the alpha, the theme and whatever the consumer overrode, so
 * reading the computed values asks reality instead of recomputing a guess. It
 * is also why this works for any component that renders text on a surface, not
 * only the ones taking a color prop.
 */

const AA_NORMAL = 4.5;

/** Warnings already issued, keyed by the pairing rather than the element —
 *  a table of fifty tags in one color is one mistake, not fifty. */
const seen = new Set();

const parse = (value) => {
  const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?/.exec(value || '');
  return m
    ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])]
    : null;
};

const luminance = ([r, g, b]) => {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * The color actually behind an element: its own background if opaque, else
 * composited over whatever is behind it, up through the shadow boundary. A
 * subtle tint is transparent by design, so stopping at the first background
 * would measure the tint's own alpha rather than the surface a reader sees.
 */
function effectiveBackground(el) {
  let node = el;
  let result = [255, 255, 255];
  const stack = [];

  while (node) {
    const bg = parse(getComputedStyle(node).backgroundColor);
    if (bg && bg[3] > 0) {
      stack.push(bg);
      if (bg[3] === 1) break;
    }
    node = node.parentElement ?? node.getRootNode()?.host ?? null;
  }

  for (const [r, g, b, a] of stack.reverse()) {
    result = [r, g, b].map((c, i) => c * a + result[i] * (1 - a));
  }
  return result;
}

/**
 * Warn once if `el`'s text does not reach AA against what is behind it.
 *
 * @param {Element} host - The component, named in the message.
 * @param {Element | null | undefined} el - The element whose text to measure.
 * @param {string} [note] - What the consumer set, e.g. the color they passed.
 */
export function warnLowContrast(host, el, note) {
  if (!el || typeof getComputedStyle !== 'function') return;

  const fg = parse(getComputedStyle(el).color);
  if (!fg) return;
  const bg = effectiveBackground(el);
  const r = ratio(fg, bg);
  if (r >= AA_NORMAL) return;

  const key = `${host.localName}:${fg.join()}:${bg.map(Math.round).join()}`;
  if (seen.has(key)) return;
  seen.add(key);

  console.warn(
    `<${host.localName}>: text is ${r.toFixed(2)}:1 against its background, ` +
      `below the 4.5:1 needed to read at this size` +
      (note ? ` (${note})` : '') +
      `. The theme only mixes accents as far as its own palette needs, so a ` +
      `color passed in keeps the value you gave it — pick a darker or lighter ` +
      `one for this background, or set --accent-text-mix higher for this subtree.`,
  );
}
