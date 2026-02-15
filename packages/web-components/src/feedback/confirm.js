import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-confirm
 */
export class ArcConfirm extends LitElement {
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

      .confirm__message {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: 1.6;
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
    this._resolve = null;
  }

  /**
   * Programmatic API: ArcConfirm.open({ heading, message, ... }) returns Promise<boolean>.
   */
  static open({ heading, message, confirmLabel, cancelLabel, variant } = {}) {
    const el = document.createElement('arc-confirm');
    el.heading = heading || '';
    el.message = message || '';
    if (confirmLabel) el['confirm-label'] = confirmLabel;
    if (cancelLabel) el['cancel-label'] = cancelLabel;
    if (variant) el.variant = variant;
    el.open = true;
    document.body.appendChild(el);

    return new Promise((resolve) => {
      el._resolve = resolve;
      el.addEventListener('arc-confirm', () => {
        resolve(true);
        el.remove();
      }, { once: true });
      el.addEventListener('arc-cancel', () => {
        resolve(false);
        el.remove();
      }, { once: true });
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
        <div class="confirm__message" part="message">${this.message}</div>
        <div slot="footer">
          <arc-button variant="ghost" size="sm" @click=${this._cancel} part="cancel">${this['cancel-label']}</arc-button>
          <arc-button variant="primary" size="sm" @click=${this._confirm} part="confirm">${this['confirm-label']}</arc-button>
        </div>
      </arc-modal>
    `;
  }
}
