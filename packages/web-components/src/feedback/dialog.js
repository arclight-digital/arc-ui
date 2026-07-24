import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Small centered confirmation dialog wrapping arc-modal for simple confirm/cancel prompts —
 * unsaved changes, session expiry, and discard decisions.
 *
 * @tag arc-dialog
 * @prop {boolean} open - Whether the dialog is visible
 * @prop {string} heading - Dialog title text
 * @prop {string} message - Dialog body message
 * @prop {string} confirmLabel - Text for the confirm button
 * @prop {string} cancelLabel - Text for the cancel button
 * @prop {'default' | 'danger'} variant - Visual variant — danger adds red accent line, glow border, and red confirm button
 * @fires {CustomEvent<void>} arc-confirm - Fired when the confirm button is clicked
 * @fires {CustomEvent<void>} arc-cancel - Fired when cancel, escape, or backdrop click occurs
 * @csspart body
 * @csspart cancel
 * @csspart confirm
 */
export class ArcDialog extends LitElement {
  static properties = {
    open:           { type: Boolean, reflect: true },
    heading:        { type: String },
    message:        { type: String },
    confirmLabel: { type: String, attribute: 'confirm-label' },
    cancelLabel:  { type: String, attribute: 'cancel-label' },
    variant:        { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .dialog__body {
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--body-size);
        line-height: var(--body-lh);
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
    this._resolvePromise = null;
  }

  /**
   * Opens the dialog and returns a Promise that resolves to `true` on confirm
   * or `false` on cancel (including Escape and backdrop click).
   */
  confirm() {
    this.open = true;
    return new Promise((resolve) => {
      this._resolvePromise = resolve;
    });
  }

  _doConfirm() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-confirm', { bubbles: true, composed: true }));
    if (this._resolvePromise) {
      this._resolvePromise(true);
      this._resolvePromise = null;
    }
  }

  _cancel() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-cancel', { bubbles: true, composed: true }));
    if (this._resolvePromise) {
      this._resolvePromise(false);
      this._resolvePromise = null;
    }
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
        ${this.message ? html`
          <div class="dialog__body" part="body">${this.message}</div>
        ` : ''}
        <div slot="footer">
          <arc-button variant="ghost" size="sm" @click=${this._cancel} part="cancel">${this.cancelLabel}</arc-button>
          <arc-button variant="primary" size="sm" @click=${this._doConfirm} part="confirm">${this.confirmLabel}</arc-button>
        </div>
      </arc-modal>
    `;
  }
}
