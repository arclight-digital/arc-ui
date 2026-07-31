import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Programmatic confirmation API that wraps dialog. Call ArcConfirm.open() and await the returned
 * promise. Same visual treatment as dialog.
 *
 * @tag arc-confirm
 * @requires arc-modal
 * @requires arc-button
 * @prop {boolean} open - Controls whether the confirmation dialog is visible. For declarative usage; the imperative API manages this automatically.
 * @prop {string} heading - The heading text displayed at the top of the confirmation dialog.
 * @prop {string} message - The body message explaining what the user is confirming. Used as the fallback for the default slot, so it is the simplest way to set the body and the only one available to the imperative `ArcConfirm.open()` API.
 * @prop {string} confirmLabel - Label for the confirm button. Use a specific verb like "Delete" or "Publish" instead of generic "OK".
 * @prop {string} cancelLabel - Label for the cancel button. Use a specific alternative like "Keep" or "Go back" when possible.
 * @prop {'default' | 'error'} variant - Controls the confirm button style. Use "error" for destructive actions — the confirm button renders in the error colour.
 * @fires {CustomEvent<void>} arc-confirm - Fired when the user clicks the confirm button
 * @fires {CustomEvent<void>} arc-cancel - Fired when the user clicks cancel, presses Escape, or clicks the backdrop
 * @slot - Body content, for when the confirmation needs markup the `message` string cannot carry — a filename in `<code>`, an emphasised consequence, a short list of what is about to change. Falls back to `message` when nothing is slotted.
 * @csspart message
 * @csspart cancel
 * @csspart confirm
 */
export class ArcConfirm extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    heading: { type: String },
    message: { type: String },
    confirmLabel: { type: String, attribute: 'confirm-label' },
    cancelLabel: { type: String, attribute: 'cancel-label' },
    variant: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .confirm__message {
        font-size: var(--_text-sm);
        color: var(--text-secondary);
        line-height: 1.6;
      }

      /* Slotted bodies are usually a sentence with one thing picked out of it —
         most often the name of whatever is about to be deleted. Inherited
         properties cross the shadow boundary on their own; these two do not,
         and a filename in the UA's default monospace is the tell. */
      .confirm__message ::slotted(code) {
        font-family: var(--font-mono);
        font-size: var(--code-size);
      }
      .confirm__message ::slotted(strong) {
        color: var(--text-primary);
      }

      /* variant="error" recolours the confirm button by moving the accent tokens
         it reads, rather than by adding a fourth arc-button variant. The button
         resolves --interactive from --accent-primary in its own context, so
         setting them on the instance is enough. */
      :host([variant="error"]) arc-button[part="confirm"] {
        --accent-primary: var(--color-error);
        --accent-primary-rgb: var(--color-error-rgb);
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.heading = '';
    this.message = '';
    this.confirmLabel = 'Confirm';
    this.cancelLabel = 'Cancel';
    this.variant = 'default';
  }

  /**
   * Programmatic API: ArcConfirm.open({ heading, message, ... }) returns Promise<boolean>.
   */
  static open({ heading, message, confirmLabel, cancelLabel, variant } = {}) {
    const el = document.createElement('arc-confirm');
    el.heading = heading || '';
    el.message = message || '';
    if (confirmLabel) el.confirmLabel = confirmLabel;
    if (cancelLabel) el.cancelLabel = cancelLabel;
    if (variant) el.variant = variant;
    el.open = true;
    document.body.appendChild(el);

    return new Promise((resolve) => {
      el.addEventListener(
        'arc-confirm',
        () => {
          resolve(true);
          el.remove();
        },
        { once: true },
      );
      el.addEventListener(
        'arc-cancel',
        () => {
          resolve(false);
          el.remove();
        },
        { once: true },
      );
    });
  }

  _confirm() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-confirm', { bubbles: true, composed: true }));
  }

  _cancel() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-cancel', { bubbles: true, composed: true }));
  }

  _onModalClose() {
    this._cancel();
  }

  render() {
    return html`
      <arc-modal
        ?open=${this.open}
        heading=${this.heading}
        size="sm"
        closable
        @arc-close=${this._onModalClose}
      >
        <div class="confirm__message" part="message"><slot>${this.message}</slot></div>
        <div slot="footer">
          <arc-button variant="ghost" size="sm" @click=${this._cancel} part="cancel">${this.cancelLabel}</arc-button>
          <arc-button variant="primary" size="sm" @click=${this._confirm} part="confirm">${this.confirmLabel}</arc-button>
        </div>
      </arc-modal>
    `;
  }
}
