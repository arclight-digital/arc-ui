import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { OverlayController } from '../shared/overlay-controller.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * General-purpose focus-trapping overlay with backdrop blur, slide-up animation, and ESC-to-close
 * behavior for forms, settings, and rich content that needs full user attention.
 *
 * @tag arc-modal
 * @status stable
 * @requires arc-icon-button
 * @prop {boolean} open - Controls the visible state of the dialog. Set to `true` to open the modal and activate the focus trap; set to `false` to close it, run the exit animation, and restore focus to the previously-focused element.
 * @prop {string} heading - Text displayed in the modal header bar. Automatically linked to the dialog via `aria-labelledby` for screen-reader accessibility. Keep it short and action-oriented (e.g. "Delete Project" rather than "Are you sure?").
 * @prop {'sm' | 'md' | 'lg'} size - Controls the maximum width of the dialog panel. `sm` (400px) is ideal for simple confirmations, `md` (560px) for standard forms, and `lg` (720px) for content-heavy dialogs with tables or multi-column layouts.
 * @prop {boolean} dismissible - When `true`, renders the built-in X close button and allows dismissal via Escape key and backdrop click. Set to `false` for critical decision modals where the user must explicitly choose an action from the footer buttons. Note the default: a modal is dismissible unless you say otherwise, where an alert is not dismissible unless you say so — the name is the convention, the default belongs to the component.
 * @prop {boolean} closable - @deprecated Since v4.0.0 — the old name for `dismissible`, kept as a two-way alias for one major and removed in v5. Setting either sets both.
 * @prop {boolean} fullscreen - Makes the modal fill the entire viewport. Useful for mobile forms or complex workflows.
 * @fires {CustomEvent<void>} arc-open - Fired when the modal opens
 * @fires {CustomEvent<void>} arc-close - Fired when the modal closes
 * @slot header
 * @slot - Default content.
 * @slot footer
 * @csspart base - The root element.
 * @csspart dialog - The dialog panel. Same element as `base`; the scrim is `::backdrop`,
 *   which is not an element and so cannot be a part — style it with the
 *   `--modal-backdrop` and `--modal-backdrop-filter` custom properties.
 * @csspart header
 * @csspart close
 * @csspart body
 * @csspart footer
 */
export class ArcModal extends DeclaredPropsMixin(LitElement) {
  static properties = {
    open: flag(false),
    heading: { type: String },
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),

    fullscreen: flag(false),

    /**
     * The canonical dismissal prop (V4-PLAN 4.3). `dismissible` won over
     * `closable` on 3-to-1 usage — arc-alert, arc-banner and arc-callout — and
     * because `DismissController` and the central dismissal contract are the
     * architecture's word for it.
     *
     * **The two dialects differed in polarity as well as spelling, and only the
     * spelling converges.** A modal is dismissible unless you say otherwise; an
     * alert is not dismissible unless you say so. Both defaults are right for
     * their component — an inescapable modal is the exception, an alert with an
     * X is the exception — so forcing one default on both would trade a naming
     * inconsistency for a behavioural one, which is the worse of the two.
     */
    dismissible: flag(true, { negative: 'no-dismissible' }),

    /**
     * Deprecated alias, removed in v5. Declared as a real property rather than
     * a getter pair so the *attribute* keeps working: `<arc-modal no-closable>`
     * is markup that exists in consumers' pages, and an accessor alone would
     * leave Lit with no attribute to observe.
     */
    closable: flag(true, { negative: 'no-closable' }),
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      /* The dialog is the panel. There is no backdrop element any more — the
         scrim is ::backdrop, which the browser paints in the top layer with no
         z-index and no stacking context to lose to. Its two properties come
         through custom properties so a consumer can still reach them;
         ::backdrop inherits from its originating element, which is what makes
         that work. */
      .modal__dialog {
        position: fixed;
        inset: 0;
        margin: auto;
        padding: 0;
        border: 1px solid var(--border-subtle);
        background: var(--surface-raised);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-overlay);
        width: calc(100% - var(--space-lg) * 2);
        max-height: calc(100vh - var(--space-2xl) * 2);
        overflow-y: auto;
        flex-direction: column;
        opacity: 0;
        transform: translateY(16px);
        transition:
          opacity var(--transition-base),
          transform var(--transition-base),
          overlay var(--transition-base) allow-discrete,
          display var(--transition-base) allow-discrete;
      }

      /* display is set here rather than on the base rule: a closed <dialog> is
         display:none by UA stylesheet, and a flex declaration on the base rule
         would override that and leave the panel visible while closed. */
      .modal__dialog[open] {
        display: flex;
        opacity: 1;
        transform: translateY(0);
      }

      /* The entry half of the transition. Without it the panel is already at
         its final opacity on the frame it enters the top layer, so only the
         exit animates. */
      @starting-style {
        .modal__dialog[open] {
          opacity: 0;
          transform: translateY(16px);
        }
      }

      .modal__dialog::backdrop {
        background: var(--modal-backdrop, var(--overlay-backdrop));
        backdrop-filter: var(--modal-backdrop-filter, blur(4px));
        opacity: 0;
        transition:
          opacity var(--transition-base),
          overlay var(--transition-base) allow-discrete,
          display var(--transition-base) allow-discrete;
      }

      .modal__dialog[open]::backdrop { opacity: 1; }

      @starting-style {
        .modal__dialog[open]::backdrop { opacity: 0; }
      }

      :host([size="sm"]) .modal__dialog { max-width: 400px; }
      :host(:not([size="lg"]):not([size="sm"])) .modal__dialog,
      :host([size="md"]) .modal__dialog { max-width: 560px; }
      :host([size="lg"]) .modal__dialog { max-width: 720px; }

      :host([fullscreen]) .modal__dialog {
        max-width: none;
        max-height: none;
        width: 100%;
        height: 100%;
        border-radius: 0;
        border: none;
      }

      .modal__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-lg);
        position: relative;
      }

      .modal__header::after {
        content: '';
        position: absolute;
        bottom: 0;
        inset-inline-start: var(--space-lg);
        inset-inline-end: var(--space-lg);
        height: 1px;
        background: var(--divider-glow);
        opacity: 0.5;
      }

      .modal__heading {
        font-size: var(--_text-md);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }


      .modal__body {
        padding: var(--space-lg);
        color: var(--text-secondary);
        font-size: var(--body-size);
        line-height: var(--body-lh);
        flex: 1;
      }

      .modal__footer {
        padding: var(--space-lg);
        position: relative;
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm);
      }

      .modal__footer::before {
        content: '';
        position: absolute;
        top: 0;
        inset-inline-start: var(--space-lg);
        inset-inline-end: var(--space-lg);
        height: 1px;
        background: var(--divider-glow);
        opacity: 0.5;
      }

      @media (prefers-reduced-motion: reduce) {
        /* The discrete properties keep their transitions: without overlay and
           display easing, a closing dialog leaves the top layer on the frame
           close() is called and the exit never runs at all. Dropping the
           duration to 0s is what "no motion" means here, not dropping the
           allow-discrete behaviour that makes close() observable. */
        .modal__dialog,
        .modal__dialog::backdrop {
          transition-duration: 0s;
        }
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

  /**
   * The single gate on dismissal.
   *
   * OverlayController routes Escape and backdrop clicks here, and the X button
   * only renders when dismissible, so guarding once covers every path. A modal
   * with dismissible=false is genuinely undismissable — the caller has to
   * resolve it through its own footer actions.
   *
   * The Escape path is why the controller cancels the browser's own close
   * rather than letting it through: `dismissible=false` has to be able to
   * refuse, and a dialog that closed and reopened would flash.
   */
  _close() {
    if (!this.dismissible) return;
    // Cancelable: a consumer with unsaved state can preventDefault() to veto.
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', { bubbles: true, composed: true, cancelable: true }),
      )
    )
      return;
    this.open = false;
  }

  /**
   * Keep the deprecated `closable` and the canonical `dismissible` in step.
   *
   * In `willUpdate` rather than `updated`, so the mirrored assignment is folded
   * into the same render pass instead of costing a second one. The canonical
   * name is checked first, so a consumer that sets both in one turn gets the
   * one they are supposed to be using.
   *
   * This cannot loop: the second pass sees the two already equal and the guard
   * on each branch is an inequality.
   */
  willUpdate(changed) {
    super.willUpdate?.(changed);
    if (changed.has('dismissible') && this.closable !== this.dismissible) {
      this.closable = this.dismissible;
    } else if (changed.has('closable') && this.dismissible !== this.closable) {
      this.dismissible = this.closable;
    }
  }

  updated(changed) {
    // Focus, inertness, Escape, focus restore and the top layer are the
    // browser's, via OverlayController and <dialog>. This only adds the event.
    super.updated?.(changed);
    if (changed.has('open') && this.open) {
      this.dispatchEvent(new CustomEvent('arc-open', { bubbles: true, composed: true }));
    }
  }

  render() {
    return html`
      <dialog
        class="modal__dialog"
        aria-label=${this.heading || 'Dialog'}
        part="base dialog"
      >
        <div class="modal__header" part="header">
          <slot name="header">
            <h2 class="modal__heading">${this.heading}</h2>
          </slot>
          ${
            this.dismissible
              ? html`
            <arc-icon-button name="x" label="Close" variant="ghost" size="sm" @click=${this._close} part="close"></arc-icon-button>
          `
              : ''
          }
        </div>
        <div class="modal__body" part="body">
          <slot></slot>
        </div>
        <div class="modal__footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </dialog>
    `;
  }
}
