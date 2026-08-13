import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { OverlayMixin } from '../shared/overlay-mixin.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * General-purpose focus-trapping overlay with backdrop blur, slide-up animation, and ESC-to-close
 * behavior for forms, settings, and rich content that needs full user attention.
 *
 * @tag arc-modal
 * @requires arc-icon-button
 * @prop {boolean} open - Controls the visible state of the dialog. Set to `true` to open the modal and activate the focus trap; set to `false` to close it, run the exit animation, and restore focus to the previously-focused element.
 * @prop {string} heading - Text displayed in the modal header bar. Automatically linked to the dialog via `aria-labelledby` for screen-reader accessibility. Keep it short and action-oriented (e.g. "Delete Project" rather than "Are you sure?").
 * @prop {'sm' | 'md' | 'lg'} size - Controls the maximum width of the dialog panel. `sm` (400px) is ideal for simple confirmations, `md` (560px) for standard forms, and `lg` (720px) for content-heavy dialogs with tables or multi-column layouts.
 * @prop {boolean} closable - When `true`, renders the built-in X close button and allows dismissal via Escape key and backdrop click. Set to `false` for critical decision modals where the user must explicitly choose an action from the footer buttons.
 * @prop {boolean} fullscreen - Makes the modal fill the entire viewport. Useful for mobile forms or complex workflows.
 * @fires {CustomEvent<void>} arc-open - Fired when the modal opens
 * @fires {CustomEvent<void>} arc-close - Fired when the modal closes
 * @slot header
 * @slot - Default content.
 * @slot footer
 * @csspart backdrop
 * @csspart dialog
 * @csspart header
 * @csspart close
 * @csspart body
 * @csspart footer
 */
export class ArcModal extends DeclaredPropsMixin(OverlayMixin(LitElement)) {
  static properties = {
    open: flag(false),
    heading: { type: String },
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),

    fullscreen: flag(false),
    closable: flag(true, { negative: 'no-closable' }),
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .modal__backdrop {
        position: fixed;
        inset: 0;
        background: var(--overlay-backdrop);
        backdrop-filter: blur(4px);
        z-index: var(--z-modal);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-lg);
        opacity: 0;
        visibility: hidden;
        /* visibility flips instantly on open (delayed only on close) so the
           dialog is focusable the moment [open] is set */
        transition: opacity var(--transition-base), visibility 0s var(--transition-base);
      }

      :host([open]) .modal__backdrop {
        opacity: 1;
        visibility: visible;
        transition-delay: 0s;
      }

      .modal__dialog {
        position: relative;
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-overlay);
        width: 100%;
        max-height: calc(100vh - var(--space-2xl) * 2);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        transform: translateY(16px);
        transition: transform var(--transition-base);
      }

      :host([open]) .modal__dialog {
        transform: translateY(0);
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

      :host([fullscreen]) .modal__backdrop {
        padding: 0;
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
        .modal__backdrop,
        .modal__dialog { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.heading = '';
  }

  /**
   * The single gate on dismissal.
   *
   * OverlayMixin routes Escape and backdrop clicks here, and the X button only
   * renders when closable, so guarding once covers every path. A modal with
   * closable=false is genuinely undismissable — the caller has to resolve it
   * through its own footer actions.
   */
  _close() {
    if (!this.closable) return;
    // Cancelable: a consumer with unsaved state can preventDefault() to veto.
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
    // OverlayMixin; this only adds the open event.
    super.updated(changed);
    if (changed.has('open') && this.open) {
      this.dispatchEvent(new CustomEvent('arc-open', { bubbles: true, composed: true }));
    }
  }

  render() {
    return html`
      <div
        class="modal__backdrop"
        @click=${this._handleBackdropClick}
        part="backdrop"
      >
        <div
          class="modal__dialog"
          role="dialog"
          aria-modal="true"
          aria-label=${this.heading || 'Dialog'}
          part="dialog"
        >
          <div class="modal__header" part="header">
            <slot name="header">
              <h2 class="modal__heading">${this.heading}</h2>
            </slot>
            ${
              this.closable
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
        </div>
      </div>
    `;
  }
}
