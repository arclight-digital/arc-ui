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
export type Scale = {
    /**
     * Domain value sitting at pixel 0.
     */
    origin: number;
    /**
     * Pixels covered by one unit of the domain.
     */
    pixelsPerUnit: number;
    /**
     * When true, increasing values move up/left.
     */
    invert: boolean;
};
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
export declare function createScale({ origin, pixelsPerUnit, invert }: {
    origin?: number;
    pixelsPerUnit: number;
    invert?: boolean;
}): Scale;
/**
 * Vertical scale for uniform rows, where `high` sits at pixel 0 and values
 * descend down the screen: `y = (high - value) * rowHeight`.
 *
 * @param {{ high: number, rowHeight: number }} spec
 * @returns {Scale}
 */
export declare function rowScale({ high, rowHeight }: {
    high: number;
    rowHeight: number;
}): Scale;
/**
 * Domain value → pixel offset within the viewport.
 * @param {Scale} scale
 * @param {number} value
 * @returns {number}
 */
export declare function toPixels(scale: Scale, value: number): number;
/**
 * Pixel offset within the viewport → domain value. Returns an exact
 * (fractional) value; apply a snapper if you need it back on the grid.
 * @param {Scale} scale
 * @param {number} px
 * @returns {number}
 */
export declare function toValue(scale: Scale, px: number): number;
/**
 * Duration/extent → width in pixels. Always positive, and independent of
 * `origin`, so it is safe for element sizing on either axis.
 * @param {Scale} scale
 * @param {number} span
 * @returns {number}
 */
export declare function spanToPixels(scale: Scale, span: number): number;
/**
 * Domain range covered by a viewport of `viewportPx`, ordered low→high
 * regardless of inversion. Feed this to `gridLines()` and to item windowing so
 * neither has to reason about direction.
 *
 * @param {Scale} scale
 * @param {number} viewportPx
 * @returns {{ from: number, to: number }}
 */
export declare function visibleRange(scale: Scale, viewportPx: number): {
    from: number;
    to: number;
};
/**
 * Rescale while pinning the value currently under `anchorPx`, which is what
 * makes wheel-zoom track the pointer and zoom-to-selection hold its edge.
 *
 * @param {Scale} scale
 * @param {number} pixelsPerUnit Target zoom level.
 * @param {number} [anchorPx]    Viewport pixel to hold fixed. Defaults to 0.
 * @returns {Scale}
 */
export declare function zoomAround(scale: Scale, pixelsPerUnit: number, anchorPx?: number): Scale;
/**
 * Shift the viewport by a pixel delta. Positive moves the view toward larger
 * values on a non-inverted scale. Clamping is the application's job.
 *
 * @param {Scale} scale
 * @param {number} deltaPx
 * @returns {Scale}
 */
export declare function panBy(scale: Scale, deltaPx: number): Scale;
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
export declare function gridSnapper(gridUnits: number): (value: number) => number;
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
export declare function gridLines(from: number, to: number, step: number): number[];
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
export declare function boundariesWithin(boundaries: number[], from: number, to: number): number[];
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
export declare function chooseStep(scale: Scale, candidates: number[], minPixelSpacing: number): number | null;
