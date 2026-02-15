import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-dialog
 */
export class ArcDialog extends LitElement {
  static properties = {
    open:           { type: Boolean, reflect: true },
    heading:        { type: String },
    message:        { type: String },
    'confirm-label': { type: String, attribute: 'confirm-label' },
    'cancel-label':  { type: String, attribute: 'cancel-label' },
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
    this['confirm-label'] = 'Confirm';
    this['cancel-label'] = 'Cancel';
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
          <arc-button variant="ghost" size="sm" @click=${this._cancel} part="cancel">${this['cancel-label']}</arc-button>
          <arc-button variant="primary" size="sm" @click=${this._doConfirm} part="confirm">${this['confirm-label']}</arc-button>
        </div>
      </arc-modal>
    `;
  }
}
