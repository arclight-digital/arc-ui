import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { OverlayController } from '../shared/overlay-controller.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Slide-out panel with backdrop overlay, keyboard dismissal, and left/right positioning for
 * off-canvas navigation, filters, and detail views.
 *
 * @tag arc-drawer
 * @status stable
 * @requires arc-icon-button
 * @prop {boolean} open - Controls the visible state of the drawer. Set to `true` to slide the panel into view and activate the backdrop; set to `false` to run the exit animation, remove the backdrop, and restore body scroll.
 * @prop {string} heading - Text displayed in the drawer header bar. Also used as the `aria-label` for the dialog panel, ensuring screen readers announce the panel purpose when it opens.
 * @prop {'left' | 'right'} position - Which edge of the viewport the drawer slides in from. Use `left` for primary navigation menus and `right` for contextual detail panels, filter sidebars, or settings trays.
 * @fires {CustomEvent<void>} arc-close - Fired when the drawer closes via backdrop click or escape key
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart panel - The sliding panel. Same element as `base`; the scrim is `::backdrop`,
 *   which is not an element and so cannot be a part — style it with the
 *   `--drawer-backdrop` custom property.
 * @csspart header
 * @csspart title
 * @csspart close
 * @csspart body
 */
export class ArcDrawer extends DeclaredPropsMixin(LitElement) {
  static properties = {
    open: flag(false),
    position: oneOf(['left', 'right']),

    heading: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      /* The panel is the dialog, and the scrim is its ::backdrop — there is no
         backdrop element left to carry a z-index, because the top layer has no
         ladder to climb. Its two properties come through custom properties so
         a consumer can still reach them: ::backdrop inherits from the element
         it belongs to. */
      .drawer__panel {
        position: fixed;
        top: 0;
        bottom: 0;
        margin: 0;
        padding: 0;
        border: none;
        border-inline-end: 1px solid var(--border-subtle);
        max-height: none;
        height: 100%;
        width: 300px;
        max-width: 85vw;
        background: var(--surface-primary);
        flex-direction: column;
        transition:
          transform var(--transition-base) var(--ease-out-expo),
          overlay var(--transition-base) allow-discrete,
          display var(--transition-base) allow-discrete;
      }

      /* display goes on the open rule, not the base one: a closed dialog is
         display:none by UA stylesheet, and a flex declaration on the base rule
         would override that and leave the panel on screen while closed. */
      .drawer__panel[open] { display: flex; }

      .drawer__panel::backdrop {
        background: var(--drawer-backdrop, var(--overlay-backdrop));
        opacity: 0;
        transition:
          opacity var(--transition-base),
          overlay var(--transition-base) allow-discrete,
          display var(--transition-base) allow-discrete;
      }

      .drawer__panel[open]::backdrop { opacity: 1; }

      @starting-style {
        .drawer__panel[open]::backdrop { opacity: 0; }
      }

      :host(:not([position="right"])) .drawer__panel,
      :host([position="left"]) .drawer__panel {
        left: 0;
        right: auto;
      }

      /* The slide-in start position, expressed once per edge. @starting-style
         is what makes the entry animate now that the panel goes from
         display:none straight into the top layer. */
      @starting-style {
        :host(:not([position="right"])) .drawer__panel[open],
        :host([position="left"]) .drawer__panel[open] {
          transform: translateX(-100%);
        }
      }

      :host([position="right"]) .drawer__panel {
        right: 0;
        left: auto;
        border-right: none;
        border-left: 1px solid var(--border-subtle);
      }

      @starting-style {
        :host([position="right"]) .drawer__panel[open] {
          transform: translateX(100%);
        }
      }

      /* The exit. A closing dialog leaves the top layer on the frame close() is
         called unless overlay is in the transition list, which is why it is
         there; this is the transform the exit runs toward. */
      .drawer__panel:not([open]) {
        transform: translateX(var(--_drawer-exit, -100%));
      }

      :host([position="right"]) .drawer__panel:not([open]) {
        --_drawer-exit: 100%;
      }

      .drawer__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-lg);
        border-bottom: 1px solid var(--divider);
        flex-shrink: 0;
      }

      .drawer__title {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-sm);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-primary);
      }


      .drawer__body {
        flex: 1;
        overflow-y: auto;
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
        new CustomEvent('arc-close', {
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    )
      return;
    this.open = false;
  }

  render() {
    return html`
      <dialog class="drawer__panel" aria-label=${this.heading || 'Drawer'} part="base panel">
        <div class="drawer__header" part="header">
          <span class="drawer__title" part="title">${this.heading}</span>
          <arc-icon-button name="x" label="Close" variant="ghost" size="sm" @click=${this._close} part="close"></arc-icon-button>
        </div>
        <div class="drawer__body" part="body">
          <slot></slot>
        </div>
      </dialog>
    `;
  }
}
