import { LitElement, html, css, nothing } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { tokenStyles } from '../shared-styles.js';
import { OverlayController } from '../shared/overlay-controller.js';
import { DeclaredPropsMixin, flag, list, int } from '../shared/props.js';
import { hydrateImages } from '../shared/hydrate-images.js';

/** Whether two galleries hold the same entries in the same order. */
const sameEntries = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((e, i) => e === b[i]);

/**
 * Whether two galleries read from links describe the same pictures. Each read
 * builds fresh objects, so identity can't answer this.
 */
const sameLinks = (a, b) =>
  Array.isArray(a) &&
  Array.isArray(b) &&
  a.length === b.length &&
  a.every((e, i) => e.src === b[i].src && e.alt === b[i].alt && e.caption === b[i].caption);

const MIN_SCALE = 1;
const MAX_SCALE = 4;
/** Load time under which no spinner shows, so a cached image never flashes one. */
const LOADING_DELAY = 150;
/** Pointer idle time before the bar and the arrows fade out. */
const IDLE_DELAY = 2500;
/** Longest gap between two taps that still counts as a double tap. */
const DOUBLE_TAP = 300;
/** Movement before a press becomes a gesture rather than a tap. */
const SLOP = 10;
/** Grow out of the thumbnail on open, and back into it on close. */
const OPEN_MS = 420;
const CLOSE_MS = 320;
/** A step: the outgoing picture leaves, the incoming one arrives, SLIDE_PX apart. */
const SLIDE_MS = 380;
const SLIDE_PX = 48;
/** How long a press stays the likely reason show() was called. */
const PRESS_WINDOW = 1000;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Capture a pointer, tolerating one that has already lifted. */
const capture = (el, id) => {
  try {
    el.setPointerCapture(id);
  } catch {
    // NotFoundError: the pointer is gone, and there is nothing to capture.
  }
};

/**
 * Full-screen image viewer on the overlay stack: open from a thumbnail, step through a gallery
 * with wrapping prev/next navigation, zoom up to 4x with pinch, wheel or double-click, and dismiss
 * with Escape, a backdrop click or a downward swipe.
 *
 * The gallery is data, not layout: images are supplied through the `images` property rather than
 * slotted children, so the closed component renders nothing. Entries may be plain `src` strings or
 * `{ src, alt, caption, srcset, sizes, width, height }` objects; the two forms mix freely. The
 * server render stays empty either way. A property is one it never sees, and the static JSON
 * attribute form it does see is skipped as a closed overlay, which keeps a full-size photograph
 * from being fetched for a first paint that cannot show it.
 *
 * Or point it at links already on the page with `gallery`: each matched `<a href>` becomes an
 * entry, and clicking one opens the viewer on it. Without script, the links still go to the images.
 *
 * @tag arc-lightbox
 * @status stable
 * @requires arc-icon-button
 * @prop {Array} images - The gallery to display. Each entry is either a `src` string or an object of shape `{ src, alt, caption, srcset, sizes, width, height, thumb, origin }`; everything but `src` is optional. `width` and `height` reserve the image's shape while it loads. `thumb` is a small source for the filmstrip (it falls back to `src`). `origin` is the element the picture grows out of on open and back into on close, as an element or a selector; without it the viewer uses the element that was clicked or focused when `show()` ran, for the image it opened on. Set as a property, or as a JSON attribute for a gallery that is static.
 * @prop {number} index - Index of the image currently displayed. Navigation wraps at both ends, so setting it out of range shows the nearest valid image.
 * @prop {boolean} open - Controls the visible state of the viewer. Set to `true` to open at the current `index` and activate the focus trap; set to `false` to close and restore focus to the previously-focused element.
 * @prop {boolean} thumbnails - Shows a filmstrip of small thumbnails under the image. Each is a button that jumps to its image; the strip stays faint until pointed at or focused, and fades with the other controls when idle.
 * @prop {string} gallery - CSS selector for links on the page to build the gallery from, such as `#photos a`. Each match becomes an entry: `href` is the image, the inner `<img>`'s `alt` is the alt text, and `data-caption` (or the image's `title`) is the caption. A click on a match opens the viewer on it. Resolved against the lightbox's own document or shadow root, so links added later are included. Ignored while `images` has entries.
 * @fires {CustomEvent<void>} arc-open - Fired when the lightbox opens
 * @fires {CustomEvent<void>} arc-close - Fired when the lightbox closes. Cancelable: call `preventDefault()` to veto the close.
 * @fires {CustomEvent<{value: number, index: number}>} arc-change - Fired when the displayed image changes. `detail.value` is the new index.
 * @slot actions - Extra controls in the top bar, before zoom and close. For download, share or delete buttons.
 * @csspart base - The root element.
 * @csspart backdrop
 * @csspart bar
 * @csspart counter
 * @csspart zoom
 * @csspart close
 * @csspart prev
 * @csspart next
 * @csspart figure
 * @csspart image
 * @csspart caption
 * @csspart loading - The spinner shown while a slow image loads.
 * @csspart error - Shown in place of an image that failed to load.
 * @csspart thumbnails - The filmstrip row.
 * @csspart thumbnail - Each button in the filmstrip.
 */
export class ArcLightbox extends DeclaredPropsMixin(LitElement) {
  static properties = {
    images: list(),
    index: int({ default: 0, min: 0, max: '_lastIndex', clamp: 'toRange' }),
    open: flag(false),
    gallery: { type: String },
    thumbnails: flag(false),
    // The gallery actually rendered. See willUpdate.
    _images: { state: true },
    _scale: { state: true },
    _loaded: { state: true },
    _failed: { state: true },
    _slow: { state: true },
    _idle: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: contents;
        --_scrim: var(--lightbox-control-bg, color-mix(in srgb, var(--surface-base) 72%, transparent));
      }

      /* Alone among the five overlays, the lightbox's scrim and its panel are
         the same box: it fills the viewport and paints the dim itself. So this
         element keeps both of its part names and ::backdrop is left
         transparent. There is nothing behind the lightbox to show through it. */
      .lightbox {
        position: fixed;
        inset: 0;
        margin: 0;
        max-width: none;
        max-height: none;
        width: 100%;
        height: 100%;
        border: none;
        background: var(--lightbox-backdrop, var(--overlay-backdrop));
        backdrop-filter: var(--lightbox-backdrop-filter, blur(4px));
        flex-direction: column;
        padding: var(--space-lg);
        opacity: 0;
        transition:
          opacity var(--transition-base),
          overlay var(--transition-base) allow-discrete,
          display var(--transition-base) allow-discrete;
      }

      /* display on the open rule: a closed dialog is display:none by UA
         stylesheet, and a flex declaration on the base rule would override it. */
      .lightbox[open] {
        display: flex;
        opacity: 1;
      }

      @starting-style {
        .lightbox[open] { opacity: 0; }
      }

      .lightbox::backdrop { background: transparent; }

      .lightbox__bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        flex-shrink: 0;
        position: relative;
        z-index: 1;
      }

      /* The controls sit on photographs of any brightness, so each group
         carries its own small backing rather than relying on the dim. */
      .lightbox__counter {
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
        font-size: var(--_text-sm);
        color: var(--text-secondary);
        background: var(--_scrim);
        border-radius: var(--radius-full);
        padding: var(--space-xs) var(--space-sm);
      }

      .lightbox__counter:empty { display: none; }

      .lightbox__actions {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        background: var(--_scrim);
        border-radius: var(--radius-full);
        padding: 2px;
        margin-inline-start: auto;
      }

      .lightbox__actions arc-icon-button::part(button),
      .lightbox__nav::part(button) {
        color: var(--text-primary);
      }

      .lightbox__sr {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }

      /* touch-action: none on the stage only. Every touch gesture here is
         the viewer's own (swipe, pinch, pan, swipe down), and the page behind
         it is scroll-locked, so there is nothing for the browser to do with
         one. The bar and the arrows keep default touch behavior. */
      .lightbox__figure {
        position: relative;
        flex: 1;
        min-height: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        overflow: hidden;
        touch-action: none;
        transform: scale(0.96);
        transition: transform var(--transition-base);
      }

      :host([open]) .lightbox__figure {
        transform: scale(1);
      }

      .lightbox__img {
        display: block;
        max-width: 100%;
        max-height: 100%;
        min-height: 0;
        object-fit: contain;
        border-radius: var(--radius-md);
        cursor: zoom-in;
        user-select: none;
        -webkit-user-drag: none;
        transition: transform var(--transition-base), opacity var(--transition-base);
      }

      /* With both dimensions known the box keeps the image's shape before a
         single byte arrives, so the caption doesn't jump when it lands. */
      .lightbox__img[width][height] {
        height: auto;
      }

      /* A new src gets a new element, so the previous image is never held on
         screen while the next one decodes. It fades in rather than popping. */
      .lightbox__img--loading {
        opacity: 0;
      }

      .lightbox__img--failed {
        display: none;
      }

      .lightbox__img--zoomed {
        cursor: grab;
        border-radius: 0;
      }

      .lightbox__img--zoomed:active {
        cursor: grabbing;
      }

      /* A finger or a wheel drives the transform directly; easing it would
         make the picture lag behind the hand. */
      .lightbox__img--gesture {
        transition: none;
      }

      .lightbox__loading {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        pointer-events: none;
      }

      .lightbox__spinner {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid color-mix(in srgb, var(--text-primary) 20%, transparent);
        border-top-color: var(--text-primary);
        animation: lightbox-spin 0.8s linear infinite;
      }

      @keyframes lightbox-spin {
        to { transform: rotate(360deg); }
      }

      .lightbox__error {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
        max-width: 40ch;
        padding: var(--space-lg);
        text-align: center;
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-secondary);
      }

      .lightbox__error svg {
        width: 32px;
        height: 32px;
        color: var(--text-muted);
      }

      .lightbox__error-alt {
        color: var(--text-muted);
      }

      .lightbox__caption {
        flex-shrink: 0;
        max-width: 60ch;
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        line-height: var(--body-lh);
        color: var(--text-secondary);
        text-align: center;
      }

      .lightbox__nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
        background: var(--_scrim);
        border-radius: var(--radius-full);
      }

      .lightbox__nav--prev { inset-inline-start: var(--space-lg); }
      .lightbox__nav--next { inset-inline-end: var(--space-lg); }

      /* Filmstrip. Faint at rest so it never competes with the picture,
         full on hover or focus. The current thumb is marked by a short
         glowing bar underneath, which reads at 40px where a ring would not. */
      .lightbox__thumbs {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: safe center;
        gap: var(--space-xs);
        flex-shrink: 0;
        margin-top: var(--space-sm);
        padding: 2px 2px 8px;
        overflow-x: auto;
        scrollbar-width: none;
        opacity: 0.35;
      }

      .lightbox__thumbs::-webkit-scrollbar { display: none; }

      .lightbox__thumbs:hover,
      .lightbox__thumbs:focus-within {
        opacity: 1;
      }

      .lightbox__thumb {
        position: relative;
        flex: none;
        padding: 0;
        border: 0;
        border-radius: 3px;
        background: none;
        cursor: pointer;
      }

      .lightbox__thumb:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .lightbox__thumb img {
        display: block;
        width: 40px;
        height: 28px;
        object-fit: cover;
        border-radius: 3px;
        filter: saturate(0.6) brightness(0.8);
        transition: filter var(--transition-fast);
      }

      .lightbox__thumb:hover img,
      .lightbox__thumb[aria-current] img {
        filter: none;
      }

      .lightbox__thumb[aria-current]::after {
        content: '';
        position: absolute;
        inset-inline: 6px;
        bottom: -5px;
        height: 2px;
        border-radius: 1px;
        background: var(--accent-primary);
        box-shadow: 0 0 8px var(--accent-primary);
      }

      .lightbox__bar,
      .lightbox__nav,
      .lightbox__thumbs {
        transition: opacity var(--transition-base);
      }

      /* A picture on its way out after a step. Placed over the incoming one
         by script, at the box it had. */
      .lightbox__ghost {
        position: absolute;
        margin: 0;
        pointer-events: none;
        transition: none;
      }

      /* Growing out of a thumbnail: the picture carries the entrance, so the
         dialog skips its own fade and the stage its settle. WAAPI animates the
         dim behind it instead. */
      @starting-style {
        .lightbox[open][data-motion='grow'] { opacity: 1; }
      }

      .lightbox[data-motion='grow'] .lightbox__figure {
        transform: none;
        transition: none;
      }

      /* Shrunk back into its thumbnail: gone at once, with nothing left to fade. */
      .lightbox[data-motion='gone'] {
        opacity: 0;
        transition: none;
      }

      /* Idle: the picture alone. pointer-events goes too, so a tap on the
         spot where an arrow was brings the controls back instead of pressing
         a button nobody can see. */
      .lightbox--idle .lightbox__bar,
      .lightbox--idle .lightbox__nav,
      .lightbox--idle .lightbox__thumbs {
        opacity: 0;
        pointer-events: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .lightbox,
        .lightbox__figure,
        .lightbox__img,
        .lightbox__bar,
        .lightbox__nav,
        .lightbox__thumbs,
        .lightbox__thumb img { transition: none; }
        .lightbox__spinner { animation-duration: 2.4s; }
      }
    `,
  ];

  constructor() {
    super();
    this._overlay = new OverlayController(this, {
      dialog: () => this.shadowRoot?.querySelector('dialog'),
      isOpen: () => this.open,
      onRequestClose: () => this._close(),
    });
    this.gallery = null;
    this.thumbnails = false;
    this._images = [];
    this._scale = 1;
    this._loaded = false;
    this._failed = false;
    this._slow = false;
    this._idle = false;
    this._panX = 0;
    this._panY = 0;
    /** +1 after a step forward, -1 after a step back, 0 for a jump or a fresh open. */
    this._direction = 0;
    this._pendingSrc = null;
    this._srcChanged = false;
    this._slowTimer = null;
    this._idleTimer = null;
    this._tapTimer = null;
    this._wheelTimer = null;
    this._lastTap = null;
    this._pointers = new Map();
    this._gesture = null;
    this._suppressClick = false;
    this._preloaded = new Map();
    this._galleryRoot = null;
    /** What was pressed or focused when show() ran, and the index it opened on. */
    this._opener = null;
    this._lastPress = null;
    /** Bumped by every open and close, so a stale animation's ending does nothing. */
    this._motionToken = 0;
    this._closing = false;
    this._ghosts = new Set();
    this._onPress = (e) => {
      this._lastPress = { target: e.composedPath()[0], t: performance.now() };
    };
    this._onNavKeyDown = this._onNavKeyDown.bind(this);
    this._onGalleryClick = this._onGalleryClick.bind(this);
    this._wheel = { handleEvent: (e) => this._onWheel(e), passive: false };
  }

  /** Entries normalized to objects regardless of input form. */
  _normalized() {
    return (Array.isArray(this._images) ? this._images : []).map((entry) =>
      typeof entry === 'string' ? { src: entry, alt: '', caption: '' } : entry,
    );
  }

  /** Upper bound for `index`; undefined while there is nothing to index. */
  get _lastIndex() {
    const total = this._normalized().length;
    return total ? total - 1 : undefined;
  }

  /** The entry `index` resolves to. */
  _current() {
    const images = this._normalized();
    if (images.length === 0) return null;
    // `index` is declared int({ max: '_lastIndex' }), so the property and the
    // picture cannot disagree (V4-PLAN 2.3, finding #70's shape).
    return images[this.index];
  }

  get _zoomed() {
    return this._scale > MIN_SCALE;
  }

  /**
   * Open the viewer, optionally jumping to a specific image first.
   *
   * @param {number} [index] Zero-based; wraps, so -1 opens the last image.
   *
   * @returns {void}
   */
  show(index) {
    this._syncGallery();
    if (typeof index === 'number' && Number.isFinite(index)) {
      const total = this._normalized().length;
      if (total > 0) this.index = ((Math.trunc(index) % total) + total) % total;
    }
    this._direction = 0;
    if (this._closing) this._abortClose();
    if (!this.open) this._opener = { el: this._pressedOrFocused(), index: this.index };
    this.open = true;
  }

  /**
   * Closes the viewer through the cancelable arc-close contract.
   *
   * @returns {void}
   */
  close() {
    this._close();
  }

  /**
   * Advances to the next image, wrapping past the end.
   *
   * @returns {void}
   */
  next() {
    this._goTo(this.index + 1, 1);
  }

  /**
   * Steps to the previous image, wrapping past the start.
   *
   * @returns {void}
   */
  prev() {
    this._goTo(this.index - 1, -1);
  }

  _goTo(index, direction = 0) {
    const total = this._normalized().length;
    if (total === 0 || this._closing) return;
    const target = ((index % total) + total) % total;
    if (target === this.index) return;
    this._resetZoom();
    this._direction = direction;
    this.index = target;
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: target, index: target },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * The single gate on dismissal. OverlayController routes Escape and backdrop
   * clicks here, close() delegates, and so does swipe-down, so the cancelable
   * arc-close fires on every path before the state flips.
   *
   * @returns {boolean} Whether the viewer closed.
   */
  _close() {
    if (!this.open || this._closing) return false;
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', { bubbles: true, composed: true, cancelable: true }),
      )
    )
      return false;
    // Past the gate: a veto can no longer stop it, so the shrink may start.
    if (!this._shrinkClose()) this.open = false;
    return true;
  }

  /* ---- Declarative gallery ---- */

  /** The links `gallery` matches, or none for a missing or invalid selector. */
  _galleryLinks() {
    if (!this.gallery) return [];
    const root = this.getRootNode();
    try {
      return [...root.querySelectorAll(this.gallery)];
    } catch {
      return [];
    }
  }

  _entriesFrom(links) {
    return links.map((a) => {
      const img = a.querySelector('img');
      return {
        src: a.href || a.getAttribute('href') || '',
        alt: img?.getAttribute('alt') ?? a.getAttribute('aria-label') ?? '',
        caption: a.dataset.caption ?? img?.getAttribute('title') ?? '',
      };
    });
  }

  /** Re-read the links when the gallery comes from the page. `images` wins. */
  _syncGallery() {
    if (!this.gallery || this.images?.length) return;
    const entries = this._entriesFrom(this._galleryLinks());
    if (!sameLinks(entries, this._images)) this._images = entries;
  }

  /**
   * One delegated listener on the root instead of one per link, and the links
   * are read at click time, so a link added after connect works with no
   * observer. A modified click (new tab, new window) is left to the browser.
   */
  _onGalleryClick(e) {
    if (!this.gallery || this.images?.length) return;
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const links = this._galleryLinks();
    if (!links.length) return;
    const link = e.composedPath().find((n) => links.includes(n));
    if (!link) return;
    e.preventDefault();
    this._images = this._entriesFrom(links);
    this.show(links.indexOf(link));
  }

  /**
   * The visible src is settled before render so the fresh `<img>` is created
   * already marked loading. Compared by src, not index: a gallery that repeats
   * an image keeps the same element, which never fires `load` again.
   *
   * The first render reads the gallery out of the `images` *attribute* rather
   * than the property. The server renders from markup, so a gallery assigned as
   * a property (the documented form, since entries are objects) is one it
   * never saw, and it renders the empty viewer. Lit re-applies a property set
   * before upgrade during the first update, so rendering it here would put the
   * figure, the caption and the nav buttons into the client's first render
   * where the server put nothing: parts changing shape under hydration, which
   * is the one thing it cannot adopt. updated() takes the property one render
   * later, once the server DOM has been adopted. A `gallery` is read then too.
   *
   * No timers here: willUpdate also runs on the server.
   */
  willUpdate(changed) {
    if (changed?.has('index') && this.open && this.hasUpdated && this._direction) this._ghostOut();
    if (!this.hasUpdated) {
      const { converter } = this.constructor.elementProperties.get('images');
      this._images = converter.fromAttribute(this.getAttribute('images'), Array);
    }
    const src = this._current()?.src ?? null;
    if (src !== this._pendingSrc) {
      this._pendingSrc = src;
      this._loaded = false;
      this._failed = false;
      this._slow = false;
      this._srcChanged = true;
    }
  }

  _onImageLoad() {
    this._loaded = true;
    this._failed = false;
  }

  _onImageError() {
    this._loaded = true;
    this._failed = true;
  }

  /**
   * The second dismissal surface: the space around the image.
   *
   * OverlayController's own backdrop click covers the dialog element, and this
   * covers the figure that fills it. Clicking beside the picture closes the
   * viewer, clicking the picture does not. Same `target === currentTarget`
   * test the controller uses, applied one element deeper. A click that ends a
   * swipe or a pinch is the gesture's, and a tap while the controls are hidden
   * only brings them back.
   */
  _onFigureClick(e) {
    if (this._suppressClick) {
      this._suppressClick = false;
      return;
    }
    if (e.target !== e.currentTarget) return;
    if (this._idle) {
      this._wake();
      return;
    }
    this._close();
  }

  updated(changed) {
    // Focus, inertness, Escape, focus restore and the top layer are the
    // browser's, via OverlayController and <dialog>. This adds the open event
    // and the navigation keys, which are the lightbox's own.
    super.updated?.(changed);
    // Compared by content, not identity: the seed above is a fresh array, so an
    // identity test would re-render every lightbox that has no gallery at all.
    if (changed.has('images') && !sameEntries(this._images, this.images)) {
      if (this.images?.length || !this.gallery) this._images = this.images;
      else this._syncGallery();
    }
    if (changed.has('gallery') && this.hasUpdated) this._syncGallery();
    if (changed.has('open')) {
      if (this.open) {
        this._resetZoom();
        this._syncGallery();
        document.addEventListener('keydown', this._onNavKeyDown);
        this._wake();
        this._growOpen();
        this.dispatchEvent(new CustomEvent('arc-open', { bubbles: true, composed: true }));
      } else {
        document.removeEventListener('keydown', this._onNavKeyDown);
        this._clearTimers();
        this._idle = false;
        this._direction = 0;
        this._endMotion();
      }
    }
    // A consumer setting `index` directly gets the same fresh start a
    // navigated change gets.
    if (changed.has('index') && (this._zoomed || this._panX || this._panY)) {
      this._resetZoom();
    }
    if (this._srcChanged) {
      this._srcChanged = false;
      clearTimeout(this._slowTimer);
      const src = this._pendingSrc;
      if (src && !this._loaded) {
        this._slowTimer = setTimeout(() => {
          if (this._pendingSrc === src && !this._loaded) this._slow = true;
        }, LOADING_DELAY);
      }
    }
    if (this.open && (changed.has('open') || changed.has('index') || changed.has('_images'))) {
      this._preloadNeighbours();
    }
    if (changed.has('index') && this.open && !changed.has('open')) {
      this._slideIn();
      this._direction = 0;
    }
    if (this.thumbnails && this.open && (changed.has('index') || changed.has('open'))) {
      this._revealThumb(changed.has('open'));
    }
  }

  /** Fetch the images either side of the current one, so a step shows at once. */
  _preloadNeighbours() {
    const images = this._normalized();
    if (images.length < 2 || typeof Image === 'undefined') return;
    for (const offset of [1, -1]) {
      const entry = images[(this.index + offset + images.length) % images.length];
      if (!entry?.src || this._preloaded.has(entry.src)) continue;
      const img = new Image();
      if (entry.sizes) img.sizes = entry.sizes;
      if (entry.srcset) img.srcset = entry.srcset;
      img.src = entry.src;
      // Held so the request isn't collected mid-flight.
      this._preloaded.set(entry.src, img);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // The server's <img> may have finished loading before this listener existed.
    hydrateImages(this);
    this._galleryRoot = this.getRootNode();
    this._galleryRoot.addEventListener('click', this._onGalleryClick);
    document.addEventListener('pointerdown', this._onPress, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onNavKeyDown);
    this._galleryRoot?.removeEventListener('click', this._onGalleryClick);
    this._galleryRoot = null;
    document.removeEventListener('pointerdown', this._onPress, true);
    this._clearTimers();
    this._endMotion();
  }

  _clearTimers() {
    clearTimeout(this._slowTimer);
    clearTimeout(this._idleTimer);
    clearTimeout(this._tapTimer);
    clearTimeout(this._wheelTimer);
    this._idleTimer = null;
    this._tapTimer = null;
  }

  /* ---- Keyboard ---- */

  _onNavKeyDown(e) {
    this._wake();
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.composedPath()[0];
    if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const step = this._panStep();
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (this._zoomed) this._panBy(step, 0);
        else this.prev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (this._zoomed) this._panBy(-step, 0);
        else this.next();
        break;
      case 'ArrowUp':
        if (this._zoomed) {
          e.preventDefault();
          this._panBy(0, step);
        }
        break;
      case 'ArrowDown':
        if (this._zoomed) {
          e.preventDefault();
          this._panBy(0, -step);
        }
        break;
      case 'Home':
        e.preventDefault();
        this._goTo(0, -1);
        break;
      case 'End':
        e.preventDefault();
        this._goTo(this._normalized().length - 1, 1);
        break;
      case '+':
      case '=':
        this._zoomTo(Math.floor(this._scale) + 1);
        break;
      case '-':
      case '_':
        this._zoomTo(Math.ceil(this._scale) - 1);
        break;
      case '0':
        this._zoomTo(MIN_SCALE);
        break;
    }
  }

  /* ---- Chrome: the bar and the arrows fade out while nothing moves ---- */

  _wake() {
    if (!this.open) return;
    this._idle = false;
    clearTimeout(this._idleTimer);
    this._idleTimer = setTimeout(() => this._sleep(), IDLE_DELAY);
  }

  _sleep() {
    this._idleTimer = null;
    if (!this.open) return;
    // Someone moving through the controls by keyboard keeps them.
    if (this._keyboardFocusInControls()) {
      this._wake();
      return;
    }
    this._idle = true;
  }

  _keyboardFocusInControls() {
    let active = this.shadowRoot?.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    if (active?.matches?.(':focus-visible')) return true;
    const light = document.activeElement;
    return !!light && this.contains(light) && light.matches(':focus-visible');
  }

  _onDialogPointerMove(e) {
    if (e.pointerType === 'mouse') this._wake();
  }

  /* ---- Zoom: 1x to 4x, anchored where the pointer is ---- */

  _resetZoom() {
    this._scale = MIN_SCALE;
    this._panX = 0;
    this._panY = 0;
    this._gesture = null;
  }

  /** The zoom button: 1x to 2x and back, around the centre. */
  _toggleZoom() {
    this._zoomTo(this._zoomed ? MIN_SCALE : 2);
  }

  _img() {
    return this.shadowRoot?.querySelector('.lightbox__img');
  }

  /**
   * Centre of the image's untransformed box in client coordinates. Read from
   * layout rather than getBoundingClientRect, which mid-transition reports
   * wherever the animation happens to be.
   */
  _origin(img) {
    const r = this._layoutRect(img);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  /**
   * An element's box in client coordinates from layout (offsets), ignoring
   * transforms. getBoundingClientRect would report wherever an animation or
   * a zoom has put it.
   */
  _layoutRect(el) {
    const dialog = this.shadowRoot.querySelector('dialog');
    const d = dialog.getBoundingClientRect();
    let x = 0;
    let y = 0;
    for (let n = el; n && n !== dialog; n = n.offsetParent) {
      x += n.offsetLeft;
      y += n.offsetTop;
    }
    return { left: d.left + x, top: d.top + y, width: el.offsetWidth, height: el.offsetHeight };
  }

  /** Pan limits at a scale: the image's edges never come inside the stage's. */
  _bounds(img, scale) {
    const stage = this.shadowRoot.querySelector('.lightbox__figure');
    return {
      x: Math.max(0, (img.offsetWidth * scale - stage.clientWidth) / 2),
      y: Math.max(0, (img.offsetHeight * scale - stage.clientHeight) / 2),
    };
  }

  /**
   * Set the scale, keeping the image point under (x, y) where it is. With no
   * point the centre of the view stays put.
   */
  _zoomTo(scale, x, y) {
    const next = clamp(scale, MIN_SCALE, MAX_SCALE);
    const img = this._img();
    if (!img || next === this._scale) return;
    if (next === MIN_SCALE) {
      this._panX = 0;
      this._panY = 0;
    } else {
      const k = next / this._scale;
      let tx = this._panX * k;
      let ty = this._panY * k;
      if (x !== undefined) {
        const o = this._origin(img);
        tx = x - o.x - k * (x - o.x - this._panX);
        ty = y - o.y - k * (y - o.y - this._panY);
      }
      const b = this._bounds(img, next);
      this._panX = clamp(tx, -b.x, b.x);
      this._panY = clamp(ty, -b.y, b.y);
    }
    this._scale = next;
    img.style.transform = this._transform();
  }

  _panBy(dx, dy) {
    const img = this._img();
    if (!img) return;
    const b = this._bounds(img, this._scale);
    this._panX = clamp(this._panX + dx, -b.x, b.x);
    this._panY = clamp(this._panY + dy, -b.y, b.y);
    img.style.transform = this._transform();
    this.requestUpdate();
  }

  _panStep() {
    const stage = this.shadowRoot?.querySelector('.lightbox__figure');
    return Math.max(40, (stage?.clientWidth ?? 400) * 0.1);
  }

  _transform() {
    // translate before scale keeps the pan in screen pixels, so a drag moves
    // the image 1:1 with the pointer.
    return this._zoomed ? `translate(${this._panX}px, ${this._panY}px) scale(${this._scale})` : 'none';
  }

  /**
   * Ctrl + wheel is both a mouse zoom and a trackpad pinch, which browsers
   * report the same way. A plain wheel pans a zoomed image and otherwise does
   * nothing, since nothing behind the viewer can scroll.
   */
  _onWheel(e) {
    const img = this._img();
    if (!img || this._failed) return;
    if (e.ctrlKey) {
      e.preventDefault();
      const px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      this._gestureStyle(img, true);
      this._zoomTo(this._scale * Math.exp(-px * 0.01), e.clientX, e.clientY);
      clearTimeout(this._wheelTimer);
      this._wheelTimer = setTimeout(() => this._gestureStyle(img, false), 150);
    } else if (this._zoomed) {
      e.preventDefault();
      this._panBy(-e.deltaX, -e.deltaY);
    }
  }

  _gestureStyle(img, on) {
    img.classList.toggle('lightbox__img--gesture', on);
  }

  _onImageDblClick(e) {
    // Touch double taps are recognised in _onPointerUp; this is the mouse's.
    if (this._zoomed) this._zoomTo(MIN_SCALE);
    else this._zoomTo(2, e.clientX, e.clientY);
  }

  /* ---- Pointer gestures on the stage ----
     One finger at 1x: swipe sideways to step, swipe down to close.
     One finger or a mouse while zoomed: pan. Two fingers: pinch.
     A press becomes a gesture only past SLOP, and the pointer is captured
     only then. Captured from the start, every tap on the picture would end
     on the figure and read as a click beside it, which closes the viewer. */

  _onPointerDown(e) {
    // A flag left by a gesture that ended without a click must not eat the
    // next real one.
    if (this._pointers.size === 0) this._suppressClick = false;
    if (!this._current() || this._failed) return;
    if (e.pointerType === 'mouse' && (e.button !== 0 || !this._zoomed)) return;
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const img = this._img();
    if (!img) return;

    if (this._pointers.size === 2) {
      const [a, b] = [...this._pointers.values()];
      for (const id of this._pointers.keys()) capture(e.currentTarget, id);
      this._gestureStyle(img, true);
      this._gesture = {
        mode: 'pinch',
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        scale: this._scale,
        panX: this._panX,
        panY: this._panY,
        origin: this._origin(img),
      };
      this._suppressClick = true;
      return;
    }
    if (this._pointers.size > 2) return;

    if (e.pointerType === 'mouse') e.preventDefault();
    this._gesture = {
      mode: null,
      id: e.pointerId,
      pointerType: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      t: performance.now(),
      panX: this._panX,
      panY: this._panY,
    };
  }

  _onPointerMove(e) {
    const p = this._pointers.get(e.pointerId);
    const g = this._gesture;
    if (!p || !g) return;
    p.x = e.clientX;
    p.y = e.clientY;
    const img = this._img();
    if (!img) return;

    if (g.mode === 'pinch') {
      const [a, b] = [...this._pointers.values()];
      const scale = clamp((g.scale * Math.hypot(a.x - b.x, a.y - b.y)) / g.dist, MIN_SCALE, MAX_SCALE);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const k = scale / g.scale;
      // The picture point under the fingers when the pinch began stays
      // under them as they move.
      const tx = mid.x - g.origin.x - k * (g.mid.x - g.origin.x - g.panX);
      const ty = mid.y - g.origin.y - k * (g.mid.y - g.origin.y - g.panY);
      const bounds = this._bounds(img, scale);
      this._scale = scale;
      this._panX = scale === MIN_SCALE ? 0 : clamp(tx, -bounds.x, bounds.x);
      this._panY = scale === MIN_SCALE ? 0 : clamp(ty, -bounds.y, bounds.y);
      // Style is written directly: a re-render per pointermove is per-frame
      // work the motion budget doesn't allow.
      img.style.transform = this._transform();
      return;
    }
    if (e.pointerId !== g.id) return;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (!g.mode) {
      if (Math.hypot(dx, dy) < SLOP) return;
      if (this._zoomed) g.mode = 'pan';
      else if (Math.abs(dx) > Math.abs(dy)) g.mode = 'swipe';
      else if (dy > 0) g.mode = 'dismiss';
      else g.mode = 'none';
      if (g.mode !== 'none') {
        capture(e.currentTarget, e.pointerId);
        this._gestureStyle(img, true);
        this._suppressClick = true;
      }
    }

    if (g.mode === 'pan') {
      const b = this._bounds(img, this._scale);
      this._panX = clamp(g.panX + dx, -b.x, b.x);
      this._panY = clamp(g.panY + dy, -b.y, b.y);
      img.style.transform = this._transform();
    } else if (g.mode === 'swipe') {
      // A lone image can't go anywhere, so it gives a little and no more.
      const x = this._normalized().length > 1 ? dx : dx / 4;
      img.style.transform = `translateX(${x}px)`;
    } else if (g.mode === 'dismiss') {
      img.style.transform = `translateY(${dy}px)`;
      img.style.opacity = String(clamp(1 - dy / 400, 0.3, 1));
    }
  }

  _onPointerUp(e) {
    const g = this._gesture;
    this._pointers.delete(e.pointerId);
    const img = this._img();
    if (!g || !img) {
      this._gesture = null;
      return;
    }

    if (g.mode === 'pinch') {
      if (this._pointers.size > 0) {
        // One finger still down: carry on as a pan from here.
        const [[id, rest]] = [...this._pointers.entries()];
        this._gesture = this._zoomed
          ? { mode: 'pan', id, startX: rest.x, startY: rest.y, panX: this._panX, panY: this._panY }
          : { mode: 'none', id };
        return;
      }
      this._settle(img);
      return;
    }
    if (e.pointerId !== g.id) return;
    this._pointers.clear();
    this._gesture = null;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    const dt = Math.max(1, performance.now() - (g.t ?? 0));

    if (g.mode === 'swipe') {
      const width = this.shadowRoot.querySelector('.lightbox__figure').clientWidth;
      const far = Math.abs(dx) > Math.max(50, width * 0.18);
      const fast = Math.abs(dx) / dt > 0.5 && Math.abs(dx) > 20;
      if ((far || fast) && this._normalized().length > 1) {
        if (dx < 0) this.next();
        else this.prev();
        return;
      }
    } else if (g.mode === 'dismiss') {
      const far = dy > 120;
      const fast = dy / dt > 0.6 && dy > 40;
      if ((far || fast) && this._close()) return;
    } else if (!g.mode && e.type === 'pointerup' && g.pointerType !== 'mouse') {
      this._onTap(e);
    }
    this._settle(img);
  }

  /** Ease back to the committed transform after a gesture lets go. */
  _settle(img) {
    this._gesture = null;
    this._gestureStyle(img, false);
    img.style.opacity = '';
    img.style.transform = this._transform();
    this.requestUpdate();
  }

  /**
   * A touch tap on the picture shows or hides the controls; two quick taps
   * zoom at the tapped point. The single tap waits out the double-tap window
   * so the first half of a double tap doesn't flash the controls.
   */
  _onTap(e) {
    const now = performance.now();
    const last = this._lastTap;
    if (last && now - last.t < DOUBLE_TAP && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 30) {
      this._lastTap = null;
      clearTimeout(this._tapTimer);
      this._suppressClick = true;
      if (this._zoomed) this._zoomTo(MIN_SCALE);
      else this._zoomTo(2, e.clientX, e.clientY);
      return;
    }
    this._lastTap = { t: now, x: e.clientX, y: e.clientY };
    if (e.composedPath()[0] !== this._img()) return;
    clearTimeout(this._tapTimer);
    this._tapTimer = setTimeout(() => {
      this._tapTimer = null;
      if (this._idle) this._wake();
      else {
        clearTimeout(this._idleTimer);
        this._idle = true;
      }
    }, DOUBLE_TAP);
  }

  /* ---- Motion: grow out of the thumbnail, slide between images ----
     All of it is WAAPI on elements that already exist, so no frame of it
     goes through a Lit render. Every entry point checks reduced motion,
     where the viewer keeps its plain fade and steps are instant. */

  _reducedMotion() {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  _easing() {
    return getComputedStyle(this).getPropertyValue('--ease-out-expo').trim() || 'ease-out';
  }

  /** The controls that fade in after a grow and out before a shrink. */
  _chrome() {
    return [...(this.shadowRoot?.querySelectorAll('.lightbox__bar, .lightbox__nav, .lightbox__thumbs') ?? [])];
  }

  /** What the user pressed or focused to open the viewer, if it is outside it. */
  _pressedOrFocused() {
    const press = this._lastPress;
    let el = press && performance.now() - press.t < PRESS_WINDOW ? press.target : null;
    if (!el) {
      el = document.activeElement;
      while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
    }
    if (!(el instanceof Element) || el === document.body || el === document.documentElement) return null;
    if (el === this || this.contains(el) || el.getRootNode() === this.shadowRoot) return null;
    return el;
  }

  /** The picture inside an element, if it holds one, so the grow starts from the image and not its frame. */
  _pictureIn(el) {
    if (el.tagName === 'IMG') return el;
    return el.querySelector?.('img') ?? el.shadowRoot?.querySelector('img') ?? el;
  }

  /**
   * Where image `i` lives on the page, as a rect, when it is visible there.
   * An entry's own `origin` first; then the gallery link it came from; then
   * whatever opened the viewer, and only for the image it opened on.
   */
  _originFor(i) {
    const entry = this._normalized()[i];
    let el = null;
    if (entry?.origin) {
      if (typeof entry.origin === 'string') {
        try {
          el = this.getRootNode().querySelector(entry.origin);
        } catch {
          el = null;
        }
      } else {
        el = entry.origin;
      }
    } else if (this.gallery && !this.images?.length) {
      el = this._galleryLinks()[i] ?? null;
    } else if (this._opener?.index === i) {
      el = this._opener.el;
    }
    if (!(el instanceof Element) || !el.isConnected) return null;
    const pic = this._pictureIn(el);
    const r = pic.getBoundingClientRect();
    const visible = r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
    if (!visible) return null;
    const radius = parseFloat(getComputedStyle(pic).borderTopLeftRadius) || 0;
    return { left: r.left, top: r.top, width: r.width, height: r.height, radius };
  }

  /**
   * The frame that shows the picture at `rest` exactly as the thumbnail at
   * `thumb` shows it. One uniform scale, large enough to cover the thumbnail
   * the way object-fit: cover does, so the photo is never stretched; then a
   * clip down to the thumbnail's visible crop and corner. The clip is in the
   * image's own (unscaled) units, hence the division by the scale.
   */
  _flipFrom(thumb, rest) {
    const scale = Math.max(thumb.width / rest.width, thumb.height / rest.height);
    const dx = thumb.left + thumb.width / 2 - (rest.left + rest.width / 2);
    const dy = thumb.top + thumb.height / 2 - (rest.top + rest.height / 2);
    const x = Math.max(0, (rest.width - thumb.width / scale) / 2);
    const y = Math.max(0, (rest.height - thumb.height / scale) / 2);
    const r = (thumb.radius ?? 0) / scale;
    return {
      transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
      clipPath: `inset(${y}px ${x}px round ${r}px)`,
    };
  }

  /** The resting frame the flip animates to or from: no transform, no crop. */
  _restFrame(img) {
    const r = parseFloat(getComputedStyle(img).borderTopLeftRadius) || 0;
    return { transform: 'none', clipPath: `inset(0px 0px round ${r}px)`, opacity: 1 };
  }

  /** Runs in updated() on open, after the controller's showModal(). */
  async _growOpen() {
    const token = ++this._motionToken;
    const dialog = this.shadowRoot?.querySelector('dialog');
    let img = this._img();
    if (!dialog || !img || this._reducedMotion()) return;
    const thumb = this._originFor(this.index);
    if (!thumb) return;
    // Set before the dialog's first style, so @starting-style sees it.
    dialog.dataset.motion = 'grow';
    const easing = this._easing();
    const dim = getComputedStyle(dialog);
    dialog.animate(
      [
        { backgroundColor: 'transparent', backdropFilter: 'none' },
        { backgroundColor: dim.backgroundColor, backdropFilter: dim.backdropFilter },
      ],
      { duration: OPEN_MS, easing },
    );
    for (const el of this._chrome()) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 120, easing, fill: 'backwards' });
    }
    if (!img.complete) {
      // Grow a picture, not an empty box: wait briefly for it to decode, and
      // hold it hidden meanwhile. Its load would otherwise fade it in at full
      // size a frame before the grow starts from the thumbnail.
      const hold = img.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
      await Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 300))]);
      hold.cancel();
      if (token !== this._motionToken || img !== this._img()) return;
      if (!img.complete || !img.naturalWidth) return;
    }
    img = this._img();
    const rest = this._layoutRect(img);
    if (!rest.width || !rest.height) return;
    const unclip = this._unclipStage(img);
    img
      .animate([{ ...this._flipFrom(thumb, rest), opacity: 1 }, this._restFrame(img)], {
        duration: OPEN_MS,
        easing,
      })
      .finished.then(unclip, unclip);
  }

  /**
   * Shrink back into the current image's thumbnail, then close. Called after
   * arc-close went unvetoed. Returns false when there is nowhere to shrink
   * to, and the caller closes with the plain fade.
   */
  _shrinkClose() {
    const dialog = this.shadowRoot?.querySelector('dialog');
    const img = this._img();
    if (!dialog || !img || this._reducedMotion() || this._failed || !this._loaded) return false;
    const thumb = this._originFor(this.index);
    if (!thumb) return false;
    this._cancelMotion();
    this._clearGhosts();
    this._resetZoom();
    img.style.transform = 'none';
    const rest = this._layoutRect(img);
    if (!rest.width || !rest.height) return false;
    const token = ++this._motionToken;
    this._closing = true;
    this._unclipStage(img);
    const easing = this._easing();
    const dim = getComputedStyle(dialog);
    const fill = 'forwards';
    dialog.animate(
      [
        { backgroundColor: dim.backgroundColor, backdropFilter: dim.backdropFilter },
        { backgroundColor: 'transparent', backdropFilter: 'none' },
      ],
      { duration: CLOSE_MS, easing, fill },
    );
    const caption = this.shadowRoot.querySelector('.lightbox__caption');
    for (const el of [...this._chrome(), caption].filter(Boolean)) {
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill });
    }
    img
      .animate(
        [this._restFrame(img), { ...this._flipFrom(thumb, rest), opacity: 1 }],
        { duration: CLOSE_MS, easing, fill },
      )
      .finished.then(
        () => {
          if (token !== this._motionToken) return;
          dialog.dataset.motion = 'gone';
          this._closing = false;
          this.open = false;
        },
        () => {},
      );
    return true;
  }

  /**
   * The stage clips a zoomed image to itself, which would also clip a
   * picture on its way to or from a thumbnail outside it. Lifted for the
   * flight only; returns the function that puts it back.
   */
  _unclipStage(img) {
    const fig = img.parentElement;
    fig.style.overflow = 'visible';
    return () => {
      fig.style.overflow = '';
    };
  }

  /** show() while a shrink is running: stay open, as it was. */
  _abortClose() {
    this._motionToken++;
    this._closing = false;
    this._cancelMotion();
    const dialog = this.shadowRoot?.querySelector('dialog');
    if (dialog) delete dialog.dataset.motion;
  }

  /** Stop every script animation in the viewer. CSS transitions are left alone. */
  _cancelMotion() {
    const fig = this.shadowRoot?.querySelector('.lightbox__figure');
    if (fig) fig.style.overflow = '';
    const dialog = this.shadowRoot?.querySelector('dialog');
    for (const a of dialog?.getAnimations?.({ subtree: true }) ?? []) {
      if (typeof CSSTransition !== 'undefined' && a instanceof CSSTransition) continue;
      if (typeof CSSAnimation !== 'undefined' && a instanceof CSSAnimation) continue;
      a.cancel();
    }
  }

  _endMotion() {
    this._motionToken++;
    this._closing = false;
    this._clearGhosts();
    this._cancelMotion();
    const dialog = this.shadowRoot?.querySelector('dialog');
    if (dialog) delete dialog.dataset.motion;
  }

  /**
   * Before a step renders: copy the outgoing picture into place over the
   * stage and slide the copy away. The real <img> is keyed on its src, so
   * Lit replaces it, and the copy is what the eye follows out. A step made
   * mid-slide drops the previous copy, so only one ever leaves at a time.
   */
  _ghostOut() {
    if (this._reducedMotion()) return;
    const img = this._img();
    const fig = img?.parentElement;
    if (!img || !fig || !img.offsetWidth || this._failed) return;
    this._clearGhosts();
    for (const a of img.getAnimations()) {
      if (typeof CSSTransition === 'undefined' || !(a instanceof CSSTransition)) a.cancel();
    }
    const ghost = img.cloneNode(false);
    ghost.classList.add('lightbox__ghost');
    ghost.removeAttribute('part');
    ghost.setAttribute('alt', '');
    ghost.setAttribute('aria-hidden', 'true');
    Object.assign(ghost.style, {
      left: `${img.offsetLeft}px`,
      top: `${img.offsetTop}px`,
      width: `${img.offsetWidth}px`,
      height: `${img.offsetHeight}px`,
      maxWidth: 'none',
      maxHeight: 'none',
    });
    fig.append(ghost);
    this._ghosts.add(ghost);
    // A swipe leaves the picture wherever the finger let go; it leaves from there.
    const from = img.style.transform && img.style.transform !== 'none' ? img.style.transform : 'translateX(0px)';
    const drop = () => {
      ghost.remove();
      this._ghosts.delete(ghost);
    };
    ghost
      .animate(
        [
          { transform: from, opacity: 1 },
          { transform: `translateX(${-this._direction * SLIDE_PX}px)`, opacity: 0 },
        ],
        { duration: SLIDE_MS, easing: this._easing(), fill: 'forwards' },
      )
      .finished.then(drop, drop);
  }

  _clearGhosts() {
    for (const ghost of this._ghosts) ghost.remove();
    this._ghosts.clear();
  }

  /** After a step renders: bring the new picture in from the side it travels from. */
  _slideIn() {
    const dir = this._direction;
    const img = this._img();
    if (!dir || !img || this._reducedMotion()) return;
    img.animate(
      [
        { transform: `translateX(${dir * SLIDE_PX}px)`, opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: SLIDE_MS, easing: this._easing() },
    );
  }

  /** Keep the current thumbnail in view in the strip. */
  _revealThumb(instant) {
    const strip = this.shadowRoot?.querySelector('.lightbox__thumbs');
    const thumb = strip?.querySelector('[aria-current]');
    if (!thumb) return;
    const left = thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2;
    strip.scrollTo({ left, behavior: instant || this._reducedMotion() ? 'instant' : 'smooth' });
  }

  /* ---- Render ---- */

  _renderStatus(current) {
    if (this._failed) {
      const alt = current.alt || '';
      return html`
        <div class="lightbox__error" part="error" role="img" aria-label=${alt ? `Couldn't load this image: ${alt}` : "Couldn't load this image"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2"></rect>
            <path d="M3 16l5-5 4 4M14 13l2-2 5 5M4 4l16 16"></path>
          </svg>
          <span aria-hidden="true">Couldn't load this image</span>
          ${alt ? html`<span class="lightbox__error-alt" aria-hidden="true">${alt}</span>` : nothing}
        </div>
      `;
    }
    if (!this._loaded && this._slow) {
      return html`<div class="lightbox__loading" part="loading" aria-hidden="true"><span class="lightbox__spinner"></span></div>`;
    }
    return nothing;
  }

  _renderThumbs(images, index) {
    if (!this.thumbnails || images.length < 2) return nothing;
    return html`
      <div class="lightbox__thumbs" part="thumbnails" role="group" aria-label="Images">
        ${images.map(
          (entry, i) => html`
            <button
              type="button"
              class="lightbox__thumb"
              part="thumbnail"
              aria-label=${entry.alt || `Image ${i + 1}`}
              aria-current=${i === index ? 'true' : nothing}
              @click=${() => this._goTo(i, i > index ? 1 : -1)}
            >
              <img src=${entry.thumb || entry.src} alt="" loading="lazy" decoding="async" draggable="false" />
            </button>
          `,
        )}
      </div>
    `;
  }

  /** The stage: the current picture, its status and its caption. */
  _renderFigure(current) {
    return html`
      <figure
        class="lightbox__figure"
        part="figure"
        aria-busy=${current && !this._loaded ? 'true' : nothing}
        @click=${this._onFigureClick}
        @wheel=${this._wheel}
        @pointerdown=${this._onPointerDown}
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @pointercancel=${this._onPointerUp}
      >
        ${
          current
            ? keyed(
                current.src,
                html`
          <img
            class="lightbox__img ${this._zoomed ? 'lightbox__img--zoomed' : ''} ${
              this._loaded ? '' : 'lightbox__img--loading'
            } ${this._failed ? 'lightbox__img--failed' : ''}"
            part="image"
            src=${current.src}
            srcset=${ifDefined(current.srcset || undefined)}
            sizes=${ifDefined(current.sizes || undefined)}
            width=${ifDefined(current.width ?? undefined)}
            height=${ifDefined(current.height ?? undefined)}
            alt=${current.alt ?? ''}
            draggable="false"
            style="transform: ${this._transform()};"
            @load=${this._onImageLoad}
            @error=${this._onImageError}
            @dblclick=${this._onImageDblClick}
          />
        `,
              )
            : nothing
        }
        ${current ? this._renderStatus(current) : nothing}
        ${
          current?.caption
            ? html`
          <figcaption class="lightbox__caption" part="caption">${current.caption}</figcaption>
        `
            : nothing
        }
      </figure>
    `;
  }

  render() {
    const images = this._normalized();
    const total = images.length;
    const index = total > 0 ? Math.max(0, Math.min(this.index, total - 1)) : 0;
    const current = images[index];

    return html`
      <dialog
        class="lightbox ${this._idle ? 'lightbox--idle' : ''}"
        aria-label=${current?.alt || 'Image viewer'}
        part="base backdrop"
        @pointermove=${this._onDialogPointerMove}
      >
        <div class="lightbox__bar" part="bar">
          <span class="lightbox__counter" part="counter" aria-live="polite">${
            total > 0
              ? html`<span aria-hidden="true">${index + 1} / ${total}</span><span class="lightbox__sr">${
                  `${index + 1} of ${total}${current?.alt ? `: ${current.alt}` : ''}`
                }</span>`
              : nothing
          }</span>
          <div class="lightbox__actions">
            <slot name="actions"></slot>
            <arc-icon-button
              name=${this._zoomed ? 'minus' : 'plus'}
              label=${this._zoomed ? 'Zoom out' : 'Zoom in'}
              variant="ghost"
              @click=${this._toggleZoom}
              part="zoom"
            ></arc-icon-button>
            <arc-icon-button
              name="x"
              label="Close"
              variant="ghost"
              @click=${this._close}
              part="close"
            ></arc-icon-button>
          </div>
        </div>

        ${this._renderFigure(current)}

        ${this._renderThumbs(images, index)}

        ${
          total > 1
            ? html`
          <arc-icon-button
            class="lightbox__nav lightbox__nav--prev"
            name="chevron-left"
            label="Previous image"
            variant="ghost"
            @click=${this.prev}
            part="prev"
          ></arc-icon-button>
          <arc-icon-button
            class="lightbox__nav lightbox__nav--next"
            name="chevron-right"
            label="Next image"
            variant="ghost"
            @click=${this.next}
            part="next"
          ></arc-icon-button>
        `
            : nothing
        }
      </dialog>
    `;
  }
}
