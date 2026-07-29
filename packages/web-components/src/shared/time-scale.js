/**
 * Linear value↔pixel mapping shared by every time-axis component
 * (ruler, timeline grid, waveform, piano roll).
 *
 * A scale is a plain, frozen, structured-cloneable object — not a controller
 * and not reactive state. Viewport ownership belongs to the application: it
 * holds offset and zoom, passes them down as props, and components emit intent
 * events rather than mutating. That keeps components viewport-stateless, which
 * is what lets a ruler stay aligned with a grid (one offset, several
 * projections) and what makes them reusable outside a timeline at all.
 *
 * The mapping is deliberately linear — `(value - origin) * pixelsPerUnit`. It
 * is the caller's job to work in a unit where that holds. Musical time in
 * ticks at a constant tempo qualifies; seconds under a tempo map would not.
 *
 * Axis-agnostic. The horizontal case maps ticks with `origin` as the scroll
 * offset; the vertical case maps pitch with `invert: true`, so that higher
 * values sit nearer the top. See `rowScale()`.
 *
 * Integer domains stay exact: nothing here divides before it multiplies except
 * in `toValue()`, which is the one direction that cannot be integral.
 */

/**
 * @typedef {object} Scale
 * @property {number} origin        Domain value sitting at pixel 0.
 * @property {number} pixelsPerUnit Pixels covered by one unit of the domain.
 * @property {boolean} invert       When true, increasing values move up/left.
 */

/**
 * Build a scale. Throws on a degenerate `pixelsPerUnit` rather than silently
 * producing NaN downstream — components should default the prop instead of
 * constructing a scale from an unset value.
 *
 * @param {{ origin?: number, pixelsPerUnit: number, invert?: boolean }} spec
 * @returns {Scale}
 */
export function createScale({ origin = 0, pixelsPerUnit, invert = false }) {
  if (!Number.isFinite(pixelsPerUnit) || pixelsPerUnit <= 0) {
    throw new RangeError(
      `time-scale: pixelsPerUnit must be a finite number greater than 0, got ${pixelsPerUnit}`,
    );
  }
  if (!Number.isFinite(origin)) {
    throw new RangeError(`time-scale: origin must be a finite number, got ${origin}`);
  }
  return Object.freeze({ origin, pixelsPerUnit, invert: Boolean(invert) });
}

/**
 * Vertical scale for uniform rows, where `high` sits at pixel 0 and values
 * descend down the screen: `y = (high - value) * rowHeight`.
 *
 * @param {{ high: number, rowHeight: number }} spec
 * @returns {Scale}
 */
export function rowScale({ high, rowHeight }) {
  return createScale({ origin: high, pixelsPerUnit: rowHeight, invert: true });
}

/** Signed pixel direction of a scale. @param {Scale} scale */
const dir = (scale) => (scale.invert ? -1 : 1);

/**
 * Domain value → pixel offset within the viewport.
 * @param {Scale} scale
 * @param {number} value
 * @returns {number}
 */
export function toPixels(scale, value) {
  return (value - scale.origin) * scale.pixelsPerUnit * dir(scale);
}

/**
 * Pixel offset within the viewport → domain value. Returns an exact
 * (fractional) value; apply a snapper if you need it back on the grid.
 * @param {Scale} scale
 * @param {number} px
 * @returns {number}
 */
export function toValue(scale, px) {
  return scale.origin + (px / (scale.pixelsPerUnit * dir(scale)));
}

/**
 * Duration/extent → width in pixels. Always positive, and independent of
 * `origin`, so it is safe for element sizing on either axis.
 * @param {Scale} scale
 * @param {number} span
 * @returns {number}
 */
export function spanToPixels(scale, span) {
  return Math.abs(span * scale.pixelsPerUnit);
}

/**
 * Domain range covered by a viewport of `viewportPx`, ordered low→high
 * regardless of inversion. Feed this to `gridLines()` and to item windowing so
 * neither has to reason about direction.
 *
 * @param {Scale} scale
 * @param {number} viewportPx
 * @returns {{ from: number, to: number }}
 */
export function visibleRange(scale, viewportPx) {
  const a = toValue(scale, 0);
  const b = toValue(scale, viewportPx);
  return a <= b ? { from: a, to: b } : { from: b, to: a };
}

/**
 * Rescale while pinning the value currently under `anchorPx`, which is what
 * makes wheel-zoom track the pointer and zoom-to-selection hold its edge.
 *
 * @param {Scale} scale
 * @param {number} pixelsPerUnit Target zoom level.
 * @param {number} [anchorPx]    Viewport pixel to hold fixed. Defaults to 0.
 * @returns {Scale}
 */
export function zoomAround(scale, pixelsPerUnit, anchorPx = 0) {
  const pinned = toValue(scale, anchorPx);
  return createScale({
    origin: pinned - anchorPx / (pixelsPerUnit * dir(scale)),
    pixelsPerUnit,
    invert: scale.invert,
  });
}

/**
 * Shift the viewport by a pixel delta. Positive moves the view toward larger
 * values on a non-inverted scale. Clamping is the application's job.
 *
 * @param {Scale} scale
 * @param {number} deltaPx
 * @returns {Scale}
 */
export function panBy(scale, deltaPx) {
  return createScale({
    origin: toValue(scale, deltaPx),
    pixelsPerUnit: scale.pixelsPerUnit,
    invert: scale.invert,
  });
}

/**
 * Build an exact integer snapper for a fixed grid.
 *
 * Inject the same grid size your validator enforces — an editor that snaps to a
 * different grid than the one being validated against authors content that
 * fails the moment it is written. Different granularities (notes to a
 * subdivision, clip placements to a bar) are separate snappers, not a concept
 * this module needs to know about.
 *
 * @param {number} gridUnits Positive integer grid size in domain units.
 * @returns {(value: number) => number}
 */
export function gridSnapper(gridUnits) {
  if (!Number.isInteger(gridUnits) || gridUnits <= 0) {
    throw new RangeError(
      `time-scale: gridUnits must be a positive integer, got ${gridUnits}`,
    );
  }
  return (value) => Math.round(value / gridUnits) * gridUnits;
}

/** Guard against a caller passing a whole project where a visible range belongs. */
const MAX_GRID_LINES = 10000;

/**
 * Evenly spaced grid positions within `[from, to]`, inclusive of any boundary
 * that lands exactly on an edge. Integer in, integer out.
 *
 * Pass a *visible* range. Generating lines for an entire project is never
 * correct and throws rather than quietly allocating millions of entries.
 *
 * When boundaries stop being evenly spaced — a per-section meter change, say —
 * this is the function you stop calling; hand the ruler an explicit array via
 * `boundariesWithin()` instead. Its subdivision logic does not change.
 *
 * @param {number} from
 * @param {number} to
 * @param {number} step
 * @returns {number[]}
 */
export function gridLines(from, to, step) {
  if (!Number.isFinite(step) || step <= 0) {
    throw new RangeError(`time-scale: step must be a finite number greater than 0, got ${step}`);
  }
  if (to < from) return [];
  const count = Math.floor(to / step) - Math.ceil(from / step) + 1;
  if (count > MAX_GRID_LINES) {
    throw new RangeError(
      `time-scale: gridLines would produce ${count} entries (limit ${MAX_GRID_LINES}). ` +
        'Pass the visible range from visibleRange(), not the full extent.',
    );
  }
  const out = [];
  for (let i = Math.ceil(from / step); i * step <= to; i++) out.push(i * step);
  return out;
}

/**
 * The subset of an explicit, possibly irregular boundary list that falls within
 * `[from, to]`. The escape hatch from `gridLines()` for non-uniform spacing —
 * same return shape, so consumers are agnostic to which one produced it.
 *
 * @param {number[]} boundaries Ascending domain positions.
 * @param {number} from
 * @param {number} to
 * @returns {number[]}
 */
export function boundariesWithin(boundaries, from, to) {
  return boundaries.filter((b) => b >= from && b <= to);
}

/**
 * Coarsest-to-finest step selection for an adaptive ruler: the first candidate
 * whose on-screen spacing meets `minPixelSpacing`, so labels thin out as you
 * zoom out instead of colliding.
 *
 * Candidates are plain numbers, which is what keeps this meter-agnostic — the
 * caller decides whether they mean bars, beats, or subdivisions.
 *
 * @param {Scale} scale
 * @param {number[]} candidates Descending step sizes, coarsest first.
 * @param {number} minPixelSpacing
 * @returns {number | null} The finest usable step, or null if none fit.
 */
export function chooseStep(scale, candidates, minPixelSpacing) {
  let chosen = null;
  for (const step of candidates) {
    if (spanToPixels(scale, step) >= minPixelSpacing) chosen = step;
  }
  return chosen;
}
