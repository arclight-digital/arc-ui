import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { OverlayController } from '../shared/overlay-controller.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, num, oneOf } from '../shared/props.js';

/**
 * A sliding overlay panel that emerges from the bottom or right edge of the viewport, with a
 * blurred backdrop, header, scrollable body, and footer slot.
 *
 * @tag arc-sheet
 * @status stable
 * @requires arc-icon-button
 * @prop {boolean} open - Controls whether the sheet is visible. Reflected as an attribute and toggleable programmatically.
 * @prop {'bottom' | 'right'} side - Which edge the panel slides in from. Bottom sheets are at most `--sheet-max-height` tall (default 80dvh); right sheets are `--sheet-width` wide (default 400px).
 * @prop {string} heading - Text displayed in the header row. Also used as the `aria-label` for the dialog panel.
 * @prop {boolean} modal - Whether the sheet blocks the page. On (the default), the page behind is inert, scroll-locked and dimmed until the sheet closes. Off (`no-modal`), the sheet floats above a page that stays usable: no backdrop, no scroll lock, and opening it leaves focus where it was. Escape still closes it while focus is inside it.
 * @prop {string} snapPoints - Heights a bottom sheet rests at, smallest first, as a comma-separated list of CSS lengths (`snap-points="120px, 50dvh, 88dvh"`). From script, a string or an array. The handle then drags between them, snapping to the nearest on release or to the next on a flick, and dragging well below the smallest requests a close. The handle is also a slider: arrow keys move between heights. Ignored by a right sheet.
 * @prop {number} snap - Index into `snapPoints` of the height the sheet rests at. Updated as the user drags or steps the handle.
 * @prop {boolean} persistent - The user cannot dismiss the sheet: Escape, a backdrop click and the drag-down close are ignored, dragging below the smallest snap point settles back on it, and there is no close button. For a permanent peek strip. Setting `open` from script still closes it.
 * @fires {CustomEvent<void>} arc-open - Fired when the sheet opens
 * @fires {CustomEvent<void>} arc-close - Fired when the sheet closes
 * @fires {CustomEvent<{ value: number }>} arc-change - Fired when the user moves the sheet to another snap point. `value` is the new `snap` index.
 * @slot header - Replaces the heading. The header row is left out when there is no heading, nothing here, and no close button (a `persistent` sheet), so a short snap point is all content.
 * @slot - Default content.
 * @slot footer - Actions under the body. The footer row renders only when something is slotted here.
 * @csspart base - The root element.
 * @csspart close
 * @csspart panel - The sliding panel. The scrim is `::backdrop`, which is not an
 *   element and so cannot be a part; style it with the `--sheet-backdrop` and
 *   `--sheet-backdrop-filter` custom properties. Size the panel with
 *   `--sheet-max-height` (bottom) and `--sheet-width` (right) rather than
 *   through this part.
 * @csspart handle - The drag handle. With `snapPoints` it is a focusable vertical slider.
 * @csspart header
 * @csspart body
 * @csspart footer
 */
export class ArcSheet extends DeclaredPropsMixin(LitElement) {
  static properties = {
    open: flag(false),
    side: oneOf(['bottom', 'right']),

    heading: { type: String },
    modal: flag(true, { negative: 'no-modal' }),
    snapPoints: { type: String, attribute: 'snap-points' },
    snap: num({ default: 0, min: 0, int: true, reflect: true }),
    persistent: flag(false),
    _hasHeader: { state: true },
    _hasFooter: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      /* The panel is the dialog; the scrim is its ::backdrop. No backdrop
         element and no z-index: the top layer has no ladder to climb. Both
         scrim properties come through custom properties so a consumer can
         still reach them, ::backdrop inherits from its originating element. */
      .sheet__panel {
        position: fixed;
        margin: 0;
        padding: 0;
        max-width: none;
        max-height: none;
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-overlay);
        flex-direction: column;
        box-sizing: border-box;
        transition:
          transform var(--duration-exit) var(--ease-out-expo),
          overlay var(--duration-exit) allow-discrete,
          display var(--duration-exit) allow-discrete;
      }

      /* display on the open rule, not the base one: a closed dialog is
         display:none by UA stylesheet, and a flex declaration on the base rule
         would override it and leave the sheet on screen while closed. */
      .sheet__panel:is([open], :popover-open) {
        display: flex;
        transition-duration: var(--duration-enter);
      }

      .sheet__panel::backdrop {
        background: var(--sheet-backdrop, var(--overlay-backdrop));
        backdrop-filter: var(--sheet-backdrop-filter, blur(4px));
        opacity: 0;
        transition:
          opacity var(--transition-exit),
          overlay var(--transition-exit) allow-discrete,
          display var(--transition-exit) allow-discrete;
      }

      /* Entering, the scrim takes the panel's curve as well as its duration,
         so the two arrive together. With the exit's ease-in it barely moved
         for the first half and faded in after the panel had landed. */
      .sheet__panel:is([open], :popover-open)::backdrop {
        opacity: 1;
        transition-duration: var(--duration-enter);
        transition-timing-function: var(--ease-out-expo);
      }

      @starting-style {
        .sheet__panel:is([open], :popover-open)::backdrop { opacity: 0; }
      }

      /* Bottom sheet. The off-screen transform is now stated twice: once for
         the entry (@starting-style, the frame the dialog enters the top layer)
         and once for the exit (:not([open]), which the overlay transition keeps
         visible long enough to run). The old single translateY(100%) base rule
         could serve both because the panel never left the layout. */
      /* Every inset stated, including the ones that must be auto. The UA
         stylesheet gives a modal dialog inset-block: 0 and every dialog
         inset-inline: 0, so a bottom sheet that set only bottom: 0 kept top: 0
         and rendered at the top of the screen, and a right sheet kept left: 0
         and opened on the left at its content height (finding #126). The UA
         also sizes a dialog fit-content, so both sides reset their stretch. */
      :host(:not([side="right"])) .sheet__panel,
      :host([side="bottom"]) .sheet__panel {
        top: auto;
        bottom: 0;
        inset-inline-start: 0;
        inset-inline-end: 0;
        /* And the UA's width: fit-content, which squeezed a short sheet to its
           content between two zero insets. */
        width: auto;
        /* dvh, not vh: on a phone, vh is the viewport with the browser chrome
           retracted, so an 80vh sheet opened with the address bar showing had
           its footer pushed under it. */
        max-height: var(--sheet-max-height, 80dvh);
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      }

      @starting-style {
        :host(:not([side="right"])) .sheet__panel:is([open], :popover-open),
        :host([side="bottom"]) .sheet__panel:is([open], :popover-open) {
          transform: translateY(100%);
        }
      }

      :host(:not([side="right"])) .sheet__panel:not([open]):not(:popover-open),
      :host([side="bottom"]) .sheet__panel:not([open]):not(:popover-open) {
        transform: translateY(100%);
      }

      /* Right sheet */
      :host([side="right"]) .sheet__panel {
        top: 0;
        inset-inline-start: auto;
        inset-inline-end: 0;
        bottom: 0;
        height: auto;
        width: var(--sheet-width, 400px);
        max-width: 90vw;
        border-radius: var(--radius-xl) 0 0 var(--radius-xl);
      }

      @starting-style {
        :host([side="right"]) .sheet__panel:is([open], :popover-open) {
          transform: translateX(100%);
        }
      }

      :host([side="right"]) .sheet__panel:not([open]):not(:popover-open) {
        transform: translateX(100%);
      }

      /* Non-modal: a popover in the top layer with the page left live. The UA
         gives popovers a ::backdrop too, and this one must not dim the page it
         is meant to leave usable (finding #112). */
      .sheet__panel[popover]::backdrop { display: none; }

      /* Snap points. The panel sits at a CSS length, so dvh and friends work
         and nothing is measured at rest. The heights are the consumer's, so
         the default max-height steps aside for them (finding #111). */
      :host([snap-points]:not([side="right"])) .sheet__panel {
        height: var(--_snap-height, auto);
        max-height: 100dvh;
        transition:
          transform var(--duration-exit) var(--ease-out-expo),
          height var(--duration-enter) var(--ease-out-expo),
          overlay var(--duration-exit) allow-discrete,
          display var(--duration-exit) allow-discrete;
      }

      /* As specific as the snap-points rule above, and after it, so it wins.
         Plain .sheet__panel.is-dragging lost to that rule: the height kept
         easing behind the pointer for the whole drag, and the release read a
         height the panel had not reached yet. */
      :host([snap-points]) .sheet__panel.is-dragging,
      .sheet__panel.is-dragging { transition: none; }

      :host([snap-points]:not([side="right"])) .sheet__handle {
        cursor: grab;
        touch-action: none;
        padding-block: var(--space-sm);
        outline: none;
      }

      :host([snap-points]:not([side="right"])) .sheet__handle:focus-visible .sheet__handle-bar {
        box-shadow: var(--interactive-focus);
      }

      .is-dragging .sheet__handle { cursor: grabbing; }

      .sheet__probe {
        position: fixed;
        inset-block-start: 0;
        inline-size: 0;
        visibility: hidden;
        pointer-events: none;
      }

      .sheet__header.is-empty,
      .sheet__footer.is-empty { display: none; }

      .sheet__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-lg);
        border-bottom: 1px solid var(--divider);
        flex-shrink: 0;
      }

      .sheet__heading {
        font-family: var(--font-body);
        font-size: var(--_text-md);
        font-weight: var(--font-label-weight, 600);
        color: var(--text-primary);
        margin: 0;
      }


      .sheet__body {
        padding: var(--space-lg);
        color: var(--text-secondary);
        font-size: var(--body-size);
        line-height: var(--body-lh);
        flex: 1;
        overflow-y: auto;
      }

      .sheet__footer {
        padding: var(--space-lg);
        border-top: 1px solid var(--divider);
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm);
        flex-shrink: 0;
      }

      /* Handle for bottom sheet */
      :host(:not([side="right"])) .sheet__handle,
      :host([side="bottom"]) .sheet__handle {
        display: flex;
        justify-content: center;
        padding: var(--space-sm) 0 0;
      }

      :host([side="right"]) .sheet__handle { display: none; }

      .sheet__handle-bar {
        width: 40px;
        height: 4px;
        border-radius: var(--radius-full);
        background: var(--border-bright);
      }

      @media (prefers-reduced-motion: reduce) {
        .sheet__backdrop,
        .sheet__panel { transition: none; }
      }
    `,
  ];

  /** Slots read on the server and before hydration; see ssr.js. */
  static slotReaders = { header: '_onHeaderSlotChange', footer: '_onFooterSlotChange' };

  constructor() {
    super();
    this.heading = '';
    this.snapPoints = '';
    this._hasHeader = false;
    this._hasFooter = false;
    this._drag = null;
    this._overlay = new OverlayController(this, {
      dialog: () => this.shadowRoot?.querySelector('.sheet__panel'),
      isOpen: () => this.open,
      modal: () => this.modal,
      // Escape and a backdrop click. A persistent sheet ignores both.
      onRequestClose: () => {
        if (!this.persistent) this._close();
      },
    });
  }

  /** The snap heights as CSS lengths, or none on a right sheet. */
  get _snaps() {
    if (this.side === 'right') return [];
    const v = this.snapPoints;
    const all = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [];
    return all.map((x) => String(x).trim()).filter(Boolean);
  }

  /** `snap`, kept inside the list. */
  get _snapIndex() {
    const n = this._snaps.length;
    return n ? Math.min(Math.max(0, this.snap | 0), n - 1) : 0;
  }

  /** A CSS length in pixels, resolved by the browser rather than by us. */
  _px(length) {
    const probe = this.shadowRoot?.querySelector('.sheet__probe');
    if (!probe) return 0;
    probe.style.height = length;
    return probe.getBoundingClientRect().height;
  }

  _moveTo(index) {
    const n = this._snaps.length;
    const next = Math.min(Math.max(0, index), n - 1);
    if (next === this._snapIndex) return;
    this.snap = next;
    this.dispatchEvent(
      new CustomEvent('arc-change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  }

  _onHandleKeydown(e) {
    if (!this._snaps.length) return;
    const i = this._snapIndex;
    const to = {
      ArrowUp: i + 1,
      ArrowRight: i + 1,
      ArrowDown: i - 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: this._snaps.length - 1,
    }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    this._moveTo(to);
  }

  _onHandleDown(e) {
    if (!this._snaps.length) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const panel = this.shadowRoot.querySelector('.sheet__panel');
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const h = panel.getBoundingClientRect().height;
    this._drag = { panel, y: e.clientY, h, lastY: e.clientY, lastT: e.timeStamp, v: 0 };
    panel.classList.add('is-dragging');
  }

  _onHandleMove(e) {
    const d = this._drag;
    if (!d) return;
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.v = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    const h = Math.max(0, Math.min(window.innerHeight, d.h - (e.clientY - d.y)));
    d.panel.style.height = `${h}px`;
  }

  /**
   * Release: the nearest height, or the next one in the direction of a flick,
   * or a close if the sheet was pulled well below the smallest. Heights are
   * resolved now, not at rest, so a `dvh` point is right for the viewport the
   * user is actually looking at.
   */
  _onHandleUp() {
    const d = this._drag;
    if (!d) return;
    this._drag = null;
    const current = d.panel.getBoundingClientRect().height;
    const heights = this._snaps.map((len) => this._px(len));
    d.panel.style.height = '';
    d.panel.classList.remove('is-dragging');

    const FLICK = 0.5; // px per ms
    const pulledDown = current < heights[0] * 0.6 || (d.v > FLICK && current <= heights[0]);
    // A persistent sheet settles back on its smallest height instead (#136).
    if (pulledDown && !this.persistent) {
      this._close();
      return;
    }
    if (pulledDown) {
      this._moveTo(0);
      this.requestUpdate();
      return;
    }
    let target = 0;
    heights.forEach((h, i) => {
      if (Math.abs(h - current) < Math.abs(heights[target] - current)) target = i;
    });
    if (d.v > FLICK)
      target = Math.max(
        0,
        heights.findLastIndex((h) => h < current - 1),
      );
    else if (d.v < -FLICK) {
      const up = heights.findIndex((h) => h > current + 1);
      target = up === -1 ? heights.length - 1 : up;
    }
    this._moveTo(target);
  }

  _close() {
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', { bubbles: true, composed: true, cancelable: true }),
      )
    )
      return;
    this.open = false;
  }

  updated(changed) {
    super.updated?.(changed);
    if (changed.has('open') && this.open) {
      this.dispatchEvent(new CustomEvent('arc-open', { bubbles: true, composed: true }));
    }
    // The close button used to be focused by hand here. `showModal()` places
    // initial focus per spec, which lands on the same button, and unlike the
    // manual call it yields to an `autofocus` on the consumer's own slotted
    // content, which the manual call silently overrode.
  }

  _renderHandle() {
    const snaps = this._snaps;
    if (!snaps.length) {
      return html`<div class="sheet__handle" part="handle"><div class="sheet__handle-bar"></div></div>`;
    }
    const i = this._snapIndex;
    return html`
      <div
        class="sheet__handle"
        part="handle"
        role="slider"
        tabindex="0"
        aria-label="Sheet height"
        aria-orientation="vertical"
        aria-valuemin="1"
        aria-valuemax=${snaps.length}
        aria-valuenow=${i + 1}
        aria-valuetext=${`${i + 1} of ${snaps.length}`}
        @keydown=${this._onHandleKeydown}
        @pointerdown=${this._onHandleDown}
        @pointermove=${this._onHandleMove}
        @pointerup=${this._onHandleUp}
        @pointercancel=${this._onHandleUp}
      >
        <div class="sheet__handle-bar"></div>
      </div>
    `;
  }

  firstUpdated() {
    hydrateSlots(this);
  }

  /**
   * Whether anything was really slotted: assigned nodes only, since
   * `flatten: true` returns a slot's fallback content when nothing is assigned,
   * and whitespace between tags does not count.
   */
  _filled(slot) {
    return slot.assignedNodes().some((n) => n.nodeType !== Node.TEXT_NODE || n.textContent.trim());
  }

  _onHeaderSlotChange(e) {
    this._hasHeader = this._filled(e.target);
  }

  _onFooterSlotChange(e) {
    this._hasFooter = this._filled(e.target);
  }

  /**
   * The header and footer rows only when they carry something. Empty, they took
   * most of a 120px snap point: a padded header with nothing in it and a
   * bordered footer with nothing in it (finding #137). The slots stay rendered
   * either way, because a slot removed from the tree can never be filled.
   */
  _renderContent() {
    const header = !!this.heading || this._hasHeader || !this.persistent;
    return html`
        ${this._renderHandle()}
        <div class="sheet__header ${header ? '' : 'is-empty'}" part="header">
          <slot name="header" @slotchange=${this._onHeaderSlotChange}>
            ${this.heading ? html`<h2 class="sheet__heading">${this.heading}</h2>` : ''}
          </slot>
          ${
            this.persistent
              ? ''
              : html`<arc-icon-button name="x" label="Close" variant="ghost" size="sm" @click=${this._close} part="close"></arc-icon-button>`
          }
        </div>
        <div class="sheet__body" part="body">
          <slot></slot>
        </div>
        <div class="sheet__footer ${this._hasFooter ? '' : 'is-empty'}" part="footer">
          <slot name="footer" @slotchange=${this._onFooterSlotChange}></slot>
        </div>
    `;
  }

  /**
   * A `<dialog>` when modal, a manual popover when not: the controller opens
   * each the way that gives it its behaviour (see OverlayController).
   */
  render() {
    const snaps = this._snaps;
    const style = snaps.length ? `--_snap-height: ${snaps[this._snapIndex]}` : '';
    const probe = snaps.length ? html`<div class="sheet__probe" aria-hidden="true"></div>` : '';
    if (this.modal) {
      return html`
        <dialog class="sheet__panel" aria-label=${this.heading || 'Sheet'} part="base panel" style=${style}>
          ${this._renderContent()}
        </dialog>
        ${probe}
      `;
    }
    return html`
      <div
        class="sheet__panel"
        popover="manual"
        role="dialog"
        aria-label=${this.heading || 'Sheet'}
        part="base panel"
        style=${style}
      >
        ${this._renderContent()}
      </div>
      ${probe}
    `;
  }
}
