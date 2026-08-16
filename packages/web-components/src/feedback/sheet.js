import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { OverlayController } from '../shared/overlay-controller.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * A sliding overlay panel that emerges from the bottom or right edge of the viewport, with a
 * blurred backdrop, header, scrollable body, and footer slot.
 *
 * @tag arc-sheet
 * @status stable
 * @requires arc-icon-button
 * @prop {boolean} open - Controls whether the sheet is visible. Reflected as an attribute and toggleable programmatically.
 * @prop {'bottom' | 'right'} side - Which edge the panel slides in from. Bottom sheets have a max-height of 80vh; right sheets are 400px wide.
 * @prop {string} heading - Text displayed in the header row. Also used as the `aria-label` for the dialog panel.
 * @fires {CustomEvent<void>} arc-open - Fired when the sheet opens
 * @fires {CustomEvent<void>} arc-close - Fired when the sheet closes
 * @slot header
 * @slot - Default content.
 * @slot footer
 * @csspart base - The root element.
 * @csspart close
 * @csspart panel - The sliding panel. The scrim is `::backdrop`, which is not an
 *   element and so cannot be a part — style it with the `--sheet-backdrop` and
 *   `--sheet-backdrop-filter` custom properties.
 * @csspart handle
 * @csspart header
 * @csspart body
 * @csspart footer
 */
export class ArcSheet extends DeclaredPropsMixin(LitElement) {
  static properties = {
    open: flag(false),
    side: oneOf(['bottom', 'right']),

    heading: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      /* The panel is the dialog; the scrim is its ::backdrop. No backdrop
         element and no z-index: the top layer has no ladder to climb. Both
         scrim properties come through custom properties so a consumer can
         still reach them — ::backdrop inherits from its originating element. */
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
      .sheet__panel[open] {
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

      .sheet__panel[open]::backdrop {
        opacity: 1;
        transition-duration: var(--duration-enter);
      }

      @starting-style {
        .sheet__panel[open]::backdrop { opacity: 0; }
      }

      /* Bottom sheet. The off-screen transform is now stated twice — once for
         the entry (@starting-style, the frame the dialog enters the top layer)
         and once for the exit (:not([open]), which the overlay transition keeps
         visible long enough to run). The old single translateY(100%) base rule
         could serve both because the panel never left the layout. */
      :host(:not([side="right"])) .sheet__panel,
      :host([side="bottom"]) .sheet__panel {
        bottom: 0;
        inset-inline-start: 0;
        inset-inline-end: 0;
        max-height: 80vh;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      }

      @starting-style {
        :host(:not([side="right"])) .sheet__panel[open],
        :host([side="bottom"]) .sheet__panel[open] {
          transform: translateY(100%);
        }
      }

      :host(:not([side="right"])) .sheet__panel:not([open]),
      :host([side="bottom"]) .sheet__panel:not([open]) {
        transform: translateY(100%);
      }

      /* Right sheet */
      :host([side="right"]) .sheet__panel {
        top: 0;
        inset-inline-end: 0;
        bottom: 0;
        width: 400px;
        max-width: 90vw;
        border-radius: var(--radius-xl) 0 0 var(--radius-xl);
      }

      @starting-style {
        :host([side="right"]) .sheet__panel[open] {
          transform: translateX(100%);
        }
      }

      :host([side="right"]) .sheet__panel:not([open]) {
        transform: translateX(100%);
      }

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
        font-weight: 600;
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

  constructor() {
    super();
    this.heading = '';
    this._overlay = new OverlayController(this, {
      dialog: () => this.shadowRoot?.querySelector('dialog'),
      isOpen: () => this.open,
      onRequestClose: () => this._close(),
    });
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
    // initial focus per spec, which lands on the same button — and unlike the
    // manual call it yields to an `autofocus` on the consumer's own slotted
    // content, which the manual call silently overrode.
  }

  render() {
    return html`
      <dialog
        class="sheet__panel"
        aria-label=${this.heading || 'Sheet'}
        part="base panel"
      >
        <div class="sheet__handle" part="handle">
          <div class="sheet__handle-bar"></div>
        </div>
        <div class="sheet__header" part="header">
          <slot name="header">
            <h2 class="sheet__heading">${this.heading}</h2>
          </slot>
          <arc-icon-button name="x" label="Close" variant="ghost" size="sm" @click=${this._close} part="close"></arc-icon-button>
        </div>
        <div class="sheet__body" part="body">
          <slot></slot>
        </div>
        <div class="sheet__footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </dialog>
    `;
  }
}
