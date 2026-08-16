import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { managedPanelStyles } from '../shared/position-styles.js';
import { PositionController } from '../shared/position-controller.js';
import { DismissController } from '../shared/dismiss-controller.js';
import { deepActiveElement } from '../shared/trigger-aria.js';
import { DeclaredPropsMixin, flag, num } from '../shared/props.js';

/**
 * A single glowing pin inside an Image Hotspots surface. The pin sits at percentage coordinates
 * over the slotted image and opens a small anchored popover holding the slotted detail content.
 * Inside an arc-image-hotspots parent, opening one pin closes any other open pin.
 *
 * @tag arc-hotspot
 * @arc-group marketing
 * @prop {number} x - Horizontal position of the pin as a percentage of the image width, from 0 (left edge) to 100 (right edge). Values outside the range are clamped; a non-numeric value falls back to 50.
 * @prop {number} y - Vertical position of the pin as a percentage of the image height, from 0 (top edge) to 100 (bottom edge). Values outside the range are clamped; a non-numeric value falls back to 50.
 * @prop {string} label - Accessible name for the pin button, repeated as the heading of the popover. Always set it — without a label the pin announces nothing useful to a screen reader.
 * @prop {boolean} open - Whether the pin's popover is currently visible. Reflected as an attribute. Opens on click; closes on Escape, outside click, or a second click on the pin.
 * @fires {CustomEvent<{value: string | number}>} arc-open - Fired when the popover opens. detail.value carries the label, or the pin's index within its parent when no label is set.
 * @fires {CustomEvent<{value: string | number}>} arc-close - Fired before the popover closes and cancelable — preventDefault() vetoes the close. detail.value matches arc-open.
 * @slot - Default content.
 * @csspart pin
 * @csspart panel
 */
export class ArcHotspot extends DeclaredPropsMixin(LitElement) {
  static properties = {
    // "Values outside the range are clamped; a non-numeric value falls back
    // to 50" — which `_pct()` did at render time only, so the property kept
    // the out-of-range number a consumer read back (finding #70).
    x: num({ default: 50, min: 0, max: 100, clamp: 'toRange', reflect: true }),
    y: num({ default: 50, min: 0, max: 100, clamp: 'toRange', reflect: true }),
    label: { type: String, reflect: true },
    open: flag(false),
  };

  static styles = [
    tokenStyles,
    css`
      /* The host spans the whole annotated surface; the parent gives its
         container position: relative, so inset: 0 stretches each hotspot over
         the image and the pin lands at its percentage coordinates. Pointer
         events are re-enabled only on the pin and the open panel, so stacked
         hotspot hosts never block the image or each other. */
      :host {
        display: block;
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      /* Zero-size anchor at the pin's coordinates. Deliberately untransformed:
         a transform here would become the containing block for the panel, and
         in a browser without top-layer popover support the controller's fixed
         viewport coordinates would resolve against it instead of the viewport.
         The centring transform lives on the pin itself, whose transform cannot
         affect its panel sibling. */
      .hotspot {
        position: absolute;
        width: 0;
        height: 0;
      }

      .hotspot__pin {
        position: absolute;
        left: 0;
        top: 0;
        transform: translate(-50%, -50%);
        width: 28px;
        height: 28px;
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--radius-full);
        cursor: pointer;
        pointer-events: auto;
      }

      /* The dot. */
      .hotspot__pin::before {
        content: '';
        position: absolute;
        inset: 8px;
        border-radius: var(--radius-full);
        background: var(--accent-primary);
        box-shadow:
          0 0 0 1px rgba(var(--accent-primary-rgb), 0.35),
          var(--glow-md);
        transition: box-shadow var(--transition-fast);
      }

      /* The breathing halo. The keyword curve is deliberate: loops are exempt
         from the entrance and exit curves in the token tree, and ease-in-out is
         the symmetric shape a pulse wants — see the loop note in
         scripts/checks/motion-tokens.js and the arc-avatar status pulse this
         follows. Opacity and transform only, so it stays off the layout path.
         The shared reduced-motion guard in tokenStyles shortens it to nothing;
         the explicit rule below removes it outright, matching arc-avatar. */
      .hotspot__pin::after {
        content: '';
        position: absolute;
        inset: 5px;
        border-radius: var(--radius-full);
        box-shadow: 0 0 12px 3px rgba(var(--accent-primary-rgb), 0.35);
        opacity: 0.5;
        animation: hotspot-pulse 2s ease-in-out infinite;
      }

      @keyframes hotspot-pulse {
        0%, 100% { opacity: 0.35; transform: scale(1); }
        50%      { opacity: 0.8;  transform: scale(1.25); }
      }

      .hotspot__pin:hover::before {
        box-shadow:
          0 0 0 1px rgba(var(--accent-primary-rgb), 0.5),
          0 0 16px rgba(var(--accent-primary-rgb), 0.5);
      }

      .hotspot__pin:focus-visible { outline: none; }
      .hotspot__pin:focus-visible::before {
        box-shadow: var(--interactive-focus-thumb);
      }

      /* An open pin holds a steady raised glow; the attention pulse stops
         because the popover already has the attention. */
      :host([open]) .hotspot__pin::before {
        box-shadow:
          0 0 0 1px rgba(var(--accent-primary-rgb), 0.6),
          0 0 18px rgba(var(--accent-primary-rgb), 0.55);
      }
      :host([open]) .hotspot__pin::after {
        animation: none;
        opacity: 0.7;
      }

      @media (prefers-reduced-motion: reduce) {
        .hotspot__pin::after { animation: none; }
      }

      .hotspot__panel {
        position: absolute;
        z-index: var(--z-tooltip);
        min-width: 200px;
        max-width: 280px;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        box-shadow: var(--shadow-overlay);
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        line-height: 1.6;
        color: var(--text-secondary);
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transform: scale(0.95);
        transition:
          opacity var(--transition-base),
          visibility var(--transition-base),
          transform var(--transition-base);
        pointer-events: none;
      }

      .hotspot__panel::before {
        content: '';
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        inset-inline-end: 0;
        height: 1px;
        background: var(--divider-glow);
      }

      :host([open]) .hotspot__panel {
        opacity: 1;
        visibility: visible;
        transform: scale(1);
        pointer-events: auto;
      }

      /* Resting fallback placement, above the pin — for the static export,
         pre-upgrade, and anywhere PositionController has not adopted the
         panel. The centring rides on the translate property rather than on
         transform, which stays free to carry the open/closed scale. */
      .hotspot__panel:not([data-managed]) {
        bottom: var(--space-lg);
        left: 0;
        translate: -50% 0;
        transform-origin: bottom center;
      }

      .hotspot__label {
        margin: 0 0 var(--space-xs);
        font-family: var(--font-label);
        font-size: var(--_text-sm);
        font-weight: 600;
        color: var(--text-primary);
      }
    `,
    managedPanelStyles('hotspot__panel'),
  ];

  static _idCounter = 0;

  constructor() {
    super();
    this.label = '';
    /** Assigned by arc-image-hotspots on slotchange; the detail.value fallback. */
    this._index = 0;
    this._openedFrom = null;
    this._panelId = `hotspot-panel-${++ArcHotspot._idCounter}`;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._dismiss = new DismissController(this, {
      // close(false): the pointer chose a new target, so don't yank focus back
      // to the pin.
      onDismiss: () => this.close(false),
    });
    this._position = new PositionController(this, {
      anchor: () => this.shadowRoot?.querySelector('.hotspot__pin'),
      floating: () => this.shadowRoot?.querySelector('.hotspot__panel'),
      placement: () => 'top',
      fallbackPlacement: 'top',
    });
  }

  updated(changed) {
    if (changed.has('open')) {
      this.open ? this._position.show() : this._position.hide();
      if (this.open) {
        this._openedFrom = deepActiveElement();
        this._dismiss.activate();
        document.addEventListener('keydown', this._onKeyDown);
      } else {
        this._dismiss.deactivate();
        document.removeEventListener('keydown', this._onKeyDown);
      }
    }
    // Moving an open pin moves its anchor out from under the panel.
    if ((changed.has('x') || changed.has('y')) && this.open) {
      this._position.show();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onKeyDown);
  }

  /** Clamp a coordinate into 0-100; anything non-numeric centres. */
  _pct(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 50;
  }

  /** What arc-open and arc-close carry: the label, or the index without one. */
  get _value() {
    return this.label || this._index;
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  _toggle() {
    if (this.open) {
      this.close();
      return;
    }
    this.open = true;
    this.dispatchEvent(
      new CustomEvent('arc-open', {
        bubbles: true,
        composed: true,
        detail: { value: this._value },
      }),
    );
  }

  /**
   * Close the popover, firing the cancelable arc-close first. Public: the
   * parent calls this to enforce one-open-at-a-time, so a consumer's veto is
   * honoured there too.
   */
  close(restoreFocus = true) {
    if (!this.open) return;
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', {
          bubbles: true,
          composed: true,
          cancelable: true,
          detail: { value: this._value },
        }),
      )
    )
      return;
    this.open = false;
    if (restoreFocus && this._openedFrom && this._openedFrom.isConnected) {
      this._openedFrom.focus();
    }
    this._openedFrom = null;
  }

  render() {
    return html`
      <div class="hotspot" style="left: ${this._pct(this.x)}%; top: ${this._pct(this.y)}%;">
        <button
          class="hotspot__pin"
          part="pin"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-haspopup="dialog"
          aria-controls=${this._panelId}
          aria-label=${this.label || 'Show details'}
          @click=${this._toggle}
        ></button>
        <div
          class="hotspot__panel"
          id=${this._panelId}
          role="dialog"
          aria-label=${this.label || 'Details'}
          aria-hidden=${this.open ? 'false' : 'true'}
          part="panel"
        >
          ${this.label ? html`<p class="hotspot__label">${this.label}</p>` : ''}
          <slot></slot>
        </div>
      </div>
    `;
  }
}
