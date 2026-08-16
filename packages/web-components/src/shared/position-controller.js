/**
 * PositionController — shared floating-panel positioning on the top layer.
 *
 * Every floating component in the library (tooltip, popover, hover-card, the
 * menus, the pickers, the listbox-bearing inputs) used to rest at a static
 * `top: calc(100% + offset)` in CSS. That positions correctly only when nothing
 * is in the way: near a viewport edge the panel clipped, and inside an
 * `overflow: hidden` ancestor it was cut off entirely. Only menubar measured
 * anything, and only for a right-edge flip. This controller generalises that
 * measurement pass and gives every panel the same three behaviors:
 *
 *   flip   — swap to the opposite side when the preferred one doesn't fit
 *   shift  — slide along the cross axis to stay inside the viewport
 *   clamp  — last resort for panels taller/wider than the space available
 *
 * ## Why the top layer
 *
 * The panel is promoted with the native popover API, so it paints in the top
 * layer: above everything, immune to `overflow: hidden` ancestors, and immune
 * to stacking contexts. That is what lets the coordinates below be plain
 * viewport coordinates and what makes the `--z-*` ladder unnecessary for
 * anything this controller manages.
 *
 * `popover="manual"` rather than `"auto"`, deliberately. An `auto` popover
 * brings its own light-dismiss and Escape handling, but it also closes every
 * other `auto` popover in an unrelated part of the tree when it opens — a
 * tooltip would dismiss an open dropdown. Components already own dismissal via
 * DismissController and their own key handlers, so `manual` keeps
 * behavior identical to before and leaves the dismiss policy with the
 * component.
 *
 * ## The attribute is applied imperatively, never rendered
 *
 * `popover` is set from JS on first show and must NEVER appear in a component's
 * template. Prism exports static HTML from these templates, and a `[popover]`
 * element in a page that never runs JS is `display: none` forever — it would
 * silently delete tooltip's no-JS `:hover` fallback and every static panel
 * example. Same discipline as tooltip's `is-managed` marker, and guarded by
 * test/position-controller.test.js.
 *
 * For the same reason the controller marks the panel `data-managed` and the CSS
 * in position-styles.js keeps its pure-CSS resting position for panels without
 * that marker. Unmanaged panels centre themselves with
 * `transform: translateX(-50%)`, which would fight the coordinates written
 * here; managed panels get the transform back for scale animation only.
 *
 * ## Usage
 *
 *     this._position = new PositionController(this, {
 *       anchor:    () => this.shadowRoot.querySelector('.select__trigger'),
 *       floating:  () => this.shadowRoot.querySelector('.select__dropdown'),
 *       placement: () => this.position,
 *       matchWidth: true,
 *     });
 *
 *     // in updated(), as the panel opens and closes:
 *     this.open ? this._position.show() : this._position.hide();
 */

/** Placements the controller understands. Anything else falls back. */
const PLACEMENTS = ['top', 'bottom', 'left', 'right'];

/** Cross-axis alignments. */
const ALIGNMENTS = ['start', 'center', 'end'];

const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/**
 * Resolve a possibly-bogus placement to a real one.
 *
 * The CSS in position-styles.js treats any unrecognized `position` value as the
 * default by selecting the default branch with `:not()` rather than by listing
 * it. This keeps that contract once positioning moves into JS: a component with
 * `position="sideways"` must behave exactly as if the attribute were absent.
 * Covered by the enum-fallback sweep.
 */
function resolvePlacement(value, fallback) {
  return PLACEMENTS.includes(value) ? value : fallback;
}

function resolveAlignment(value, fallback) {
  return ALIGNMENTS.includes(value) ? value : fallback;
}

/**
 * Normalize an anchor to a viewport rect.
 *
 * An anchor is usually an element, but context-menu anchors to the pointer and
 * has no element to measure. Returning a plain `{x, y}` (or any partial rect)
 * from the `anchor` callback stands in for a zero-size box at that point, which
 * the placement maths then treats like any other anchor.
 */
function anchorRect(anchor) {
  if (typeof anchor?.getBoundingClientRect === 'function') {
    return anchor.getBoundingClientRect();
  }
  const left = anchor.left ?? anchor.x ?? 0;
  const top = anchor.top ?? anchor.y ?? 0;
  const width = anchor.width ?? 0;
  const height = anchor.height ?? 0;
  return { left, top, width, height, right: left + width, bottom: top + height };
}

/** True when the anchor is an element that has since left the document. */
function anchorGone(anchor) {
  return anchor instanceof Node && !anchor.isConnected;
}

/**
 * Window listener options, written once so the add and the remove cannot drift.
 *
 * `capture: true` because scroll does not bubble: a capture-phase listener on
 * window is the only way a single listener sees an ancestor scroll container
 * move the anchor. The flag has to match on the way out too — a
 * `removeEventListener` keyed on a different capture flag removes nothing and
 * says nothing.
 *
 * `passive: true` on both because neither handler ever calls `preventDefault`.
 * It is a scheduling hint with no observable behaviour, so no test asserts it
 * and its mutants are expected survivors.
 */
const SCROLL_LISTENER = { capture: true, passive: true };
const RESIZE_LISTENER = { passive: true };

/** Clamp `v` into [min, max], tolerating an inverted range. */
function clamp(v, min, max) {
  // max < min when the panel is larger than the space it has to fit in. Biasing
  // to `min` then keeps the panel's start edge on screen, which is where its
  // first focusable content and its scroll origin are — clamping to `max`
  // instead would push the top of a too-tall menu off the top of the screen.
  return max < min ? min : Math.min(Math.max(v, min), max);
}

export class PositionController {
  /**
   * @param {import('lit').ReactiveElement} host
   * @param {object} opts
   * @param {() => Element | {x?: number, y?: number, left?: number, top?: number,
   *   width?: number, height?: number} | null | undefined} opts.anchor - What to
   *   position against: an element, or a point/rect for a pointer-anchored menu.
   * @param {() => Element | null | undefined} opts.floating - The panel to position.
   * @param {() => string} [opts.placement] - Preferred side; unknown values fall back.
   * @param {string} [opts.fallbackPlacement='bottom'] - Side used when placement is unrecognized.
   * @param {() => string} [opts.align] - Cross-axis alignment ('start' | 'center' | 'end').
   * @param {string} [opts.fallbackAlign='center'] - Alignment used when align is unrecognized.
   * @param {number} [opts.offset=8] - Gap between anchor and panel, in px.
   * @param {number} [opts.crossOffset=0] - Nudge along the cross axis, in px.
   *   Menubar's submenus use a negative value to cancel the parent panel's own
   *   padding so the first submenu item lines up with the item that opened it.
   * @param {number} [opts.padding=8] - Minimum distance kept from the viewport edge, in px.
   * @param {boolean} [opts.flip=true] - Allow swapping to the opposite side.
   * @param {boolean} [opts.shift=true] - Allow sliding along the cross axis.
   * @param {boolean} [opts.matchWidth=false] - Force the panel to the anchor's width.
   * @param {boolean} [opts.matchMinWidth=false] - Force the panel to at least the anchor's width.
   * @param {boolean} [opts.constrainSize=false] - Cap the panel's height to the space available.
   */
  constructor(host, opts) {
    this.host = host;
    this.opts = opts;
    this._shown = false;
    this._adoptedEl = null;
    this._update = this._update.bind(this);
    host.addController(this);
  }

  /** The resolved side the panel is currently on. Null while hidden. */
  get placement() {
    return this._placement ?? null;
  }

  /**
   * Promote the panel to the top layer and position it.
   *
   * Idempotent: calling it while shown just repositions, which is what a
   * component wants when its content changes size (an option list filtering
   * down, a picker switching months).
   */
  show() {
    const floating = this.opts.floating();
    if (!floating) return;

    // Unconditionally, not just on the first show: the panel element can change
    // identity while the controller stays shown, as it does when breadcrumb-menu
    // moves from one open crumb to the next.
    const isNewPanel = this._adoptedEl !== floating;
    const wasHidden = !this._shown;
    this._adopt(floating);

    if (wasHidden) {
      this._shown = true;
      // A top-layer panel does not move with its anchor on its own, so without
      // these it hangs in place while the page scrolls underneath.
      window.addEventListener('scroll', this._update, SCROLL_LISTENER);
      window.addEventListener('resize', this._update, RESIZE_LISTENER);
    }

    // wasHidden as well as isNewPanel, because hide() disconnects the observer:
    // reopening the same panel needs it wired up again.
    if ((isNewPanel || wasHidden) && typeof ResizeObserver !== 'undefined') {
      this._resizeObserver ??= new ResizeObserver(this._update);
      this._resizeObserver.disconnect();
      this._resizeObserver.observe(floating);
      const anchor = this.opts.anchor();
      // Only a real element can be observed; a pointer-coordinate anchor has no
      // box to watch.
      if (anchor instanceof Element) this._resizeObserver.observe(anchor);
    }

    this._update();
  }

  /** Demote the panel out of the top layer and stop tracking. */
  hide() {
    if (!this._shown) return;
    this._shown = false;
    this._placement = undefined;
    window.removeEventListener('scroll', this._update, SCROLL_LISTENER);
    window.removeEventListener('resize', this._update, RESIZE_LISTENER);
    this._resizeObserver?.disconnect();

    const floating = this.opts.floating();
    if (floating?.isConnected && this._isOpenPopover(floating)) {
      floating.hidePopover();
    }
  }

  hostDisconnected() {
    this.hide();
  }

  /**
   * Give the panel its `popover` attribute the first time it is shown.
   *
   * Deferred to here rather than done at construction so a component that never
   * opens leaves no trace, and so the attribute cannot end up in a template.
   */
  _adopt(floating) {
    // Keyed on the element, not a boolean: a panel rendered conditionally
    // (breadcrumb-menu builds a fresh dropdown for whichever crumb is open) is a
    // different element each time, and a once-only flag would leave every panel
    // after the first without its popover attribute — silently back in the
    // normal layer.
    if (this._adoptedEl !== floating) {
      this._adoptedEl = floating;
      // Feature-detect rather than assume: without popover support the panel
      // stays in normal flow and keeps its CSS stacking, but the coordinates
      // below still apply, so it degrades to correctly-positioned-but-clippable
      // instead of invisible.
      this._topLayer = typeof floating.showPopover === 'function';
      if (this._topLayer && !floating.hasAttribute('popover')) {
        floating.setAttribute('popover', 'manual');
      }
      floating.dataset.managed = '';
    }
    if (this._topLayer && !this._isOpenPopover(floating)) {
      // Throws if the element is disconnected or already open; both are races
      // with a component closing mid-frame and neither is worth propagating.
      try {
        floating.showPopover();
      } catch {
        /* not showable this frame — the next show() will retry */
      }
    }
  }

  _isOpenPopover(el) {
    try {
      return el.matches(':popover-open');
    } catch {
      return false;
    }
  }

  /** Measure and write coordinates. Safe to call at any rate. */
  _update() {
    if (!this._shown) return;
    const anchor = this.opts.anchor();
    const floating = this.opts.floating();
    if (!anchor || anchorGone(anchor) || !floating?.isConnected) return;

    const a = anchorRect(anchor);
    const { padding = 8, offset = 8, crossOffset = 0 } = this.opts;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (this.opts.matchWidth || this.opts.matchMinWidth) {
      // border-box, or the anchor's width would be applied to the panel's
      // content box and its own border and padding would push it wider than the
      // trigger it is supposed to line up with.
      floating.style.boxSizing = 'border-box';
      const prop = this.opts.matchWidth ? 'width' : 'minWidth';
      floating.style[prop] = `${a.width}px`;
    }

    // offsetWidth/offsetHeight rather than a rect: panels animate `transform`
    // (scale on open, translate while unmanaged), and a rect reports the
    // *visual* box, so measuring mid-animation would read a scaled-down size
    // and place the panel a few px off. The layout box is what we want.
    const w = floating.offsetWidth;
    const h = floating.offsetHeight;

    let placement = resolvePlacement(
      this.opts.placement?.(),
      this.opts.fallbackPlacement ?? 'bottom',
    );
    const align = resolveAlignment(this.opts.align?.(), this.opts.fallbackAlign ?? 'center');

    if (this.opts.flip !== false) {
      placement = this._flip(placement, a, w, h, vw, vh, offset, padding);
    }

    const vertical = placement === 'top' || placement === 'bottom';
    let left;
    let top;

    if (vertical) {
      top = placement === 'bottom' ? a.bottom + offset : a.top - h - offset;
      left =
        (align === 'start' ? a.left : align === 'end' ? a.right - w : a.left + (a.width - w) / 2) +
        crossOffset;
    } else {
      left = placement === 'right' ? a.right + offset : a.left - w - offset;
      top =
        (align === 'start' ? a.top : align === 'end' ? a.bottom - h : a.top + (a.height - h) / 2) +
        crossOffset;
    }

    if (this.opts.shift !== false) {
      // Only the cross axis shifts. Sliding the main axis would detach the
      // panel from its anchor, which reads as a bug rather than a fit.
      if (vertical) left = clamp(left, padding, vw - w - padding);
      else top = clamp(top, padding, vh - h - padding);
    }

    // Main-axis clamp regardless of `shift`: a panel taller than the space on
    // both sides has already failed to flip, and leaving it to overflow the
    // viewport means its far end is unreachable.
    if (vertical) top = clamp(top, padding, vh - h - padding);
    else left = clamp(left, padding, vw - w - padding);

    if (this.opts.constrainSize) {
      const room = vertical
        ? (placement === 'bottom' ? vh - (a.bottom + offset) : a.top - offset) - padding
        : vh - 2 * padding;
      floating.style.maxHeight = `${Math.max(room, 0)}px`;
    }

    Object.assign(floating.style, {
      position: 'fixed',
      // The unmanaged CSS rests the panel with whichever of these four it
      // needs; all must be neutralised or a leftover `right: 0` stretches the
      // panel back across the viewport.
      left: `${Math.round(left)}px`,
      top: `${Math.round(top)}px`,
      right: 'auto',
      bottom: 'auto',
      margin: '0',
    });

    this._placement = placement;
    // Exposed for arrow direction and transform-origin. The *resolved* side, so
    // a flipped panel's arrow follows it.
    floating.dataset.placement = placement;
    floating.dataset.align = align;
  }

  /**
   * Swap to the opposite side when the preferred one doesn't fit and the
   * opposite one does. Never swaps into an equally bad fit — a panel too tall
   * for either side stays on the side the author asked for and gets clamped.
   */
  _flip(placement, a, w, h, vw, vh, offset, padding) {
    const fits = {
      bottom: vh - a.bottom - offset - padding >= h,
      top: a.top - offset - padding >= h,
      right: vw - a.right - offset - padding >= w,
      left: a.left - offset - padding >= w,
    };
    return fits[placement] || !fits[OPPOSITE[placement]] ? placement : OPPOSITE[placement];
  }
}
