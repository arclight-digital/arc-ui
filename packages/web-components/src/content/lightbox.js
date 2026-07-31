import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { OverlayMixin } from '../shared/overlay-mixin.js';

/**
 * Full-screen image viewer on the overlay stack: open from a thumbnail, step through a gallery
 * with wrapping prev/next navigation, zoom to 2x with drag-to-pan, and dismiss with Escape or a
 * backdrop click.
 *
 * The gallery is data, not layout: images are supplied through the `images` property rather than
 * slotted children, so the closed component renders nothing and the server render stays empty.
 * Entries may be plain `src` strings or `{ src, alt, caption }` objects; the two forms mix freely.
 *
 * @tag arc-lightbox
 * @requires arc-icon-button
 * @prop {Array} images - The gallery to display. Each entry is either a `src` string or an object of shape `{ src, alt, caption }`; `alt` and `caption` are optional. Set as a property — arrays do not round-trip through attributes.
 * @prop {number} index - Index of the image currently displayed. Navigation wraps at both ends, so setting it out of range shows the nearest valid image.
 * @prop {boolean} open - Controls the visible state of the viewer. Set to `true` to open at the current `index` and activate the focus trap; set to `false` to close and restore focus to the previously-focused element.
 * @fires {CustomEvent<void>} arc-open - Fired when the lightbox opens
 * @fires {CustomEvent<void>} arc-close - Fired when the lightbox closes. Cancelable: call `preventDefault()` to veto the close.
 * @fires {CustomEvent<{value: number, index: number}>} arc-change - Fired when the displayed image changes. `detail.value` is the new index.
 * @slot none
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
 */
export class ArcLightbox extends OverlayMixin(LitElement) {
  static properties = {
    // Attribute is off: an array can't survive a round trip through one, and
    // leaving it on invites `images="[...]"` that silently sets a string.
    images: { attribute: false },
    index: { type: Number },
    open: { type: Boolean, reflect: true },
    _zoomed: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .lightbox {
        position: fixed;
        inset: 0;
        background: var(--overlay-backdrop);
        backdrop-filter: blur(4px);
        z-index: var(--z-modal);
        display: flex;
        flex-direction: column;
        padding: var(--space-lg);
        opacity: 0;
        visibility: hidden;
        /* visibility flips instantly on open (delayed only on close) so the
           dialog is focusable the moment [open] is set */
        transition: opacity var(--transition-base), visibility 0s var(--transition-base);
      }

      :host([open]) .lightbox {
        opacity: 1;
        visibility: visible;
        transition-delay: 0s;
      }

      .lightbox__bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        flex-shrink: 0;
      }

      .lightbox__counter {
        font-family: var(--font-mono);
        font-variant-numeric: tabular-nums;
        font-size: var(--_text-sm);
        color: var(--text-muted);
      }

      .lightbox__actions {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .lightbox__figure {
        flex: 1;
        min-height: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        overflow: hidden;
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
        touch-action: none;
        transition: transform var(--transition-base);
      }

      .lightbox__img--zoomed {
        cursor: grab;
        border-radius: 0;
      }

      .lightbox__img--zoomed:active {
        cursor: grabbing;
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
      }

      .lightbox__nav--prev { inset-inline-start: var(--space-lg); }
      .lightbox__nav--next { inset-inline-end: var(--space-lg); }

      @media (prefers-reduced-motion: reduce) {
        .lightbox,
        .lightbox__figure,
        .lightbox__img { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.images = [];
    this.index = 0;
    this.open = false;
    this._zoomed = false;
    this._panX = 0;
    this._panY = 0;
    this._drag = null;
    this._onNavKeyDown = this._onNavKeyDown.bind(this);
  }

  /** Entries normalised to `{ src, alt, caption }` regardless of input form. */
  _normalized() {
    return (Array.isArray(this.images) ? this.images : []).map((entry) =>
      typeof entry === 'string' ? { src: entry, alt: '', caption: '' } : entry,
    );
  }

  /** Opens the viewer, optionally jumping to a specific image first. */
  show(index) {
    if (typeof index === 'number' && Number.isFinite(index)) {
      const total = this._normalized().length;
      if (total > 0) this.index = ((Math.trunc(index) % total) + total) % total;
    }
    this.open = true;
  }

  /** Closes the viewer through the cancelable arc-close contract. */
  close() {
    this._close();
  }

  /** Advances to the next image, wrapping past the end. */
  next() {
    this._goTo(this.index + 1);
  }

  /** Steps to the previous image, wrapping past the start. */
  prev() {
    this._goTo(this.index - 1);
  }

  _goTo(index) {
    const total = this._normalized().length;
    if (total === 0) return;
    const target = ((index % total) + total) % total;
    if (target === this.index) return;
    this._resetZoom();
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
   * The single gate on dismissal. OverlayMixin routes Escape and backdrop
   * clicks here, and close() delegates, so the cancelable arc-close fires on
   * every path before the state flips.
   */
  _close() {
    if (!this.open) return;
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', { bubbles: true, composed: true, cancelable: true }),
      )
    )
      return;
    this.open = false;
  }

  updated(changed) {
    // Focus trap, scroll lock, Escape and focus restore all come from
    // OverlayMixin; this adds the open event and the navigation keys.
    super.updated(changed);
    if (changed.has('open')) {
      if (this.open) {
        this._resetZoom();
        document.addEventListener('keydown', this._onNavKeyDown);
        this.dispatchEvent(new CustomEvent('arc-open', { bubbles: true, composed: true }));
      } else {
        document.removeEventListener('keydown', this._onNavKeyDown);
      }
    }
    // A consumer setting `index` directly gets the same fresh start a
    // navigated change gets.
    if (changed.has('index') && (this._zoomed || this._panX || this._panY)) {
      this._resetZoom();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onNavKeyDown);
  }

  _onNavKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    } else if (e.key === '+' || e.key === '=') {
      if (!this._zoomed) this._toggleZoom();
    } else if (e.key === '-' || e.key === '_') {
      if (this._zoomed) this._toggleZoom();
    }
  }

  /* ---- Zoom: one level (2x), panned by drag ---- */

  _resetZoom() {
    this._zoomed = false;
    this._panX = 0;
    this._panY = 0;
    this._drag = null;
  }

  _toggleZoom() {
    this._panX = 0;
    this._panY = 0;
    this._zoomed = !this._zoomed;
  }

  _transform() {
    // translate before scale keeps the pan in screen pixels, so a drag moves
    // the image 1:1 with the pointer.
    return this._zoomed ? `translate(${this._panX}px, ${this._panY}px) scale(2)` : 'none';
  }

  _onPointerDown(e) {
    if (!this._zoomed) return;
    e.preventDefault();
    const img = e.currentTarget;
    const stage = this.shadowRoot.querySelector('.lightbox__figure').getBoundingClientRect();
    const rect = img.getBoundingClientRect(); // post-transform, so already scaled
    this._drag = {
      startX: e.clientX,
      startY: e.clientY,
      panX: this._panX,
      panY: this._panY,
      maxX: Math.max(0, (rect.width - stage.width) / 2),
      maxY: Math.max(0, (rect.height - stage.height) / 2),
    };
    img.setPointerCapture(e.pointerId);
    img.style.transition = 'none';
  }

  _onPointerMove(e) {
    if (!this._drag) return;
    const { startX, startY, panX, panY, maxX, maxY } = this._drag;
    this._panX = Math.max(-maxX, Math.min(maxX, panX + (e.clientX - startX)));
    this._panY = Math.max(-maxY, Math.min(maxY, panY + (e.clientY - startY)));
    // Style is written directly: a re-render per pointermove is per-frame work
    // the motion budget doesn't allow.
    e.currentTarget.style.transform = this._transform();
  }

  _onPointerUp(e) {
    if (!this._drag) return;
    this._drag = null;
    e.currentTarget.style.transition = '';
  }

  render() {
    const images = this._normalized();
    const total = images.length;
    const index = total > 0 ? Math.max(0, Math.min(this.index, total - 1)) : 0;
    const current = images[index];

    return html`
      <div
        class="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label=${current?.alt || 'Image viewer'}
        part="backdrop"
        @click=${this._handleBackdropClick}
      >
        <div class="lightbox__bar" part="bar">
          <span class="lightbox__counter" part="counter" aria-live="polite">
            ${total > 0 ? `${index + 1} / ${total}` : nothing}
          </span>
          <div class="lightbox__actions">
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

        <figure class="lightbox__figure" part="figure" @click=${this._handleBackdropClick}>
          ${
            current
              ? html`
            <img
              class="lightbox__img ${this._zoomed ? 'lightbox__img--zoomed' : ''}"
              part="image"
              src=${current.src}
              alt=${current.alt ?? ''}
              draggable="false"
              style="transform: ${this._transform()};"
              @dblclick=${this._toggleZoom}
              @pointerdown=${this._onPointerDown}
              @pointermove=${this._onPointerMove}
              @pointerup=${this._onPointerUp}
              @pointercancel=${this._onPointerUp}
            />
          `
              : nothing
          }
          ${
            current?.caption
              ? html`
            <figcaption class="lightbox__caption" part="caption">${current.caption}</figcaption>
          `
              : nothing
          }
        </figure>

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
      </div>
    `;
  }
}
